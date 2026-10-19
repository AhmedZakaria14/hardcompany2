/**
 * HARD GROUP - CMS ARCHIVAL, TRASH & RECOVERABLE DELETION SERVICE
 * 
 * Provides reference checks, soft-delete archival into `trash_bin`, draft restoration,
 * deliberate permanent deletion with Super Admin authorization, and customer record isolation.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';
import { canManageSettings } from '../../types/firestore-schema';
import { PublisherUser } from './publicationTypes';
import {
  TrashEntityType,
  TrashItem,
  ReferenceCheckResult,
  ReferencedLocation,
  SoftDeleteParams,
} from './archivalTypes';

const DEFAULT_RETENTION_DAYS = 30;

/**
 * Scans Firestore collections to check for active references before soft deleting an entity.
 * Also explicitly verifies that customer records will remain preserved and un-cascaded.
 */
export async function checkReferencesBeforeDelete(
  entityType: TrashEntityType,
  entityId: string,
  entityTitle?: any
): Promise<ReferenceCheckResult> {
  const referencedLocations: ReferencedLocation[] = [];
  const warningsAr: string[] = [];
  const warningsEn: string[] = [];

  let hasCustomerLeads = false;

  // 1. Navigation Reference Check
  try {
    const navSnap = await getDocs(collection(db, 'navigation'));
    navSnap.forEach((docSnap) => {
      const data = docSnap.data();
      const itemsStr = JSON.stringify(data.items || []);
      if (itemsStr.includes(entityId)) {
        referencedLocations.push({
          type: 'navigation',
          title: {
            ar: `شريط التنقل: ${data.title?.ar || docSnap.id}`,
            en: `Navigation Menu: ${data.title?.en || docSnap.id}`,
          },
          location: `navigation/${docSnap.id}`,
        });
      }
    });
  } catch (err) {
    console.warn('[ArchivalService] Nav check warning:', err);
  }

  // 2. Page & Structured Content Reference Check
  try {
    const pagesSnap = await getDocs(collection(db, 'pages'));
    pagesSnap.forEach((docSnap) => {
      const data = docSnap.data();
      const sectionsStr = JSON.stringify(data.sections || []);
      if (sectionsStr.includes(entityId)) {
        referencedLocations.push({
          type: 'published_page',
          title: {
            ar: `صفحة منشورة: ${data.title?.ar || docSnap.id}`,
            en: `Published Page: ${data.title?.en || docSnap.id}`,
          },
          location: `pages/${docSnap.id}`,
        });
      }
    });
  } catch (err) {
    console.warn('[ArchivalService] Page check warning:', err);
  }

  // 3. Blog Articles Reference Check (for categories / authors)
  if (entityType === 'category' || entityType === 'author') {
    try {
      const blogSnap = await getDocs(collection(db, 'blog_posts'));
      blogSnap.forEach((docSnap) => {
        const post = docSnap.data();
        if (
          (entityType === 'category' && (post.categoryId === entityId || JSON.stringify(post.category || '').includes(entityId))) ||
          (entityType === 'author' && (post.authorId === entityId || JSON.stringify(post.author || '').includes(entityId)))
        ) {
          referencedLocations.push({
            type: 'article',
            title: {
              ar: `مقال مدونة: ${post.title?.ar || docSnap.id}`,
              en: `Blog Article: ${post.title?.en || docSnap.id}`,
            },
            location: `blog_posts/${docSnap.id}`,
          });
        }
      });
    } catch (err) {
      console.warn('[ArchivalService] Blog check warning:', err);
    }
  }

  // 4. Customer Records Inspection (CRITICAL ISOLATION RULE)
  // Check if customer leads reference this property/project/service. Customer records are NEVER deleted!
  try {
    const inquiryCollections = ['property_inquiries', 'project_inquiries', 'viewing_bookings', 'valuation_leads', 'contact_leads'];
    let customerLeadCount = 0;

    for (const colName of inquiryCollections) {
      try {
        const colRef = collection(db, colName);
        const qProp = query(colRef, where('propertyId', '==', entityId));
        const qProj = query(colRef, where('projectId', '==', entityId));
        
        const [snapProp, snapProj] = await Promise.all([
          getDocs(qProp).catch(() => null),
          getDocs(qProj).catch(() => null),
        ]);

        const count = (snapProp?.size || 0) + (snapProj?.size || 0);
        if (count > 0) {
          customerLeadCount += count;
          referencedLocations.push({
            type: 'customer_lead',
            title: {
              ar: `طلبات واستفسارات العملاء (${colName}): ${count} سجلات`,
              en: `Customer Leads (${colName}): ${count} records`,
            },
            location: colName,
            isCustomerRecord: true,
          });
        }
      } catch {
        // Ignore single collection query missing index
      }
    }

    if (customerLeadCount > 0) {
      hasCustomerLeads = true;
      warningsAr.push(`يوجد ${customerLeadCount} طلب/استفسار للعملاء مرتبط بهذا العنصر. سيتم الحفاظ الكامل على كافة طلبات العملاء ولن يتم حذفها إطلاقاً.`);
      warningsEn.push(`Found ${customerLeadCount} customer leads linked to this entity. Customer records are strictly preserved and will NOT be deleted.`);
    }
  } catch (err) {
    console.warn('[ArchivalService] Customer lead check warning:', err);
  }

  // Construct active warnings for public site references
  const publicRefs = referencedLocations.filter((r) => !r.isCustomerRecord);
  if (publicRefs.length > 0) {
    warningsAr.push(`تنبيه: هذا العنصر مستخدم حالياً في ${publicRefs.length} موضع منشور بالموقع العامة (صفحات/قوائم). أرشفته قد تؤدي لروابط مفقودة.`);
    warningsEn.push(`Warning: This entity is currently referenced in ${publicRefs.length} public site locations (pages/menus). Archiving it may cause missing links.`);
  } else {
    warningsAr.push('لا توجد مراجع عامة نشطة ترتبط بهذا العنصر.');
    warningsEn.push('No active public menu or page references found for this item.');
  }

  return {
    hasActiveReferences: publicRefs.length > 0,
    hasCustomerLeads,
    referencedLocations,
    warningsAr,
    warningsEn,
    canSafeSoftDelete: true,
  };
}

