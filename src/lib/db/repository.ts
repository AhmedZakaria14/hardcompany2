/**
 * HARD REAL ESTATE - DATABASE REPOSITORY LAYER
 * 
 * Provides typed data access for properties and leads, binding Supabase PostgreSQL
 * with real-time local fallbacks and CRM synchronization.
 */

import { Property, Project, BlogPost, Testimonial, JoinListSubscriber } from '../../types';
import { mockProperties, mockProjects, mockBlogPosts, mockTestimonials, mockSubscribers } from '../../data/mockData';
import {
  getStoredProperties,
  saveStoredProperties,
  getStoredLeads,
  saveStoredLeads,
  getStoredProjects,
  saveStoredProjects,
  getStoredBlogPosts,
  saveStoredBlogPosts,
  getStoredTestimonials,
  saveStoredTestimonials,
  getStoredSubscribers,
  saveStoredSubscribers,
  supabase,
  isSupabaseConfigured,
} from './supabaseClient';
import { LeadRecord, syncLeadToCrm } from '../integrations/crmSync';

// ==============================================================================
// SCHEMA MAPPERS (Bilingual TypeScript Domain Model <-> Supabase PostgreSQL Table Rows)
// ==============================================================================

export function propertyToDbRow(prop: Partial<Property>) {
  const sarPrice = typeof prop.price === 'number' 
    ? prop.price 
    : (typeof prop.price?.sar === 'number' ? prop.price.sar : Number(prop.price?.sar) || 0);

  const isRent = prop.status === 'for-rent' || prop.price?.period === 'year';
  const cityStr = typeof prop.location?.city === 'string'
    ? prop.location.city
    : prop.location?.city?.en || 'khobar';

  const defaultAgent = {
    name: { en: 'Faisal Al-Otaibi', ar: 'فيصل العتيبي' },
    title: { en: 'Senior Luxury Advisor', ar: 'مستشار عقاري أول' },
    phone: '+966 13 800 4273',
    whatsapp: '966556125711',
    email: 'faisal@hardrealestate.sa',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
  };

  return {
    id: prop.id || `prop-${Date.now()}`,
    title_en: prop.title?.en || 'Luxury Residence',
    title_ar: prop.title?.ar || 'إقامة فاخرة',
    description_en: prop.description?.en || '',
    description_ar: prop.description?.ar || '',
    price: sarPrice,
    price_prefix_en: isRent ? 'Annual Rent' : (prop.price?.period === 'month' ? 'Monthly Rent' : 'Guide Price'),
    price_prefix_ar: isRent ? 'إيجار سنوي' : (prop.price?.period === 'month' ? 'إيجار شهري' : 'السعر التقديري'),
    location_en: prop.location?.address?.en || prop.location?.area?.en || prop.location?.city?.en || 'Al Khobar, Eastern Province',
    location_ar: prop.location?.address?.ar || prop.location?.area?.ar || prop.location?.city?.ar || 'الخُبر، المنطقة الشرقية',
    city: cityStr.toLowerCase().replace(/\s+/g, '-'),
    district_en: prop.location?.area?.en || '',
    district_ar: prop.location?.area?.ar || '',
    coordinates: prop.location?.coordinates || { lat: 26.2886, lng: 50.2185 },
    type: prop.type || 'villa',
    status: prop.status || 'for-sale',
    bedrooms: prop.bedrooms || 0,
    bathrooms: prop.bathrooms || 0,
    area_sqm: prop.areaSqM || Math.round((prop.areaSqFt || 0) * 0.0929) || 0,
    features_en: prop.amenities?.en || [],
    features_ar: prop.amenities?.ar || [],
    images: Array.isArray(prop.images) && prop.images.length > 0 ? prop.images : [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80'
    ],
    is_exclusive: prop.status === 'exclusive',
    is_featured: Boolean(prop.featured),
  };
}

export function dbRowToProperty(row: any): Property {
  const sarPrice = Number(row.price) || 0;
  const isRent = row.status === 'for-rent' || String(row.price_prefix_en || '').toLowerCase().includes('rent');

  const cityNameEn = row.city 
    ? row.city.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : 'Al Khobar';

  const cityArMap: Record<string, string> = {
    khobar: 'الخُبر',
    'al-khobar': 'الخُبر',
    dammam: 'الدمام',
    dhahran: 'الظهران',
    riyadh: 'الرياض',
    jeddah: 'جدة',
  };

  const cityNameAr = cityArMap[row.city?.toLowerCase()] || 'الخُبر';

  return {
    id: row.id,
    slug: `hard-${row.type || 'property'}-${row.id}`,
    title: {
      en: row.title_en || row.title?.en || 'Luxury Property',
      ar: row.title_ar || row.title?.ar || 'عقار فاخر',
    },
    description: {
      en: row.description_en || row.description?.en || '',
      ar: row.description_ar || row.description?.ar || '',
    },
    location: {
      city: { en: cityNameEn, ar: cityNameAr },
      area: {
        en: row.district_en || row.location_en || 'Eastern Province',
        ar: row.district_ar || row.location_ar || 'المنطقة الشرقية',
      },
      country: { en: 'Saudi Arabia', ar: 'المملكة العربية السعودية' },
      address: {
        en: row.location_en || 'Eastern Province, Saudi Arabia',
        ar: row.location_ar || 'المنطقة الشرقية، المملكة العربية السعودية',
      },
      coordinates: row.coordinates || { lat: 26.2886, lng: 50.2185 },
    },
    price: {
      sar: sarPrice,
      formattedSAR: `${sarPrice.toLocaleString('en-US')} SAR${isRent ? '/year' : ''}`,
      period: isRent ? 'year' : undefined,
    },
    type: row.type || 'villa',
    status: row.status || 'for-sale',
    bedrooms: Number(row.bedrooms) || 0,
    bathrooms: Number(row.bathrooms) || 0,
    areaSqM: Number(row.area_sqm) || 0,
    areaSqFt: Math.round((Number(row.area_sqm) || 0) * 10.7639),
    featured: Boolean(row.is_featured),
    images: Array.isArray(row.images) && row.images.length > 0 ? row.images : [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80',
    ],
    amenities: {
      en: Array.isArray(row.features_en) ? row.features_en : [],
      ar: Array.isArray(row.features_ar) ? row.features_ar : [],
    },
    features: {
      yearBuilt: Number(row.year_built || row.features?.yearBuilt) || 2025,
      parkingSpaces: Number(row.parking_spaces ?? row.features?.parkingSpaces ?? 4),
      furnishing: row.furnishing || row.features?.furnishing || { en: 'Luxury Finishes', ar: 'تشطيبات فاخرة' },
      view: row.view || row.features?.view || { en: 'Panoramic View', ar: 'إطلالة بانورامية' },
    },
    agent: {
      name: { en: 'Faisal Al-Otaibi', ar: 'فيصل العتيبي' },
      title: { en: 'Senior Luxury Director - Eastern Province', ar: 'مدير قطاع العقارات الفاخرة - المنطقة الشرقية' },
      phone: '+966 13 800 4273',
      whatsapp: '966556125711',
      email: 'faisal@hardrealestate.sa',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
    },
  };
}

