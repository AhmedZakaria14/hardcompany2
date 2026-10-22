import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Property, Project, BlogPost, Testimonial, JoinListSubscriber } from '../types';
import {
  TeamMember,
  FaqEntity,
  OfficeLocation,
  Certification,
  BusinessStatistic,
  PartnerBrand,
  EnhancedTestimonial,
} from '../types/businessEntities';
import {
  PropertiesRepository,
  LeadsRepository,
  ProjectsRepository,
  BlogRepository,
  TestimonialsRepository,
  JoinListRepository,
} from '../lib/db/repository';
import {
  TeamMembersRepository,
  FaqsRepository,
  OfficesRepository,
  CertificationsRepository,
  BusinessStatisticsRepository,
  PartnerBrandsRepository,
  EnhancedTestimonialsRepository,
} from '../lib/db/entitiesRepository';
import {
  FirestorePropertiesRepository,
  FirestoreProjectsRepository,
  FirestoreBlogRepository,
  FirestoreLeadsRepository,
  FirestoreJoinListRepository,
} from '../lib/db/firestoreRepository';
import {
  FirestoreTeamMembersRepository,
  FirestoreFaqsRepository,
  FirestoreOfficesRepository,
  FirestoreCertificationsRepository,
  FirestoreStatisticsRepository,
  FirestorePartnersRepository,
  FirestoreEnhancedTestimonialsRepository,
} from '../lib/db/firestoreEntitiesRepository';
import {
  LeadRecord,
  CrmSyncLog,
  subscribeToCrmLogs,
  getCrmSyncLogs,
} from '../lib/integrations/crmSync';
import { isSupabaseConfigured } from '../lib/db/supabaseClient';
import { PublicDataReader } from '../lib/firebase/dataAccess';

interface DataContextType {
  properties: Property[];
  leads: LeadRecord[];
  projects: Project[];
  blogPosts: BlogPost[];
  testimonials: Testimonial[];
  subscribers: JoinListSubscriber[];
  crmLogs: CrmSyncLog[];
  // Reusable Business Entities
  teamMembers: TeamMember[];
  faqs: FaqEntity[];
  offices: OfficeLocation[];
  certifications: Certification[];
  statistics: BusinessStatistic[];
  partnerBrands: PartnerBrand[];
  enhancedTestimonials: EnhancedTestimonial[];
  isLoading: boolean;
  isSupabaseConnected: boolean;

  // Properties CRUD
  addProperty: (propertyData: Partial<Property>) => Promise<Property>;
  updateProperty: (id: string, updates: Partial<Property>) => Promise<Property | null>;
  deleteProperty: (id: string) => Promise<boolean>;
  resetPropertiesToDefault: () => void;

  // Projects CRUD
  addProject: (projectData: Partial<Project>) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<boolean>;
  resetProjectsToDefault: () => void;

  // Blog Posts CRUD
  addBlogPost: (postData: Partial<BlogPost>) => Promise<BlogPost>;
  updateBlogPost: (id: string, updates: Partial<BlogPost>) => Promise<BlogPost | null>;
  deleteBlogPost: (id: string) => Promise<boolean>;
  resetBlogToDefault: () => void;
  resetBlogPostsToDefault: () => void;

  // Testimonials / Client Success Stories CRUD
  addTestimonial: (data: Partial<Testimonial>) => Promise<Testimonial>;
  updateTestimonial: (id: string, updates: Partial<Testimonial>) => Promise<Testimonial | null>;
  deleteTestimonial: (id: string) => Promise<boolean>;
  resetTestimonialsToDefault: () => void;

  // Join List Subscribers CRUD
  addSubscriber: (email: string, source?: string, notes?: string) => Promise<JoinListSubscriber>;
  updateSubscriber: (id: string, updates: Partial<JoinListSubscriber>) => Promise<JoinListSubscriber | null>;
  deleteSubscriber: (id: string) => Promise<boolean>;
  toggleSubscriberStatus: (id: string) => Promise<JoinListSubscriber | null>;
  resetSubscribersToDefault: () => void;

