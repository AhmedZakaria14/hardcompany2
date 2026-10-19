/**
 * HARD Group - Comprehensive Firestore Database Schema Specification
 * Version: 2.0.0
 * 
 * Architecture Principles:
 * 1. Normalized Collections: Public content separated from private operational data.
 * 2. Localization Discipline: Bilingual fields represented as { ar: string; en: string }.
 * 3. Publication Workflow: Clear distinction between draft and published payloads with publicationStatus.
 * 4. Audit & Governance: Immutable audit events and versioned revisions for content changes.
 * 5. Strict Role-Based Access: Public read for published content; admin-only read for operational leads and logs.
 */

export type SchemaVersion = '2.0.0';
export type PublicationStatus = 'draft' | 'published' | 'archived';
export type SectorId = 'portal' | 'realestate' | 'construction' | 'hvac';
export type AdminRole = 'superadmin' | 'publisher' | 'editor' | 'lead_manager';

/**
 * RBAC Permission Capability Guards
 */
export function canPublish(role?: AdminRole | string): boolean {
  return role === 'superadmin' || role === 'publisher';
}

export function canEditContent(role?: AdminRole | string): boolean {
  return role === 'superadmin' || role === 'publisher' || role === 'editor';
}

export function canManageLeads(role?: AdminRole | string): boolean {
  return role === 'superadmin' || role === 'publisher' || role === 'lead_manager';
}

export function canManageSettings(role?: AdminRole | string): boolean {
  return role === 'superadmin';
}

export function hasSectorAccess(allowedSectors?: SectorId[] | string[], targetSector?: SectorId | string): boolean {
  if (!targetSector) return true;
  if (!allowedSectors || allowedSectors.length === 0) return true; // Default access
  return allowedSectors.includes('portal' as any) || allowedSectors.includes(targetSector as any);
}

export interface LocalizedText {
  ar: string;
  en: string;
}

export interface LocalizedRichText {
  ar: string;
  en: string;
}

export interface GeoLocation {
  lat: number;
  lng: number;
  address: LocalizedText;
  city: LocalizedText;
  district?: LocalizedText;
}

// ==========================================
// 1. SITE SETTINGS & NAVIGATION
// ==========================================

export interface SiteSettingsDoc {
  id: string; // e.g. 'global' or 'realestate_settings'
  schemaVersion: SchemaVersion;
  sector: SectorId;
  siteName: LocalizedText;
  tagline: LocalizedText;
  contactEmail: string;
  supportPhone: string;
  whatsappNumber: string;
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
  seoDefaults: {
    metaTitle: LocalizedText;
    metaDescription: LocalizedText;
    ogImage: string;
  };
  publicationStatus: PublicationStatus;
  updatedAt: string; // ISO String or Firestore ServerTimestamp
  updatedBy: string; // UID
}

export interface NavigationItem {
  id: string;
  label: LocalizedText;
  path: string;
  targetSector?: SectorId;
  children?: NavigationItem[];
  isExternal?: boolean;
}

export interface NavigationDoc {
  id: string; // e.g. 'header_portal', 'footer_realestate'
  schemaVersion: SchemaVersion;
  menuLocation: 'header' | 'footer' | 'mobile_drawer';
  sector: SectorId;
  items: NavigationItem[];
  publicationStatus: PublicationStatus;
  updatedAt: string;
  updatedBy: string;
}

// ==========================================
// 2. SECTORS, PAGES & SECTIONS
// ==========================================

export interface SectorDoc {
  id: SectorId;
  schemaVersion: SchemaVersion;
  name: LocalizedText;
  description: LocalizedText;
  heroImage: string;
  themeColor: string;
  accentColor: string;
  isActive: boolean;
  order: number;
  updatedAt: string;
}

export interface PageDoc {
  id: string; // e.g. 'page_realestate_home', 'page_hvac_about'
  schemaVersion: SchemaVersion;
  slug: string; // e.g. '/properties', '/hvac'
  sector: SectorId;
  title: LocalizedText;
  seoTitle: LocalizedText;
  seoDescription: LocalizedText;
  sectionIds: string[]; // Ordered list of references to SectionDoc
  publicationStatus: PublicationStatus;
  updatedAt: string;
  updatedBy: string;
}

export interface SectionDoc {
  id: string; // e.g. 'sec_hero_realestate', 'sec_stats_group'
  schemaVersion: SchemaVersion;
  pageId: string;
  sector: SectorId;
  sectionType: 'hero' | 'about_overview' | 'stats' | 'services_grid' | 'cta_banner' | 'faq' | 'contact_info';
  title: LocalizedText;
  subtitle?: LocalizedText;
  content: Record<string, any>; // Type-safe section specific payload (JSON/Bilingual)
  order: number;
  publicationStatus: PublicationStatus;
  updatedAt: string;
  updatedBy: string;
}

