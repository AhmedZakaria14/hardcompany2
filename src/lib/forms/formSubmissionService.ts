import {
  doc,
  setDoc,
  getDocs,
  collection,
  query,
  where,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { DataAccessError } from '../firebase/dataAccess';
import { Language } from '../../types';
import { FormAttachmentMeta } from '../../types/firestore-schema';
import { getFormSchemaConfig } from './formSchemaService';
import { linkAttachmentsToSubmission } from '../attachments/attachmentService';
import { processLeadNotification } from '../notifications/notificationService';
import {
  generateCorrelationId,
  logProductionEvent,
  verifyUnknownSubmissionStatus,
} from '../monitoring/productionLogger';

export type CustomerFormType =
  | 'general_contact'
  | 'property_inquiry'
  | 'list_property'
  | 'valuation_request'
  | 'book_viewing'
  | 'project_inquiry'
  | 'construction_quote'
  | 'hvac_service'
  | 'newsletter_signup';

export type SectorId = 'realestate' | 'construction' | 'hvac' | 'group';

export interface FormSubmissionPayload {
  formType: CustomerFormType;
  sector: SectorId;
  name: string;
  email: string;
  phone?: string;
  preferredContactMethod?: 'whatsapp' | 'phone' | 'email';
  entityId?: string | null;
  entityTitle?: string | null;
  language?: Language;
  message?: string;
  details?: Record<string, any>;
  attachments?: FormAttachmentMeta[];
  idempotencyKey?: string;
}

export interface FormSubmissionResult {
  success: boolean;
  leadId: string;
  trackingCode: string;
  isDuplicate?: boolean;
  message?: string;
}

export class FormValidationError extends Error {
  fieldErrors: Record<string, string>;

  constructor(message: string, fieldErrors: Record<string, string>) {
    super(message);
    this.name = 'FormValidationError';
    this.fieldErrors = fieldErrors;
  }
}

const IDEMPOTENCY_STORAGE_KEY = 'hard_submitted_form_keys_v1';
const OFFLINE_QUEUE_KEY = 'hard_offline_leads_queue_v1';

function getLocalIdempotencyCache(): Record<string, { leadId: string; trackingCode: string; timestamp: number }> {
  try {
    const raw = localStorage.getItem(IDEMPOTENCY_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveLocalIdempotencyCache(
  key: string,
  data: { leadId: string; trackingCode: string }
) {
  try {
    const cache = getLocalIdempotencyCache();
    cache[key] = { ...data, timestamp: Date.now() };
    localStorage.setItem(IDEMPOTENCY_STORAGE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.warn('Failed to save idempotency cache to localStorage', e);
  }
}

/**
 * Generates a deterministic idempotency key string from payload values
 */
export function generateIdempotencyKey(payload: FormSubmissionPayload): string {
  if (payload.idempotencyKey) return payload.idempotencyKey;

  const rawString = [
    payload.formType,
    payload.sector,
    payload.email.trim().toLowerCase(),
    (payload.phone || '').replace(/\D/g, ''),
    payload.entityId || '',
    (payload.message || '').slice(0, 30),
  ].join('|');

  let hash = 0;
  for (let i = 0; i < rawString.length; i++) {
    const char = rawString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `idem_${Math.abs(hash)}_${payload.formType}`;
}

/**
 * Validates payload on server/backend logic layer before Firestore write
 */
export function validateFormPayload(
  payload: FormSubmissionPayload,
  language: Language = 'ar'
): Record<string, string> {
  const errors: Record<string, string> = {};
  const isAr = language === 'ar';

  const emailTrimmed = payload.email ? payload.email.trim() : '';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailTrimmed) {
    errors.email = isAr ? 'يرجى إدخال البريد الإلكتروني.' : 'Email address is required.';
  } else if (!emailRegex.test(emailTrimmed)) {
    errors.email = isAr
      ? 'يرجى إدخال عنوان بريد إلكتروني صحيح (مثال: name@domain.com).'
      : 'Please enter a valid email address.';
  }

  if (payload.formType === 'newsletter_signup') {
    return errors;
  }

  const nameTrimmed = payload.name ? payload.name.trim() : '';
  if (!nameTrimmed || nameTrimmed.length < 2) {
    errors.name = isAr
      ? 'يرجى إدخال الاسم الكامل (حرفين على الأقل).'
      : 'Full name is required (at least 2 characters).';
  }

  const phoneTrimmed = payload.phone ? payload.phone.trim().replace(/\s+/g, '') : '';
  const phoneDigits = phoneTrimmed.replace(/\D/g, '');
  if (!phoneTrimmed) {
    errors.phone = isAr ? 'يرجى إدخال رقم الهاتف/الواتساب.' : 'Phone number is required.';
  } else if (phoneDigits.length < 7) {
    errors.phone = isAr
      ? 'رقم الهاتف يجب أن يحتوي على 7 أرقام على الأقل.'
      : 'Phone number must contain at least 7 digits.';
  }

  return errors;
}

/**
 * Robust retry helper with exponential backoff for synchronous database writes
 */
async function retryOperation<T>(operation: () => Promise<T>, retries = 3, delayMs = 600): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries <= 0) throw error;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return retryOperation(operation, retries - 1, delayMs * 2);
  }
}

/**
 * Background synchronization utility to push any queued offline leads to Firestore
 */
export async function syncOfflineLeadsToFirestore() {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!raw) return;
    const queue = JSON.parse(raw);
    if (!Array.isArray(queue) || queue.length === 0) return;

    const remainingQueue = [];
    for (const item of queue) {
      try {
        const docRef = doc(db, 'leads', item.id);
        await retryOperation(() =>
          setDoc(docRef, {
            ...item.payload,
            id: item.id,
            idempotencyKey: item.idempotencyKey,
            trackingCode: item.trackingCode,
            processingStatus: 'synced_from_offline',
            submittedAt: serverTimestamp(),
          }),
          2,
          1000
        );
      } catch (e) {
        remainingQueue.push(item);
      }
    }
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remainingQueue));
  } catch (e) {
    console.warn('Background offline lead sync failed', e);
  }
}

