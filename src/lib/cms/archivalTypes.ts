/**
 * HARD GROUP - CMS ARCHIVAL, TRASH & RECOVERABLE DELETION TYPES
 */

import { AdminRole, SectorId } from '../../types/firestore-schema';

export type TrashEntityType =
  | 'property'
  | 'project'
  | 'category'
  | 'service'
  | 'page_document'
  | 'asset'
  | 'author'
  | 'navigation'
  | 'form_schema'
  | 'testimonial'
  | 'team_member';

export interface TrashItem {
  id: string; // e.g. trash_property_prop123
  entityType: TrashEntityType;
  entityId: string;
  title: { ar: string; en: string } | string;
  sector?: SectorId | string;
  originalCollection: string;
  originalData: any;
  deletedBy: string; // User email or UID
  deletedByRole?: AdminRole | string;
  deletedAt: string; // ISO timestamp
  retentionExpiresAt: string; // ISO timestamp (30 days from deletion)
  referenceWarningsOnDelete?: string[];
  notes?: string;
}

export interface ReferencedLocation {
  type: 'navigation' | 'published_page' | 'article' | 'form_schema' | 'customer_lead';
  title: { ar: string; en: string } | string;
  location: string;
  isCustomerRecord?: boolean; // If true, customer record will NOT be deleted
}

export interface ReferenceCheckResult {
  hasActiveReferences: boolean;
  hasCustomerLeads: boolean;
  referencedLocations: ReferencedLocation[];
  warningsAr: string[];
  warningsEn: string[];
  canSafeSoftDelete: boolean;
}

export interface SoftDeleteParams {
  entityType: TrashEntityType;
  entityId: string;
  title: { ar: string; en: string } | string;
  sector?: SectorId | string;
  originalCollection: string;
  originalData: any;
  userEmail: string;
  userRole: AdminRole | string;
  retentionDays?: number;
}
