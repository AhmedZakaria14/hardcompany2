/**
 * HARD GROUP - SERVER-SIDE NOTIFICATION TYPES & SCHEMAS
 */

import { SectorId } from '../../types/firestore-schema';
import { CustomerFormType } from '../forms/formSubmissionService';

export type NotificationStatus =
  | 'delivered'
  | 'failed'
  | 'unconfigured'
  | 'pending_retry'
  | 'duplicate_skipped';

export type NotificationChannel = 'email' | 'webhook' | 'whatsapp';

export interface ApprovedRecipient {
  email: string;
  name?: string;
  role?: string;
  sectorScope: SectorId | 'global';
  isActive: boolean;
}

export interface NotificationProviderConfig {
  channel: NotificationChannel;
  providerName: string;
  isConfigured: boolean;
  endpointUrl?: string;
  hasApiKey: boolean;
}

export interface NotificationAuditEntry {
  timestamp: string;
  action: 'dispatch_attempt' | 'delivered' | 'failed' | 'manual_retry' | 'duplicate_skipped';
  provider: string;
  responseMessage?: string;
  errorMessage?: string;
  performedBy?: string;
}

export interface NotificationLogDoc {
  id: string; // e.g. notif_lead-123_webhook
  eventId: string; // e.g. notif_lead-123
  leadId: string;
  trackingCode: string;
  sector: SectorId | string;
  formType: CustomerFormType | string;
  approvedRecipients: string[];
  providerUsed: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  attempts: number;
  maxAttempts: number;
  lastAttemptAt: string;
  deliveredAt?: string;
  lastError?: string;
  payloadSummary: string;
  auditTrail: NotificationAuditEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface NotificationDispatchResult {
  success: boolean;
  status: NotificationStatus;
  logId: string;
  providerUsed: string;
  recipients: string[];
  attempts: number;
  message: string;
  error?: string;
}