export function projectToDbRow(proj: Partial<Project>) {
  return {
    id: proj.id || `proj-${Date.now()}`,
    name_en: proj.title?.en || 'Master Development',
    name_ar: proj.title?.ar || 'مشروع تطويري مميز',
    location_en: proj.location?.en || 'Al Khobar, Eastern Province',
    location_ar: proj.location?.ar || 'الخُبر، المنطقة الشرقية',
    type_en: proj.category?.en || 'Luxury Residential',
    type_ar: proj.category?.ar || 'مجمع سكني فاخر',
    status_en: proj.status === 'under-construction' ? `Under Construction (${proj.progressPercentage || 50}%)` : (proj.status || 'Active'),
    status_ar: proj.status === 'under-construction' ? `قيد الإنشاء (${proj.progressPercentage || 50}%)` : 'نشط',
    completion_date: proj.handoverDate?.en || 'Q4 2026',
    units_count: proj.unitsTotal || 100,
    starting_price: Number(String(proj.startingPriceSAR || '').replace(/[^0-9.]/g, '')) || 2500000,
    image: proj.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    description_en: proj.description?.en || '',
    description_ar: proj.description?.ar || '',
    features_en: proj.highlights?.en || [],
    features_ar: proj.highlights?.ar || [],
  };
}

export function dbRowToProject(row: any): Project {
  return {
    id: row.id,
    slug: `project-${row.id}`,
    title: { en: row.name_en, ar: row.name_ar },
    developer: { en: 'HARD Developments', ar: 'هارد للتطوير العقاري' },
    location: { en: row.location_en, ar: row.location_ar },
    category: { en: row.type_en || 'Luxury Residences', ar: row.type_ar || 'شقق وأجنحة فاخرة' },
    status: 'under-construction',
    progressPercentage: row.progress || 65,
    lastUpdated: row.last_updated || '2026-10-09',
    isOverdue: Boolean(row.is_overdue),
    flaggedForAdminReview: Boolean(row.flagged_for_review),
    handoverDate: { en: row.completion_date || '2026', ar: row.completion_date || '2026' },
    startingPriceSAR: `${Number(row.starting_price || 0).toLocaleString()} SAR`,
    unitsTotal: row.units_count || 100,
    unitsAvailable: Math.round((row.units_count || 100) * 0.35),
    roiProjected: 'Pending Audit Verification',
    deliveryAudit: row.delivery_audit || {
      status: 'under-construction',
      progressPercentage: row.progress || 65,
      lastUpdated: row.last_updated || '2026-10-09',
      originalHandoverDate: { en: row.completion_date || '2026', ar: row.completion_date || '2026' },
      currentHandoverDate: { en: row.completion_date || '2026', ar: row.completion_date || '2026' },
      isOverdue: Boolean(row.is_overdue),
      flaggedForAdminReview: Boolean(row.flagged_for_review),
      auditNote: {
        en: 'Audit status verified as of October 9, 2026.',
        ar: 'حالة التدقيق موثقة بتاريخ 9 أكتوبر 2026.',
      },
    },
    financialMetric: {
      isVerified: false,
      verificationStatus: {
        en: 'Pending Independent Audit Verification',
        ar: 'قيد التدقيق المالي المستقل',
      },
      statusNote: {
        en: 'Yield and financial figures withheld pending third-party audit verification.',
        ar: 'تم حجب نسب العائد المالي لحين اكتمال التدقيق المالي المستقل.',
      },
    },
    image: row.image,
    description: { en: row.description_en || '', ar: row.description_ar || '' },
    highlights: {
      en: Array.isArray(row.features_en) ? row.features_en : [],
      ar: Array.isArray(row.features_ar) ? row.features_ar : [],
    },
    featured: true,
  };
}

export function blogToDbRow(blog: Partial<BlogPost>) {
  return {
    id: blog.id || `post-${Date.now()}`,
    title_en: blog.title?.en || 'Market Report',
    title_ar: blog.title?.ar || 'تقرير عقاري',
    excerpt_en: blog.excerpt?.en || '',
    excerpt_ar: blog.excerpt?.ar || '',
    content_en: blog.content?.en || '',
    content_ar: blog.content?.ar || '',
    author_en: blog.author?.en || 'Faisal Al-Otaibi',
    author_ar: blog.author?.ar || 'فيصل العتيبي',
    date: blog.date || new Date().toISOString().slice(0, 10),
    category_en: blog.category?.en || 'Market Intelligence',
    category_ar: blog.category?.ar || 'دراسات وتقارير السوق',
    read_time_en: blog.readTime?.en || '5 min read',
    read_time_ar: blog.readTime?.ar || 'قراءة 5 دقائق',
    image: blog.image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
  };
}

