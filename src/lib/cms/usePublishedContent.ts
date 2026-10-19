/**
 * HARD GROUP - REAL-TIME PUBLISHED CONTENT HOOK
 * 
 * Subscribes public components to approved published Firestore documents/collections.
 * Features:
 * - Scoped real-time `onSnapshot` listeners filtered for `publicationStatus == 'published'`
 * - Clean unsubscribe management on component unmount
 * - Preserves loading, unavailable, and error states
 * - Draft isolation: Draft changes in `cms_drafts` never leak to site visitors
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  collection,
  doc,
  query,
  where,
  onSnapshot,
  getDocs,
  getDoc,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase';

export interface UsePublishedContentResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  isUnavailable: boolean;
  isLiveRealtime: boolean;
  refresh: () => Promise<void>;
}

export interface UsePublishedCollectionResult<T> {
  data: T[];
  isLoading: boolean;
  error: string | null;
  isUnavailable: boolean;
  isLiveRealtime: boolean;
  refresh: () => Promise<void>;
}

/**
 * Hook to subscribe to a single published document in Firestore
 */
export function usePublishedDoc<T = any>(
  collectionName: string,
  documentId: string,
  fallbackData: T | null = null
): UsePublishedContentResult<T> {
  const [data, setData] = useState<T | null>(fallbackData);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiveRealtime, setIsLiveRealtime] = useState<boolean>(false);

  const unsubRef = useRef<Unsubscribe | null>(null);

  const subscribe = useCallback(() => {
    if (!collectionName || !documentId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const docRef = doc(db, collectionName, documentId);

      // Clean previous listener if any
      if (unsubRef.current) {
        unsubRef.current();
      }

      unsubRef.current = onSnapshot(
        docRef,
        (snap) => {
          if (snap.exists()) {
            const raw = snap.data();
            // Draft isolation check: ignore if document is explicitly marked as draft
            if (raw.publicationStatus && raw.publicationStatus !== 'published') {
              setData(fallbackData);
            } else {
              setData({ ...raw, id: snap.id } as T);
            }
          } else {
            setData(fallbackData);
          }
          setIsLoading(false);
          setIsLiveRealtime(true);
        },
        (err) => {
          console.warn(`[usePublishedDoc] Listener warning for ${collectionName}/${documentId}:`, err);
          setError(err.message || 'Failed to receive real-time updates');
          setIsLoading(false);
          setIsLiveRealtime(false);
          // Fallback to static data
          setData(fallbackData);
        }
      );
    } catch (err: any) {
      console.warn(`[usePublishedDoc] Setup error for ${collectionName}/${documentId}:`, err);
      setError(err?.message || 'Initialization error');
      setIsLoading(false);
      setData(fallbackData);
    }
  }, [collectionName, documentId, fallbackData]);

  useEffect(() => {
    subscribe();
    return () => {
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
    };
  }, [subscribe]);

  const refresh = useCallback(async () => {
    if (!collectionName || !documentId) return;
    setIsLoading(true);
    try {
      const docRef = doc(db, collectionName, documentId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const raw = snap.data();
        if (!raw.publicationStatus || raw.publicationStatus === 'published') {
          setData({ ...raw, id: snap.id } as T);
        }
      }
    } catch (e: any) {
      setError(e?.message || 'Manual refresh failed');
    } finally {
      setIsLoading(false);
    }
  }, [collectionName, documentId]);

  return {
    data,
    isLoading,
    error,
    isUnavailable: !isLoading && !data,
    isLiveRealtime,
    refresh,
  };
}

/**
 * Hook to subscribe to published collection items in Firestore
 */
export function usePublishedCollection<T = any>(
  collectionName: string,
  filterFn?: (item: T) => boolean,
  fallbackData: T[] = []
): UsePublishedCollectionResult<T> {
  const [data, setData] = useState<T[]>(fallbackData);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiveRealtime, setIsLiveRealtime] = useState<boolean>(false);

  const unsubRef = useRef<Unsubscribe | null>(null);

  const subscribe = useCallback(() => {
    if (!collectionName) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const colRef = collection(db, collectionName);
      // Query published documents strictly
      const q = query(colRef, where('publicationStatus', '==', 'published'));

      if (unsubRef.current) {
        unsubRef.current();
      }

      unsubRef.current = onSnapshot(
        q,
        (snap) => {
          let items = snap.docs.map((d) => ({ ...d.data(), id: d.id } as T));
          if (filterFn) {
            items = items.filter(filterFn);
          }
          setData(items.length > 0 ? items : fallbackData);
          setIsLoading(false);
          setIsLiveRealtime(true);
        },
        (err) => {
          console.warn(`[usePublishedCollection] Listener error for ${collectionName}:`, err);
          setError(err.message || 'Collection real-time listener error');
          setIsLoading(false);
          setIsLiveRealtime(false);
          setData(fallbackData);
        }
      );
    } catch (err: any) {
      console.warn(`[usePublishedCollection] Setup error for ${collectionName}:`, err);
      setError(err?.message || 'Initialization error');
      setIsLoading(false);
      setData(fallbackData);
    }
  }, [collectionName, filterFn, fallbackData]);

  useEffect(() => {
    subscribe();
    return () => {
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
    };
  }, [subscribe]);

  const refresh = useCallback(async () => {
    if (!collectionName) return;
    setIsLoading(true);
    try {
      const colRef = collection(db, collectionName);
      const q = query(colRef, where('publicationStatus', '==', 'published'));
      const snap = await getDocs(q);
      let items = snap.docs.map((d) => ({ ...d.data(), id: d.id } as T));
      if (filterFn) {
        items = items.filter(filterFn);
      }
      setData(items.length > 0 ? items : fallbackData);
    } catch (e: any) {
      setError(e?.message || 'Refresh failed');
    } finally {
      setIsLoading(false);
    }
  }, [collectionName, filterFn, fallbackData]);

  return {
    data,
    isLoading,
    error,
    isUnavailable: !isLoading && (!data || data.length === 0),
    isLiveRealtime,
    refresh,
  };
}
