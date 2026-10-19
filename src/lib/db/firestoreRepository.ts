import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';
import { PublicDataWriter } from '../firebase/dataAccess';
import { Property, Project, BlogPost, Testimonial, JoinListSubscriber } from '../../types';
import { LeadRecord } from '../integrations/crmSync';
import { mockProperties, mockProjects, mockBlogPosts, mockTestimonials, mockSubscribers } from '../../data/mockData';

// Helper to remove undefined fields for Firestore
function sanitizePayload<T extends object>(data: T): Record<string, any> {
  const clean: Record<string, any> = {};
  Object.entries(data).forEach(([key, val]) => {
    if (val !== undefined) {
      clean[key] = val;
    }
  });
  return clean;
}

// ==============================================================================
// 1. PROPERTIES REPOSITORY (Firestore)
// ==============================================================================

export const FirestorePropertiesRepository = {
  async getAll(): Promise<Property[]> {
    try {
      const colRef = collection(db, 'properties');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        const items = snap.docs.map((d) => d.data() as Property);
        return items;
      }
    } catch (e) {
      console.warn('FirestorePropertiesRepository.getAll error, falling back:', e);
    }
    return mockProperties;
  },

  async create(propertyData: Partial<Property>): Promise<Property> {
    const id = propertyData.id || `prop-${Date.now()}`;
    const newProperty: Property = {
      ...mockProperties[0], // fallback defaults
      ...propertyData,
      id,
    } as Property;

    try {
      const docRef = doc(db, 'properties', id);
      await setDoc(docRef, sanitizePayload(newProperty));
    } catch (e) {
      console.error('Error saving property to Firestore:', e);
    }
    return newProperty;
  },

  async update(id: string, updates: Partial<Property>): Promise<Property | null> {
    try {
      const docRef = doc(db, 'properties', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const existing = snap.data() as Property;
        const updated = { ...existing, ...updates };
        await updateDoc(docRef, sanitizePayload(updates));
        return updated;
      }
    } catch (e) {
      console.error('Error updating property in Firestore:', e);
    }
    return null;
  },

  async delete(id: string): Promise<boolean> {
    try {
      const docRef = doc(db, 'properties', id);
      await deleteDoc(docRef);
      return true;
    } catch (e) {
      console.error('Error deleting property in Firestore:', e);
      return false;
    }
  },
};

// ==============================================================================
// 2. PROJECTS REPOSITORY (Firestore)
// ==============================================================================

export const FirestoreProjectsRepository = {
  async getAll(): Promise<Project[]> {
    try {
      const colRef = collection(db, 'construction_projects');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as Project);
      }
    } catch (e) {
      console.warn('FirestoreProjectsRepository.getAll error:', e);
    }
    return mockProjects;
  },

  async create(projectData: Partial<Project>): Promise<Project> {
    const id = projectData.id || `proj-${Date.now()}`;
    const newProject: Project = {
      ...mockProjects[0],
      ...projectData,
      id,
    } as Project;

    try {
      const docRef = doc(db, 'construction_projects', id);
      await setDoc(docRef, sanitizePayload(newProject));
    } catch (e) {
      console.error('Error saving project to Firestore:', e);
    }
    return newProject;
  },

  async update(id: string, updates: Partial<Project>): Promise<Project | null> {
    try {
      const docRef = doc(db, 'construction_projects', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const existing = snap.data() as Project;
        const updated = { ...existing, ...updates };
        await updateDoc(docRef, sanitizePayload(updates));
        return updated;
      }
    } catch (e) {
      console.error('Error updating project in Firestore:', e);
    }
    return null;
  },

  async delete(id: string): Promise<boolean> {
    try {
      const docRef = doc(db, 'construction_projects', id);
      await deleteDoc(docRef);
      return true;
    } catch (e) {
      console.error('Error deleting project in Firestore:', e);
      return false;
    }
  },
};

// ==============================================================================
// 3. BLOG REPOSITORY (Firestore)
// ==============================================================================

export const FirestoreBlogRepository = {
  async getAll(): Promise<BlogPost[]> {
    try {
      const colRef = collection(db, 'blog_posts');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as BlogPost);
      }
    } catch (e) {
      console.warn('FirestoreBlogRepository.getAll error:', e);
    }
    return mockBlogPosts;
  },

  async create(postData: Partial<BlogPost>): Promise<BlogPost> {
    const id = postData.id || `post-${Date.now()}`;
    const newPost: BlogPost = {
      ...mockBlogPosts[0],
      ...postData,
      id,
    } as BlogPost;

    try {
      const docRef = doc(db, 'blog_posts', id);
      await setDoc(docRef, sanitizePayload(newPost));
    } catch (e) {
      console.error('Error saving blog post to Firestore:', e);
    }
    return newPost;
  },

  async update(id: string, updates: Partial<BlogPost>): Promise<BlogPost | null> {
    try {
      const docRef = doc(db, 'blog_posts', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const existing = snap.data() as BlogPost;
        const updated = { ...existing, ...updates };
        await updateDoc(docRef, sanitizePayload(updates));
        return updated;
      }
    } catch (e) {
      console.error('Error updating blog post in Firestore:', e);
    }
    return null;
  },

  async delete(id: string): Promise<boolean> {
    try {
      const docRef = doc(db, 'blog_posts', id);
      await deleteDoc(docRef);
      return true;
    } catch (e) {
      console.error('Error deleting blog post in Firestore:', e);
      return false;
    }
  },
};