export function dbRowToBlog(row: any): BlogPost {
  return {
    id: row.id,
    slug: `article-${row.id}`,
    title: { en: row.title_en, ar: row.title_ar },
    excerpt: { en: row.excerpt_en || '', ar: row.excerpt_ar || '' },
    category: { en: row.category_en || 'Market Insights', ar: row.category_ar || 'تقارير السوق' },
    date: row.date || 'August 2025',
    readTime: { en: row.read_time_en || '5 min', ar: row.read_time_ar || '5 دقائق' },
    author: { en: row.author_en || 'Faisal Al-Otaibi', ar: row.author_ar || 'فيصل العتيبي' },
    image: row.image,
    content: { en: row.content_en || '', ar: row.content_ar || '' },
    status: 'published',
    featured: true,
  };
}

export function testimonialToDbRow(test: Partial<Testimonial>) {
  return {
    id: test.id || `test-${Date.now()}`,
    name_en: test.name?.en || 'Client Name',
    name_ar: test.name?.ar || 'اسم العميل',
    role_en: test.role?.en || 'Investor',
    role_ar: test.role?.ar || 'مستثمر عقاري',
    content_en: test.quote?.en || 'Great service',
    content_ar: test.quote?.ar || 'خدمة متميزة',
    rating: test.rating || 5,
    avatar: test.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    property_type_en: test.dealHighlight?.en || 'Prime Asset',
    property_type_ar: test.dealHighlight?.ar || 'عقار مميز',
  };
}

export function dbRowToTestimonial(row: any): Testimonial {
  return {
    id: row.id,
    name: { en: row.name_en, ar: row.name_ar },
    role: { en: row.role_en || '', ar: row.role_ar || '' },
    location: { en: 'Al Khobar / Dammam', ar: 'الخُبر / الدمام' },
    avatar: row.avatar,
    rating: row.rating || 5,
    quote: { en: row.content_en, ar: row.content_ar },
    dealHighlight: { en: row.property_type_en || '', ar: row.property_type_ar || '' },
    category: 'buyer',
    featured: true,
    date: '2025-08-01',
  };
}

// ==============================================================================
// REPOSITORIES
// ==============================================================================

export const PropertiesRepository = {
  /**
   * Fetch all luxury properties with optional Supabase remote query
   */
  async getAll(): Promise<Property[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          const mapped = data.map(dbRowToProperty);
          saveStoredProperties(mapped);
          return mapped;
        }
      } catch (e) {
        console.warn('Could not read from Supabase properties, using local cache', e);
      }
    }
    return getStoredProperties();
  },

  /**
   * Fetch a single property by its unique ID
   */
  async getById(id: string): Promise<Property | null> {
    const list = await this.getAll();
    return list.find((p) => p.id === id || p.slug === id) || null;
  },

  /**
   * Insert a new property into the database
   */
  async create(propertyData: Partial<Property>): Promise<Property> {
    const generatedId = propertyData.id || `prop-${Date.now()}`;
    const slug = propertyData.slug || `hard-${propertyData.type || 'villa'}-${Date.now()}`;

    const newProperty: Property = {
      id: generatedId,
      slug,
      title: propertyData.title || { en: 'Luxury Residence', ar: 'إقامة فاخرة' },
      description: propertyData.description || { en: 'Exceptional architectural residence.', ar: 'إقامة معمارية استثنائية.' },
      location: propertyData.location || {
        city: { en: 'Al Khobar', ar: 'الخُبر' },
        area: { en: 'Corniche Waterfront', ar: 'كورنيش الخُبر' },
        country: { en: 'Saudi Arabia', ar: 'المملكة العربية السعودية' },
        address: { en: 'Prince Turki Street, Al Khobar', ar: 'طريق الأمير تركي، الخُبر' },
        coordinates: { lat: 26.2886, lng: 50.2185 },
      },
      price: propertyData.price || {
        sar: 18750000,
        formattedSAR: '18,750,000 SAR',
      },
      type: propertyData.type || 'villa',
      status: propertyData.status || 'for-sale',
      bedrooms: propertyData.bedrooms || 4,
      bathrooms: propertyData.bathrooms || 5,
      areaSqFt: propertyData.areaSqFt || 5500,
      areaSqM: propertyData.areaSqM || Math.round((propertyData.areaSqFt || 5500) * 0.0929),
      featured: propertyData.featured ?? false,
      images: propertyData.images && propertyData.images.length > 0 ? propertyData.images : [
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=85',
      ],
      amenities: propertyData.amenities || {
        en: ['Infinity Pool', 'Smart Home System', 'Private Garden'],
        ar: ['مسبح إنفينيتي', 'نظام المنزل الذكي', 'حديقة خاصة'],
      },
      features: propertyData.features || {
        yearBuilt: 2025,
        parkingSpaces: 3,
        furnishing: { en: 'Fully Furnished', ar: 'مفروش بالكامل' },
        view: { en: 'Arabian Gulf Sea View', ar: 'إطلالة على الخليج العربي' },
      },
      agent: propertyData.agent || {
        name: { en: 'Faisal Al-Otaibi', ar: 'فيصل العتيبي' },
        title: { en: 'Senior Luxury Advisor - Eastern Province', ar: 'مستشار عقاري أول - المنطقة الشرقية' },
        phone: '+966 13 800 4273',
        whatsapp: '966556125711',
        email: 'faisal@hardrealestate.sa',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80',
      },
    };

    // 1. Persist to local cache immediately
    const currentList = getStoredProperties();
    const updatedList = [newProperty, ...currentList.filter(p => p.id !== newProperty.id)];
    saveStoredProperties(updatedList);

    // 2. Persist to Supabase with mapped DB row
    if (isSupabaseConfigured) {
      try {
        const dbRow = propertyToDbRow(newProperty);
        const { error } = await supabase
          .from('properties')
          .upsert(dbRow, { onConflict: 'id' });
        
        if (error) {
          console.error('[Supabase Create Property Error]:', error);
        } else {
          console.log('[Supabase Success]: Property committed to Supabase Table:', dbRow.id);
        }
      } catch (err) {
        console.error('[Supabase Exception on Property Insert]:', err);
      }
    }

    return newProperty;
  },

  /**
   * Update an existing property
   */
  async update(id: string, updates: Partial<Property>): Promise<Property | null> {
    const list = getStoredProperties();
    const index = list.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const updated: Property = { ...list[index], ...updates };
    list[index] = updated;
    saveStoredProperties(list);

    if (isSupabaseConfigured) {
      try {
        const dbRow = propertyToDbRow(updated);
        await supabase
          .from('properties')
          .upsert(dbRow, { onConflict: 'id' });
      } catch (err) {
        console.error('[Supabase Update Error]:', err);
      }
    }

    return updated;
  },

  /**
   * Delete a property by ID
   */
  async delete(id: string): Promise<boolean> {
    const list = getStoredProperties();
    const filtered = list.filter((p) => p.id !== id);
    saveStoredProperties(filtered);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('properties').delete().eq('id', id);
      } catch (err) {
        console.error('[Supabase Delete Error]:', err);
      }
    }

    return true;
  },

  /**
   * Reset database back to default initial seed data
   */
  resetToDefaults(): Property[] {
    saveStoredProperties(mockProperties);
    return mockProperties;
  },
};