  // --- REUSABLE BUSINESS ENTITIES CRUD ---
  // Team Members
  addTeamMember: (data: Partial<TeamMember>) => Promise<TeamMember>;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => Promise<TeamMember | null>;
  deleteTeamMember: (id: string) => Promise<boolean>;
  resetTeamMembersToDefault: () => void;

  // FAQs
  addFaq: (data: Partial<FaqEntity>) => Promise<FaqEntity>;
  updateFaq: (id: string, updates: Partial<FaqEntity>) => Promise<FaqEntity | null>;
  deleteFaq: (id: string) => Promise<boolean>;
  resetFaqsToDefault: () => void;

  // Offices
  addOffice: (data: Partial<OfficeLocation>) => Promise<OfficeLocation>;
  updateOffice: (id: string, updates: Partial<OfficeLocation>) => Promise<OfficeLocation | null>;
  deleteOffice: (id: string) => Promise<boolean>;
  resetOfficesToDefault: () => void;

  // Certifications
  addCertification: (data: Partial<Certification>) => Promise<Certification>;
  updateCertification: (id: string, updates: Partial<Certification>) => Promise<Certification | null>;
  deleteCertification: (id: string) => Promise<boolean>;
  resetCertificationsToDefault: () => void;

  // Business Statistics
  addStatistic: (data: Partial<BusinessStatistic>) => Promise<BusinessStatistic>;
  updateStatistic: (id: string, updates: Partial<BusinessStatistic>) => Promise<BusinessStatistic | null>;
  deleteStatistic: (id: string) => Promise<boolean>;
  resetStatisticsToDefault: () => void;

  // Partner Brands
  addPartnerBrand: (data: Partial<PartnerBrand>) => Promise<PartnerBrand>;
  updatePartnerBrand: (id: string, updates: Partial<PartnerBrand>) => Promise<PartnerBrand | null>;
  deletePartnerBrand: (id: string) => Promise<boolean>;
  resetPartnerBrandsToDefault: () => void;

  // Enhanced Testimonials
  addEnhancedTestimonial: (data: Partial<EnhancedTestimonial>) => Promise<EnhancedTestimonial>;
  updateEnhancedTestimonial: (id: string, updates: Partial<EnhancedTestimonial>) => Promise<EnhancedTestimonial | null>;
  deleteEnhancedTestimonial: (id: string) => Promise<boolean>;
  resetEnhancedTestimonialsToDefault: () => void;

  // Leads & CRM
  submitLead: (leadInput: {
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
  }) => Promise<{ lead: LeadRecord; crmResult: { success: boolean; crmReferenceId: string; crmSystem: string } }>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [subscribers, setSubscribers] = useState<JoinListSubscriber[]>([]);
  const [crmLogs, setCrmLogs] = useState<CrmSyncLog[]>(getCrmSyncLogs());