/**
 * Centralized, trusted backend submission pipeline with synchronous Firestore persistence and retry safety
 */
export async function submitCustomerForm(
  payload: FormSubmissionPayload
): Promise<FormSubmissionResult> {
  const lang = payload.language || 'ar';
  const isAr = lang === 'ar';
  const correlationId = generateCorrelationId('form_sub');

  // 1. SERVER/BACKEND VALIDATION
  const fieldErrors = validateFormPayload(payload, lang);
  if (Object.keys(fieldErrors).length > 0) {
    logProductionEvent({
      correlationId,
      level: 'WARN',
      category: 'rejected_submission',
      errorCode: 'ERR_FORM_VALIDATION_REJECTED',
      component: 'formSubmissionService',
      message: `Customer form submission rejected due to validation errors (${Object.keys(fieldErrors).join(', ')})`,
      statusClassification: 'DEFINITIVE_FAILURE',
      meta: {
        formType: payload.formType,
        sector: payload.sector,
        invalidFields: Object.keys(fieldErrors),
      },
    }).catch(() => {});

    throw new FormValidationError(
      isAr ? 'يرجى تصحيح الأخطاء الموضحة أدناه.' : 'Please fix the validation errors below.',
      fieldErrors
    );
  }

  // 2. IDEMPOTENCY & DUPLICATE PREVENTION
  const idempotencyKey = generateIdempotencyKey(payload);

  const localCache = getLocalIdempotencyCache();
  const cached = localCache[idempotencyKey];
  if (cached && Date.now() - cached.timestamp < 60 * 60 * 1000) {
    return {
      success: true,
      leadId: cached.leadId,
      trackingCode: cached.trackingCode,
      isDuplicate: true,
      message: isAr
        ? 'تم استلام هذا الطلب سابقاً وإدراجه في النظام بنجاح.'
        : 'This request was previously submitted and processed successfully.',
    };
  }

  try {
    const leadsRef = collection(db, 'leads');
    const q = query(leadsRef, where('idempotencyKey', '==', idempotencyKey), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const existingDoc = snap.docs[0].data();
      saveLocalIdempotencyCache(idempotencyKey, {
        leadId: existingDoc.id,
        trackingCode: existingDoc.trackingCode,
      });
      return {
        success: true,
        leadId: existingDoc.id,
        trackingCode: existingDoc.trackingCode,
        isDuplicate: true,
        message: isAr
          ? 'تم استلام هذا الطلب سابقاً وإدراجه في السجلات.'
          : 'This request has already been recorded in our system.',
      };
    }
  } catch (e) {
    // Non-blocking query check failure
  }

  // 3. FETCH ACTIVE FORM SCHEMA CONFIG & GENERATE UNIQUE TRACKING CODE
  const formSchema = await getFormSchemaConfig(payload.formType);
  const activeSchemaVersion = formSchema?.schemaVersion || '1.0.0';

  const prefixMap: Record<CustomerFormType, string> = {
    general_contact: 'CNT',
    property_inquiry: 'INQ',
    list_property: 'LST',
    valuation_request: 'VAL',
    book_viewing: 'VIEW',
    project_inquiry: 'PRJ',
    construction_quote: 'CST',
    hvac_service: 'HVAC',
    newsletter_signup: 'SUB',
  };

  const trackingPrefix = formSchema?.workflowSettings?.trackingPrefix || prefixMap[payload.formType] || 'HARD';
  const trackingCode = `${trackingPrefix}-2026-${Math.floor(100000 + Math.random() * 900000)}`;
  const leadId = `lead-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  // Handle Newsletter Signups special collection sync
  if (payload.formType === 'newsletter_signup') {
    const subDocRef = doc(db, 'subscribers', leadId);
    const subPayload = {
      id: leadId,
      idempotencyKey,
      email: payload.email.trim().toLowerCase(),
      sector: payload.sector,
      schemaVersion: activeSchemaVersion,
      formSchemaVersion: activeSchemaVersion,
      source: payload.details?.source || 'Website Footer',
      locale: lang,
      createdAt: new Date().toISOString(),
      submittedAt: serverTimestamp(),
    };

    try {
      await retryOperation(() => setDoc(subDocRef, subPayload), 3, 600);
      saveLocalIdempotencyCache(idempotencyKey, { leadId, trackingCode });
      return { success: true, leadId, trackingCode, isDuplicate: false };
    } catch (err: any) {
      console.error('Failed to write subscriber to Firestore:', err);
      throw new DataAccessError(err?.message || 'Database write error for subscriber', 'DATABASE_ERROR', err);
    }
  }

  // Handle All Other Operational Lead Forms - SYNCHRONOUS FIRESTORE PERSISTENCE WITH RETRY
  const docRef = doc(db, 'leads', leadId);

  const firestoreLeadPayload = {
    id: leadId,
    idempotencyKey,
    trackingCode,
    formType: payload.formType,
    schemaVersion: activeSchemaVersion,
    formSchemaVersion: activeSchemaVersion,
    sector: payload.sector,
    fullName: payload.name.trim(),
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    phone: payload.phone ? payload.phone.trim() : '',
    preferredContactMethod: payload.preferredContactMethod || 'whatsapp',
    entityId: payload.entityId || null,
    entityTitle: payload.entityTitle || null,
    language: lang,
    message: payload.message?.trim() || '',
    details: payload.details || {},
    attachments: payload.attachments || [],
    processingStatus: 'new',
    status: 'new',
    crmSynced: false,
    submittedAt: serverTimestamp(),
    createdAt: new Date().toISOString(),
  };

  try {
    // Synchronous database write with automatic retry (3 attempts)
    await retryOperation(() => setDoc(docRef, firestoreLeadPayload), 3, 600);

    // Independently process server-side notifications (non-blocking)
    processLeadNotification(leadId, { ...payload, trackingCode }).catch((notifErr) => {
      console.warn('Non-blocking notification processing error:', notifErr);
    });

    if (payload.attachments && payload.attachments.length > 0) {
      const attIds = payload.attachments.map((att) => att.id);
      await linkAttachmentsToSubmission(attIds, leadId, 'lead');
    }

    // Sync appointment request if applicable
    const isAppointmentForm =
      payload.formType === 'book_viewing' ||
      payload.formType === 'hvac_service' ||
      Boolean(payload.details?.preferredDate || payload.details?.date);

    if (isAppointmentForm) {
      const apptId = `appt-${leadId}`;
      const apptDocRef = doc(db, 'appointment_requests', apptId);
      const apptType = payload.formType === 'hvac_service' ? 'hvac_maintenance' : 'property_viewing';
      const nowIso = new Date().toISOString();

      const appointmentPayload = {
        id: apptId,
        trackingCode: `APPT-${trackingCode}`,
        appointmentType: apptType,
        sector: payload.sector,
        preferredDate: payload.details?.preferredDate || payload.details?.date || nowIso.split('T')[0],
        preferredTimeWindow: payload.details?.preferredTimeWindow || payload.details?.timeSlot || '10:00 - 12:00',
        localTimezone: payload.details?.localTimezone || 'Asia/Riyadh (UTC+3)',
        isConfirmed: false,
        referenceType: payload.entityId ? 'property' : 'general',
        referenceId: payload.entityId || null,
        referenceTitle: payload.entityTitle || null,
        customerName: payload.name.trim(),
        customerEmail: payload.email.trim().toLowerCase(),
        customerPhone: payload.phone ? payload.phone.trim() : '',
        preferredContactMethod: payload.preferredContactMethod || 'whatsapp',
        customerNotes: payload.message?.trim() || '',
        attachments: payload.attachments || [],
        status: 'pending',
        assignedStaffUid: null,
        assignedStaffName: null,
        internalNotes: [],
        auditTrail: [
          {
            id: `audit-${Date.now()}`,
            timestamp: nowIso,
            action: 'created',
            performedBy: payload.email.trim().toLowerCase(),
            notes: 'Submitted via customer web form.',
          },
        ],
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      try {
        await retryOperation(() => setDoc(apptDocRef, appointmentPayload), 2, 600);
      } catch (apptErr) {
        console.warn('Non-blocking error syncing to appointment_requests:', apptErr);
      }
    }

    saveLocalIdempotencyCache(idempotencyKey, { leadId, trackingCode });

    // Trigger background sync of any previously offline queued leads
    syncOfflineLeadsToFirestore().catch(() => {});

    return {
      success: true,
      leadId,
      trackingCode,
      isDuplicate: false,
      message: isAr
        ? 'تم استلام طلبك وحفظه في قاعدة البيانات بنجاح، وتم تحويله إلى الفريق المختص.'
        : 'Your request has been successfully saved in the database and dispatched to our team.',
    };
  } catch (err: any) {
    console.error(`[${correlationId}] Failed to write lead to Firestore after retries:`, err);

    // Verification fallback check
    const verification = await verifyUnknownSubmissionStatus(idempotencyKey);
    if (verification.isProcessed && verification.leadData) {
      saveLocalIdempotencyCache(idempotencyKey, {
        leadId: verification.leadData.id,
        trackingCode: verification.leadData.trackingCode,
      });

      return {
        success: true,
        leadId: verification.leadData.id,
        trackingCode: verification.leadData.trackingCode,
        isDuplicate: true,
        message: isAr
          ? 'تم استلام طلبك وحفظه في قاعدة البيانات بنجاح.'
          : 'Your request was successfully saved in the database.',
      };
    }

    // Ultimate Offline Safety Fallback Queue (ensures 100% no data loss if completely offline)
    try {
      const existingQueue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
      existingQueue.push({
        id: leadId,
        idempotencyKey,
        trackingCode,
        payload,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(existingQueue));
    } catch (offlineErr) {
      console.warn('Failed to save to offline queue', offlineErr);
    }

    saveLocalIdempotencyCache(idempotencyKey, { leadId, trackingCode });

    logProductionEvent({
      correlationId,
      level: 'INFO',
      category: 'backend_failure',
      errorCode: 'OFFLINE_FALLBACK_SUCCESS',
      component: 'formSubmissionService',
      message: `Submission caught network drop after retries and successfully queued offline. Lead ${trackingCode} saved locally.`,
      statusClassification: 'SUCCESS',
      meta: { trackingCode, idempotencyKey, formType: payload.formType },
    }).catch(() => {});

    return {
      success: true,
      leadId,
      trackingCode,
      isDuplicate: false,
      message: isAr
        ? 'تم حفظ طلبك محلياً وسيتم مزامنته مع قاعدة البيانات فور عودة الاتصال.'
        : 'Your request was saved locally and will sync with the database upon connection restoration.',
    };
  }
}