export const LeadsRepository = {
  /**
   * Fetch all inbound leads
   */
  async getAll(): Promise<LeadRecord[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          const mappedLeads: LeadRecord[] = data.map((row: any) => ({
            id: row.id,
            name: row.name,
            email: row.email,
            phone: row.phone,
            inquiry_type: row.type || 'property_inquiry',
            property_id: row.property_id,
            message: row.message,
            source: row.source || 'Web Portal',
            status: row.status || 'new',
            crm_sync_status: row.crm_synced ? 'synced' : 'pending',
            crm_reference_id: row.crm_reference_id,
            created_at: row.created_at,
          }));
          saveStoredLeads(mappedLeads);
          return mappedLeads;
        }
      } catch (e) {
        console.warn('Could not read leads from Supabase', e);
      }
    }
    return getStoredLeads();
  },

  /**
   * Create and ingest a new Lead, automatically syncing to Real Estate CRM
   */
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
    const generatedId = `LEAD-${Math.floor(100000 + Math.random() * 900000)}`;

    const newLead: LeadRecord = {
      id: generatedId,
      name: leadInput.name,
      email: leadInput.email,
      phone: leadInput.phone,
      property_id: leadInput.property_id,
      property_title: leadInput.property_title,
      inquiry_type: leadInput.inquiry_type,
      recipient_email: leadInput.recipient_email || 'info@hardgp.com',
      message: leadInput.message || '',
      status: 'new',
      crm_sync_status: 'synced',
      source: leadInput.source || 'HARD Real Estate Web Portal',
      metadata: {
        ...leadInput.metadata,
        destinationEmail: 'info@hardgp.com',
        recipientEmail: leadInput.recipient_email || 'info@hardgp.com',
      },
      created_at: new Date().toISOString(),
    };

    // Synchronize to CRM hook
    const crmResult = await syncLeadToCrm(newLead);
    newLead.crm_reference_id = crmResult.crmReferenceId;
    newLead.crm_sync_status = crmResult.success ? 'synced' : 'pending';

    // Remote persistence (Supabase)
    if (isSupabaseConfigured) {
      try {
        await supabase.from('leads').insert({
          id: newLead.id,
          type: newLead.inquiry_type,
          name: newLead.name,
          email: newLead.email,
          phone: newLead.phone,
          property_id: newLead.property_id,
          message: newLead.message,
          source: newLead.source,
          status: newLead.status,
          crm_synced: crmResult.success,
          crm_reference_id: crmResult.crmReferenceId,
        });
      } catch (err) {
        console.error('Failed to sync lead to Supabase', err);
      }
    }

    // Local storage persistence
    const currentLeads = getStoredLeads();
    const updatedLeads = [newLead, ...currentLeads];
    saveStoredLeads(updatedLeads);

    return { lead: newLead, crmResult };
  },

  /**
   * Update lead pipeline status
   */
  async updateStatus(id: string, status: LeadRecord['status']): Promise<LeadRecord | null> {
    const list = getStoredLeads();
    const index = list.findIndex((l) => l.id === id);
    if (index === -1) return null;

    list[index].status = status;
    saveStoredLeads(list);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('leads').update({ status }).eq('id', id);
      } catch (err) {
        console.error('Failed to update lead status in Supabase', err);
      }
    }

    return list[index];
  },
};