  // Entities state
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [faqs, setFaqs] = useState<FaqEntity[]>([]);
  const [offices, setOffices] = useState<OfficeLocation[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [statistics, setStatistics] = useState<BusinessStatistic[]>([]);
  const [partnerBrands, setPartnerBrands] = useState<PartnerBrand[]>([]);
  const [enhancedTestimonials, setEnhancedTestimonials] = useState<EnhancedTestimonial[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        props,
        lds,
        projs,
        posts,
        tests,
        subs,
        tm,
        fq,
        off,
        certs,
        stats,
        partners,
        enhTests,
      ] = await Promise.all([
        FirestorePropertiesRepository.getAll().catch(() => PropertiesRepository.getAll()),
        FirestoreLeadsRepository.getAll().catch(() => []),
        FirestoreProjectsRepository.getAll().catch(() => ProjectsRepository.getAll()),
        FirestoreBlogRepository.getAll().catch(() => BlogRepository.getAll()),
        TestimonialsRepository.getAll(),
        FirestoreJoinListRepository.getAll().catch(() => []),
        FirestoreTeamMembersRepository.getAll().catch(() => TeamMembersRepository.getAll()),
        FirestoreFaqsRepository.getAll().catch(() => FaqsRepository.getAll()),
        FirestoreOfficesRepository.getAll().catch(() => OfficesRepository.getAll()),
        FirestoreCertificationsRepository.getAll().catch(() => CertificationsRepository.getAll()),
        FirestoreStatisticsRepository.getAll().catch(() => BusinessStatisticsRepository.getAll()),
        FirestorePartnersRepository.getAll().catch(() => PartnerBrandsRepository.getAll()),
        FirestoreEnhancedTestimonialsRepository.getAll().catch(() => EnhancedTestimonialsRepository.getAll()),
      ]);

      setProperties(props);
      setLeads(lds);
      setProjects(projs);
      setBlogPosts(posts);
      setTestimonials(tests);
      setSubscribers(subs);
      setTeamMembers(tm);
      setFaqs(fq);
      setOffices(off);
      setCertifications(certs);
      setStatistics(stats);
      setPartnerBrands(partners);
      setEnhancedTestimonials(enhTests);
    } catch (err) {
      console.error('Failed to load data from repositories:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();

    // 1. Scoped real-time listener for published properties
    const unsubProps = PublicDataReader.subscribeToPublishedCollection<any>('properties', (publishedProps) => {
      if (publishedProps && publishedProps.length > 0) {
        setProperties(publishedProps);
      }
    });

    // 2. Scoped real-time listener for published construction projects
    const unsubProjects = PublicDataReader.subscribeToPublishedCollection<any>('construction_projects', (publishedProjects) => {
      if (publishedProjects && publishedProjects.length > 0) {
        setProjects(publishedProjects);
      }
    });

    // 3. Listener for CRM sync logs
    const unsubCrm = subscribeToCrmLogs((newLogs) => {
      setCrmLogs(newLogs);
    });

    // 4. Scoped real-time listener for customer leads from Firestore
    let unsubLeads: () => void = () => {};
    try {
      FirestoreLeadsRepository.getAll().then((dbLeads) => {
        setLeads(dbLeads || []);
      }).catch(() => {});
    } catch {
      // Ignore
    }

    return () => {
      unsubProps();
      unsubProjects();
      unsubCrm();
      unsubLeads();
    };
  }, [refreshData]);

  // Properties CRUD
  const addProperty = async (propertyData: Partial<Property>): Promise<Property> => {
    const created = await PropertiesRepository.create(propertyData);
    await FirestorePropertiesRepository.create(created).catch((err) => {
      console.warn('Firestore property create notice:', err);
    });
    setProperties((prev) => [created, ...prev]);
    return created;
  };

  const updateProperty = async (id: string, updates: Partial<Property>): Promise<Property | null> => {
    const updated = await PropertiesRepository.update(id, updates);
    if (updated) {
      await FirestorePropertiesRepository.update(id, updates).catch((err) => {
        console.warn('Firestore property update notice:', err);
      });
      setProperties((prev) => prev.map((p) => (p.id === id ? updated : p)));
    }
    return updated;
  };

  const deleteProperty = async (id: string): Promise<boolean> => {
    const success = await PropertiesRepository.delete(id);
    if (success) {
      await FirestorePropertiesRepository.delete(id).catch((err) => {
        console.warn('Firestore property delete notice:', err);
      });
      setProperties((prev) => prev.filter((p) => p.id !== id));
    }
    return success;
  };

  const resetPropertiesToDefault = () => {
    const defaultData = PropertiesRepository.resetToDefaults();
    setProperties(defaultData);
  };

  // Projects CRUD
  const addProject = async (projectData: Partial<Project>): Promise<Project> => {
    const created = await ProjectsRepository.create(projectData);
    await FirestoreProjectsRepository.create(created).catch((err) => {
      console.warn('Firestore project create notice:', err);
    });
    setProjects((prev) => [created, ...prev]);
    return created;
  };

  const updateProject = async (id: string, updates: Partial<Project>): Promise<Project | null> => {
    const updated = await ProjectsRepository.update(id, updates);
    if (updated) {
      await FirestoreProjectsRepository.update(id, updates).catch((err) => {
        console.warn('Firestore project update notice:', err);
      });
      setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
    }
    return updated;
  };

