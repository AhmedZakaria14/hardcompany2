/**
 * Local storage & state repository for business entities:
 * Team Members, FAQs, Offices, Certifications, Business Statistics, Partner Brands, Testimonials.
 */

import {
  TeamMember,
  FaqEntity,
  OfficeLocation,
  Certification,
  BusinessStatistic,
  PartnerBrand,
  EnhancedTestimonial,
} from '../../types/businessEntities';
import {
  mockTeamMembers,
  mockFaqs,
  mockOffices,
  mockCertifications,
  mockBusinessStatistics,
  mockPartnerBrands,
  mockEnhancedTestimonials,
} from '../../data/entitiesMockData';

const TEAM_KEY = 'hard_cms_team_members';
const FAQS_KEY = 'hard_cms_faqs';
const OFFICES_KEY = 'hard_cms_offices';
const CERTS_KEY = 'hard_cms_certifications';
const STATS_KEY = 'hard_cms_statistics';
const PARTNERS_KEY = 'hard_cms_partners';
const TESTIMONIALS_KEY = 'hard_cms_testimonials_v2';

function getItem<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Failed to write ${key} to localStorage:`, e);
  }
}

// 1. TEAM MEMBERS REPOSITORY
export const TeamMembersRepository = {
  getAll(): TeamMember[] {
    return getItem<TeamMember>(TEAM_KEY, mockTeamMembers).sort((a, b) => a.order - b.order);
  },
  saveAll(list: TeamMember[]) {
    setItem(TEAM_KEY, list);
  },
  create(item: Partial<TeamMember>): TeamMember {
    const current = this.getAll();
    const newItem: TeamMember = {
      id: item.id || `team-${Date.now()}`,
      name: item.name || { en: 'Team Member', ar: 'عضو الفريق' },
      role: item.role || { en: 'Executive', ar: 'مسؤول تنفيذي' },
      bio: item.bio || { en: '', ar: '' },
      email: item.email || '',
      phone: item.phone || '',
      avatar: item.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
      sector: item.sector || 'group',
      order: item.order ?? current.length + 1,
      status: item.status || 'published',
      socialLinks: item.socialLinks || {},
      certifications: item.certifications || [],
      verification: item.verification || {
        isVerified: false,
        verificationStatus: 'unverified',
      },
    };
    const updated = [newItem, ...current.filter((t) => t.id !== newItem.id)];
    this.saveAll(updated);
    return newItem;
  },
  update(id: string, updates: Partial<TeamMember>): TeamMember | null {
    const current = this.getAll();
    const idx = current.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    const updated: TeamMember = { ...current[idx], ...updates };
    current[idx] = updated;
    this.saveAll(current);
    return updated;
  },
  delete(id: string): boolean {
    const current = this.getAll();
    const filtered = current.filter((t) => t.id !== id);
    this.saveAll(filtered);
    return true;
  },
  resetToDefaults(): TeamMember[] {
    this.saveAll(mockTeamMembers);
    return mockTeamMembers;
  },
};

// 2. FAQS REPOSITORY
export const FaqsRepository = {
  getAll(): FaqEntity[] {
    return getItem<FaqEntity>(FAQS_KEY, mockFaqs).sort((a, b) => a.order - b.order);
  },
  saveAll(list: FaqEntity[]) {
    setItem(FAQS_KEY, list);
  },
  create(item: Partial<FaqEntity>): FaqEntity {
    const current = this.getAll();
    const newItem: FaqEntity = {
      id: item.id || `faq-${Date.now()}`,
      question: item.question || { en: 'Frequently Asked Question', ar: 'سؤال شائع' },
      answer: item.answer || { en: 'Answer text details.', ar: 'تفاصيل الإجابة.' },
      category: item.category || { en: 'General', ar: 'عام' },
      sector: item.sector || 'group',
      order: item.order ?? current.length + 1,
      status: item.status || 'published',
    };
    const updated = [newItem, ...current.filter((f) => f.id !== newItem.id)];
    this.saveAll(updated);
    return newItem;
  },
  update(id: string, updates: Partial<FaqEntity>): FaqEntity | null {
    const current = this.getAll();
    const idx = current.findIndex((f) => f.id === id);
    if (idx === -1) return null;
    const updated: FaqEntity = { ...current[idx], ...updates };
    current[idx] = updated;
    this.saveAll(current);
    return updated;
  },
  delete(id: string): boolean {
    const current = this.getAll();
    const filtered = current.filter((f) => f.id !== id);
    this.saveAll(filtered);
    return true;
  },
  resetToDefaults(): FaqEntity[] {
    this.saveAll(mockFaqs);
    return mockFaqs;
  },
};

// 3. OFFICES REPOSITORY
export const OfficesRepository = {
  getAll(): OfficeLocation[] {
    return getItem<OfficeLocation>(OFFICES_KEY, mockOffices).sort((a, b) => a.order - b.order);
  },
  saveAll(list: OfficeLocation[]) {
    setItem(OFFICES_KEY, list);
  },
  create(item: Partial<OfficeLocation>): OfficeLocation {
    const current = this.getAll();
    const newItem: OfficeLocation = {
      id: item.id || `off-${Date.now()}`,
      name: item.name || { en: 'Office Location', ar: 'مقر الفرع' },
      city: item.city || { en: 'Al Khobar', ar: 'الخُبر' },
      address: item.address || { en: 'Main Street', ar: 'الشارع الرئيسي' },
      phone: item.phone || '+966 13 800 4273',
      email: item.email || 'info@hardgp.com',
      workingHours: item.workingHours || { en: 'Sunday - Thursday 8am-5pm', ar: 'الأحد - الخميس 8 ص - 5 م' },
      coordinates: item.coordinates || { lat: 26.2886, lng: 50.2185 },
      googleMapUrl: item.googleMapUrl || '',
      image: item.image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
      isHeadquarters: Boolean(item.isHeadquarters),
      sector: item.sector || 'group',
      order: item.order ?? current.length + 1,
      status: item.status || 'published',
    };
    const updated = [newItem, ...current.filter((o) => o.id !== newItem.id)];
    this.saveAll(updated);
    return newItem;
  },
  update(id: string, updates: Partial<OfficeLocation>): OfficeLocation | null {
    const current = this.getAll();
    const idx = current.findIndex((o) => o.id === id);
    if (idx === -1) return null;
    const updated: OfficeLocation = { ...current[idx], ...updates };
    current[idx] = updated;
    this.saveAll(current);
    return updated;
  },
  delete(id: string): boolean {
    const current = this.getAll();
    const filtered = current.filter((o) => o.id !== id);
    this.saveAll(filtered);
    return true;
  },
  resetToDefaults(): OfficeLocation[] {
    this.saveAll(mockOffices);
    return mockOffices;
  },
};

// 4. CERTIFICATIONS REPOSITORY
export const CertificationsRepository = {
  getAll(): Certification[] {
    return getItem<Certification>(CERTS_KEY, mockCertifications).sort((a, b) => a.order - b.order);
  },
  saveAll(list: Certification[]) {
    setItem(CERTS_KEY, list);
  },
  create(item: Partial<Certification>): Certification {
    const current = this.getAll();
    const newItem: Certification = {
      id: item.id || `cert-${Date.now()}`,
      title: item.title || { en: 'Certified Accreditation', ar: 'اعتماد رسمي معتمد' },
      issuer: item.issuer || { en: 'Regulatory Authority', ar: 'الجهة المانحة' },
      issueDate: item.issueDate || new Date().toISOString().slice(0, 10),
      expiryDate: item.expiryDate || '',
      credentialId: item.credentialId || '',
      credentialUrl: item.credentialUrl || '',
      image: item.image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
      sector: item.sector || 'group',
      order: item.order ?? current.length + 1,
      status: item.status || 'published',
      verification: item.verification || {
        isVerified: true,
        verificationStatus: 'verified',
        verifierName: 'Compliance Audit Panel',
      },
    };
    const updated = [newItem, ...current.filter((c) => c.id !== newItem.id)];
    this.saveAll(updated);
    return newItem;
  },
  update(id: string, updates: Partial<Certification>): Certification | null {
    const current = this.getAll();
    const idx = current.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    const updated: Certification = { ...current[idx], ...updates };
    current[idx] = updated;
    this.saveAll(current);
    return updated;
  },
  delete(id: string): boolean {
    const current = this.getAll();
    const filtered = current.filter((c) => c.id !== id);
    this.saveAll(filtered);
    return true;
  },
  resetToDefaults(): Certification[] {
    this.saveAll(mockCertifications);
    return mockCertifications;
  },
};

// 5. STATISTICS REPOSITORY
export const BusinessStatisticsRepository = {
  getAll(): BusinessStatistic[] {
    return getItem<BusinessStatistic>(STATS_KEY, mockBusinessStatistics).sort((a, b) => a.order - b.order);
  },
  saveAll(list: BusinessStatistic[]) {
    setItem(STATS_KEY, list);
  },
  create(item: Partial<BusinessStatistic>): BusinessStatistic {
    const current = this.getAll();
    const newItem: BusinessStatistic = {
      id: item.id || `stat-${Date.now()}`,
      value: item.value || '+100',
      label: item.label || { en: 'Metric Label', ar: 'مؤشر الإنجاز' },
      description: item.description || { en: '', ar: '' },
      iconName: item.iconName || 'TrendingUp',
      sector: item.sector || 'group',
      order: item.order ?? current.length + 1,
      status: item.status || 'published',
      verification: item.verification || {
        isVerified: true,
        verificationStatus: 'verified',
      },
    };
    const updated = [newItem, ...current.filter((s) => s.id !== newItem.id)];
    this.saveAll(updated);
    return newItem;
  },
  update(id: string, updates: Partial<BusinessStatistic>): BusinessStatistic | null {
    const current = this.getAll();
    const idx = current.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    const updated: BusinessStatistic = { ...current[idx], ...updates };
    current[idx] = updated;
    this.saveAll(current);
    return updated;
  },
  delete(id: string): boolean {
    const current = this.getAll();
    const filtered = current.filter((s) => s.id !== id);
    this.saveAll(filtered);
    return true;
  },
  resetToDefaults(): BusinessStatistic[] {
    this.saveAll(mockBusinessStatistics);
    return mockBusinessStatistics;
  },
};

// 6. PARTNERS REPOSITORY
export const PartnerBrandsRepository = {
  getAll(): PartnerBrand[] {
    return getItem<PartnerBrand>(PARTNERS_KEY, mockPartnerBrands).sort((a, b) => a.order - b.order);
  },
  saveAll(list: PartnerBrand[]) {
    setItem(PARTNERS_KEY, list);
  },
  create(item: Partial<PartnerBrand>): PartnerBrand {
    const current = this.getAll();
    const newItem: PartnerBrand = {
      id: item.id || `partner-${Date.now()}`,
      name: item.name || { en: 'Partner Brand', ar: 'علامة الشريك' },
      logoUrl: item.logoUrl || 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=300&q=80',
      websiteUrl: item.websiteUrl || '',
      category: item.category || { en: 'Strategic Partner', ar: 'شريك استراتيجي' },
      sector: item.sector || 'group',
      order: item.order ?? current.length + 1,
      status: item.status || 'published',
    };
    const updated = [newItem, ...current.filter((p) => p.id !== newItem.id)];
    this.saveAll(updated);
    return newItem;
  },
  update(id: string, updates: Partial<PartnerBrand>): PartnerBrand | null {
    const current = this.getAll();
    const idx = current.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    const updated: PartnerBrand = { ...current[idx], ...updates };
    current[idx] = updated;
    this.saveAll(current);
    return updated;
  },
  delete(id: string): boolean {
    const current = this.getAll();
    const filtered = current.filter((p) => p.id !== id);
    this.saveAll(filtered);
    return true;
  },
  resetToDefaults(): PartnerBrand[] {
    this.saveAll(mockPartnerBrands);
    return mockPartnerBrands;
  },
};

// 7. ENHANCED TESTIMONIALS REPOSITORY
export const EnhancedTestimonialsRepository = {
  getAll(): EnhancedTestimonial[] {
    return getItem<EnhancedTestimonial>(TESTIMONIALS_KEY, mockEnhancedTestimonials).sort((a, b) => a.order - b.order);
  },
  saveAll(list: EnhancedTestimonial[]) {
    setItem(TESTIMONIALS_KEY, list);
  },
  create(item: Partial<EnhancedTestimonial>): EnhancedTestimonial {
    const current = this.getAll();
    const newItem: EnhancedTestimonial = {
      id: item.id || `test-${Date.now()}`,
      name: item.name || { en: 'Client Name', ar: 'اسم العميل' },
      role: item.role || { en: 'Investor', ar: 'مستثمر' },
      location: item.location || { en: 'Al Khobar', ar: 'الخُبر' },
      avatar: item.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      rating: item.rating || 5,
      quote: item.quote || { en: 'Exceptional service and guidance.', ar: 'خدمة متميزة وتوجيه راقٍ.' },
      dealHighlight: item.dealHighlight || { en: 'Prime Acquisition', ar: 'صفقة مميزة' },
      category: item.category || 'investor',
      sector: item.sector || 'realestate',
      order: item.order ?? current.length + 1,
      featured: item.featured ?? true,
      status: item.status || 'published',
      date: item.date || new Date().toISOString().slice(0, 10),
      verification: item.verification || {
        isVerified: true,
        verificationStatus: 'verified',
        verifierName: 'REGA & Legal Registrar',
      },
    };
    const updated = [newItem, ...current.filter((t) => t.id !== newItem.id)];
    this.saveAll(updated);
    return newItem;
  },
  update(id: string, updates: Partial<EnhancedTestimonial>): EnhancedTestimonial | null {
    const current = this.getAll();
    const idx = current.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    const updated: EnhancedTestimonial = { ...current[idx], ...updates };
    current[idx] = updated;
    this.saveAll(current);
    return updated;
  },
  delete(id: string): boolean {
    const current = this.getAll();
    const filtered = current.filter((t) => t.id !== id);
    this.saveAll(filtered);
    return true;
  },
  resetToDefaults(): EnhancedTestimonial[] {
    this.saveAll(mockEnhancedTestimonials);
    return mockEnhancedTestimonials;
  },
};