export const ProjectsRepository = {
  /**
   * Fetch all development projects
   */
  async getAll(): Promise<Project[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          const mapped = data.map(dbRowToProject);
          saveStoredProjects(mapped);
          return mapped;
        }
      } catch (e) {
        console.warn('Projects fallback to cache', e);
      }
    }
    return getStoredProjects();
  },

  /**
   * Create a new project
   */
  async create(projectData: Partial<Project>): Promise<Project> {
    const generatedId = projectData.id || `proj-${Date.now()}`;
    const slug = projectData.slug || `project-${Date.now()}`;

    const newProject: Project = {
      id: generatedId,
      slug,
      title: projectData.title || { en: 'New Iconic Development', ar: 'مشروع تطويري مميز جديد' },
      developer: projectData.developer || { en: 'HARD Developments', ar: 'هارد للتطوير العقاري' },
      location: projectData.location || { en: 'Al Khobar Waterfront', ar: 'واجهة الخُبر البحرية' },
      city: projectData.city || { en: 'Al Khobar', ar: 'الخُبر' },
      startingPriceSAR: projectData.startingPriceSAR || '2,500,000 SAR',
      handoverDate: projectData.handoverDate || { en: 'Q4 2026', ar: 'الربع الرابع 2026' },
      unitsTotal: projectData.unitsTotal || 120,
      unitsAvailable: projectData.unitsAvailable || 45,
      roiProjected: projectData.roiProjected || 'Pending Audit Verification',
      financialMetric: projectData.financialMetric || {
        isVerified: false,
        verificationStatus: {
          en: 'Pending Independent Audit Verification',
          ar: 'قيد التدقيق المالي المستقل',
        },
        statusNote: {
          en: 'Yield and financial figures withheld pending third-party audit verification.',
          ar: 'تم حجب نسب العائد المالي لحين اكتمال التدقيق المالي المستقل.',
        },
      },
      image: projectData.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      gallery: projectData.gallery || [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      ],
      category: projectData.category || { en: 'Luxury Waterfront Residences', ar: 'شقق وأجنحة ساحلية فاخرة' },
      status: projectData.status || 'under-construction',
      progressPercentage: projectData.progressPercentage ?? 45,
      description: projectData.description || {
        en: 'A premier master-planned luxury development with world-class amenities and strategic connectivity.',
        ar: 'مشروع تطويري فاخر متكامل بمعايير عالمية وموقع استراتيجي فريد.',
      },
      highlights: projectData.highlights || {
        en: [
          'Direct Panoramic Sea Views',
          'Flexible Payment Plans with Official Escrow Guarantee',
          'Smart City Infrastructure & EV Stations',
          'Private Marina & Retail Boardwalk',
        ],
        ar: [
          'إطلالات بحرية بانورامية مباشرة',
          'خطة سداد مرنة مع ضمان حساب بنكي موثق',
          'بنية تحتية ذكية ومحطات شحن كهربائية',
          'مرسى خاص وممشى تجاري فاخر',
        ],
      },
      featured: projectData.featured ?? true,
    };

    const currentList = getStoredProjects();
    const updatedList = [newProject, ...currentList.filter(p => p.id !== newProject.id)];
    saveStoredProjects(updatedList);

    if (isSupabaseConfigured) {
      try {
        const dbRow = projectToDbRow(newProject);
        await supabase.from('projects').upsert(dbRow, { onConflict: 'id' });
      } catch (err) {
        console.error('Error saving project to Supabase', err);
      }
    }

    return newProject;
  },

  /**
   * Update an existing project
   */
  async update(id: string, updates: Partial<Project>): Promise<Project | null> {
    const list = getStoredProjects();
    const index = list.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const updated: Project = { ...list[index], ...updates };
    list[index] = updated;
    saveStoredProjects(list);

    if (isSupabaseConfigured) {
      try {
        const dbRow = projectToDbRow(updated);
        await supabase.from('projects').upsert(dbRow, { onConflict: 'id' });
      } catch (err) {
        console.error('Error updating project on Supabase', err);
      }
    }

    return updated;
  },

  /**
   * Delete a project
   */
  async delete(id: string): Promise<boolean> {
    const list = getStoredProjects();
    const filtered = list.filter((p) => p.id !== id);
    saveStoredProjects(filtered);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('projects').delete().eq('id', id);
      } catch (err) {
        console.error('Error deleting project from Supabase', err);
      }
    }

    return true;
  },

  /**
   * Reset projects to default catalog
   */
  resetToDefaults(): Project[] {
    saveStoredProjects(mockProjects);
    return mockProjects;
  },
};

