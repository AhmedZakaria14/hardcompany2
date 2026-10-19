/**
 * HARD GROUP - PRODUCTION MONITORING & LOGGING SERVICE
 * 
 * Provides:
 * - Correlation ID generation & propagation
 * - Structured JSON logging with PII/Secret redaction (No passwords, tokens, or raw credentials)
 * - Safe Idempotency vs Temporarily Unknown status checking
 * - Live subscription for CMS Operations Center
 */

import {
  StructuredLogDoc,
  LogLevel,
  LogCategory,
  OperationStatusClassification,
  FailureSummaryMetrics,
} from './monitoringTypes';
import { db } from '../firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  where,
  getDocs,
} from 'firebase/firestore';

/**
 * Generate a unique correlation ID for tracking operations across frontend and backend
 */
export function generateCorrelationId(prefix: string = 'corr'): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 7);
  return `${prefix}_${ts}_${rand}`;
}

/**
 * Redact sensitive fields (passwords, tokens, API keys, secrets, cards) from metadata
 */
export function redactSensitiveMetadata(meta?: Record<string, any>): Record<string, any> | undefined {
  if (!meta || typeof meta !== 'object') return meta;

  const SENSITIVE_KEYS = [
    'password',
    'pass',
    'token',
    'bearer',
    'secret',
    'apiKey',
    'apikey',
    'auth',
    'authorization',
    'creditCard',
    'cvv',
  ];

  const cleanMeta: Record<string, any> = {};

  for (const [key, val] of Object.entries(meta)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.some((s) => lowerKey.includes(s.toLowerCase()))) {
      cleanMeta[key] = '[REDACTED_SECRET]';
    } else if (val && typeof val === 'object' && !Array.isArray(val)) {
      cleanMeta[key] = redactSensitiveMetadata(val);
    } else if (typeof val === 'string' && val.length > 250) {
      // Truncate long strings (e.g. raw base64 uploads)
      cleanMeta[key] = val.substring(0, 100) + '...[TRUNCATED_BLOB]';
    } else {
      cleanMeta[key] = val;
    }
  }

  return cleanMeta;
}

/**
 * Mask email for logging (e.g. "a***n@hard.sa")
 */
export function maskUserEmail(email?: string): string | undefined {
  if (!email || !email.includes('@')) return email;
  const [user, domain] = email.split('@');
  if (user.length <= 2) return `${user[0]}*@${domain}`;
  return `${user[0]}***${user[user.length - 1]}@${domain}`;
}

/**
 * Write a structured log entry to Firestore system_production_logs
 */
export async function logProductionEvent(params: {
  correlationId?: string;
  level: LogLevel;
  category: LogCategory;
  errorCode: string;
  component: string;
  message: string;
  statusClassification: OperationStatusClassification;
  userRole?: string;
  userEmail?: string;
  meta?: Record<string, any>;
}): Promise<string> {
  const correlationId = params.correlationId || generateCorrelationId();
  const timestamp = new Date().toISOString();
  const cleanMeta = redactSensitiveMetadata(params.meta);
  const maskedEmail = maskUserEmail(params.userEmail);

  const logDoc: Omit<StructuredLogDoc, 'id'> = {
    timestamp,
    correlationId,
    level: params.level,
    category: params.category,
    errorCode: params.errorCode,
    component: params.component,
    message: params.message,
    statusClassification: params.statusClassification,
    userRole: params.userRole,
    userEmailMasked: maskedEmail,
    meta: cleanMeta,
    createdAt: timestamp,
  };

  // Console output
  if (params.level === 'ERROR') {
    console.error(`[PRODUCTION_ERROR][${correlationId}][${params.category}] ${params.message}`, logDoc);
  } else if (params.level === 'WARN') {
    console.warn(`[PRODUCTION_WARN][${correlationId}][${params.category}] ${params.message}`, logDoc);
  } else {
    console.info(`[PRODUCTION_INFO][${correlationId}][${params.category}] ${params.message}`, logDoc);
  }

  // Persist to Firestore
  try {
    const docRef = await addDoc(collection(db, 'system_production_logs'), logDoc);
    return docRef.id;
  } catch (err) {
    console.warn('Fallback: Failed to write system log to Firestore:', err);
    return 'local_fallback_log_id';
  }
}

/**
 * Distinguish a failed operation from an operation whose final status is temporarily unknown
 * Checks if a submission with idempotencyKey was successfully processed during network drop
 */
export async function verifyUnknownSubmissionStatus(idempotencyKey: string): Promise<{
  isProcessed: boolean;
  leadData?: any;
}> {
  if (!idempotencyKey) return { isProcessed: false };

  try {
    const q = query(
      collection(db, 'leads'),
      where('idempotencyKey', '==', idempotencyKey),
      limit(1)
    );
    const snap = await getDocs(q);

    if (!snap.empty) {
      const doc = snap.docs[0];
      return {
        isProcessed: true,
        leadData: { id: doc.id, ...doc.data() },
      };
    }
  } catch (e) {
    console.warn('Failed to verify unknown submission status:', e);
  }

  return { isProcessed: false };
}

/**
 * Real-time subscription to production logs for CMS Monitoring Center
 */
export function subscribeToProductionLogs(
  onLogsUpdated: (logs: StructuredLogDoc[], metrics: FailureSummaryMetrics) => void,
  maxLogs: number = 50
): () => void {
  const q = query(
    collection(db, 'system_production_logs'),
    orderBy('createdAt', 'desc'),
    limit(maxLogs)
  );

  return onSnapshot(
    q,
    (snap) => {
      const logs: StructuredLogDoc[] = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<StructuredLogDoc, 'id'>),
      }));

      // Calculate summary metrics
      const metrics: FailureSummaryMetrics = {
        totalLogCount: logs.length,
        backendFailuresCount: logs.filter((l) => l.category === 'backend_failure').length,
        rejectedSubmissionsCount: logs.filter((l) => l.category === 'rejected_submission').length,
        failedNotificationsCount: logs.filter((l) => l.category === 'failed_notification').length,
        uploadErrorsCount: logs.filter((l) => l.category === 'upload_error').length,
        publicationFailuresCount: logs.filter((l) => l.category === 'publication_failure').length,
        temporarilyUnknownCount: logs.filter((l) => l.statusClassification === 'TEMPORARILY_UNKNOWN').length,
        lastFailureTimestamp: logs.length > 0 ? logs[0].timestamp : undefined,
      };

      onLogsUpdated(logs, metrics);
    },
    (err) => {
      console.warn('Production log listener error:', err);
    }
  );
}