  const deleteProject = async (id: string): Promise<boolean> => {
    const success = await ProjectsRepository.delete(id);
    if (success) {
      await FirestoreProjectsRepository.delete(id).catch((err) => {
        console.warn('Firestore project delete notice:', err);
      });
      setProjects((prev) => prev.filter((p) => p.id !== id));
    }
    return success;
  };

  const resetProjectsToDefault = () => {
    const defaultData = ProjectsRepository.resetToDefaults();
    setProjects(defaultData);
  };

  // Blog Posts CRUD
  const addBlogPost = async (postData: Partial<BlogPost>): Promise<BlogPost> => {
    const created = await BlogRepository.create(postData);
    await FirestoreBlogRepository.create(created).catch((err) => {
      console.warn('Firestore blog post create notice:', err);
    });
    setBlogPosts((prev) => [created, ...prev]);
    return created;
  };

  const updateBlogPost = async (id: string, updates: Partial<BlogPost>): Promise<BlogPost | null> => {
    const updated = await BlogRepository.update(id, updates);
    if (updated) {
      await FirestoreBlogRepository.update(id, updates).catch((err) => {
        console.warn('Firestore blog post update notice:', err);
      });
      setBlogPosts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    }
    return updated;
  };

  const deleteBlogPost = async (id: string): Promise<boolean> => {
    const success = await BlogRepository.delete(id);
    if (success) {
      await FirestoreBlogRepository.delete(id).catch((err) => {
        console.warn('Firestore blog post delete notice:', err);
      });
      setBlogPosts((prev) => prev.filter((p) => p.id !== id));
    }
    return success;
  };

  const resetBlogToDefault = () => {
    const defaultData = BlogRepository.resetToDefaults();
    setBlogPosts(defaultData);
  };

  // Testimonials / Client Success Stories CRUD
  const addTestimonial = async (data: Partial<Testimonial>): Promise<Testimonial> => {
    const created = await TestimonialsRepository.create(data);
    setTestimonials((prev) => [created, ...prev]);
    return created;
  };

  const updateTestimonial = async (id: string, updates: Partial<Testimonial>): Promise<Testimonial | null> => {
    const updated = await TestimonialsRepository.update(id, updates);
    if (updated) {
      setTestimonials((prev) => prev.map((t) => (t.id === id ? updated : t)));
    }
    return updated;
  };

  const deleteTestimonial = async (id: string): Promise<boolean> => {
    const success = await TestimonialsRepository.delete(id);
    if (success) {
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
    }
    return success;
  };

  const resetTestimonialsToDefault = () => {
    const defaultData = TestimonialsRepository.resetToDefaults();
    setTestimonials(defaultData);
  };

  // Join List Subscribers CRUD
  const addSubscriber = async (email: string, source = 'Website Footer', notes = ''): Promise<JoinListSubscriber> => {
    const subscriber = await JoinListRepository.create({ email, source, notes });
    await FirestoreJoinListRepository.create({ email, source, notes }).catch((err) => {
      console.warn('Firestore subscriber create notice:', err);
    });
    setSubscribers((prev) => {
      const exists = prev.some((s) => s.id === subscriber.id);
      if (exists) {
        return prev.map((s) => (s.id === subscriber.id ? subscriber : s));
      }
      return [subscriber, ...prev];
    });
    return subscriber;
  };

  const updateSubscriber = async (id: string, updates: Partial<JoinListSubscriber>): Promise<JoinListSubscriber | null> => {
    const updated = await JoinListRepository.update(id, updates);
    if (updated) {
      await FirestoreJoinListRepository.update(id, updates).catch((err) => {
        console.warn('Firestore subscriber update notice:', err);
      });
      setSubscribers((prev) => prev.map((s) => (s.id === id ? updated : s)));
    }
    return updated;
  };

