/**
 * HARD GROUP - INDEPENDENT SERVER-SIDE NOTIFICATION ENGINE
 * 
 * Features:
 * 1. Independent execution post-lead persistence. Notification failure NEVER erases or fails lead submission.
 * 2. Duplicate-event protection using idempotent event log IDs.
 * 3. Automatic & manual retries with full audit trail.
 * 4. Private status recording in Firestore for authorized administrators.
 */

import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { FormSubmissionPayload } from '../forms/formSubmissionService';
import { getApprovedRecipients, getProviderConfig } from './notificationConfig';
import { dispatchNotificationToProvider } from './notificationDispatcher';
import {
  NotificationAuditEntry,
  NotificationChannel,
  NotificationDispatchResult,
  NotificationLogDoc,
  NotificationStatus,
} from './notificationTypes';

/**
 * Main entry point: Process notifications independently for a newly persisted lead
 */
export async function processLeadNotification(
  leadId: string,
  payload: FormSubmissionPayload & { trackingCode: string }
): Promise<NotificationDispatchResult> {
  const channel: NotificationChannel = 'webhook'; // Primary reliable channel
  const eventId = `notif_${leadId}`;
  const logId = `notif_${leadId}_${channel}`;
  const nowIso = new Date().toISOString();

  // Resolve approved recipients
  const approvedRecipients = getApprovedRecipients(payload.sector, payload.formType);
  const provider = getProviderConfig(channel);

  try {
    // 1. DUPLICATE-EVENT PROTECTION GUARD
    const logRef = doc(db, 'notification_logs', logId);
    let existingDoc: NotificationLogDoc | null = null;

    try {
      const snap = await getDoc(logRef);
      if (snap.exists()) {
        existingDoc = snap.data() as NotificationLogDoc;
      }
    } catch (readErr) {
      console.warn('[Notification Engine] Non-blocking read error for existing log:', readErr);
    }

    // Check if notification already delivered for this event
    if (existingDoc && existingDoc.status === 'delivered') {
      console.info(`[Notification Engine] Duplicate event protection: Notification for lead ${leadId} already delivered.`);
      return {
        success: true,
        status: 'duplicate_skipped',
        logId,
        providerUsed: existingDoc.providerUsed,
        recipients: existingDoc.approvedRecipients,
        attempts: existingDoc.attempts,
        message: 'Notification was previously delivered. Duplicate dispatch skipped.',
      };
    }

    const currentAttempt = (existingDoc?.attempts || 0) + 1;
    const existingAuditTrail: NotificationAuditEntry[] = existingDoc?.auditTrail || [];

    // 2. EXECUTE DISPATCH TO CONFIGURED PROVIDER
    const dispatchResult = await dispatchNotificationToProvider(channel, approvedRecipients, {
      ...payload,
      leadId,
    });

    const newAuditEntry: NotificationAuditEntry = {
      timestamp: nowIso,
      action: dispatchResult.success ? 'delivered' : 'dispatch_attempt',
      provider: dispatchResult.providerName,
      responseMessage: dispatchResult.responseMessage,
      errorMessage: dispatchResult.errorMessage,
      performedBy: 'system_notification_engine',
    };

    const updatedAuditTrail = [...existingAuditTrail, newAuditEntry];

    // 3. PERSIST NOTIFICATION LOG PRIVATELY IN FIRESTORE
    const logPayload: NotificationLogDoc = {
      id: logId,
      eventId,
      leadId,
      trackingCode: payload.trackingCode,
      sector: payload.sector,
      formType: payload.formType,
      approvedRecipients,
      providerUsed: dispatchResult.providerName,
      channel,
      status: dispatchResult.status,
      attempts: currentAttempt,
      maxAttempts: 3,
      lastAttemptAt: nowIso,
      deliveredAt: dispatchResult.success ? nowIso : existingDoc?.deliveredAt,
      lastError: dispatchResult.errorMessage || undefined,
      payloadSummary: `Lead [${payload.trackingCode}] ${payload.name} (${payload.email}) -> ${payload.formType}`,
      auditTrail: updatedAuditTrail,
      createdAt: existingDoc?.createdAt || nowIso,
      updatedAt: nowIso,
    };

    try {
      await setDoc(logRef, logPayload);
    } catch (writeLogErr) {
      console.error('[Notification Engine] Failed to save notification log in Firestore:', writeLogErr);
    }

    // 4. UPDATE LEAD SUMMARY STATUS IN LEADS COLLECTION
    try {
      const leadRef = doc(db, 'leads', leadId);
      await updateDoc(leadRef, {
        notificationStatus: dispatchResult.status,
        notificationProvider: dispatchResult.providerName,
        notificationLastAttemptAt: nowIso,
        notificationError: dispatchResult.errorMessage || null,
        updatedAt: nowIso,
      });
    } catch (leadUpdateErr) {
      console.warn('[Notification Engine] Could not update notification summary on lead document:', leadUpdateErr);
    }

    return {
      success: dispatchResult.success,
      status: dispatchResult.status,
      logId,
      providerUsed: dispatchResult.providerName,
      recipients: approvedRecipients,
      attempts: currentAttempt,
      message: dispatchResult.responseMessage || dispatchResult.errorMessage || 'Notification process finished',
      error: dispatchResult.errorMessage,
    };
  } catch (err: any) {
    console.error(`[Notification Engine] Exception in processLeadNotification for lead ${leadId}:`, err);

    // CRITICAL REQUIREMENT: A notification failure must not erase or fail the lead!
    return {
      success: false,
      status: 'failed',
      logId,
      providerUsed: provider.providerName,
      recipients: approvedRecipients,
      attempts: 1,
      message: 'Notification failed with exception',
      error: err?.message || String(err),
    };
  }
}