// ==============================================================================
// 4. LEADS REPOSITORY (Firestore)
// ==============================================================================

export const FirestoreLeadsRepository = {
  async getAll(): Promise<LeadRecord[]> {
    try {
      const colRef = collection(db, 'leads');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as LeadRecord);
      }
    } catch (e) {
      console.warn('FirestoreLeadsRepository.getAll error:', e);
    }
    return [];
  },

  async create(leadInput: {
    name: string;
    email: string;
    phone: string;
    property_id?: string;
    property_title?: string;
    inquiry_type: LeadRecord['inquiry_type'];
    recipient_email?: string;
    message?: string;
    source?: string;
    metadata?: Record<string, any>;
  }): Promise<{ lead: LeadRecord; crmResult: { success: boolean; crmReferenceId: string; crmSystem: string } }> {
    try {
      const { lead: createdLead, trackingCode } = await PublicDataWriter.submitLead({
        fullName: leadInput.name,
        email: leadInput.email,
        phone: leadInput.phone,
        sector: 'realestate',
        leadType: leadInput.inquiry_type,
        message: leadInput.message,
        metadata: {
          property_id: leadInput.property_id,
          property_title: leadInput.property_title,
          recipient_email: leadInput.recipient_email || 'info@hardgp.com',
          source: leadInput.source || 'HARD Group Portal',
          ...leadInput.metadata,
        },
      });

      const leadRecord: LeadRecord = {
        id: createdLead.id,
        name: createdLead.fullName,
        email: createdLead.email,
        phone: createdLead.phone,
        property_id: leadInput.property_id,
        property_title: leadInput.property_title,
        inquiry_type: leadInput.inquiry_type,
        recipient_email: leadInput.recipient_email || 'info@hardgp.com',
        message: createdLead.message || '',
        status: createdLead.status as any,
        crm_sync_status: 'synced',
        source: leadInput.source || 'HARD Group Portal',
        metadata: {
          trackingCode,
          ...leadInput.metadata,
        },
        created_at: createdLead.createdAt,
      };

      return {
        lead: leadRecord,
        crmResult: {
          success: true,
          crmReferenceId: trackingCode,
          crmSystem: 'Firestore CRM',
        },
      };
    } catch (e: any) {
      console.error('Error persisting lead to Firestore:', e);
      throw e;
    }
  },
};

// ==============================================================================
// 5. SUBSCRIBERS REPOSITORY (Firestore)
// ==============================================================================

export const FirestoreJoinListRepository = {
  async getAll(): Promise<JoinListSubscriber[]> {
    try {
      const colRef = collection(db, 'subscribers');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as JoinListSubscriber);
      }
    } catch (e) {
      console.warn('FirestoreJoinListRepository.getAll error:', e);
    }
    return mockSubscribers;
  },

  async create(data: { email: string; source?: string; notes?: string }): Promise<JoinListSubscriber> {
    const id = `sub-${Date.now()}`;
    const newSubscriber: JoinListSubscriber = {
      id,
      email: data.email,
      source: data.source || 'Website Footer',
      status: 'active',
      createdAt: new Date().toISOString(),
      notes: data.notes || '',
    };

    try {
      const docRef = doc(db, 'subscribers', id);
      await setDoc(docRef, sanitizePayload(newSubscriber));
    } catch (e) {
      console.error('Error saving subscriber to Firestore:', e);
    }

    return newSubscriber;
  },

  async update(id: string, updates: Partial<JoinListSubscriber>): Promise<JoinListSubscriber | null> {
    try {
      const docRef = doc(db, 'subscribers', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const existing = snap.data() as JoinListSubscriber;
        const updated = { ...existing, ...updates };
        await updateDoc(docRef, sanitizePayload(updates));
        return updated;
      }
    } catch (e) {
      console.error('Error updating subscriber in Firestore:', e);
    }
    return null;
  },

  async delete(id: string): Promise<boolean> {
    try {
      const docRef = doc(db, 'subscribers', id);
      await deleteDoc(docRef);
      return true;
    } catch (e) {
      console.error('Error deleting subscriber in Firestore:', e);
      return false;
    }
  },
};
