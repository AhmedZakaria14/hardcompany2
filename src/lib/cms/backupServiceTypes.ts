/**
 * HARD GROUP - CMS BACKUP & DISASTER RECOVERY TYPES
 */

import { Property, Project, BlogPost, Testimonial } from '../../types';
import { TrashItem } from './archivalTypes';

export interface DatabaseSnapshotMeta {
  backupId: string;
  version: string;
  environment: 'production' | 'staging' | 'development';
  createdAt: string;
  createdBy: {
    uid: string;
    email: string;
    name: string;
  };
  collectionsCount: Record<string, number>;
  totalDocumentCount: number;
  checksum: string;
  retentionPolicyDays: number;
}

export interface FullDatabaseBackupSnapshot {
  metadata: DatabaseSnapshotMeta;
  data: {
    properties: Property[];
    projects: Project[];
    blog_posts: BlogPost[];
    testimonials: Testimonial[];
    leads: any[];
    appointments: any[];
    subscribers: any[];
    pages: any[];
    branding: any[];
    trash_bin: TrashItem[];
    audit_logs: any[];
    revisions: any[];
  };
}

export interface MediaReferenceAuditResult {
  totalMediaReferencesChecked: number;
  healthyReferencesCount: number;
  brokenOrMissingCount: number;
  items: {
    entityType: string;
    entityId: string;
    field: string;
    mediaUrl: string;
    status: 'healthy' | 'missing_or_invalid' | 'relative_asset';
    issueDescription?: string;
  }[];
}

export interface RestorationValidationReport {
  isValid: boolean;
  snapshotMeta: DatabaseSnapshotMeta;
  targetEnvironment: string;
  diffSummary: {
    properties: { toCreate: number; toUpdate: number; unchanged: number };
    projects: { toCreate: number; toUpdate: number; unchanged: number };
    blog_posts: { toCreate: number; toUpdate: number; unchanged: number };
    testimonials: { toCreate: number; toUpdate: number; unchanged: number };
    pages: { toCreate: number; toUpdate: number; unchanged: number };
    trash_bin: { toCreate: number; toUpdate: number; unchanged: number };
  };
  warnings: string[];
  mediaCheck: MediaReferenceAuditResult;
}

export interface BackupScheduleConfig {
  autoExportEnabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  gcsBucketName: string;
  retentionDays: number;
  pointInTimeRecoveryPitr: boolean;
  objectVersioningEnabled: boolean;
  lastSuccessfulExportAt?: string;
  lastBackupSizeBytes?: number;
}
