import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { SectorId } from '../../types/firestore-schema';

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
  console.error('Firestore Appointment Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'rescheduled' | 'completed' | 'cancelled';
export type AppointmentType = 'property_viewing' | 'hvac_maintenance' | 'hvac_installation' | 'hvac_inspection' | 'construction_site_visit';

export interface AuditTrailEntry {
  id: string;
  timestamp: string;
  action: 'created' | 'confirmed' | 'rescheduled' | 'cancelled' | 'completed' | 'note_added' | 'assigned';
  performedBy: string;
  performedByEmail?: string;
  notes?: string;
  changes?: Record<string, { from: any; to: any }>;
}

export interface FirestoreAppointment {
  id: string;
  trackingCode: string;
  appointmentType: AppointmentType;
  sector: SectorId;
  
  // Requested Time Details
  preferredDate: string; // YYYY-MM-DD
  preferredTimeWindow: string; // e.g. "09:00 - 12:00"
  localTimezone: string; // e.g. "Asia/Riyadh"

  // Confirmed Time Details (Distinguished from requested)
  isConfirmed: boolean;
  confirmedDate?: string; // YYYY-MM-DD
  confirmedTimeWindow?: string;
  confirmedTimezone?: string;

  // Reference (Property, HVAC Service, or Project)
  referenceType: 'property' | 'service' | 'project' | 'general';
  referenceId?: string | null;
  referenceTitle?: string | null;

  // Customer Details
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  preferredContactMethod?: 'phone' | 'whatsapp' | 'email';
  customerNotes?: string;

  // Operational State
  status: AppointmentStatus;
  assignedStaffUid?: string | null;
  assignedStaffName?: string | null;
  internalNotes?: string[];
  auditTrail: AuditTrailEntry[];

  // Metadata
  createdAt: string;
  updatedAt: string;
}

export class AppointmentConflictError extends Error {
  conflictingAppointment: { id: string; trackingCode: string; customerName: string; timeWindow: string };

  constructor(message: string, conflictingAppointment: any) {
    super(message);
    this.name = 'AppointmentConflictError';
    this.conflictingAppointment = conflictingAppointment;
  }
}

/**
 * Real-time subscription to appointment requests
 */
export function subscribeToAppointments(
  onData: (appointments: FirestoreAppointment[]) => void,
  onError?: (err: Error) => void
): () => void {
  const collectionRef = collection(db, 'appointment_requests');
  const q = query(collectionRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const appointments: FirestoreAppointment[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          trackingCode: data.trackingCode || `APPT-${d.id.slice(0, 6)}`,
          appointmentType: data.appointmentType || 'property_viewing',
          sector: data.sector || 'realestate',
          preferredDate: data.preferredDate || new Date().toISOString().split('T')[0],
          preferredTimeWindow: data.preferredTimeWindow || '10:00 - 12:00',
          localTimezone: data.localTimezone || 'Asia/Riyadh (UTC+3)',
          isConfirmed: Boolean(data.isConfirmed),
          confirmedDate: data.confirmedDate,
          confirmedTimeWindow: data.confirmedTimeWindow,
          confirmedTimezone: data.confirmedTimezone,
          referenceType: data.referenceType || 'general',
          referenceId: data.referenceId || null,
          referenceTitle: data.referenceTitle || null,
          customerName: data.customerName || data.clientName || 'Anonymous',
          customerEmail: data.customerEmail || data.clientEmail || '',
          customerPhone: data.customerPhone || data.clientPhone || '',
          preferredContactMethod: data.preferredContactMethod || 'whatsapp',
          customerNotes: data.customerNotes || data.message || '',
          status: data.status || 'pending',
          assignedStaffUid: data.assignedStaffUid || null,
          assignedStaffName: data.assignedStaffName || null,
          internalNotes: Array.isArray(data.internalNotes) ? data.internalNotes : [],
          auditTrail: Array.isArray(data.auditTrail) ? data.auditTrail : [],
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        };
      });
      onData(appointments);
    },
    (error) => {
      console.error('Error listening to appointments:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, 'appointment_requests');
    }
  );
}

/**
 * Creates a new appointment request
 */
