import { LocalizedText } from './firestore-schema';

export type SectorScope = 'realestate' | 'construction' | 'hvac' | 'group' | 'all';
export type PublicationStatus = 'published' | 'draft' | 'archived';

export interface VerificationMetadata {
  isVerified: boolean;
  verificationStatus: 'verified' | 'unverified' | 'pending';
  verifierName?: string;
  verificationDate?: string;
  verificationId?: string; // License number, audit certificate ref, ISO code
  internalEvidenceNotes?: string; // STRICTLY PRIVATE internal evidence (only visible in CMS)
  publishEvidenceNotes?: boolean; // Default false - keep private unless explicitly checked
}

export interface TeamMember {
  id: string;
  name: LocalizedText;
  role: LocalizedText;
  bio?: LocalizedText;
  email?: string;
  phone?: string;
  avatar: string;
  sector: SectorScope;
  order: number;
  status: PublicationStatus;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    whatsapp?: string;
  };
  certifications?: string[]; // Referenced certification IDs or titles
  verification?: VerificationMetadata;
}

export interface FaqEntity {
  id: string;
  question: LocalizedText;
  answer: LocalizedText;
  category?: LocalizedText;
  sector: SectorScope;
  order: number;
  status: PublicationStatus;
}

export interface OfficeLocation {
  id: string;
  name: LocalizedText;
  city: LocalizedText;
  address: LocalizedText;
  phone: string;
  email: string;
  workingHours?: LocalizedText;
  coordinates?: {
    lat: number;
    lng: number;
  };
  googleMapUrl?: string;
  image?: string;
  isHeadquarters?: boolean;
  sector: SectorScope;
  order: number;
  status: PublicationStatus;
}

export interface Certification {
  id: string;
  title: LocalizedText;
  issuer: LocalizedText;
  issueDate?: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  image?: string;
  sector: SectorScope;
  order: number;
  status: PublicationStatus;
  verification?: VerificationMetadata;
}

export interface BusinessStatistic {
  id: string;
  value: string;
  label: LocalizedText;
  description?: LocalizedText;
  iconName?: string;
  sector: SectorScope;
  order: number;
  status: PublicationStatus;
  verification?: VerificationMetadata;
}

export interface PartnerBrand {
  id: string;
  name: LocalizedText;
  logoUrl: string;
  websiteUrl?: string;
  category?: LocalizedText;
  sector: SectorScope;
  order: number;
  status: PublicationStatus;
}

// Extended Testimonial with full sector, verification, order, and status support
export interface EnhancedTestimonial {
  id: string;
  name: LocalizedText;
  role: LocalizedText;
  location?: LocalizedText;
  avatar: string;
  rating: number;
  quote: LocalizedText;
  dealHighlight?: LocalizedText;
  category?: 'buyer' | 'seller' | 'investor' | 'tenant' | 'client' | 'corporate';
  sector: SectorScope;
  order: number;
  featured?: boolean;
  status: PublicationStatus;
  date?: string;
  verification?: VerificationMetadata;
}