/**
 * Manual Retry function for authorized administrators in CMS
 */
export async function retryLeadNotification(
  leadId: string,
  adminEmail: string
): Promise<NotificationDispatchResult> {
  const nowIso = new Date().toISOString();
  const logId = `notif_${leadId}_webhook`;

  try {
    // Read Lead data
    const leadRef = doc(db, 'leads', leadId);
    const leadSnap = await getDoc(leadRef);

    if (!leadSnap.exists()) {
      return {
        success: false,
        status: 'failed',
        logId,
        providerUsed: 'None',
        recipients: [],
        attempts: 0,
        message: 'Lead document not found in Firestore.',
        error: 'Lead not found',
      };
    }

    const leadData = leadSnap.data();
    const approvedRecipients = getApprovedRecipients(leadData.sector || 'global', leadData.formType);
    const channel: NotificationChannel = 'webhook';

    const dispatchResult = await dispatchNotificationToProvider(channel, approvedRecipients, {
      formType: leadData.formType,
      sector: leadData.sector,
      name: leadData.fullName || leadData.name || 'Valued Client',
      email: leadData.email,
      phone: leadData.phone,
      preferredContactMethod: leadData.preferredContactMethod,
      message: leadData.message,
      details: leadData.details,
      trackingCode: leadData.trackingCode,
      leadId,
    });

    // Update log
    const logRef = doc(db, 'notification_logs', logId);
    const logSnap = await getDoc(logRef);
    const existingLog = logSnap.exists() ? (logSnap.data() as NotificationLogDoc) : null;

    const currentAttempt = (existingLog?.attempts || 0) + 1;
    const auditTrail: NotificationAuditEntry[] = existingLog?.auditTrail || [];

    auditTrail.push({
      timestamp: nowIso,
      action: 'manual_retry',
      provider: dispatchResult.providerName,
      responseMessage: dispatchResult.responseMessage,
      errorMessage: dispatchResult.errorMessage,
      performedBy: adminEmail,
    });

    const updatedLog: NotificationLogDoc = {
      id: logId,
      eventId: `notif_${leadId}`,
      leadId,
      trackingCode: leadData.trackingCode,
      sector: leadData.sector || 'global',
      formType: leadData.formType || 'general_contact',
      approvedRecipients,
      providerUsed: dispatchResult.providerName,
      channel,
      status: dispatchResult.status,
      attempts: currentAttempt,
      maxAttempts: 5,
      lastAttemptAt: nowIso,
      deliveredAt: dispatchResult.success ? nowIso : existingLog?.deliveredAt,
      lastError: dispatchResult.errorMessage || undefined,
      payloadSummary: `Retry for [${leadData.trackingCode}] ${leadData.fullName || leadData.name}`,
      auditTrail,
      createdAt: existingLog?.createdAt || nowIso,
      updatedAt: nowIso,
    };

    await setDoc(logRef, updatedLog);

    await updateDoc(leadRef, {
      notificationStatus: dispatchResult.status,
      notificationProvider: dispatchResult.providerName,
      notificationLastAttemptAt: nowIso,
      notificationError: dispatchResult.errorMessage || null,
      updatedAt: nowIso,
    });

    return {
      success: dispatchResult.success,
      status: dispatchResult.status,
      logId,
      providerUsed: dispatchResult.providerName,
      recipients: approvedRecipients,
      attempts: currentAttempt,
      message: dispatchResult.responseMessage || dispatchResult.errorMessage || 'Retry executed',
      error: dispatchResult.errorMessage,
    };
  } catch (err: any) {
    console.error(`[Notification Engine] Exception in retryLeadNotification for lead ${leadId}:`, err);
    return {
      success: false,
      status: 'failed',
      logId,
      providerUsed: 'Error',
      recipients: [],
      attempts: 0,
      message: 'Failed to execute notification retry',
      error: err?.message || String(err),
    };
  }
}

/**
 * Subscribes to private notification logs for a specific lead or list of leads (Admin view)
 */
export function subscribeToNotificationLogs(
  leadId: string,
  onUpdate: (logs: NotificationLogDoc[]) => void,
  onError?: (err: Error) => void
): () => void {
  const logsRef = collection(db, 'notification_logs');
  const q = query(logsRef, where('leadId', '==', leadId));

  return onSnapshot(
    q,
    (snap) => {
      const logs = snap.docs.map((doc) => doc.data() as NotificationLogDoc);
      onUpdate(logs);
    },
    (err) => {
      console.warn('Error subscribing to notification logs:', err);
      if (onError) onError(err);
    }
  );
}
