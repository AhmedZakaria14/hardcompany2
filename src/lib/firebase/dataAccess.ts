import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Unsubscribe,
  DocumentData,
} from 'firebase/firestore';
import { db } from '../firebase';
import { sanitizePayload, withServerTimestamps, toISOString } from './serializers';
import {
  validateLeadInput,
  validateAppointmentInput,
  validatePropertyInput,
  validateProjectInput,
  validateArticleInput,
  validateServiceInput,
  validateAdminProfileInput,
  validateSubscriberInput,
  ValidationError,
} from './validators';
import {
  PropertyDoc,
  ProjectDoc,
  ServiceDoc,
  ArticleDoc,
  LeadDoc,
  AppointmentRequestDoc,
  AuditEventDoc,
  RevisionDoc,
  SiteSettingsDoc,
  AdminProfileDoc,
} from '../../types/firestore-schema';

export class DataAccessError extends Error {
  constructor(
    message: string,
    public code: 'VALIDATION_ERROR' | 'UNAUTHORIZED' | 'NOT_FOUND' | 'DATABASE_ERROR' = 'DATABASE_ERROR',
    public details?: any
  ) {
    super(message);
    this.name = 'DataAccessError';
  }
}

// Helper to normalize Firestore document data with ISO timestamps
function normalizeDoc<T extends Record<string, any>>(docSnap: any): T {
  if (!docSnap || !docSnap.exists || typeof docSnap.exists === 'function' && !docSnap.exists()) {
    throw new DataAccessError('Document does not exist', 'NOT_FOUND');
  }
  const data = docSnap.data();
  return {
    ...data,
    id: docSnap.id,
    createdAt: toISOString(data?.createdAt || data?._serverTimestamp),
    updatedAt: toISOString(data?.updatedAt || data?._serverTimestamp),
  } as T;
}

// ==============================================================================
// 1. PUBLIC READ OPERATIONS
// ==============================================================================

export const PublicDataReader = {
  /**
   * Fetches published properties with optional sector or status filter.
   */
  async getPublishedProperties(filter?: { categoryId?: string; isFeatured?: boolean }): Promise<PropertyDoc[]> {
    try {
      const colRef = collection(db, 'properties');
      let q = query(colRef, where('publicationStatus', '==', 'published'));

      if (filter?.categoryId) {
        q = query(q, where('categoryId', '==', filter.categoryId));
      }
      if (filter?.isFeatured !== undefined) {
        q = query(q, where('isFeatured', '==', filter.isFeatured));
      }

      const snap = await getDocs(q);
      return snap.docs.map((d) => normalizeDoc<PropertyDoc>(d));
    } catch (e) {
      console.warn('[PublicDataReader] getPublishedProperties fallback/error:', e);
      return [];
    }
  },

  /**
   * Fetches published construction development projects.
   */
  async getPublishedProjects(): Promise<ProjectDoc[]> {
    try {
      const colRef = collection(db, 'construction_projects');
      const q = query(colRef, where('publicationStatus', '==', 'published'));
      const snap = await getDocs(q);
      return snap.docs.map((d) => normalizeDoc<ProjectDoc>(d));
    } catch (e) {
      console.warn('[PublicDataReader] getPublishedProjects error:', e);
      return [];
    }
  },

  /**
   * Fetches published services (HVAC and Contracting).
   */
  async getPublishedServices(sector?: string): Promise<ServiceDoc[]> {
    try {
      const colRef = collection(db, 'hvac_services');
      let q = query(colRef, where('publicationStatus', '==', 'published'));
      if (sector) {
        q = query(q, where('sector', '==', sector));
      }
      const snap = await getDocs(q);
      return snap.docs.map((d) => normalizeDoc<ServiceDoc>(d));
    } catch (e) {
      console.warn('[PublicDataReader] getPublishedServices error:', e);
      return [];
    }
  },

  /**
   * Fetches published blog articles.
   */
  async getPublishedArticles(): Promise<ArticleDoc[]> {
    try {
      const colRef = collection(db, 'blog_posts');
      const q = query(colRef, where('publicationStatus', '==', 'published'));
      const snap = await getDocs(q);
      return snap.docs.map((d) => normalizeDoc<ArticleDoc>(d));
    } catch (e) {
      console.warn('[PublicDataReader] getPublishedArticles error:', e);
      return [];
    }
  },

  /**
   * Subscribes to published collection updates with automatic subscription cleanup.
   */
  subscribeToPublishedCollection<T extends Record<string, any>>(
    collectionName: string,
    onData: (items: T[]) => void,
    onError?: (err: Error) => void
  ): Unsubscribe {
    const colRef = collection(db, collectionName);
    const q = query(colRef, where('publicationStatus', '==', 'published'));

    return onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((d) => normalizeDoc<T>(d));
        onData(items);
      },
      (err) => {
        console.error(`[PublicDataReader] Realtime error on collection '${collectionName}':`, err);
        if (onError) onError(err);
      }
    );
  },
};