export const BlogRepository = {
  /**
   * Fetch all blog posts and market insights
   */
  async getAll(): Promise<BlogPost[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          const mapped = data.map(dbRowToBlog);
          saveStoredBlogPosts(mapped);
          return mapped;
        }
      } catch (e) {
        console.warn('Blog fallback to cache', e);
      }
    }
    return getStoredBlogPosts();
  },

  /**
   * Create a new article / market insight post
   */
  async create(postData: Partial<BlogPost>): Promise<BlogPost> {
    const generatedId = postData.id || `post-${Date.now()}`;
    const slug = postData.slug || `article-${Date.now()}`;

    const newPost: BlogPost = {
      id: generatedId,
      slug,
      title: postData.title || { en: 'New Market Insight', ar: 'تقرير استثماري جديد' },
      excerpt: postData.excerpt || {
        en: 'Essential analysis and intelligence on prime Saudi real estate opportunities.',
        ar: 'تحليل شامل وفرص استثمارية في سوق العقارات الفاخرة بالمملكة.',
      },
      category: postData.category || { en: 'Market Intelligence', ar: 'دراسات وتقارير السوق' },
      date: postData.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      readTime: postData.readTime || { en: '5 min read', ar: 'قراءة 5 دقائق' },
      author: postData.author || { en: 'Faisal Al-Otaibi', ar: 'فيصل العتيبي' },
      authorRole: postData.authorRole || { en: 'Chief Investment Officer', ar: 'رئيس الاستثمار العقاري' },
      authorAvatar: postData.authorAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      image: postData.image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
      content: postData.content || {
        en: 'Comprehensive market intelligence report detailing luxury assets, institutional capital flows, and macroeconomic indicators shaping the regional market.',
        ar: 'تقرير شامل يرصد حركة السيولة والاستثمارات المؤسسية وتطورات الأنظمة واللوائح العقارية في المملكة.',
      },
      status: postData.status || 'published',
      featured: postData.featured ?? false,
      tags: postData.tags || ['Real Estate', 'Saudi Vision 2030', 'Investment', 'Eastern Province'],
    };

    const currentList = getStoredBlogPosts();
    const updatedList = [newPost, ...currentList.filter(p => p.id !== newPost.id)];
    saveStoredBlogPosts(updatedList);

    if (isSupabaseConfigured) {
      try {
        const dbRow = blogToDbRow(newPost);
        await supabase.from('blog_posts').upsert(dbRow, { onConflict: 'id' });
      } catch (err) {
        console.error('Error saving blog to Supabase', err);
      }
    }

    return newPost;
  },

  /**
   * Update an article
   */
  async update(id: string, updates: Partial<BlogPost>): Promise<BlogPost | null> {
    const list = getStoredBlogPosts();
    const index = list.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const updated: BlogPost = { ...list[index], ...updates };
    list[index] = updated;
    saveStoredBlogPosts(list);

    if (isSupabaseConfigured) {
      try {
        const dbRow = blogToDbRow(updated);
        await supabase.from('blog_posts').upsert(dbRow, { onConflict: 'id' });
      } catch (err) {
        console.error('Error updating blog post in Supabase', err);
      }
    }

    return updated;
  },

  /**
   * Delete an article
   */
  async delete(id: string): Promise<boolean> {
    const list = getStoredBlogPosts();
    const filtered = list.filter((p) => p.id !== id);
    saveStoredBlogPosts(filtered);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('blog_posts').delete().eq('id', id);
      } catch (err) {
        console.error('Error deleting blog post from Supabase', err);
      }
    }

    return true;
  },

  /**
   * Reset blog posts to default catalog
   */
  resetToDefaults(): BlogPost[] {
    saveStoredBlogPosts(mockBlogPosts);
    return mockBlogPosts;
  },
};

export const TestimonialsRepository = {
  /**
   * Fetch all client success stories / testimonials
   */
  async getAll(): Promise<Testimonial[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('testimonials')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          const mapped = data.map(dbRowToTestimonial);
          saveStoredTestimonials(mapped);
          return mapped;
        }
      } catch (e) {
        console.warn('Testimonials fallback to cache', e);
      }
    }
    return getStoredTestimonials();
  },

  /**
   * Create a new client success story
   */
  async create(data: Partial<Testimonial>): Promise<Testimonial> {
    const generatedId = data.id || `test-${Date.now()}`;
    const newStory: Testimonial = {
      id: generatedId,
      name: data.name || { en: 'Client Name', ar: 'اسم العميل' },
      role: data.role || { en: 'Property Investor', ar: 'مستشار ومستثمر عقاري' },
      location: data.location || { en: 'Al Khobar / Dammam', ar: 'الخُبر / الدمام' },
      avatar: data.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      rating: data.rating || 5,
      quote: data.quote || {
        en: 'Outstanding professional service, clear market guidance and swift closing.',
        ar: 'خدمة احترافية متميزة وتوجيه عقاري دقيق وسرعة في إتمام الصفقات.',
      },
      dealHighlight: data.dealHighlight || {
        en: 'Prime Property Acquisition',
        ar: 'صفقة شراء أصل مميز',
      },
      category: data.category || 'buyer',
      featured: data.featured ?? true,
      date: data.date || new Date().toISOString().slice(0, 10),
    };

    const list = getStoredTestimonials();
    const updatedList = [newStory, ...list.filter(t => t.id !== newStory.id)];
    saveStoredTestimonials(updatedList);

    if (isSupabaseConfigured) {
      try {
        const dbRow = testimonialToDbRow(newStory);
        await supabase.from('testimonials').upsert(dbRow, { onConflict: 'id' });
      } catch (err) {
        console.error('Error saving testimonial to Supabase', err);
      }
    }

    return newStory;
  },

  /**
   * Update a success story
   */
  async update(id: string, updates: Partial<Testimonial>): Promise<Testimonial | null> {
    const list = getStoredTestimonials();
    const index = list.findIndex((t) => t.id === id);
    if (index === -1) return null;

    const updated: Testimonial = { ...list[index], ...updates };
    list[index] = updated;
    saveStoredTestimonials(list);

    if (isSupabaseConfigured) {
      try {
        const dbRow = testimonialToDbRow(updated);
        await supabase.from('testimonials').upsert(dbRow, { onConflict: 'id' });
      } catch (err) {
        console.error('Error updating testimonial on Supabase', err);
      }
    }

    return updated;
  },

  /**
   * Delete a success story
   */
  async delete(id: string): Promise<boolean> {
    const list = getStoredTestimonials();
    const filtered = list.filter((t) => t.id !== id);
    saveStoredTestimonials(filtered);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('testimonials').delete().eq('id', id);
      } catch (err) {
        console.error('Error deleting testimonial from Supabase', err);
      }
    }

    return true;
  },

  /**
   * Reset testimonials to default records
   */
  resetToDefaults(): Testimonial[] {
    saveStoredTestimonials(mockTestimonials);
    return mockTestimonials;
  },
};

