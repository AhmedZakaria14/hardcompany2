/**
 * HARD GROUP - CMS DEBOUNCED AUTOSAVE HOOK
 * 
 * Manages autosaving drafts to Firestore with debouncing, status indicators,
 * revision concurrency control, offline backup buffer, and navigation warnings.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { DraftSaveStatus, CMSDraftRecord, RevisionConflictError } from './draftTypes';
import { getCMSDraft, saveCMSDraft } from './draftService';

interface UseDraftAutosaveOptions<T> {
  entityType: string;
  entityId: string;
  sector?: string;
  currentData: T;
  userEmail?: string;
  debounceMs?: number;
  enabled?: boolean;
  onDraftLoaded?: (record: CMSDraftRecord<T>) => void;
}

export function useDraftAutosave<T = any>({
  entityType,
  entityId,
  sector = 'portal',
  currentData,
  userEmail = 'admin@hardgroup.sa',
  debounceMs = 1500,
  enabled = true,
  onDraftLoaded,
}: UseDraftAutosaveOptions<T>) {
  const [saveStatus, setSaveStatus] = useState<DraftSaveStatus>('idle');
  const [revision, setRevision] = useState<number>(0);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [conflictRemoteRecord, setConflictRemoteRecord] = useState<CMSDraftRecord<T> | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);

  const initialLoadDoneRef = useRef(false);
  const lastSavedDataRef = useRef<string>('');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentDataRef = useRef(currentData);
  currentDataRef.current = currentData;

  // 1. Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // Attempt auto-sync if we were offline or have unsaved changes
      if (initialLoadDoneRef.current && (saveStatus === 'offline' || saveStatus === 'unsaved')) {
        triggerSave(true);
      }
    };

    const handleOffline = () => {
      setIsOffline(true);
      if (saveStatus === 'unsaved' || saveStatus === 'saving') {
        setSaveStatus('offline');
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [saveStatus]);

  // 2. Initial Draft Fetch on entity change
  useEffect(() => {
    let isMounted = true;
    initialLoadDoneRef.current = false;
    setSaveStatus('idle');

    async function initDraft() {
      if (!entityType || !entityId) return;
      const { record, isFromOfflineBuffer } = await getCMSDraft<T>(entityType, entityId);

      if (!isMounted) return;

      if (record) {
        setRevision(record.revision);
        setLastSavedAt(record.updatedAt);
        lastSavedDataRef.current = JSON.stringify(record.data);

        if (onDraftLoaded) {
          onDraftLoaded(record);
        }

        if (isFromOfflineBuffer) {
          setSaveStatus('offline');
        } else {
          setSaveStatus('saved');
        }
      } else {
        lastSavedDataRef.current = JSON.stringify(currentDataRef.current);
        setSaveStatus('idle');
      }

      initialLoadDoneRef.current = true;
    }

    initDraft();

    return () => {
      isMounted = false;
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [entityType, entityId]);

  // 3. Perform Save logic
  const triggerSave = useCallback(
    async (forceOverwrite = false) => {
      if (!entityType || !entityId) return;

      const serialized = JSON.stringify(currentDataRef.current);
      if (!forceOverwrite && serialized === lastSavedDataRef.current) {
        setSaveStatus('saved');
        return;
      }

      setSaveStatus('saving');
      setErrorMessage(null);

      try {
        const savedRecord = await saveCMSDraft<T>({
          entityType,
          entityId,
          sector,
          data: currentDataRef.current,
          expectedRevision: revision,
          userEmail,
          forceOverwrite,
        });

        setRevision(savedRecord.revision);
        setLastSavedAt(savedRecord.updatedAt);
        lastSavedDataRef.current = serialized;
        setConflictRemoteRecord(null);
        setSaveStatus('saved');
      } catch (err: any) {
        if (err?.message === 'OFFLINE_SAVED_LOCALLY' || !navigator.onLine) {
          setSaveStatus('offline');
          setErrorMessage('Offline: Draft preserved in browser storage');
        } else if (err instanceof RevisionConflictError) {
          setSaveStatus('conflict');
          setConflictRemoteRecord(err.remoteRecord);
          setErrorMessage(`Conflict: Another admin saved revision ${err.remoteRevision}`);
        } else {
          setSaveStatus('failed');
          setErrorMessage(err?.message || 'Failed to save draft to Firestore');
        }
      }
    },
    [entityType, entityId, sector, revision, userEmail]
  );

  // 4. Detect Data Changes & Debounce Save
  useEffect(() => {
    if (!initialLoadDoneRef.current || !enabled) return;

    const currentSerialized = JSON.stringify(currentData);
    if (currentSerialized === lastSavedDataRef.current) {
      if (saveStatus === 'unsaved') setSaveStatus('saved');
      return;
    }

    // Mark as unsaved immediately
    if (saveStatus !== 'saving' && saveStatus !== 'conflict') {
      setSaveStatus(navigator.onLine ? 'unsaved' : 'offline');
    }

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce save execution
    debounceTimerRef.current = setTimeout(() => {
      triggerSave(false);
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [currentData, debounceMs, enabled, triggerSave]);

  // 5. beforeunload Window Guard
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus === 'unsaved' || saveStatus === 'saving' || saveStatus === 'offline' || saveStatus === 'conflict') {
        e.preventDefault();
        e.returnValue = 'You have unsaved draft changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveStatus]);

  // Conflict Resolution: Load remote version
  const resolveConflictUseRemote = useCallback(() => {
    if (conflictRemoteRecord) {
      setRevision(conflictRemoteRecord.revision);
      setLastSavedAt(conflictRemoteRecord.updatedAt);
      lastSavedDataRef.current = JSON.stringify(conflictRemoteRecord.data);

      if (onDraftLoaded) {
        onDraftLoaded(conflictRemoteRecord);
      }

      setConflictRemoteRecord(null);
      setSaveStatus('saved');
    }
  }, [conflictRemoteRecord, onDraftLoaded]);

  // Conflict Resolution: Force overwrite remote version
  const resolveConflictForceOverwrite = useCallback(() => {
    return triggerSave(true);
  }, [triggerSave]);

  return {
    saveStatus,
    revision,
    lastSavedAt,
    errorMessage,
    conflictRemoteRecord,
    isOffline,
    hasUnsavedChanges: saveStatus === 'unsaved' || saveStatus === 'saving' || saveStatus === 'offline' || saveStatus === 'conflict',
    forceSave: () => triggerSave(false),
    resolveConflictUseRemote,
    resolveConflictForceOverwrite,
  };
}
