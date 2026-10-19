export type ConstructionLanguage = 'ar' | 'en';

export type ConstructionProjectCategory =
  | 'all'
  | 'residential'
  | 'commercial'
  | 'industrial'
  | 'finishing';

export type ProjectStatus = 'completed' | 'in-progress' | 'delivered';

export interface ConstructionProject {
  id: string;
  titleAr: string;
  titleEn: string;
  category: 'residential' | 'commercial' | 'industrial' | 'finishing';
  status: ProjectStatus;
  locationAr: string;
  locationEn: string;
  cityAr: string;
  cityEn: string;
  year: string;
  buaM2: number; // Built-up area in m²
  durationMonths: number;
  valueSAR: string;
  clientAr: string;
  clientEn: string;
  image: string;
  galleryImages: string[];
  descriptionAr: string;
  descriptionEn: string;
  scopeAr: string[];
  scopeEn: string[];
  structuralSystemAr: string;
  structuralSystemEn: string;
  finishingLevelAr: string;
  finishingLevelEn: string;
  highlightsAr: string[];
  highlightsEn: string[];
  featured?: boolean;
}

export type FinishingLevel = 'skeleton' | 'commercial' | 'deluxe' | 'super-luxury';
export type ConstructionProjectType =
  | 'villa'
  | 'commercial-building'
  | 'duplex'
  | 'residential-compound'
  | 'warehouse';

export interface CostEstimateParams {
  projectType: ConstructionProjectType;
  finishingLevel: FinishingLevel;
  builtUpArea: number; // in m²
  floors: number;
  hasBasement: boolean;
  hasPool: boolean;
  hasElevator: boolean;
  hasSmartHome: boolean;
  location: string;
}

export interface CostEstimateResult {
  minTotalSAR: number;
  maxTotalSAR: number;
  avgTotalSAR: number;
  structuralCostSAR: number;
  finishingCostSAR: number;
  mepCostSAR: number;
  addonsCostSAR: number;
  pricePerM2SAR: number;
  estimatedDurationMonths: number;
}

export type LeadStatus = 'new' | 'contacted' | 'proposal_sent' | 'won' | 'closed';

export interface ConstructionQuoteLead {
  id: string;
  referenceNumber: string;
  createdAt: string;
  clientName: string;
  phoneNumber: string;
  email: string;
  city: string;
  district: string;
  projectType: ConstructionProjectType | 'other';
  finishingLevel?: FinishingLevel;
  builtUpArea?: number;
  budgetRangeSAR?: string;
  timeline?: string;
  notes?: string;
  hasArchitecturalPlans?: boolean;
  fileName?: string;
  source: 'quote_form' | 'cost_estimator' | 'project_inquiry' | 'direct_call';
  inquiredProjectId?: string;
  estimatedValueSAR?: number;
  calculatorVersion?: number;
  inputSnapshot?: Record<string, any>;
  calculationSnapshot?: Record<string, any>;
  status: LeadStatus;
  adminNotes?: string;
}

export interface ConstructionService {
  id: string;
  iconName: string;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  deliverablesAr: string[];
  deliverablesEn: string[];
  warrantyYears: number;
  badgeAr?: string;
  badgeEn?: string;
  startingPriceSAR?: string;
}