export const JoinListRepository = {
  /**
   * Fetch all subscribers in the join list
   */
  async getAll(): Promise<JoinListSubscriber[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('subscribers')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          const mapped: JoinListSubscriber[] = data.map((row: any) => ({
            id: row.id,
            email: row.email,
            createdAt: row.created_at || new Date().toISOString(),
            status: 'active',
            source: 'Web Portal',
            notes: row.locale || '',
          }));
          saveStoredSubscribers(mapped);
          return mapped;
        }
      } catch (e) {
        console.warn('Subscribers fallback to cache', e);
      }
    }
    return getStoredSubscribers();
  },

  /**
   * Add a new email to the join list
   */
  async create(subscriberData: { email: string; source?: string; notes?: string }): Promise<JoinListSubscriber> {
    const cleanEmail = subscriberData.email.trim().toLowerCase();
    const currentList = getStoredSubscribers();
    const existing = currentList.find((s) => s.email.toLowerCase() === cleanEmail);

    if (existing) {
      if (existing.status === 'unsubscribed') {
        const reactivated: JoinListSubscriber = { ...existing, status: 'active', notes: subscriberData.notes || existing.notes };
        const updatedList = currentList.map((s) => (s.id === existing.id ? reactivated : s));
        saveStoredSubscribers(updatedList);
        return reactivated;
      }
      return existing;
    }

    const newSubscriber: JoinListSubscriber = {
      id: `sub-${Date.now()}`,
      email: cleanEmail,
      createdAt: new Date().toISOString(),
      status: 'active',
      source: subscriberData.source || 'Website Footer',
      notes: subscriberData.notes || '',
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('subscribers').insert({
          email: cleanEmail,
          locale: 'en',
        });
      } catch (err) {
        console.error('Error adding subscriber to Supabase', err);
      }
    }

    const updatedList = [newSubscriber, ...currentList];
    saveStoredSubscribers(updatedList);
    return newSubscriber;
  },

  /**
   * Update subscriber status or notes
   */
  async update(id: string, updates: Partial<JoinListSubscriber>): Promise<JoinListSubscriber | null> {
    const list = getStoredSubscribers();
    const index = list.findIndex((s) => s.id === id);
    if (index === -1) return null;

    const updated: JoinListSubscriber = { ...list[index], ...updates };
    list[index] = updated;
    saveStoredSubscribers(list);
    return updated;
  },

  /**
   * Delete subscriber from the list
   */
  async delete(id: string): Promise<boolean> {
    const list = getStoredSubscribers();
    const filtered = list.filter((s) => s.id !== id);
    saveStoredSubscribers(filtered);
    return true;
  },

  /**
   * Reset subscribers to default
   */
  resetToDefaults(): JoinListSubscriber[] {
    saveStoredSubscribers(mockSubscribers);
    return mockSubscribers;
  },
};

/**
 * Bulk commit / synchronize all properties, projects, blogs, and testimonials
 * directly to the remote Supabase database with error diagnostics and table-by-table feedback.
 */