  const deleteSubscriber = async (id: string): Promise<boolean> => {
    const success = await JoinListRepository.delete(id);
    if (success) {
      await FirestoreJoinListRepository.delete(id).catch((err) => {
        console.warn('Firestore subscriber delete notice:', err);
      });
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
    }
    return success;
  };

  const toggleSubscriberStatus = async (id: string): Promise<JoinListSubscriber | null> => {
    const target = subscribers.find((s) => s.id === id);
    if (!target) return null;
    const newStatus = target.status === 'active' ? 'unsubscribed' : 'active';
    return updateSubscriber(id, { status: newStatus });
  };

  const resetSubscribersToDefault = () => {
    const defaultData = JoinListRepository.resetToDefaults();
    setSubscribers(defaultData);
  };

  // --- REUSABLE BUSINESS ENTITIES CRUD METHODS ---

  // 1. Team Members
  const addTeamMember = async (data: Partial<TeamMember>): Promise<TeamMember> => {
    const item = TeamMembersRepository.create(data);
    await FirestoreTeamMembersRepository.create(item).catch(() => {});
    setTeamMembers((prev) => [item, ...prev.filter((t) => t.id !== item.id)].sort((a, b) => a.order - b.order));
    return item;
  };
  const updateTeamMember = async (id: string, updates: Partial<TeamMember>): Promise<TeamMember | null> => {
    const item = TeamMembersRepository.update(id, updates);
    if (item) {
      await FirestoreTeamMembersRepository.update(id, updates).catch(() => {});
      setTeamMembers((prev) => prev.map((t) => (t.id === id ? item : t)).sort((a, b) => a.order - b.order));
    }
    return item;
  };
  const deleteTeamMember = async (id: string): Promise<boolean> => {
    const ok = TeamMembersRepository.delete(id);
    if (ok) {
      await FirestoreTeamMembersRepository.delete(id).catch(() => {});
      setTeamMembers((prev) => prev.filter((t) => t.id !== id));
    }
    return ok;
  };
  const resetTeamMembersToDefault = () => {
    const defaults = TeamMembersRepository.resetToDefaults();
    setTeamMembers(defaults);
  };

  // 2. FAQs
  const addFaq = async (data: Partial<FaqEntity>): Promise<FaqEntity> => {
    const item = FaqsRepository.create(data);
    await FirestoreFaqsRepository.create(item).catch(() => {});
    setFaqs((prev) => [item, ...prev.filter((f) => f.id !== item.id)].sort((a, b) => a.order - b.order));
    return item;
  };
  const updateFaq = async (id: string, updates: Partial<FaqEntity>): Promise<FaqEntity | null> => {
    const item = FaqsRepository.update(id, updates);
    if (item) {
      await FirestoreFaqsRepository.update(id, updates).catch(() => {});
      setFaqs((prev) => prev.map((f) => (f.id === id ? item : f)).sort((a, b) => a.order - b.order));
    }
    return item;
  };
  const deleteFaq = async (id: string): Promise<boolean> => {
    const ok = FaqsRepository.delete(id);
    if (ok) {
      await FirestoreFaqsRepository.delete(id).catch(() => {});
      setFaqs((prev) => prev.filter((f) => f.id !== id));
    }
    return ok;
  };
  const resetFaqsToDefault = () => {
    const defaults = FaqsRepository.resetToDefaults();
    setFaqs(defaults);
  };

  // 3. Offices
  const addOffice = async (data: Partial<OfficeLocation>): Promise<OfficeLocation> => {
    const item = OfficesRepository.create(data);
    await FirestoreOfficesRepository.create(item).catch(() => {});
    setOffices((prev) => [item, ...prev.filter((o) => o.id !== item.id)].sort((a, b) => a.order - b.order));
    return item;
  };
  const updateOffice = async (id: string, updates: Partial<OfficeLocation>): Promise<OfficeLocation | null> => {
    const item = OfficesRepository.update(id, updates);
    if (item) {
      await FirestoreOfficesRepository.update(id, updates).catch(() => {});
      setOffices((prev) => prev.map((o) => (o.id === id ? item : o)).sort((a, b) => a.order - b.order));
    }
    return item;
  };
  const deleteOffice = async (id: string): Promise<boolean> => {
    const ok = OfficesRepository.delete(id);
    if (ok) {
      await FirestoreOfficesRepository.delete(id).catch(() => {});
      setOffices((prev) => prev.filter((o) => o.id !== id));
    }
    return ok;
  };
  const resetOfficesToDefault = () => {
    const defaults = OfficesRepository.resetToDefaults();
    setOffices(defaults);
  };