// ==========================================
// 3. CORE BUSINESS ENTITIES
// ==========================================

export interface PropertyDoc {
  id: string; // e.g. 'prop_101'
  schemaVersion: SchemaVersion;
  title: LocalizedText;
  description: LocalizedText;
  price: number;
  currency: string;
  pricePeriod?: 'sale' | 'monthly' | 'yearly';
  location: GeoLocation;
  propertyType: 'villa' | 'apartment' | 'duplex' | 'penthouse' | 'commercial' | 'land';
  listingType: 'sale' | 'rent';
  status: 'available' | 'reserved' | 'sold' | 'under_construction';
  specs: {
    areaSqM: number;
    bedrooms: number;
    bathrooms: number;
    parkingSpaces?: number;
    yearBuilt?: number;
  };
  amenities: string[]; // Localized amenity keys
  images: string[];
  featuredImage: string;
  floorPlanUrl?: string;
  brochureUrl?: string;
  virtualTourUrl?: string;
  categoryId: string;
  isFeatured: boolean;
  publicationStatus: PublicationStatus;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export interface ProjectDoc {
  id: string; // e.g. 'proj_201'
  schemaVersion: SchemaVersion;
  title: LocalizedText;
  description: LocalizedText;
  category: 'commercial' | 'residential' | 'industrial' | 'infrastructure';
  location: GeoLocation;
  completionPercentage: number;
  status: 'planning' | 'in_progress' | 'completed' | 'handover';
  specs: {
    builtUpAreaSqM?: number;
    totalUnits?: number;
    contractValueSAR?: number;
    clientName?: LocalizedText;
  };
  gallery: string[];
  featuredImage: string;
  brochureUrl?: string;
  isFeatured: boolean;
  publicationStatus: PublicationStatus;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export interface ServiceDoc {
  id: string; // e.g. 'srv_hvac_chiller'
  schemaVersion: SchemaVersion;
  title: LocalizedText;
  description: LocalizedText;
  sector: 'hvac' | 'construction' | 'realestate';
  category: string;
  features: LocalizedText[];
  pricingModel?: {
    startingPriceSAR?: number;
    unitLabel?: LocalizedText;
  };
  iconName?: string;
  image: string;
  isFeatured: boolean;
  publicationStatus: PublicationStatus;
  updatedAt: string;
  updatedBy: string;
}

export interface ArticleDoc {
  id: string; // e.g. 'art_saudi_vision_2030'
  schemaVersion: SchemaVersion;
  slug: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  content: LocalizedRichText;
  sector: SectorId;
  categoryId: string;
  author: {
    name: LocalizedText;
    role: LocalizedText;
    avatar?: string;
  };
  featuredImage: string;
  tags: string[];
  readTimeMinutes: number;
  isFeatured: boolean;
  publicationStatus: PublicationStatus;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export interface CategoryDoc {
  id: string; // e.g. 'cat_villa', 'cat_hvac_commercial'
  schemaVersion: SchemaVersion;
  domain: 'properties' | 'projects' | 'services' | 'articles';
  name: LocalizedText;
  slug: string;
  order: number;
  updatedAt: string;
}

// ==========================================
// 4. PEOPLE, REVIEWS & LOCATIONS
// ==========================================

export interface TeamMemberDoc {
  id: string;
  schemaVersion: SchemaVersion;
  name: LocalizedText;
  position: LocalizedText;
  department: LocalizedText;
  sector: SectorId;
  bio: LocalizedText;
  photoUrl: string;
  linkedinUrl?: string;
  email?: string;
  order: number;
  isLeadership: boolean;
  publicationStatus: PublicationStatus;
  updatedAt: string;
}

export interface TestimonialDoc {
  id: string;
  schemaVersion: SchemaVersion;
  clientName: LocalizedText;
  companyName?: LocalizedText;
  sector: SectorId;
  content: LocalizedText;
  rating: number; // 1 to 5
  avatarUrl?: string;
  isFeatured: boolean;
  publicationStatus: PublicationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OfficeDoc {
  id: string;
  schemaVersion: SchemaVersion;
  city: LocalizedText;
  officeName: LocalizedText;
  location: GeoLocation;
  phone: string;
  email: string;
  workingHours: LocalizedText;
  isHeadquarters: boolean;
  updatedAt: string;
}

// ==========================================
// 5. MEDIA METADATA
// ==========================================

export interface MediaMetadataDoc {
  id: string;
  schemaVersion: SchemaVersion;
  fileName: string;
  storagePath: string;
  downloadUrl: string;
  fileSizeBytes: number;
  contentType: string; // e.g. 'image/jpeg', 'application/pdf'
  dimensions?: { width: number; height: number };
  altText: LocalizedText;
  uploadedBy: string; // UID
  createdAt: string;
}

// ==========================================
// 6. CALCULATORS & FORM CONFIGURATIONS
// ==========================================

export interface CalculatorConfigDoc {
  id: string; // e.g. 'calc_construction_saudi', 'calc_hvac_capacity'
  schemaVersion: SchemaVersion;
  calculatorType: 'construction_cost' | 'hvac_load';
  sector: SectorId;
  baseUnitRatesSAR: Record<string, number>; // e.g. { 'finishing_lux': 1800, 'skeleton': 650 }
  materialFactors: Record<string, number>;
  regionalMultipliers: Record<string, number>; // e.g. { 'riyadh': 1.0, 'jeddah': 1.05 }
  updatedAt: string;
  updatedBy: string;
}

export interface FormConfigDoc {
  id: string; // e.g. 'form_book_viewing', 'form_hvac_survey'
  schemaVersion: SchemaVersion;
  formType: string;
  title: LocalizedText;
  fields: Array<{
    name: string;
    label: LocalizedText;
    type: 'text' | 'email' | 'phone' | 'select' | 'date' | 'textarea' | 'file';
    required: boolean;
    options?: LocalizedText[];
    fileConfig?: {
      maxCount?: number;
      maxSizeBytes?: number;
      allowedMimeTypes?: string[];
    };
  }>;
  allowAttachments?: boolean;
  attachmentConfig?: {
    maxCount: number;
    maxSizeBytes: number;
    allowedMimeTypes: string[];
    required?: boolean;
  };
  recipientEmails: string[];
  updatedAt: string;
}

// ==========================================
// 7. PRIVATE OPERATIONAL DATA & ATTACHMENTS (LEADS, APPOINTMENTS & ATTACHMENTS)
// ==========================================

export interface FormAttachmentMeta {
  id: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  extension: string;
  downloadToken: string;
  storagePath: string;
  dataBase64?: string;
  uploadedAt: string;
}

export interface FormAttachmentDoc extends FormAttachmentMeta {
  schemaVersion: SchemaVersion;
  submissionId?: string; // Linked leadId or appointmentId
  submissionType?: 'lead' | 'appointment' | 'general';
  uploadSessionId?: string;
  status: 'pending_submission' | 'attached' | 'abandoned';
  expiresAt?: string;
  uploadedByIp?: string;
}

export interface LeadDoc {
  id: string; // e.g. 'lead_9921'
  trackingCode: string; // e.g. 'HARD-8832'
  schemaVersion: SchemaVersion;
  fullName: string;
  email: string;
  phone: string;
  sector: SectorId;
  leadType: 'general_inquiry' | 'property_brochure' | 'list_property' | 'hvac_request' | 'construction_quote';
  subject?: string;
  message?: string;
  attachments?: FormAttachmentMeta[];
  metadata?: {
    propertyId?: string;
    projectId?: string;
    serviceId?: string;
    estimatedCostSAR?: number;
  };
  status: 'new' | 'contacted' | 'in_progress' | 'closed' | 'archived';
  notes?: string;
  assignedTo?: string; // Admin UID
  createdAt: string; // ISO timestamp
  updatedAt: string;
}

export interface AppointmentRequestDoc {
  id: string;
  trackingCode: string;
  schemaVersion: SchemaVersion;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  sector: SectorId;
  preferredDate: string; // YYYY-MM-DD
  preferredTimeSlot: string; // e.g. "10:00 AM - 12:00 PM"
  locationType: 'onsite' | 'office' | 'virtual';
  targetId?: string; // Property ID or Project ID
  attachments?: FormAttachmentMeta[];
  status: 'pending' | 'confirmed' | 'rescheduled' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 8. GOVERNANCE, REVISIONS & AUDIT LOGS
// ==========================================

export interface AdminProfileDoc {
  uid: string;
  schemaVersion: SchemaVersion;
  email: string;
  displayName: string;
  role: AdminRole;
  department?: string;
  allowedSectors: SectorId[];
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RevisionDoc {
  id: string;
  schemaVersion: SchemaVersion;
  collectionName: string; // e.g. 'properties', 'sections'
  documentId: string;
  snapshotData: Record<string, any>;
  changeSummary: string;
  authorUid: string;
  authorEmail: string;
  createdAt: string;
}

export interface AuditEventDoc {
  id: string;
  schemaVersion: SchemaVersion;
  eventType: 'auth_login' | 'content_published' | 'content_archived' | 'lead_status_changed' | 'settings_updated';
  actorUid: string;
  actorEmail: string;
  targetCollection?: string;
  targetDocumentId?: string;
  ipAddress?: string;
  details: Record<string, any>;
  createdAt: string;
}
