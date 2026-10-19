import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  arrayUnion,
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { syncLeadToCrm } from '../integrations/crmSync';

export interface LeadNote {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}

export interface LeadStatusHistory {
  id: string;
  fromStatus: string;
  toStatus: string;
  changedBy: string;
  timestamp: string;
  note?: string;
}

export interface FirestoreLead {
  id: string;
  trackingCode: string;
  idempotencyKey?: string;
  formType: string;
  schemaVersion?: string;
  sector: string;
  fullName: string;
  name?: string;
  email: string;
  phone: string;
  preferredContactMethod?: string;
  entityId?: string | null;
  entityTitle?: string | null;
  language?: string;
  message?: string;
  details?: Record<string, any>;
  status: 'new' | 'contacted' | 'qualified' | 'under_negotiation' | 'closed' | 'archived';
  processingStatus?: string;
  assignedTo?: string;
  assignedToName?: string;
  followUpDate?: string;
  internalNotes?: LeadNote[];
  statusHistory?: LeadStatusHistory[];
  crmSynced?: boolean;
  crmReferenceId?: string;
  crmSystem?: string;
  notificationStatus?: 'delivered' | 'failed' | 'unconfigured' | 'pending_retry' | 'duplicate_skipped' | string;
  notificationProvider?: string;
  attachments?: any[];
  notificationLastAttemptAt?: string;
  notificationError?: string;
  submittedAt?: any;
  createdAt: string;
  updatedAt?: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path,
  };
  console.error('[Firestore Error]:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Real-time listener for leads collection sorted by createdAt descending
 */
export function subscribeToLeads(
  onData: (leads: FirestoreLead[]) => void,
  onError: (err: any) => void
): () => void {
  const path = 'leads';
  const leadsQuery = query(collection(db, path), orderBy('createdAt', 'desc'));

  return onSnapshot(
    leadsQuery,
    (snapshot) => {
      const items: FirestoreLead[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          trackingCode: data.trackingCode || `HARD-${d.id.substring(0, 5)}`,
          formType: data.formType || 'general_contact',
          schemaVersion: data.schemaVersion || '1.0.0',
          sector: data.sector || 'portal',
          fullName: data.fullName || data.name || 'Valued Client',
          name: data.name || data.fullName || 'Valued Client',
          email: data.email || '',
          phone: data.phone || '',
          preferredContactMethod: data.preferredContactMethod || 'whatsapp',
          entityId: data.entityId || null,
          entityTitle: data.entityTitle || null,
          language: data.language || 'en',
          message: data.message || '',
          details: data.details || {},
          status: data.status || data.processingStatus || 'new',
          processingStatus: data.processingStatus || data.status || 'new',
          assignedTo: data.assignedTo || '',
          assignedToName: data.assignedToName || '',
          followUpDate: data.followUpDate || '',
          internalNotes: Array.isArray(data.internalNotes) ? data.internalNotes : [],
          statusHistory: Array.isArray(data.statusHistory) ? data.statusHistory : [],
          crmSynced: Boolean(data.crmSynced),
          crmReferenceId: data.crmReferenceId || '',
          crmSystem: data.crmSystem || '',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || '',
        } as FirestoreLead;
      });
      onData(items);
    },
    (error) => {
      console.warn('Leads onSnapshot failed or permission denied:', error);
      onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

/**
 * Update lead status with audit history log
 */
export async function updateLeadStatus(
  leadId: string,
  currentLead: FirestoreLead,
  newStatus: FirestoreLead['status'],
  actorEmail: string,
  note?: string
): Promise<boolean> {
  const path = `leads/${leadId}`;
  try {
    const docRef = doc(db, 'leads', leadId);
    const nowIso = new Date().toISOString();

    const historyEntry: LeadStatusHistory = {
      id: `hist-${Date.now()}`,
      fromStatus: currentLead.status,
      toStatus: newStatus,
      changedBy: actorEmail || 'Admin',
      timestamp: nowIso,
      note: note || `Status updated to ${newStatus}`,
    };

    const updatedHistory = [...(currentLead.statusHistory || []), historyEntry];

    await updateDoc(docRef, {
      status: newStatus,
      processingStatus: newStatus,
      statusHistory: updatedHistory,
      updatedAt: nowIso,
    });

    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    return false;
  }
}

/**
 * Assign staff member to lead
 */
export async function assignLeadStaff(
  leadId: string,
  currentLead: FirestoreLead,
  assignedTo: string,
  assignedToName: string,
  actorEmail: string
): Promise<boolean> {
  const path = `leads/${leadId}`;
  try {
    const docRef = doc(db, 'leads', leadId);
    const nowIso = new Date().toISOString();

    const historyEntry: LeadStatusHistory = {
      id: `hist-${Date.now()}`,
      fromStatus: currentLead.status,
      toStatus: currentLead.status,
      changedBy: actorEmail || 'Admin',
      timestamp: nowIso,
      note: `Assigned lead to ${assignedToName || assignedTo || 'Unassigned'}`,
    };

    const updatedHistory = [...(currentLead.statusHistory || []), historyEntry];

    await updateDoc(docRef, {
      assignedTo: assignedTo || '',
      assignedToName: assignedToName || '',
      statusHistory: updatedHistory,
      updatedAt: nowIso,
    });

    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    return false;
  }
}

/**
 * Set follow up date for lead
 */
export async function setLeadFollowUpDate(
  leadId: string,
  followUpDate: string,
  actorEmail: string
): Promise<boolean> {
  const path = `leads/${leadId}`;
  try {
    const docRef = doc(db, 'leads', leadId);
    const nowIso = new Date().toISOString();

    await updateDoc(docRef, {
      followUpDate: followUpDate || '',
      updatedAt: nowIso,
    });

    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    return false;
  }
}

/**
 * Add internal note to lead
 */
export async function addLeadInternalNote(
  leadId: string,
  currentLead: FirestoreLead,
  noteText: string,
  actorEmail: string
): Promise<boolean> {
  const path = `leads/${leadId}`;
  try {
    const docRef = doc(db, 'leads', leadId);
    const nowIso = new Date().toISOString();

    const newNote: LeadNote = {
      id: `note-${Date.now()}`,
      text: noteText.trim(),
      author: actorEmail || 'Admin',
      createdAt: nowIso,
    };

    const updatedNotes = [newNote, ...(currentLead.internalNotes || [])];

    await updateDoc(docRef, {
      internalNotes: updatedNotes,
      updatedAt: nowIso,
    });

    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    return false;
  }
}

/**
 * Trigger manual CRM sync for a lead document
 */
export async function triggerLeadCrmSync(
  lead: FirestoreLead,
  actorEmail: string
): Promise<{ success: boolean; crmRef?: string; system?: string }> {
  const path = `leads/${lead.id}`;
  try {
    const syncRes = await syncLeadToCrm({
      id: lead.id,
      name: lead.fullName || lead.name || 'Valued Client',
      email: lead.email,
      phone: lead.phone,
      property_id: lead.entityId || undefined,
      property_title: lead.entityTitle || undefined,
      inquiry_type: (lead.formType as any) || 'general_contact',
      recipient_email: lead.details?.recipientEmail || 'info@hardgp.com',
      message: lead.message,
      status: (lead.status as any) || 'new',
      crm_sync_status: 'synced',
      source: `Portal (${lead.sector})`,
      created_at: lead.createdAt,
    });

    if (syncRes.success) {
      const docRef = doc(db, 'leads', lead.id);
      await updateDoc(docRef, {
        crmSynced: true,
        crmReferenceId: syncRes.crmReferenceId,
        crmSystem: syncRes.crmSystem,
        updatedAt: new Date().toISOString(),
      });
    }

    return {
      success: syncRes.success,
      crmRef: syncRes.crmReferenceId,
      system: syncRes.crmSystem,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    return { success: false };
  }
}