  // 4. Certifications
  const addCertification = async (data: Partial<Certification>): Promise<Certification> => {
    const item = CertificationsRepository.create(data);
    await FirestoreCertificationsRepository.create(item).catch(() => {});
    setCertifications((prev) => [item, ...prev.filter((c) => c.id !== item.id)].sort((a, b) => a.order - b.order));
    return item;
  };
  const updateCertification = async (id: string, updates: Partial<Certification>): Promise<Certification | null> => {
    const item = CertificationsRepository.update(id, updates);
    if (item) {
      await FirestoreCertificationsRepository.update(id, updates).catch(() => {});
      setCertifications((prev) => prev.map((c) => (c.id === id ? item : c)).sort((a, b) => a.order - b.order));
    }
    return item;
  };
  const deleteCertification = async (id: string): Promise<boolean> => {
    const ok = CertificationsRepository.delete(id);
    if (ok) {
      await FirestoreCertificationsRepository.delete(id).catch(() => {});
      setCertifications((prev) => prev.filter((c) => c.id !== id));
    }
    return ok;
  };
  const resetCertificationsToDefault = () => {
    const defaults = CertificationsRepository.resetToDefaults();
    setCertifications(defaults);
  };

  // 5. Business Statistics
  const addStatistic = async (data: Partial<BusinessStatistic>): Promise<BusinessStatistic> => {
    const item = BusinessStatisticsRepository.create(data);
    await FirestoreStatisticsRepository.create(item).catch(() => {});
    setStatistics((prev) => [item, ...prev.filter((s) => s.id !== item.id)].sort((a, b) => a.order - b.order));
    return item;
  };
  const updateStatistic = async (id: string, updates: Partial<BusinessStatistic>): Promise<BusinessStatistic | null> => {
    const item = BusinessStatisticsRepository.update(id, updates);
    if (item) {
      await FirestoreStatisticsRepository.update(id, updates).catch(() => {});
      setStatistics((prev) => prev.map((s) => (s.id === id ? item : s)).sort((a, b) => a.order - b.order));
    }
    return item;
  };
  const deleteStatistic = async (id: string): Promise<boolean> => {
    const ok = BusinessStatisticsRepository.delete(id);
    if (ok) {
      await FirestoreStatisticsRepository.delete(id).catch(() => {});
      setStatistics((prev) => prev.filter((s) => s.id !== id));
    }
    return ok;
  };
  const resetStatisticsToDefault = () => {
    const defaults = BusinessStatisticsRepository.resetToDefaults();
    setStatistics(defaults);
  };

  // 6. Partner Brands
  const addPartnerBrand = async (data: Partial<PartnerBrand>): Promise<PartnerBrand> => {
    const item = PartnerBrandsRepository.create(data);
    await FirestorePartnersRepository.create(item).catch(() => {});
    setPartnerBrands((prev) => [item, ...prev.filter((p) => p.id !== item.id)].sort((a, b) => a.order - b.order));
    return item;
  };
  const updatePartnerBrand = async (id: string, updates: Partial<PartnerBrand>): Promise<PartnerBrand | null> => {
    const item = PartnerBrandsRepository.update(id, updates);
    if (item) {
      await FirestorePartnersRepository.update(id, updates).catch(() => {});
      setPartnerBrands((prev) => prev.map((p) => (p.id === id ? item : p)).sort((a, b) => a.order - b.order));
    }
    return item;
  };
  const deletePartnerBrand = async (id: string): Promise<boolean> => {
    const ok = PartnerBrandsRepository.delete(id);
    if (ok) {
      await FirestorePartnersRepository.delete(id).catch(() => {});
      setPartnerBrands((prev) => prev.filter((p) => p.id !== id));
    }
    return ok;
  };
  const resetPartnerBrandsToDefault = () => {
    const defaults = PartnerBrandsRepository.resetToDefaults();
    setPartnerBrands(defaults);
  };