export async function createAppointmentRequest(
  payload: Omit<FirestoreAppointment, 'id' | 'trackingCode' | 'isConfirmed' | 'status' | 'auditTrail' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const apptId = `appt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const trackingCode = `APPT-2026-${Math.floor(100000 + Math.random() * 900000)}`;
  const now = new Date().toISOString();

  const auditEntry: AuditTrailEntry = {
    id: `audit-${Date.now()}`,
    timestamp: now,
    action: 'created',
    performedBy: payload.customerEmail || 'customer_submission',
    notes: 'Appointment request submitted by customer.',
  };

  const apptDoc: FirestoreAppointment = {
    ...payload,
    id: apptId,
    trackingCode,
    isConfirmed: false,
    status: 'pending',
    internalNotes: [],
    auditTrail: [auditEntry],
    createdAt: now,
    updatedAt: now,
  };

  try {
    const docRef = doc(db, 'appointment_requests', apptId);
    await setDoc(docRef, apptDoc);
    return apptId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `appointment_requests/${apptId}`);
    throw error;
  }
}

/**
 * Transactional Confirmation with Conflict Prevention
 * Checks for conflicting confirmed appointments for the same reference/resource on the confirmed date & time slot.
 */
export async function confirmAppointmentWithTransaction(
  appointmentId: string,
  confirmationData: {
    confirmedDate: string;
    confirmedTimeWindow: string;
    confirmedTimezone: string;
    assignedStaffName?: string;
    notes?: string;
  },
  operatorEmail: string
): Promise<void> {
  const apptDocRef = doc(db, 'appointment_requests', appointmentId);

  try {
    await runTransaction(db, async (transaction) => {
      const apptDoc = await transaction.get(apptDocRef);
      if (!apptDoc.exists()) {
        throw new Error('Appointment request not found.');
      }

      const currentData = apptDoc.data() as FirestoreAppointment;

      // Check for conflicts in the appointment_requests collection
      // Query all existing confirmed appointments on the same date
      const apptsRef = collection(db, 'appointment_requests');
      const conflictQuery = query(
        apptsRef,
        where('status', '==', 'confirmed'),
        where('confirmedDate', '==', confirmationData.confirmedDate)
      );

      const conflictSnap = await getDocs(conflictQuery);
      const conflicts = conflictSnap.docs.filter((docSnap) => {
        if (docSnap.id === appointmentId) return false; // Ignore current appointment
        const data = docSnap.data();
        
        // Match either same referenceId or same time window if resource is shared
        const sameTimeWindow = data.confirmedTimeWindow === confirmationData.confirmedTimeWindow;
        const sameReference = currentData.referenceId && data.referenceId === currentData.referenceId;
        const sameStaff = confirmationData.assignedStaffName && data.assignedStaffName === confirmationData.assignedStaffName;

        return sameTimeWindow && (sameReference || sameStaff);
      });

      if (conflicts.length > 0) {
        const existingConflict = conflicts[0].data();
        throw new AppointmentConflictError(
          `Schedule Conflict: Slot ${confirmationData.confirmedDate} (${confirmationData.confirmedTimeWindow}) is already confirmed for ${existingConflict.customerName || 'another customer'} (${existingConflict.trackingCode}).`,
          {
            id: conflicts[0].id,
            trackingCode: existingConflict.trackingCode,
            customerName: existingConflict.customerName,
            timeWindow: existingConflict.confirmedTimeWindow,
          }
        );
      }

      const now = new Date().toISOString();
      const auditEntry: AuditTrailEntry = {
        id: `audit-${Date.now()}`,
        timestamp: now,
        action: 'confirmed',
        performedBy: operatorEmail,
        notes: confirmationData.notes || 'Appointment officially confirmed with trusted schedule verification.',
        changes: {
          status: { from: currentData.status, to: 'confirmed' },
          confirmedDate: { from: currentData.confirmedDate || null, to: confirmationData.confirmedDate },
          confirmedTimeWindow: { from: currentData.confirmedTimeWindow || null, to: confirmationData.confirmedTimeWindow },
        },
      };

      const updatedAuditTrail = [...(currentData.auditTrail || []), auditEntry];

      transaction.update(apptDocRef, {
        status: 'confirmed',
        isConfirmed: true,
        confirmedDate: confirmationData.confirmedDate,
        confirmedTimeWindow: confirmationData.confirmedTimeWindow,
        confirmedTimezone: confirmationData.confirmedTimezone,
        assignedStaffName: confirmationData.assignedStaffName || currentData.assignedStaffName || null,
        auditTrail: updatedAuditTrail,
        updatedAt: now,
      });
    });
  } catch (error) {
    if (error instanceof AppointmentConflictError) {
      throw error;
    }
    handleFirestoreError(error, OperationType.UPDATE, `appointment_requests/${appointmentId}`);
    throw error;
  }
}

/**
 * Transactional Rescheduling with Conflict Prevention
 */
export async function rescheduleAppointmentWithTransaction(
  appointmentId: string,
  rescheduleData: {
    newDate: string;
    newTimeWindow: string;
    timezone: string;
    reason: string;
  },
  operatorEmail: string
): Promise<void> {
  const apptDocRef = doc(db, 'appointment_requests', appointmentId);

  try {
    await runTransaction(db, async (transaction) => {
      const apptDoc = await transaction.get(apptDocRef);
      if (!apptDoc.exists()) {
        throw new Error('Appointment request not found.');
      }

      const currentData = apptDoc.data() as FirestoreAppointment;

      // Check conflicts for new date/time slot
      const apptsRef = collection(db, 'appointment_requests');
      const conflictQuery = query(
        apptsRef,
        where('status', '==', 'confirmed'),
        where('confirmedDate', '==', rescheduleData.newDate)
      );

      const conflictSnap = await getDocs(conflictQuery);
      const conflicts = conflictSnap.docs.filter((docSnap) => {
        if (docSnap.id === appointmentId) return false;
        const data = docSnap.data();
        const sameTimeWindow = data.confirmedTimeWindow === rescheduleData.newTimeWindow;
        const sameReference = currentData.referenceId && data.referenceId === currentData.referenceId;
        return sameTimeWindow && sameReference;
      });

      if (conflicts.length > 0) {
        const existingConflict = conflicts[0].data();
        throw new AppointmentConflictError(
          `Schedule Conflict: Slot ${rescheduleData.newDate} (${rescheduleData.newTimeWindow}) is already booked.`,
          {
            id: conflicts[0].id,
            trackingCode: existingConflict.trackingCode,
            customerName: existingConflict.customerName,
            timeWindow: existingConflict.confirmedTimeWindow,
          }
        );
      }

      const now = new Date().toISOString();
      const auditEntry: AuditTrailEntry = {
        id: `audit-${Date.now()}`,
        timestamp: now,
        action: 'rescheduled',
        performedBy: operatorEmail,
        notes: `Rescheduled: ${rescheduleData.reason}`,
        changes: {
          status: { from: currentData.status, to: 'rescheduled' },
          confirmedDate: { from: currentData.confirmedDate || currentData.preferredDate, to: rescheduleData.newDate },
          confirmedTimeWindow: { from: currentData.confirmedTimeWindow || currentData.preferredTimeWindow, to: rescheduleData.newTimeWindow },
        },
      };

      const updatedAuditTrail = [...(currentData.auditTrail || []), auditEntry];

      transaction.update(apptDocRef, {
        status: 'rescheduled',
        isConfirmed: true,
        confirmedDate: rescheduleData.newDate,
        confirmedTimeWindow: rescheduleData.newTimeWindow,
        confirmedTimezone: rescheduleData.timezone,
        auditTrail: updatedAuditTrail,
        updatedAt: now,
      });
    });
  } catch (error) {
    if (error instanceof AppointmentConflictError) {
      throw error;
    }
    handleFirestoreError(error, OperationType.UPDATE, `appointment_requests/${appointmentId}`);
    throw error;
  }
}

/**
 * Cancel Appointment with audit log
 */
export async function cancelAppointment(
  appointmentId: string,
  reason: string,
  operatorEmail: string
): Promise<void> {
  const apptDocRef = doc(db, 'appointment_requests', appointmentId);

  try {
    const snap = await getDoc(apptDocRef);
    if (!snap.exists()) throw new Error('Appointment not found.');
    const data = snap.data() as FirestoreAppointment;

    const now = new Date().toISOString();
    const auditEntry: AuditTrailEntry = {
      id: `audit-${Date.now()}`,
      timestamp: now,
      action: 'cancelled',
      performedBy: operatorEmail,
      notes: `Cancellation reason: ${reason}`,
      changes: { status: { from: data.status, to: 'cancelled' } },
    };

    await updateDoc(apptDocRef, {
      status: 'cancelled',
      isConfirmed: false,
      auditTrail: [...(data.auditTrail || []), auditEntry],
      updatedAt: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `appointment_requests/${appointmentId}`);
    throw error;
  }
}

/**
 * Complete Appointment with audit log
 */
export async function completeAppointment(
  appointmentId: string,
  completionNotes: string,
  operatorEmail: string
): Promise<void> {
  const apptDocRef = doc(db, 'appointment_requests', appointmentId);

  try {
    const snap = await getDoc(apptDocRef);
    if (!snap.exists()) throw new Error('Appointment not found.');
    const data = snap.data() as FirestoreAppointment;

    const now = new Date().toISOString();
    const auditEntry: AuditTrailEntry = {
      id: `audit-${Date.now()}`,
      timestamp: now,
      action: 'completed',
      performedBy: operatorEmail,
      notes: completionNotes || 'Appointment completed successfully.',
      changes: { status: { from: data.status, to: 'completed' } },
    };

    await updateDoc(apptDocRef, {
      status: 'completed',
      auditTrail: [...(data.auditTrail || []), auditEntry],
      updatedAt: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `appointment_requests/${appointmentId}`);
    throw error;
  }
}

/**
 * Add Internal Note to Appointment with audit log
 */
export async function addAppointmentInternalNote(
  appointmentId: string,
  noteText: string,
  operatorEmail: string
): Promise<void> {
  const apptDocRef = doc(db, 'appointment_requests', appointmentId);

  try {
    const snap = await getDoc(apptDocRef);
    if (!snap.exists()) throw new Error('Appointment not found.');
    const data = snap.data() as FirestoreAppointment;

    const now = new Date().toISOString();
    const formattedNote = `[${now.slice(0, 16).replace('T', ' ')} - ${operatorEmail}] ${noteText}`;
    
    const auditEntry: AuditTrailEntry = {
      id: `audit-${Date.now()}`,
      timestamp: now,
      action: 'note_added',
      performedBy: operatorEmail,
      notes: `Note: ${noteText}`,
    };

    await updateDoc(apptDocRef, {
      internalNotes: [...(data.internalNotes || []), formattedNote],
      auditTrail: [...(data.auditTrail || []), auditEntry],
      updatedAt: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `appointment_requests/${appointmentId}`);
    throw error;
  }
}