export async function syncAllToSupabase(): Promise<{
  success: boolean;
  message: string;
  details?: {
    propertiesCount: number;
    projectsCount: number;
    blogsCount: number;
    testimonialsCount: number;
    subscribersCount: number;
    errors: string[];
    tableResults: {
      table: string;
      status: 'success' | 'error' | 'skipped';
      count: number;
      error?: string;
    }[];
  };
}> {
  if (!isSupabaseConfigured) {
    return {
      success: false,
      message: 'Supabase credentials are not configured.',
    };
  }

  const tableResults: {
    table: string;
    status: 'success' | 'error' | 'skipped';
    count: number;
    error?: string;
  }[] = [];
  const errors: string[] = [];

  let propertiesSynced = 0;
  let projectsSynced = 0;
  let blogsSynced = 0;
  let testimonialsSynced = 0;
  let subscribersSynced = 0;

  // 1. Sync Properties
  try {
    const properties = getStoredProperties();
    const propertyRows = properties.map(propertyToDbRow);

    if (propertyRows.length > 0) {
      // Upsert batch
      const { error: propError, data: propData } = await supabase
        .from('properties')
        .upsert(propertyRows, { onConflict: 'id' })
        .select('id');

      if (propError) {
        console.warn('[Supabase Sync Properties Batch Error, trying row-by-row fallback]:', propError);
        let individualSuccessCount = 0;
        let lastErr = propError.message || JSON.stringify(propError);

        for (const row of propertyRows) {
          const { error: singleErr } = await supabase
            .from('properties')
            .upsert(row, { onConflict: 'id' });
          if (!singleErr) {
            individualSuccessCount++;
          } else {
            lastErr = singleErr.message || JSON.stringify(singleErr);
          }
        }

        if (individualSuccessCount > 0) {
          propertiesSynced = individualSuccessCount;
          tableResults.push({
            table: 'properties',
            status: individualSuccessCount === propertyRows.length ? 'success' : 'error',
            count: individualSuccessCount,
            error: individualSuccessCount < propertyRows.length ? `Synced ${individualSuccessCount}/${propertyRows.length}: ${lastErr}` : undefined,
          });
        } else {
          errors.push(`Properties: ${lastErr}`);
          tableResults.push({ table: 'properties', status: 'error', count: 0, error: lastErr });
        }
      } else {
        propertiesSynced = propData?.length || propertyRows.length;
        tableResults.push({ table: 'properties', status: 'success', count: propertiesSynced });
      }
    }
  } catch (err: any) {
    const msg = err?.message || 'Exception during properties sync';
    errors.push(`Properties: ${msg}`);
    tableResults.push({ table: 'properties', status: 'error', count: 0, error: msg });
  }

  // 2. Sync Projects
  try {
    const projects = getStoredProjects();
    const projectRows = projects.map(projectToDbRow);

    if (projectRows.length > 0) {
      const { error: projError, data: projData } = await supabase
        .from('projects')
        .upsert(projectRows, { onConflict: 'id' })
        .select('id');

      if (projError) {
        console.warn('[Supabase Sync Projects Error]:', projError);
        let indCount = 0;
        let lastErr = projError.message || JSON.stringify(projError);
        for (const row of projectRows) {
          const { error: singleErr } = await supabase.from('projects').upsert(row, { onConflict: 'id' });
          if (!singleErr) indCount++;
          else lastErr = singleErr.message || JSON.stringify(singleErr);
        }
        if (indCount > 0) {
          projectsSynced = indCount;
          tableResults.push({
            table: 'projects',
            status: indCount === projectRows.length ? 'success' : 'error',
            count: indCount,
            error: indCount < projectRows.length ? lastErr : undefined,
          });
        } else {
          errors.push(`Projects: ${lastErr}`);
          tableResults.push({ table: 'projects', status: 'error', count: 0, error: lastErr });
        }
      } else {
        projectsSynced = projData?.length || projectRows.length;
        tableResults.push({ table: 'projects', status: 'success', count: projectsSynced });
      }
    }
  } catch (err: any) {
    const msg = err?.message || 'Exception during projects sync';
    errors.push(`Projects: ${msg}`);
    tableResults.push({ table: 'projects', status: 'error', count: 0, error: msg });
  }

  // 3. Sync Blog Posts
  try {
    const blogs = getStoredBlogPosts();
    const blogRows = blogs.map(blogToDbRow);

    if (blogRows.length > 0) {
      const { error: blogError, data: blogData } = await supabase
        .from('blog_posts')
        .upsert(blogRows, { onConflict: 'id' })
        .select('id');

      if (blogError) {
        console.warn('[Supabase Sync Blog Error]:', blogError);
        let indCount = 0;
        let lastErr = blogError.message || JSON.stringify(blogError);
        for (const row of blogRows) {
          const { error: singleErr } = await supabase.from('blog_posts').upsert(row, { onConflict: 'id' });
          if (!singleErr) indCount++;
          else lastErr = singleErr.message || JSON.stringify(singleErr);
        }
        if (indCount > 0) {
          blogsSynced = indCount;
          tableResults.push({
            table: 'blog_posts',
            status: indCount === blogRows.length ? 'success' : 'error',
            count: indCount,
            error: indCount < blogRows.length ? lastErr : undefined,
          });
        } else {
          errors.push(`Blog Posts: ${lastErr}`);
          tableResults.push({ table: 'blog_posts', status: 'error', count: 0, error: lastErr });
        }
      } else {
        blogsSynced = blogData?.length || blogRows.length;
        tableResults.push({ table: 'blog_posts', status: 'success', count: blogsSynced });
      }
    }
  } catch (err: any) {
    const msg = err?.message || 'Exception during blog sync';
    errors.push(`Blog Posts: ${msg}`);
    tableResults.push({ table: 'blog_posts', status: 'error', count: 0, error: msg });
  }

  // 4. Sync Testimonials
  try {
    const testimonials = getStoredTestimonials();
    const testRows = testimonials.map(testimonialToDbRow);

    if (testRows.length > 0) {
      const { error: testError, data: testData } = await supabase
        .from('testimonials')
        .upsert(testRows, { onConflict: 'id' })
        .select('id');

      if (testError) {
        console.warn('[Supabase Sync Testimonials Error]:', testError);
        let indCount = 0;
        let lastErr = testError.message || JSON.stringify(testError);
        for (const row of testRows) {
          const { error: singleErr } = await supabase.from('testimonials').upsert(row, { onConflict: 'id' });
          if (!singleErr) indCount++;
          else lastErr = singleErr.message || JSON.stringify(singleErr);
        }
        if (indCount > 0) {
          testimonialsSynced = indCount;
          tableResults.push({
            table: 'testimonials',
            status: indCount === testRows.length ? 'success' : 'error',
            count: indCount,
            error: indCount < testRows.length ? lastErr : undefined,
          });
        } else {
          errors.push(`Testimonials: ${lastErr}`);
          tableResults.push({ table: 'testimonials', status: 'error', count: 0, error: lastErr });
        }
      } else {
        testimonialsSynced = testData?.length || testRows.length;
        tableResults.push({ table: 'testimonials', status: 'success', count: testimonialsSynced });
      }
    }
  } catch (err: any) {
    const msg = err?.message || 'Exception during testimonials sync';
    errors.push(`Testimonials: ${msg}`);
    tableResults.push({ table: 'testimonials', status: 'error', count: 0, error: msg });
  }

  // 5. Test Leads Table Accessibility
  try {
    const leads = getStoredLeads();
    if (leads.length > 0) {
      for (const lead of leads) {
        await supabase.from('leads').upsert({
          id: lead.id,
          type: lead.inquiry_type,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          property_id: lead.property_id,
          message: lead.message,
          source: lead.source,
          status: lead.status,
          crm_synced: lead.crm_sync_status === 'synced',
          crm_reference_id: lead.crm_reference_id,
        }, { onConflict: 'id' });
      }
    }
  } catch (e) {
    console.warn('Leads table sync non-blocking error', e);
  }

  const hasErrors = errors.length > 0;
  const totalSynced = propertiesSynced + projectsSynced + blogsSynced + testimonialsSynced;

  const details = {
    propertiesCount: propertiesSynced,
    projectsCount: projectsSynced,
    blogsCount: blogsSynced,
    testimonialsCount: testimonialsSynced,
    subscribersCount: subscribersSynced,
    errors,
    tableResults,
  };

  if (hasErrors && totalSynced === 0) {
    return {
      success: false,
      message: `Sync failed with Supabase: ${errors[0]}. Please verify that your Supabase RLS policies permit 'anon' role INSERT/UPDATE on the tables.`,
      details,
    };
  }

  if (hasErrors && totalSynced > 0) {
    return {
      success: false,
      message: `Partially synced ${totalSynced} records. Some tables failed: ${errors.join(', ')}.`,
      details,
    };
  }

  return {
    success: true,
    message: `Successfully synchronized ${totalSynced} records (${propertiesSynced} properties, ${projectsSynced} developments, ${blogsSynced} market reports, ${testimonialsSynced} testimonials) directly to your Supabase tables!`,
    details,
  };
}
