/**
 * HARD GROUP - PRODUCTION MONITORING & STRUCTURED LOGGING TYPES
 */

export type LogLevel = 'ERROR' | 'WARN' | 'INFO';

export type LogCategory =
  | 'backend_failure'
  | 'rejected_submission'
  | 'failed_notification'
  | 'upload_error' | 'publication_failure';

export type OperationStatusClassification =
  | 'DEFINITIVE_FAILURE'
  | 'TEMPORARILY_UNKNOWN'
  | 'SUCCESS';

export interface StructuredLogDoc {
  id: string;
  timestamp: string;
  correlationId: string;
  level: LogLevel;
  category: LogCategory;
  errorCode: string;
  component: string;
  message: string;
  statusClassification: OperationStatusClassification;
  userRole?: string;
  userEmailMasked?: string;
  meta?: Record<string, any>;
  createdAt: string;
}

export interface FailureSummaryMetrics {
  totalLogCount: number;
  backendFailuresCount: number;
  rejectedSubmissionsCount: number;
  failedNotificationsCount: number;
  uploadErrorsCount: number;
  publicationFailuresCount: number;
  temporarilyUnknownCount: number;
  lastFailureTimestamp?: string;
}
