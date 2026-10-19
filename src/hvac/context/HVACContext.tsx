import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Language,
  HVACLead,
  HVACLeadStatus,
  HVACService,
  HVACGalleryItem,
  HVACTestimonial,
  HVACFaqItem,
  HVACChecklistItem,
} from '../types';
import {
  initialServices,
  initialGallery,
  initialTestimonials,
  initialFaqs,
  summerChecklist as initialChecklist,
  initialSampleLeads,
} from '../data/initialData';
import {
  subscribeHVACServices,
  saveHVACServiceDoc,
  deleteHVACServiceDoc,
  subscribeHVACSectionContent,
  saveHVACSectionContent,
  subscribeHVACGallery,
  saveHVACGalleryDoc,
  deleteHVACGalleryDoc,
  subscribeHVACTestimonials,
  saveHVACTestimonialDoc,
  deleteHVACTestimonialDoc,
  subscribeHVACLeads,
  saveHVACLeadDoc,
  updateHVACLeadStatusDoc,
  deleteHVACLeadDoc,
  HVACCityArea,
  HVACHeroContent,
  HVACOperatingHoursContact,
  HVACBookingCopy,
  DEFAULT_HVAC_CITIES,
  DEFAULT_HVAC_HERO,
  DEFAULT_HVAC_HOURS_CONTACT,
  DEFAULT_HVAC_BOOKING_COPY,
} from '../services/hvacFirestore';

interface QuoteInitData {
  city: string;
  customCity?: string;
  service: string;
}

interface HVACContextType {
  language: Language;
  isAr: boolean;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  // Leads
  leads: HVACLead[];
  addLead: (leadData: Omit<HVACLead, 'id' | 'referenceNumber' | 'createdAt' | 'status' | 'source'>) => HVACLead;
  updateLeadStatus: (id: string, status: HVACLeadStatus) => void;
  deleteLead: (id: string) => void;
  // Services
  services: HVACService[];
  addService: (svc: Omit<HVACService, 'id'>) => Promise<void>;
  updateService: (id: string, svc: Partial<HVACService>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  updateServices: (services: HVACService[]) => void;
  // Cities & Service Areas
  serviceAreas: HVACCityArea[];
  updateServiceAreas: (areas: HVACCityArea[]) => Promise<void>;
  // Hero & Booking Copy & Contact
  heroContent: HVACHeroContent;
  updateHeroContent: (data: Partial<HVACHeroContent>) => Promise<void>;
  operatingHours: HVACOperatingHoursContact;
  updateOperatingHours: (data: Partial<HVACOperatingHoursContact>) => Promise<void>;
  bookingCopy: HVACBookingCopy;
  updateBookingCopy: (data: Partial<HVACBookingCopy>) => Promise<void>;
  // Portfolio Gallery
  galleryItems: HVACGalleryItem[];
  addGalleryItem: (item: Omit<HVACGalleryItem, 'id'>) => Promise<void>;
  updateGalleryItem: (id: string, item: Partial<HVACGalleryItem>) => Promise<void>;
  deleteGalleryItem: (id: string) => Promise<void>;
  updateGalleryItems: (items: HVACGalleryItem[]) => void;
  // Testimonials
  testimonials: HVACTestimonial[];
  addTestimonial: (item: Omit<HVACTestimonial, 'id'>) => Promise<void>;
  updateTestimonial: (id: string, item: Partial<HVACTestimonial>) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;
  updateTestimonials: (items: HVACTestimonial[]) => void;
  // FAQs & Guides
  faqItems: HVACFaqItem[];
  updateFaqItems: (items: HVACFaqItem[]) => void;
  maintenanceGuides: HVACChecklistItem[];
  updateMaintenanceGuides: (items: HVACChecklistItem[]) => void;
  resetAllToDefaults: () => void;
  // Booking Modal
  isBookingModalOpen: boolean;
  bookingInitialService: string;
  openBookingModal: (serviceName?: string) => void;
  closeBookingModal: () => void;
  // Quote Dialog
  isQuoteDialogOpen: boolean;
  quoteInitialData: QuoteInitData | null;
  openQuoteDialog: (initData: QuoteInitData) => void;
  closeQuoteDialog: () => void;
}

const HVACContext = createContext<HVACContextType | undefined>(undefined);

const STORAGE_KEY_LEADS = 'hard_hvac_leads_v1';
const STORAGE_KEY_SERVICES = 'hard_hvac_services_v1';
const STORAGE_KEY_GALLERY = 'hard_hvac_gallery_v1';
const STORAGE_KEY_REVIEWS = 'hard_hvac_reviews_v1';

export function HVACProvider({
  children,
  initialLanguage = 'ar',
  onLanguageChangeExternal,
}: {
  children: React.ReactNode;
  initialLanguage?: Language;
  onLanguageChangeExternal?: (lang: Language) => void;
}) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  // Sync external language prop if updated
  useEffect(() => {
    setLanguageState(initialLanguage);
  }, [initialLanguage]);