/**
 * Soft-deletes / archives an entity into `trash_bin` in Firestore.
 * Removes the item from public collections without touching customer lead records.
 */
export async function moveToTrash(params: SoftDeleteParams): Promise<TrashItem> {
  const {
    entityType,
    entityId,
    title,
    sector = 'portal',
    originalCollection,
    originalData,
    userEmail,
    userRole,
    retentionDays = DEFAULT_RETENTION_DAYS,
  } = params;

  const now = new Date();
  const deletedAt = now.toISOString();

  const retentionDate = new Date(now.getTime() + retentionDays * 24 * 60 * 60 * 1000);
  const retentionExpiresAt = retentionDate.toISOString();

  const trashId = `trash_${entityType}_${entityId}`;
  const trashDocRef = doc(db, 'trash_bin', trashId);

  // Run reference check to record pre-deletion warnings
  const refCheck = await checkReferencesBeforeDelete(entityType, entityId, title);

  const trashItem: TrashItem = {
    id: trashId,
    entityType,
    entityId,
    title,
    sector,
    originalCollection,
    originalData,
    deletedBy: userEmail,
    deletedByRole: userRole,
    deletedAt,
    retentionExpiresAt,
    referenceWarningsOnDelete: refCheck.warningsEn,
  };

  const batch = writeBatch(db);

  // 1. Move to Trash Bin
  batch.set(trashDocRef, trashItem);

  // 2. Remove or mark soft-deleted in original public collection
  const origDocRef = doc(db, originalCollection, entityId);
  batch.set(
    origDocRef,
    {
      publicationStatus: 'archived',
      isArchived: true,
      archivedAt: deletedAt,
      archivedBy: userEmail,
    },
    { merge: true }
  );

  // 3. Remove corresponding draft if present in cms_drafts
  const draftDocRef = doc(db, 'cms_drafts', `${entityType}_${entityId}`);
  batch.delete(draftDocRef);

  // 4. Record Audit Event
  const auditEventId = `audit_archive_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const auditDocRef = doc(db, 'audit_events', auditEventId);
  batch.set(auditDocRef, {
    id: auditEventId,
    eventType: 'CONTENT_ARCHIVED',
    entityType,
    entityId,
    actorEmail: userEmail,
    actorRole: userRole,
    createdAt: deletedAt,
    notes: `Moved to trash bin with ${retentionDays}-day retention policy.`,
  });

  await batch.commit();

  return trashItem;
}

/**
 * Restores a soft-deleted item from `trash_bin` back into `cms_drafts` as a draft revision.
 */
export async function restoreFromTrash(trashId: string, userEmail: string): Promise<any> {
  const trashDocRef = doc(db, 'trash_bin', trashId);
  const snap = await getDoc(trashDocRef);

  if (!snap.exists()) {
    throw new Error(`Trash record '${trashId}' not found or already purged.`);
  }

  const trashItem = snap.data() as TrashItem;
  const now = new Date().toISOString();

  const batch = writeBatch(db);

  // 1. Restore into cms_drafts as a draft payload for editor review
  const draftDocRef = doc(db, 'cms_drafts', `${trashItem.entityType}_${trashItem.entityId}`);
  const restoredDraftPayload = {
    entityType: trashItem.entityType,
    entityId: trashItem.entityId,
    content: trashItem.originalData,
    revision: 1,
    status: 'draft',
    lastSavedAt: now,
    lastSavedBy: userEmail,
    restoredFromTrashAt: now,
  };
  batch.set(draftDocRef, restoredDraftPayload, { merge: true });

  // 2. Update status in original collection to 'draft'
  const origDocRef = doc(db, trashItem.originalCollection, trashItem.entityId);
  batch.set(
    origDocRef,
    {
      publicationStatus: 'draft',
      isArchived: false,
      restoredAt: now,
      restoredBy: userEmail,
    },
    { merge: true }
  );

  // 3. Delete from trash_bin
  batch.delete(trashDocRef);

  // 4. Record Audit Event
  const auditEventId = `audit_restore_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const auditDocRef = doc(db, 'audit_events', auditEventId);
  batch.set(auditDocRef, {
    id: auditEventId,
    eventType: 'CONTENT_RESTORED',
    entityType: trashItem.entityType,
    entityId: trashItem.entityId,
    actorEmail: userEmail,
    createdAt: now,
    notes: `Restored from trash bin to CMS draft state.`,
  });

  await batch.commit();

  return restoredDraftPayload;
}

