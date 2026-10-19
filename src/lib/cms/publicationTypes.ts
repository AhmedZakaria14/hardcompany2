/**
 * HARD GROUP - CMS DRAFT-PREVIEW-PUBLISH WORKFLOW TYPES
 */

import { AdminRole, SectorId } from '../../types/firestore-schema';

export type PolicyCategory = 'required_fields' | 'translations' | 'references' | 'media';

export interface PublishValidationError {
  field: string;
  category: PolicyCategory;
  messageAr: string;
  messageEn: string;
}

export interface PublishValidationResult {
  isValid: boolean;
  errors: PublishValidationError[];
  warnings: string[];
  summary: {
    requiredFieldsCount: number;
    translationsPassed: boolean;
    referencesPassed: boolean;
    mediaPassed: boolean;
  };
}

export interface PublisherUser {
  uid: string;
  email: string;
  name?: string;
  role: AdminRole | string;
  allowedSectors?: SectorId[] | string[];
}

export interface PublicationParams {
  entityType: 'page_document' | 'property' | 'project' | 'form_schema' | 'site_section' | 'calculator_config';
  entityId: string;
  sector?: SectorId | string;
  draftData: any;
  publisherUser: PublisherUser;
  targetCollectionName?: string;
}

export interface PublicationResult {
  success: boolean;
  publishedVersion: number;
  publishedAt: string;
  auditEventId: string;
  messageAr: string;
  messageEn: string;
}