// ==============================================================================
// 2. PUBLIC WRITE OPERATIONS (TRUSTED BOUNDARY)
// ==============================================================================

export const PublicDataWriter = {
  /**
   * Validates and submits a new customer lead/inquiry.
   */
  async submitLead(rawInput: Record<string, any>): Promise<{ lead: LeadDoc; trackingCode: string }> {
    const validated = validateLeadInput(rawInput);
    const leadId = `lead-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const trackingCode = `HARD-LEAD-${Math.floor(100000 + Math.random() * 900000)}`;

    const leadPayload: LeadDoc = {
      id: leadId,
      trackingCode,
      schemaVersion: '2.0.0',
      fullName: validated.fullName,
      email: validated.email,
      phone: validated.phone,
      sector: validated.sector,
      leadType: validated.leadType as any,
      subject: validated.subject,
      message: validated.message,
      metadata: validated.metadata,
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = doc(db, 'leads', leadId);
    await setDoc(docRef, withServerTimestamps(leadPayload, true));

    return { lead: leadPayload, trackingCode };
  },

  /**
   * Validates and submits an appointment or property viewing request.
   */
  async submitAppointmentRequest(rawInput: Record<string, any>): Promise<{ appointment: AppointmentRequestDoc; trackingCode: string }> {
    const validated = validateAppointmentInput(rawInput);
    const appointmentId = `app-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const trackingCode = `HARD-APP-${Math.floor(100000 + Math.random() * 900000)}`;

    const appointmentPayload: AppointmentRequestDoc = {
      id: appointmentId,
      trackingCode,
      schemaVersion: '2.0.0',
      clientName: validated.clientName,
      clientEmail: validated.clientEmail,
      clientPhone: validated.clientPhone,
      sector: validated.sector,
      preferredDate: validated.preferredDate,
      preferredTimeSlot: validated.preferredTimeSlot,
      locationType: validated.locationType,
      targetId: validated.targetId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = doc(db, 'appointment_requests', appointmentId);
    await setDoc(docRef, withServerTimestamps(appointmentPayload, true));

    return { appointment: appointmentPayload, trackingCode };
  },
};

// ==============================================================================
// 3. AUTHENTICATED ADMIN OPERATIONS & AUDIT GOVERNANCE
// ==============================================================================

export const AdminDataWriter = {
  /**
   * Records an immutable audit log event.
   */
  async recordAuditEvent(
    eventType: AuditEventDoc['eventType'],
    actorUid: string,
    actorEmail: string,
    details: Record<string, any>
  ): Promise<void> {
    try {
      const eventId = `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const eventPayload: AuditEventDoc = {
        id: eventId,
        schemaVersion: '2.0.0',
        eventType,
        actorUid,
        actorEmail,
        details,
        createdAt: new Date().toISOString(),
      };
      const docRef = doc(db, 'audit_events', eventId);
      await setDoc(docRef, sanitizePayload(eventPayload));
    } catch (e) {
      console.error('[AdminDataWriter] recordAuditEvent error:', e);
    }
  },

  /**
   * Saves a document draft and creates a revision snapshot.
   */
  async saveDraft(
    collectionName: string,
    documentId: string,
    draftData: Record<string, any>,
    authorUid: string,
    authorEmail: string
  ): Promise<void> {
    const docRef = doc(db, collectionName, documentId);
    const existingSnap = await getDoc(docRef);

    const payload = {
      ...(existingSnap.exists() ? existingSnap.data() : {}),
      ...draftData,
      id: documentId,
      publicationStatus: 'draft',
      updatedBy: authorUid,
    };

    await setDoc(docRef, withServerTimestamps(payload));

    // Record revision
    const revisionId = `rev-${Date.now()}`;
    const revisionPayload: RevisionDoc = {
      id: revisionId,
      schemaVersion: '2.0.0',
      collectionName,
      documentId,
      snapshotData: draftData,
      changeSummary: 'Saved draft',
      authorUid,
      authorEmail,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'revisions', revisionId), sanitizePayload(revisionPayload));

    // Audit log
    await this.recordAuditEvent('content_published', authorUid, authorEmail, {
      action: 'save_draft',
      collectionName,
      documentId,
    });
  },

  /**
   * Promotes a document to 'published' status.
   */
  async publishDocument(
    collectionName: string,
    documentId: string,
    authorUid: string,
    authorEmail: string
  ): Promise<void> {
    const docRef = doc(db, collectionName, documentId);
    await updateDoc(docRef, withServerTimestamps({
      publicationStatus: 'published',
      isPublished: true,
      publishedAt: new Date().toISOString(),
      updatedBy: authorUid,
    }));

    await this.recordAuditEvent('content_published', authorUid, authorEmail, {
      action: 'publish_document',
      collectionName,
      documentId,
    });
  },

  /**
   * Fetches operational leads for admin management dashboard.
   */
  async getAdminLeads(): Promise<LeadDoc[]> {
    try {
      const colRef = collection(db, 'leads');
      const snap = await getDocs(colRef);
      return snap.docs.map((d) => normalizeDoc<LeadDoc>(d));
    } catch (e) {
      console.error('[AdminDataWriter] getAdminLeads error:', e);
      return [];
    }
  },

  /**
   * Updates lead status in private operational data.
   */
  async updateLeadStatus(
    leadId: string,
    status: LeadDoc['status'],
    notes: string,
    actorUid: string,
    actorEmail: string
  ): Promise<void> {
    const docRef = doc(db, 'leads', leadId);
    await updateDoc(docRef, withServerTimestamps({
      status,
      notes,
      assignedTo: actorUid,
    }));

    await this.recordAuditEvent('lead_status_changed', actorUid, actorEmail, {
      leadId,
      newStatus: status,
    });
  },
};

// ==============================================================================
// 4. AUTHENTICATED ADMIN READ OPERATIONS
// ==============================================================================

export const AdminDataReader = {
  /**
   * Fetches all admin profiles for super admin management.
   */
  async getAdminProfiles(): Promise<AdminProfileDoc[]> {
    try {
      const colRef = collection(db, 'admin_profiles');
      const snap = await getDocs(colRef);
      return snap.docs.map((d) => normalizeDoc<AdminProfileDoc>(d));
    } catch (e) {
      console.error('[AdminDataReader] getAdminProfiles error:', e);
      throw new DataAccessError('Failed to fetch admin profiles', 'DATABASE_ERROR', e);
    }
  },

  /**
   * Fetches audit log events.
   */
  async getAuditEvents(limitCount = 100): Promise<AuditEventDoc[]> {
    try {
      const colRef = collection(db, 'audit_events');
      const q = query(colRef, limit(limitCount));
      const snap = await getDocs(q);
      return snap.docs.map((d) => normalizeDoc<AuditEventDoc>(d));
    } catch (e) {
      console.error('[AdminDataReader] getAuditEvents error:', e);
      return [];
    }
  },

  /**
   * Fetches all documents from a specific collection filtered by sector if provided.
   */
  async getCollectionDocs<T extends Record<string, any>>(
    collectionName: string,
    sectorFilter?: string
  ): Promise<T[]> {
    try {
      const colRef = collection(db, collectionName);
      let q = query(colRef);
      if (sectorFilter && sectorFilter !== 'group') {
        q = query(colRef, where('sector', '==', sectorFilter));
      }
      const snap = await getDocs(q);
      return snap.docs.map((d) => normalizeDoc<T>(d));
    } catch (e) {
      console.error(`[AdminDataReader] getCollectionDocs error on '${collectionName}':`, e);
      return [];
    }
  },

  /**
   * Realtime subscription for admin collections.
   */
  subscribeToAdminCollection<T extends Record<string, any>>(
    collectionName: string,
    onData: (items: T[]) => void,
    onError?: (err: Error) => void
  ): Unsubscribe {
    const colRef = collection(db, collectionName);
    return onSnapshot(
      colRef,
      (snap) => {
        const items = snap.docs.map((d) => normalizeDoc<T>(d));
        onData(items);
      },
      (err) => {
        console.error(`[AdminDataReader] Realtime snapshot error on '${collectionName}':`, err);
        if (onError) onError(err);
      }
    );
  },
};

// ==============================================================================
// 5. PRIVILEGED SERVER OPERATIONS
// ==============================================================================

export const ServerDataReader = {
  /**
   * Fetches single document by path securely.
   */
  async getDocByPath<T extends Record<string, any>>(collectionName: string, documentId: string): Promise<T | null> {
    try {
      const docRef = doc(db, collectionName, documentId);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return null;
      return normalizeDoc<T>(snap);
    } catch (e) {
      console.error(`[ServerDataReader] getDocByPath error on ${collectionName}/${documentId}:`, e);
      return null;
    }
  },
};

export const ServerDataWriter = {
  /**
   * Privileged admin profile provisioning.
   */
  async upsertAdminProfile(profile: AdminProfileDoc): Promise<void> {
    validateAdminProfileInput(profile);
    const docRef = doc(db, 'admin_profiles', profile.uid);
    await setDoc(docRef, withServerTimestamps(profile));
  },

  /**
   * Privileged hard delete for server tasks.
   */
  async deleteDocument(collectionName: string, documentId: string): Promise<void> {
    const docRef = doc(db, collectionName, documentId);
    await deleteDoc(docRef);
  },
};