/**
 * Permanently deletes an item from `trash_bin`. Requires Super Admin permissions.
 */
export async function permanentlyDeleteFromTrash(trashId: string, user: PublisherUser): Promise<void> {
  if (!canManageSettings(user.role) && user.role !== 'superadmin') {
    throw new Error(
      `PERMISSION_DENIED: Role '${user.role}' is not authorized to execute permanent deletion. Super Admin privileges required.`
    );
  }

  const trashDocRef = doc(db, 'trash_bin', trashId);
  const snap = await getDoc(trashDocRef);

  if (!snap.exists()) {
    return;
  }

  const trashItem = snap.data() as TrashItem;
  const now = new Date().toISOString();

  const batch = writeBatch(db);

  // 1. Permanently remove from trash_bin
  batch.delete(trashDocRef);

  // 2. Permanently remove document from original collection
  const origDocRef = doc(db, trashItem.originalCollection, trashItem.entityId);
  batch.delete(origDocRef);

  // 3. Record Audit Event
  const auditEventId = `audit_permanent_delete_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const auditDocRef = doc(db, 'audit_events', auditEventId);
  batch.set(auditDocRef, {
    id: auditEventId,
    eventType: 'CONTENT_PERMANENTLY_DELETED',
    entityType: trashItem.entityType,
    entityId: trashItem.entityId,
    actorEmail: user.email,
    actorRole: user.role,
    createdAt: now,
    notes: `Permanently deleted by Super Admin. Customer records remained preserved.`,
  });

  await batch.commit();
}

/**
 * Fetches all items currently residing in the `trash_bin` collection.
 */
export async function fetchTrashBinItems(): Promise<TrashItem[]> {
  try {
    const snap = await getDocs(collection(db, 'trash_bin'));
    const list: TrashItem[] = [];

    snap.forEach((docSnap) => {
      list.push({ ...docSnap.data(), id: docSnap.id } as TrashItem);
    });

    list.sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());

    return list;
  } catch (err) {
    console.warn('[ArchivalService] Failed to fetch trash items from Firestore:', err);
    return [];
  }
}

/**
 * Purges expired items from `trash_bin` whose retentionExpiresAt has passed.
 */
export async function purgeExpiredTrash(): Promise<number> {
  const items = await fetchTrashBinItems();
  const nowIso = new Date().toISOString();

  const expired = items.filter((item) => item.retentionExpiresAt && item.retentionExpiresAt <= nowIso);

  if (expired.length === 0) return 0;

  const batch = writeBatch(db);
  for (const item of expired) {
    batch.delete(doc(db, 'trash_bin', item.id));
    batch.delete(doc(db, item.originalCollection, item.entityId));
  }

  await batch.commit();
  return expired.length;
}
