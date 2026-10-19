export type Language = 'en' | 'ar';

export type HVACLeadStatus = 'new' | 'contacted' | 'scheduled' | 'completed' | 'cancelled';

export interface HVACLead {
  id: string;
  referenceNumber: string;
  clientName: string;
  phoneNumber: string;
  email?: string;
  city: string;
  customCity?: string;
  service: string;
  notes?: string;
  source: 'hvac';
  createdAt: string;
  status: HVACLeadStatus;
  preferredDate?: string;
  isUrgent?: boolean;
  areaSqM?: number;
  estimatedSavingsSAR?: number;
  calculatorVersion?: number;
  inputSnapshot?: Record<string, any>;
  calculationSnapshot?: Record<string, any>;
}

export interface HVACService {
  id: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  image: string;
  badgeEn?: string;
  badgeAr?: string;
  active: boolean;
  sortOrder: number;
}

export interface HVACGalleryItem {
  id: string;
  image: string;
  titleEn: string;
  titleAr: string;
  categoryEn: string;
  categoryAr: string;
  captionEn: string;
  captionAr: string;
  locationEn: string;
  locationAr: string;
  active: boolean;
}

export interface HVACTestimonial {
  id: string;
  nameEn: string;
  nameAr: string;
  cityEn: string;
  cityAr: string;
  rating: number;
  quoteEn: string;
  quoteAr: string;
  serviceEn: string;
  serviceAr: string;
  date: string;
  active: boolean;
}

export interface HVACFaqItem {
  id: string;
  questionEn: string;
  questionAr: string;
  answerEn: string;
  answerAr: string;
  category?: string;
}

export interface HVACChecklistItem {
  id: string;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  importanceEn: string;
  importanceAr: string;
  iconName: string;
}

export type EfficiencyTier = 'split_standard' | 'inverter_high' | 'package_unit' | 'vrf_central';