  // 7. Enhanced Testimonials
  const addEnhancedTestimonial = async (data: Partial<EnhancedTestimonial>): Promise<EnhancedTestimonial> => {
    const item = EnhancedTestimonialsRepository.create(data);
    await FirestoreEnhancedTestimonialsRepository.create(item).catch(() => {});
    setEnhancedTestimonials((prev) => [item, ...prev.filter((t) => t.id !== item.id)].sort((a, b) => a.order - b.order));
    return item;
  };
  const updateEnhancedTestimonial = async (id: string, updates: Partial<EnhancedTestimonial>): Promise<EnhancedTestimonial | null> => {
    const item = EnhancedTestimonialsRepository.update(id, updates);
    if (item) {
      await FirestoreEnhancedTestimonialsRepository.update(id, updates).catch(() => {});
      setEnhancedTestimonials((prev) => prev.map((t) => (t.id === id ? item : t)).sort((a, b) => a.order - b.order));
    }
    return item;
  };
  const deleteEnhancedTestimonial = async (id: string): Promise<boolean> => {
    const ok = EnhancedTestimonialsRepository.delete(id);
    if (ok) {
      await FirestoreEnhancedTestimonialsRepository.delete(id).catch(() => {});
      setEnhancedTestimonials((prev) => prev.filter((t) => t.id !== id));
    }
    return ok;
  };
  const resetEnhancedTestimonialsToDefault = () => {
    const defaults = EnhancedTestimonialsRepository.resetToDefaults();
    setEnhancedTestimonials(defaults);
  };

  // Leads & CRM
  const submitLead = async (leadInput: {
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
  }) => {
    const result = await LeadsRepository.create(leadInput);
    await FirestoreLeadsRepository.create(leadInput).catch((err) => {
      console.warn('Firestore lead persistence notice:', err);
    });
    setLeads((prev) => [result.lead, ...prev]);
    return result;
  };

  return (
    <DataContext.Provider
      value={{
        properties,
        leads,
        projects,
        blogPosts,
        testimonials,
        subscribers,
        crmLogs,
        teamMembers,
        faqs,
        offices,
        certifications,
        statistics,
        partnerBrands,
        enhancedTestimonials,
        isLoading,
        isSupabaseConnected: isSupabaseConfigured,
        addProperty,
        updateProperty,
        deleteProperty,
        resetPropertiesToDefault,
        addProject,
        updateProject,
        deleteProject,
        resetProjectsToDefault,
        addBlogPost,
        updateBlogPost,
        deleteBlogPost,
        resetBlogToDefault,
        resetBlogPostsToDefault: resetBlogToDefault,
        addTestimonial,
        updateTestimonial,
        deleteTestimonial,
        resetTestimonialsToDefault,
        addSubscriber,
        updateSubscriber,
        deleteSubscriber,
        toggleSubscriberStatus,
        resetSubscribersToDefault,
        addTeamMember,
        updateTeamMember,
        deleteTeamMember,
        resetTeamMembersToDefault,
        addFaq,
        updateFaq,
        deleteFaq,
        resetFaqsToDefault,
        addOffice,
        updateOffice,
        deleteOffice,
        resetOfficesToDefault,
        addCertification,
        updateCertification,
        deleteCertification,
        resetCertificationsToDefault,
        addStatistic,
        updateStatistic,
        deleteStatistic,
        resetStatisticsToDefault,
        addPartnerBrand,
        updatePartnerBrand,
        deletePartnerBrand,
        resetPartnerBrandsToDefault,
        addEnhancedTestimonial,
        updateEnhancedTestimonial,
        deleteEnhancedTestimonial,
        resetEnhancedTestimonialsToDefault,
        submitLead,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextType {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
