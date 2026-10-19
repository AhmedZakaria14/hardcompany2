import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
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

// Sanitize payload to strip undefined fields for Firestore
function sanitizePayload<T extends object>(data: T): Record<string, any> {
  const clean: Record<string, any> = {};
  Object.entries(data).forEach(([key, val]) => {
    if (val !== undefined) {
      clean[key] = val;
    }
  });
  return clean;
}

// 1. FIRESTORE TEAM MEMBERS
export const FirestoreTeamMembersRepository = {
  async getAll(): Promise<TeamMember[]> {
    try {
      const snap = await getDocs(collection(db, 'team_members'));
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as TeamMember).sort((a, b) => (a.order || 0) - (b.order || 0));
      }
    } catch (e) {
      console.warn('FirestoreTeamMembersRepository.getAll error, using fallback:', e);
    }
    return mockTeamMembers;
  },
  async create(data: Partial<TeamMember>): Promise<TeamMember> {
    const id = data.id || `team-${Date.now()}`;
    const item = { ...mockTeamMembers[0], ...data, id } as TeamMember;
    try {
      await setDoc(doc(db, 'team_members', id), sanitizePayload(item));
    } catch (e) {
      console.error('Error saving team member to Firestore:', e);
    }
    return item;
  },
  async update(id: string, updates: Partial<TeamMember>): Promise<TeamMember | null> {
    try {
      const ref = doc(db, 'team_members', id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const existing = snap.data() as TeamMember;
        const updated = { ...existing, ...updates };
        await updateDoc(ref, sanitizePayload(updates));
        return updated;
      }
    } catch (e) {
      console.error('Error updating team member in Firestore:', e);
    }
    return null;
  },
  async delete(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'team_members', id));
      return true;
    } catch (e) {
      console.error('Error deleting team member in Firestore:', e);
      return false;
    }
  },
};

// 2. FIRESTORE FAQS
export const FirestoreFaqsRepository = {
  async getAll(): Promise<FaqEntity[]> {
    try {
      const snap = await getDocs(collection(db, 'faqs'));
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as FaqEntity).sort((a, b) => (a.order || 0) - (b.order || 0));
      }
    } catch (e) {
      console.warn('FirestoreFaqsRepository.getAll error, using fallback:', e);
    }
    return mockFaqs;
  },
  async create(data: Partial<FaqEntity>): Promise<FaqEntity> {
    const id = data.id || `faq-${Date.now()}`;
    const item = { ...mockFaqs[0], ...data, id } as FaqEntity;
    try {
      await setDoc(doc(db, 'faqs', id), sanitizePayload(item));
    } catch (e) {
      console.error('Error saving FAQ to Firestore:', e);
    }
    return item;
  },
  async update(id: string, updates: Partial<FaqEntity>): Promise<FaqEntity | null> {
    try {
      const ref = doc(db, 'faqs', id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const existing = snap.data() as FaqEntity;
        const updated = { ...existing, ...updates };
        await updateDoc(ref, sanitizePayload(updates));
        return updated;
      }
    } catch (e) {
      console.error('Error updating FAQ in Firestore:', e);
    }
    return null;
  },
  async delete(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'faqs', id));
      return true;
    } catch (e) {
      console.error('Error deleting FAQ in Firestore:', e);
      return false;
    }
  },
};

// 3. FIRESTORE OFFICES
export const FirestoreOfficesRepository = {
  async getAll(): Promise<OfficeLocation[]> {
    try {
      const snap = await getDocs(collection(db, 'offices'));
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as OfficeLocation).sort((a, b) => (a.order || 0) - (b.order || 0));
      }
    } catch (e) {
      console.warn('FirestoreOfficesRepository.getAll error, using fallback:', e);
    }
    return mockOffices;
  },
  async create(data: Partial<OfficeLocation>): Promise<OfficeLocation> {
    const id = data.id || `off-${Date.now()}`;
    const item = { ...mockOffices[0], ...data, id } as OfficeLocation;
    try {
      await setDoc(doc(db, 'offices', id), sanitizePayload(item));
    } catch (e) {
      console.error('Error saving office to Firestore:', e);
    }
    return item;
  },
  async update(id: string, updates: Partial<OfficeLocation>): Promise<OfficeLocation | null> {
    try {
      const ref = doc(db, 'offices', id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const existing = snap.data() as OfficeLocation;
        const updated = { ...existing, ...updates };
        await updateDoc(ref, sanitizePayload(updates));
        return updated;
      }
    } catch (e) {
      console.error('Error updating office in Firestore:', e);
    }
    return null;
  },
  async delete(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'offices', id));
      return true;
    } catch (e) {
      console.error('Error deleting office in Firestore:', e);
      return false;
    }
  },
};