  // Synchronize HTML attributes for RTL & Lang
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (onLanguageChangeExternal) {
      onLanguageChangeExternal(lang);
    }
  };

  const toggleLanguage = () => {
    const next = language === 'ar' ? 'en' : 'ar';
    setLanguage(next);
  };

  // Leads state with Firestore sync
  const [leads, setLeads] = useState<HVACLead[]>(initialSampleLeads);

  useEffect(() => {
    const unsub = subscribeHVACLeads((list) => {
      if (list && list.length > 0) setLeads(list);
    });
    return () => unsub();
  }, []);

  // Services with Firestore Sync
  const [services, setServices] = useState<HVACService[]>(initialServices);

  useEffect(() => {
    const unsub = subscribeHVACServices((list) => {
      setServices(list);
    });
    return () => unsub();
  }, []);

  const addService = async (svc: Omit<HVACService, 'id'>) => {
    const newSvc: HVACService = {
      ...svc,
      id: `hvac-svc-${Date.now()}`,
    };
    await saveHVACServiceDoc(newSvc);
  };

  const updateService = async (id: string, updated: Partial<HVACService>) => {
    const existing = services.find((s) => s.id === id);
    if (!existing) return;
    const merged = { ...existing, ...updated };
    await saveHVACServiceDoc(merged);
  };

  const deleteService = async (id: string) => {
    await deleteHVACServiceDoc(id);
  };

  // Shared Service Areas / Cities
  const [serviceAreas, setServiceAreas] = useState<HVACCityArea[]>(DEFAULT_HVAC_CITIES);

  useEffect(() => {
    const unsub = subscribeHVACSectionContent<HVACCityArea[]>(
      'service_areas',
      DEFAULT_HVAC_CITIES,
      (data) => setServiceAreas(data)
    );
    return () => unsub();
  }, []);

  const updateServiceAreas = async (areas: HVACCityArea[]) => {
    setServiceAreas(areas);
    await saveHVACSectionContent('service_areas', areas);
  };

  // Hero, Operating Hours & Booking Copy
  const [heroContent, setHeroContent] = useState<HVACHeroContent>(DEFAULT_HVAC_HERO);
  const [operatingHours, setOperatingHours] = useState<HVACOperatingHoursContact>(DEFAULT_HVAC_HOURS_CONTACT);
  const [bookingCopy, setBookingCopy] = useState<HVACBookingCopy>(DEFAULT_HVAC_BOOKING_COPY);

  useEffect(() => {
    const unsubHero = subscribeHVACSectionContent<HVACHeroContent>(
      'hero',
      DEFAULT_HVAC_HERO,
      (data) => setHeroContent(data)
    );
    const unsubHours = subscribeHVACSectionContent<HVACOperatingHoursContact>(
      'hours_contact',
      DEFAULT_HVAC_HOURS_CONTACT,
      (data) => setOperatingHours(data)
    );
    const unsubBooking = subscribeHVACSectionContent<HVACBookingCopy>(
      'booking_copy',
      DEFAULT_HVAC_BOOKING_COPY,
      (data) => setBookingCopy(data)
    );

    return () => {
      unsubHero();
      unsubHours();
      unsubBooking();
    };
  }, []);

  const updateHeroContent = async (data: Partial<HVACHeroContent>) => {
    const merged = { ...heroContent, ...data };
    setHeroContent(merged);
    await saveHVACSectionContent('hero', merged);
  };

  const updateOperatingHours = async (data: Partial<HVACOperatingHoursContact>) => {
    const merged = { ...operatingHours, ...data };
    setOperatingHours(merged);
    await saveHVACSectionContent('hours_contact', merged);
  };

  const updateBookingCopy = async (data: Partial<HVACBookingCopy>) => {
    const merged = { ...bookingCopy, ...data };
    setBookingCopy(merged);
    await saveHVACSectionContent('booking_copy', merged);
  };

  // Gallery Items
  const [galleryItems, setGalleryItems] = useState<HVACGalleryItem[]>(initialGallery);

  useEffect(() => {
    const unsub = subscribeHVACGallery((list) => setGalleryItems(list));
    return () => unsub();
  }, []);

  const addGalleryItem = async (item: Omit<HVACGalleryItem, 'id'>) => {
    const newItem: HVACGalleryItem = {
      ...item,
      id: `gal-${Date.now()}`,
    };
    await saveHVACGalleryDoc(newItem);
  };

  const updateGalleryItem = async (id: string, updated: Partial<HVACGalleryItem>) => {
    const existing = galleryItems.find((g) => g.id === id);
    if (!existing) return;
    const merged = { ...existing, ...updated };
    await saveHVACGalleryDoc(merged);
  };

  const deleteGalleryItem = async (id: string) => {
    await deleteHVACGalleryDoc(id);
  };

  // Testimonials
  const [testimonials, setTestimonials] = useState<HVACTestimonial[]>(initialTestimonials);

  useEffect(() => {
    const unsub = subscribeHVACTestimonials((list) => setTestimonials(list));
    return () => unsub();
  }, []);

  const addTestimonial = async (item: Omit<HVACTestimonial, 'id'>) => {
    const newItem: HVACTestimonial = {
      ...item,
      id: `rev-${Date.now()}`,
    };
    await saveHVACTestimonialDoc(newItem);
  };

  const updateTestimonial = async (id: string, updated: Partial<HVACTestimonial>) => {
    const existing = testimonials.find((t) => t.id === id);
    if (!existing) return;
    const merged = { ...existing, ...updated };
    await saveHVACTestimonialDoc(merged);
  };

  const deleteTestimonial = async (id: string) => {
    await deleteHVACTestimonialDoc(id);
  };

  // FAQs & Maintenance Guides
  const [faqItems, setFaqItems] = useState<HVACFaqItem[]>(initialFaqs);
  const [maintenanceGuides, setMaintenanceGuides] = useState<HVACChecklistItem[]>(initialChecklist);

  // Booking Modal
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingInitialService, setBookingInitialService] = useState('');

  const openBookingModal = (serviceName?: string) => {
    setBookingInitialService(serviceName || '');
    setIsBookingModalOpen(true);
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
  };

  // Listen for window custom event 'hvac:open-booking'
  useEffect(() => {
    const handleCustomBookingEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ service?: string }>;
      openBookingModal(customEvent.detail?.service);
    };

    window.addEventListener('hvac:open-booking', handleCustomBookingEvent);
    return () => {
      window.removeEventListener('hvac:open-booking', handleCustomBookingEvent);
    };
  }, []);

  // Quote Dialog
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [quoteInitialData, setQuoteInitialData] = useState<QuoteInitData | null>(null);

  const openQuoteDialog = (initData: QuoteInitData) => {
    setQuoteInitialData(initData);
    setIsQuoteDialogOpen(true);
  };

  const closeQuoteDialog = () => {
    setIsQuoteDialogOpen(false);
  };

  // Add lead function
  const addLead = (leadData: Omit<HVACLead, 'id' | 'referenceNumber' | 'createdAt' | 'status' | 'source'>): HVACLead => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const referenceNumber = `HVAC-2026-${randomSuffix}`;
    const newLead: HVACLead = {
      ...leadData,
      id: `hvac-lead-${Date.now()}-${randomSuffix}`,
      referenceNumber,
      source: 'hvac',
      createdAt: new Date().toISOString(),
      status: 'new',
    };

    setLeads((prev) => [newLead, ...prev]);
    saveHVACLeadDoc(newLead).catch((e) => console.warn(e));

    // Optional API dispatch / email trigger (non-blocking)
    try {
      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: 'info@hardgp.com',
          subject: `New HVAC Lead [${referenceNumber}]: ${leadData.clientName}`,
          data: newLead,
        }),
      }).catch(() => {
        // graceful offline fallback
      });
    } catch {
      // ignore
    }

    return newLead;
  };

  const updateLeadStatus = (id: string, status: HVACLeadStatus) => {
    updateHVACLeadStatusDoc(id, status).catch((e) => console.warn(e));
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status } : l))
    );
  };

  const deleteLead = (id: string) => {
    deleteHVACLeadDoc(id).catch((e) => console.warn(e));
    setLeads((prev) => prev.filter((l) => l.id !== id));
  };

  const resetAllToDefaults = () => {
    setServices(initialServices);
    setGalleryItems(initialGallery);
    setTestimonials(initialTestimonials);
    setLeads(initialSampleLeads);
    setServiceAreas(DEFAULT_HVAC_CITIES);
    setHeroContent(DEFAULT_HVAC_HERO);
    setOperatingHours(DEFAULT_HVAC_HOURS_CONTACT);
    setBookingCopy(DEFAULT_HVAC_BOOKING_COPY);
  };

  const updateFaqItems = (items: HVACFaqItem[]) => setFaqItems(items);
  const updateMaintenanceGuides = (items: HVACChecklistItem[]) => setMaintenanceGuides(items);

  return (
    <HVACContext.Provider
      value={{
        language,
        isAr: language === 'ar',
        setLanguage,
        toggleLanguage,
        leads,
        addLead,
        updateLeadStatus,
        deleteLead,
        services,
        addService,
        updateService,
        deleteService,
        updateServices: setServices,
        serviceAreas,
        updateServiceAreas,
        heroContent,
        updateHeroContent,
        operatingHours,
        updateOperatingHours,
        bookingCopy,
        updateBookingCopy,
        galleryItems,
        addGalleryItem,
        updateGalleryItem,
        deleteGalleryItem,
        updateGalleryItems: setGalleryItems,
        testimonials,
        addTestimonial,
        updateTestimonial,
        deleteTestimonial,
        updateTestimonials: setTestimonials,
        faqItems,
        updateFaqItems,
        maintenanceGuides,
        updateMaintenanceGuides,
        resetAllToDefaults,
        isBookingModalOpen,
        bookingInitialService,
        openBookingModal,
        closeBookingModal,
        isQuoteDialogOpen,
        quoteInitialData,
        openQuoteDialog,
        closeQuoteDialog,
      }}
    >
      {children}
    </HVACContext.Provider>
  );
}

export function useHVAC() {
  const context = useContext(HVACContext);
  if (!context) {
    throw new Error('useHVAC must be used within an HVACProvider');
  }
  return context;
}
