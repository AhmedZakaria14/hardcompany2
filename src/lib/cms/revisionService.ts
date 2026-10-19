/**
 * HARD GROUP - CMS REVISION HISTORY & RETENTION MANAGEMENT SERVICE
 * 
 * Provides version tracking, historical snapshot previews, non-destructive restoration
 * as new draft revisions, media/reference integrity analysis, and automated retention limits.
 */

import { collection, doc, getDocs, getDoc, setDoc, deleteDoc, query, where, orderBy, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';

export type RevisionChangeType = 'autosave_draft' | 'manual_draft' | 'published_release' | 'restored_draft';

export interface ContentRevisionDoc {
  id: string;
  entityType: string;
  entityId: string;
  sector?: string;
  version: number;
  snapshotData: any;
  changedBy: string;
  changedAt: string;
  changeType: RevisionChangeType;
  restoredFromVersion?: number;
  notes?: string;
}

export interface MediaCheckResult {
  hasMissingMedia: boolean;
  missingMediaUrls: string[];
  warnings: { ar: string; en: string }[];
}

export interface ReferenceCheckResult {
  hasOutdatedReferences: boolean;
  brokenReferences: string[];
  warnings: { ar: string; en: string }[];
}

export interface RevisionAnalysisResult {
  mediaCheck: MediaCheckResult;
  referenceCheck: ReferenceCheckResult;
}

const MAX_REVISION_RETENTION_COUNT = 30;

/**
 * Saves a new revision snapshot in Firestore and enforces retention policy.
 */
export async function saveRevisionSnapshot(
  entityType: string,
  entityId: string,
  snapshotData: any,
  userEmail: string,
  changeType: RevisionChangeType = 'manual_draft',
  sector = 'portal',
  notes?: string,
  restoredFromVersion?: number
): Promise<ContentRevisionDoc> {
  const revisionsCol = collection(db, 'revisions');
  const q = query(
    revisionsCol,
    where('entityType', '==', entityType),
    where('entityId', '==', entityId)
  );

  let nextVersion = 1;
  try {
    const snap = await getDocs(q);
    if (!snap.empty) {
      let maxV = 0;
      snap.forEach((d) => {
        const data = d.data();
        if (typeof data.version === 'number' && data.version > maxV) {
          maxV = data.version;
        }
      });
      nextVersion = maxV + 1;
    }
  } catch (err) {
    console.warn('[RevisionService] Could not determine max version, defaulting to timestamp version:', err);
    nextVersion = Math.floor(Date.now() / 1000);
  }

  const now = new Date().toISOString();
  const revisionId = `rev_${entityType}_${entityId}_v${nextVersion}_${Date.now()}`;
  const revDocRef = doc(db, 'revisions', revisionId);

  const newRevision: ContentRevisionDoc = {
    id: revisionId,
    entityType,
    entityId,
    sector,
    version: nextVersion,
    snapshotData,
    changedBy: userEmail || 'system_editor',
    changedAt: now,
    changeType,
    ...(restoredFromVersion ? { restoredFromVersion } : {}),
    ...(notes ? { notes } : {}),
  };

  try {
    await setDoc(revDocRef, newRevision);
    // Enforce retention policy asynchronously in background
    applyRevisionRetentionPolicy(entityType, entityId, MAX_REVISION_RETENTION_COUNT).catch((err) =>
      console.warn('[RevisionService] Retention policy error:', err)
    );
  } catch (err) {
    console.error('[RevisionService] Failed to save revision snapshot:', err);
    throw err;
  }

  return newRevision;
}

/**
 * Fetches all historical revisions for a given entity ordered from newest to oldest.
 */
export async function fetchRevisionHistory(entityType: string, entityId: string): Promise<ContentRevisionDoc[]> {
  try {
    const revisionsCol = collection(db, 'revisions');
    const q = query(
      revisionsCol,
      where('entityType', '==', entityType),
      where('entityId', '==', entityId)
    );

    const snap = await getDocs(q);
    const list: ContentRevisionDoc[] = [];

    snap.forEach((docSnap) => {
      const data = docSnap.data() as ContentRevisionDoc;
      list.push({ ...data, id: docSnap.id });
    });

    // Sort descending by version number or timestamp
    list.sort((a, b) => {
      if (b.version !== a.version) return b.version - a.version;
      return new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime();
    });

    return list;
  } catch (err) {
    console.warn('[RevisionService] Failed to fetch revisions from Firestore, returning empty list:', err);
    return [];
  }
}

/**
 * Analyzes missing media assets and outdated entity/author/category references in a snapshot.
 */
export async function analyzeRevisionIntegrity(snapshotData: any): Promise<RevisionAnalysisResult> {
  const mediaWarnings: { ar: string; en: string }[] = [];
  const missingMediaUrls: string[] = [];

  const refWarnings: { ar: string; en: string }[] = [];
  const brokenReferences: string[] = [];

  const jsonString = JSON.stringify(snapshotData || {});

  // 1. Detect image URLs in snapshot
  const urlRegex = /(https?:\/\/[^\s"'<>]+?\.(?:png|jpg|jpeg|webp|gif|svg))/gi;
  const matches = Array.from(new Set(jsonString.match(urlRegex) || []));

  for (const url of matches) {
    if (url.includes('placeholder') || url.includes('example.com') || url.length < 10) {
      missingMediaUrls.push(url);
      mediaWarnings.push({
        en: `Media asset URL '${url.substring(0, 45)}...' uses an unverified or temporary domain.`,
        ar: `رابط الصورة '${url.substring(0, 45)}...' قد يكون مؤقتاً أو غير متاح.`,
      });
    }
  }

  // 2. Check author references if present
  if (snapshotData?.authorId) {
    try {
      const authorSnap = await getDoc(doc(db, 'blog_authors', snapshotData.authorId));
      if (!authorSnap.exists()) {
        brokenReferences.push(`authorId:${snapshotData.authorId}`);
        refWarnings.push({
          en: `Referenced Author ID '${snapshotData.authorId}' no longer exists in the author registry.`,
          ar: `الكاتب المرجعي المنسوب (ID: ${snapshotData.authorId}) لم يعد موجوداً في سجل الكتاب.`,
        });
      }
    } catch {
      // Ignore network errors in checks
    }
  }

  // 3. Check category references if present
  if (snapshotData?.categoryId) {
    try {
      const catSnap = await getDoc(doc(db, 'blog_categories', snapshotData.categoryId));
      if (!catSnap.exists()) {
        brokenReferences.push(`categoryId:${snapshotData.categoryId}`);
        refWarnings.push({
          en: `Referenced Category ID '${snapshotData.categoryId}' was removed or updated.`,
          ar: `التصنيف المرجعي المنسوب (ID: ${snapshotData.categoryId}) تم تحسينه أو حذفه.`,
        });
      }
    } catch {
      // Ignore network errors in checks
    }
  }

  return {
    mediaCheck: {
      hasMissingMedia: missingMediaUrls.length > 0,
      missingMediaUrls,
      warnings: mediaWarnings,
    },
    referenceCheck: {
      hasOutdatedReferences: brokenReferences.length > 0,
      brokenReferences,
      warnings: refWarnings,
    },
  };
}

/**
 * Restores a historical revision snapshot into a NEW draft without overwriting or destroying history.
 */
export async function restoreRevisionToDraft(
  entityType: string,
  entityId: string,
  revision: ContentRevisionDoc,
  userEmail: string
): Promise<{ newDraft: any; newRevision: ContentRevisionDoc }> {
  const draftDocRef = doc(db, 'cms_drafts', `${entityType}_${entityId}`);
  const now = new Date().toISOString();

  // Read existing draft to safely bump revision/version
  let currentRevNumber = 1;
  try {
    const existingDraft = await getDoc(draftDocRef);
    if (existingDraft.exists()) {
      const d = existingDraft.data();
      currentRevNumber = (d.revision || 1) + 1;
    }
  } catch (err) {
    console.warn('[RevisionService] Could not read existing draft revision number:', err);
  }

  const restoredDraftPayload = {
    entityType,
    entityId,
    content: revision.snapshotData,
    revision: currentRevNumber,
    status: 'draft',
    lastSavedAt: now,
    lastSavedBy: userEmail,
    restoredFromVersion: revision.version,
    restoredAt: now,
  };

  // Write new draft to Firestore
  await setDoc(draftDocRef, restoredDraftPayload, { merge: true });

  // Record a new revision snapshot representing the restoration event
  const newRevisionDoc = await saveRevisionSnapshot(
    entityType,
    entityId,
    revision.snapshotData,
    userEmail,
    'restored_draft',
    revision.sector || 'portal',
    `Restored from historical version v${revision.version}`,
    revision.version
  );

  return {
    newDraft: restoredDraftPayload,
    newRevision: newRevisionDoc,
  };
}

/**
 * Automated retention policy: keeps at most maxRevisions per entityType/entityId to prevent unlimited growth.
 */
export async function applyRevisionRetentionPolicy(
  entityType: string,
  entityId: string,
  maxRevisions = MAX_REVISION_RETENTION_COUNT
): Promise<number> {
  const history = await fetchRevisionHistory(entityType, entityId);
  if (history.length <= maxRevisions) {
    return 0; // Within threshold
  }

  const excess = history.slice(maxRevisions);
  let deletedCount = 0;

  const batch = writeBatch(db);
  for (const item of excess) {
    const docRef = doc(db, 'revisions', item.id);
    batch.delete(docRef);
    deletedCount++;
  }

  await batch.commit();
  return deletedCount;
}