// 4. FIRESTORE CERTIFICATIONS
export const FirestoreCertificationsRepository = {
  async getAll(): Promise<Certification[]> {
    try {
      const snap = await getDocs(collection(db, 'certifications'));
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as Certification).sort((a, b) => (a.order || 0) - (b.order || 0));
      }
    } catch (e) {
      console.warn('FirestoreCertificationsRepository.getAll error, using fallback:', e);
    }
    return mockCertifications;
  },
  async create(data: Partial<Certification>): Promise<Certification> {
    const id = data.id || `cert-${Date.now()}`;
    const item = { ...mockCertifications[0], ...data, id } as Certification;
    try {
      await setDoc(doc(db, 'certifications', id), sanitizePayload(item));
    } catch (e) {
      console.error('Error saving certification to Firestore:', e);
    }
    return item;
  },
  async update(id: string, updates: Partial<Certification>): Promise<Certification | null> {
    try {
      const ref = doc(db, 'certifications', id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const existing = snap.data() as Certification;
        const updated = { ...existing, ...updates };
        await updateDoc(ref, sanitizePayload(updates));
        return updated;
      }
    } catch (e) {
      console.error('Error updating certification in Firestore:', e);
    }
    return null;
  },
  async delete(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'certifications', id));
      return true;
    } catch (e) {
      console.error('Error deleting certification in Firestore:', e);
      return false;
    }
  },
};

// 5. FIRESTORE STATISTICS
export const FirestoreStatisticsRepository = {
  async getAll(): Promise<BusinessStatistic[]> {
    try {
      const snap = await getDocs(collection(db, 'statistics'));
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as BusinessStatistic).sort((a, b) => (a.order || 0) - (b.order || 0));
      }
    } catch (e) {
      console.warn('FirestoreStatisticsRepository.getAll error, using fallback:', e);
    }
    return mockBusinessStatistics;
  },
  async create(data: Partial<BusinessStatistic>): Promise<BusinessStatistic> {
    const id = data.id || `stat-${Date.now()}`;
    const item = { ...mockBusinessStatistics[0], ...data, id } as BusinessStatistic;
    try {
      await setDoc(doc(db, 'statistics', id), sanitizePayload(item));
    } catch (e) {
      console.error('Error saving statistic to Firestore:', e);
    }
    return item;
  },
  async update(id: string, updates: Partial<BusinessStatistic>): Promise<BusinessStatistic | null> {
    try {
      const ref = doc(db, 'statistics', id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const existing = snap.data() as BusinessStatistic;
        const updated = { ...existing, ...updates };
        await updateDoc(ref, sanitizePayload(updates));
        return updated;
      }
    } catch (e) {
      console.error('Error updating statistic in Firestore:', e);
    }
    return null;
  },
  async delete(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'statistics', id));
      return true;
    } catch (e) {
      console.error('Error deleting statistic in Firestore:', e);
      return false;
    }
  },
};

// 6. FIRESTORE PARTNERS
export const FirestorePartnersRepository = {
  async getAll(): Promise<PartnerBrand[]> {
    try {
      const snap = await getDocs(collection(db, 'partners'));
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as PartnerBrand).sort((a, b) => (a.order || 0) - (b.order || 0));
      }
    } catch (e) {
      console.warn('FirestorePartnersRepository.getAll error, using fallback:', e);
    }
    return mockPartnerBrands;
  },
  async create(data: Partial<PartnerBrand>): Promise<PartnerBrand> {
    const id = data.id || `partner-${Date.now()}`;
    const item = { ...mockPartnerBrands[0], ...data, id } as PartnerBrand;
    try {
      await setDoc(doc(db, 'partners', id), sanitizePayload(item));
    } catch (e) {
      console.error('Error saving partner to Firestore:', e);
    }
    return item;
  },
  async update(id: string, updates: Partial<PartnerBrand>): Promise<PartnerBrand | null> {
    try {
      const ref = doc(db, 'partners', id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const existing = snap.data() as PartnerBrand;
        const updated = { ...existing, ...updates };
        await updateDoc(ref, sanitizePayload(updates));
        return updated;
      }
    } catch (e) {
      console.error('Error updating partner in Firestore:', e);
    }
    return null;
  },
  async delete(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'partners', id));
      return true;
    } catch (e) {
      console.error('Error deleting partner in Firestore:', e);
      return false;
    }
  },
};

// 7. FIRESTORE ENHANCED TESTIMONIALS
export const FirestoreEnhancedTestimonialsRepository = {
  async getAll(): Promise<EnhancedTestimonial[]> {
    try {
      const snap = await getDocs(collection(db, 'testimonials'));
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as EnhancedTestimonial).sort((a, b) => (a.order || 0) - (b.order || 0));
      }
    } catch (e) {
      console.warn('FirestoreEnhancedTestimonialsRepository.getAll error, using fallback:', e);
    }
    return mockEnhancedTestimonials;
  },
  async create(data: Partial<EnhancedTestimonial>): Promise<EnhancedTestimonial> {
    const id = data.id || `test-${Date.now()}`;
    const item = { ...mockEnhancedTestimonials[0], ...data, id } as EnhancedTestimonial;
    try {
      await setDoc(doc(db, 'testimonials', id), sanitizePayload(item));
    } catch (e) {
      console.error('Error saving testimonial to Firestore:', e);
    }
    return item;
  },
  async update(id: string, updates: Partial<EnhancedTestimonial>): Promise<EnhancedTestimonial | null> {
    try {
      const ref = doc(db, 'testimonials', id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const existing = snap.data() as EnhancedTestimonial;
        const updated = { ...existing, ...updates };
        await updateDoc(ref, sanitizePayload(updates));
        return updated;
      }
    } catch (e) {
      console.error('Error updating testimonial in Firestore:', e);
    }
    return null;
  },
  async delete(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'testimonials', id));
      return true;
    } catch (e) {
      console.error('Error deleting testimonial in Firestore:', e);
      return false;
    }
  },
};
