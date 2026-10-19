import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import {
  HVACService,
  HVACGalleryItem,
  HVACTestimonial,
  HVACFaqItem,
  HVACChecklistItem,
  HVACLead,
} from '../types';
import {
  initialServices,
  initialGallery,
  initialTestimonials,
  initialFaqs,
  summerChecklist as initialChecklist,
  initialSampleLeads,
} from '../data/initialData';
import { sanitizePayload, withServerTimestamps } from '../../lib/firebase/serializers';

// --- Shared City & Service Area Interfaces ---
export interface HVACCityArea {
  id: string;
  cityNameEn: string;
  cityNameAr: string;
  regionEn: string;
  regionAr: string;
  responseTimeMin: number;
  isPrimaryArea: boolean;
  active: boolean;
}

export interface HVACHeroContent {
  badgeEn: string;
  badgeAr: string;
  headlineEn: string;
  headlineAr: string;
  subtitleEn: string;
  subtitleAr: string;
  bgImageUrl: string;
  ctaPrimaryEn: string;
  ctaPrimaryAr: string;
  ctaEmergencyEn: string;
  ctaEmergencyAr: string;
  isPublished?: boolean;
}

export interface HVACOperatingHoursContact {
  emergencyPhone: string;
  whatsappNumber: string;
  officeEmail: string;
  officeAddressEn: string;
  officeAddressAr: string;
  cityEn: string;
  cityAr: string;
  lat: number;
  lng: number;
  googleMapsUrl: string;
  hoursWeekdayEn: string;
  hoursWeekdayAr: string;
  hoursFridayEn: string;
  hoursFridayAr: string;
  is24x7EmergencyActive: boolean;
}

export interface HVACBookingCopy {
  modalTitleEn: string;
  modalTitleAr: string;
  modalSubtitleEn: string;
  modalSubtitleAr: string;
  urgentNoteEn: string;
  urgentNoteAr: string;
  submitButtonEn: string;
  submitButtonAr: string;
}

// Default Shared Cities for Eastern Province & Major KSA Centers
export const DEFAULT_HVAC_CITIES: HVACCityArea[] = [
  {
    id: 'city-khobar',
    cityNameEn: 'Al Khobar',
    cityNameAr: 'الخبر',
    regionEn: 'Eastern Province',
    regionAr: 'المنطقة الشرقية',
    responseTimeMin: 30,
    isPrimaryArea: true,
    active: true,
  },
  {
    id: 'city-dammam',
    cityNameEn: 'Dammam',
    cityNameAr: 'الدمام',
    regionEn: 'Eastern Province',
    regionAr: 'المنطقة الشرقية',
    responseTimeMin: 30,
    isPrimaryArea: true,
    active: true,
  },
  {
    id: 'city-dhahran',
    cityNameEn: 'Dhahran',
    cityNameAr: 'الظهران',
    regionEn: 'Eastern Province',
    regionAr: 'المنطقة الشرقية',
    responseTimeMin: 25,
    isPrimaryArea: true,
    active: true,
  },
  {
    id: 'city-jubail',
    cityNameEn: 'Jubail Industrial',
    cityNameAr: 'الجبيل الصناعية',
    regionEn: 'Eastern Province',
    regionAr: 'المنطقة الشرقية',
    responseTimeMin: 45,
    isPrimaryArea: false,
    active: true,
  },
  {
    id: 'city-[#009ee2]-qatif',
    cityNameEn: 'Qatif & Saihat',
    cityNameAr: 'القطيف وسيهات',
    regionEn: 'Eastern Province',
    regionAr: 'المنطقة الشرقية',
    responseTimeMin: 35,
    isPrimaryArea: false,
    active: true,
  },
  {
    id: 'city-riyadh',
    cityNameEn: 'Riyadh HQ Branch',
    cityNameAr: 'الرياض (فرع المقر الرئيسي)',
    regionEn: 'Central Region',
    regionAr: 'المنطقة الوسطى',
    responseTimeMin: 40,
    isPrimaryArea: true,
    active: true,
  },
];

export const DEFAULT_HVAC_HERO: HVACHeroContent = {
  badgeEn: '24/7 Rapid Emergency Response & Engineering Care',
  badgeAr: 'خدمة طوارئ واستجابة هاتفية على مدار الساعة ٢٤/٧',
  headlineEn: 'Master AC Repair & Precision Cooling Engineering',
  headlineAr: 'الاحترافية المطلقة في صيانة وتبريد أنظمة التكييف',
  subtitleEn: 'Certified HVAC technicians for split, concealed, package, and VRF systems across the Eastern Province and Riyadh.',
  subtitleAr: 'فنيون مهندسون معتمدون لصيانة كافة أنواع المكيفات: سبليت، كونسيلد، باكج سطحي، وأنظمة VRF في الشرقية والرياض.',
  bgImageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1600&q=80',
  ctaPrimaryEn: 'Book Technician Visit',
  ctaPrimaryAr: 'حجز موعد فني صيانة',
  ctaEmergencyEn: 'Emergency Hotline Call',
  ctaEmergencyAr: 'الاتصال بالطوارئ فوراً',
  isPublished: true,
};

export const DEFAULT_HVAC_HOURS_CONTACT: HVACOperatingHoursContact = {
  emergencyPhone: '+966 13 800 4272',
  whatsappNumber: '+966501234567',
  officeEmail: 'hvac@hard-sa.com',
  officeAddressEn: 'King Fahd Road, Corniche District, Al Khobar, Saudi Arabia',
  officeAddressAr: 'طريق الملك فهد، حي الكورنيش، الخبر، المملكة العربية السعودية',
  cityEn: 'Al Khobar',
  cityAr: 'الخبر',
  lat: 26.288412,
  lng: 50.210543,
  googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=26.288412,50.210543',
  hoursWeekdayEn: 'Saturday - Thursday: 8:00 AM - 10:00 PM',
  hoursWeekdayAr: 'السبت - الخميس: ٨:٠٠ صباحاً - ١٠:٠٠ مساءً',
  hoursFridayEn: 'Friday: 2:00 PM - 10:00 PM (Emergency Active 24/7)',
  hoursFridayAr: 'الجمعة: ٢:٠٠ ظهراً - ١٠:٠٠ مساءً (الطوارئ مفعّلة ٢٤/٧)',
  is24x7EmergencyActive: true,
};

export const DEFAULT_HVAC_BOOKING_COPY: HVACBookingCopy = {
  modalTitleEn: 'Schedule HVAC Service Visit',
  modalTitleAr: 'حجز زيارة صيانة تكييف معتمدة',
  modalSubtitleEn: 'Select your preferred time window and emergency level. Our team dispatches certified technicians.',
  modalSubtitleAr: 'اختر الموعد المناسب ودرجة الاستعجال، وسيقوم فريقنا الفني بالتواصل ومباشرة الطلب فوراً.',
  urgentNoteEn: 'Urgent requests receive priority hotline dispatch within 30-45 minutes.',
  urgentNoteAr: 'الطلبات العاجلة تحظى بأولوية المباشرة الفورية خلال ٣٠ - ٤٥ دقيقة.',
  submitButtonEn: 'Confirm Service Reservation',
  submitButtonAr: 'تأكيد حجز الموعد الفني',
};

// --- Firestore Collection Subscriptions ---

/**
 * Subscribes to HVAC Services in Firestore.
 */
export function subscribeHVACServices(
  callback: (services: HVACService[]) => void
): Unsubscribe {
  const colRef = collection(db, 'hvac_services');
  return onSnapshot(
    colRef,
    (snap) => {
      if (snap.empty) {
        seedHVACServices().then(() => callback(initialServices));
        return;
      }
      const list: HVACService[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          slug: data.slug || d.id,
          titleEn: data.titleEn || '',
          titleAr: data.titleAr || '',
          descriptionEn: data.descriptionEn || '',
          descriptionAr: data.descriptionAr || '',
          image: data.image || '',
          badgeEn: data.badgeEn || '',
          badgeAr: data.badgeAr || '',
          active: data.active !== false,
          sortOrder: Number(data.sortOrder) || 1,
        };
      });
      callback(list.sort((a, b) => a.sortOrder - b.sortOrder));
    },
    (err) => {
      console.warn('[subscribeHVACServices] Fallback to default:', err);
      callback(initialServices);
    }
  );
}

export async function seedHVACServices(): Promise<void> {
  try {
    for (const svc of initialServices) {
      const docRef = doc(db, 'hvac_services', svc.id);
      await setDoc(docRef, sanitizePayload(svc), { merge: true });
    }
  } catch (e) {
    console.warn('[seedHVACServices] Seed err:', e);
  }
}

export async function saveHVACServiceDoc(service: HVACService): Promise<void> {
  const docRef = doc(db, 'hvac_services', service.id);
  await setDoc(docRef, withServerTimestamps(sanitizePayload(service)), { merge: true });
}

export async function deleteHVACServiceDoc(id: string): Promise<void> {
  const docRef = doc(db, 'hvac_services', id);
  await deleteDoc(docRef);
}

/**
 * Subscribes to HVAC Section Content documents in Firestore.
 */
export function subscribeHVACSectionContent<T>(
  sectionKey: 'hero' | 'hours_contact' | 'booking_copy' | 'service_areas',
  defaultFallback: T,
  callback: (data: T) => void
): Unsubscribe {
  const docRef = doc(db, 'hvac_content', sectionKey);
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        callback(snap.data() as T);
      } else {
        callback(defaultFallback);
      }
    },
    (err) => {
      console.warn(`[subscribeHVACSectionContent] ${sectionKey} fallback:`, err);
      callback(defaultFallback);
    }
  );
}

export async function saveHVACSectionContent<T extends object>(
  sectionKey: 'hero' | 'hours_contact' | 'booking_copy' | 'service_areas',
  data: T
): Promise<void> {
  const docRef = doc(db, 'hvac_content', sectionKey);
  await setDoc(docRef, withServerTimestamps(sanitizePayload(data)), { merge: true });
}

/**
 * Subscribes to HVAC Gallery items.
 */
export function subscribeHVACGallery(
  callback: (gallery: HVACGalleryItem[]) => void
): Unsubscribe {
  const colRef = collection(db, 'hvac_gallery');
  return onSnapshot(
    colRef,
    (snap) => {
      if (snap.empty) {
        callback(initialGallery);
        return;
      }
      const list: HVACGalleryItem[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<HVACGalleryItem, 'id'>),
      }));
      callback(list);
    },
    (err) => {
      console.warn('[subscribeHVACGallery] Fallback:', err);
      callback(initialGallery);
    }
  );
}

export async function saveHVACGalleryDoc(item: HVACGalleryItem): Promise<void> {
  const docRef = doc(db, 'hvac_gallery', item.id);
  await setDoc(docRef, withServerTimestamps(sanitizePayload(item)), { merge: true });
}

export async function deleteHVACGalleryDoc(id: string): Promise<void> {
  const docRef = doc(db, 'hvac_gallery', id);
  await deleteDoc(docRef);
}

/**
 * Subscribes to HVAC Testimonials in Firestore.
 */
export function subscribeHVACTestimonials(
  callback: (testimonials: HVACTestimonial[]) => void
): Unsubscribe {
  const colRef = collection(db, 'hvac_testimonials');
  return onSnapshot(
    colRef,
    (snap) => {
      if (snap.empty) {
        callback(initialTestimonials);
        return;
      }
      const list: HVACTestimonial[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<HVACTestimonial, 'id'>),
      }));
      callback(list);
    },
    (err) => {
      console.warn('[subscribeHVACTestimonials] Fallback:', err);
      callback(initialTestimonials);
    }
  );
}

export async function saveHVACTestimonialDoc(item: HVACTestimonial): Promise<void> {
  const docRef = doc(db, 'hvac_testimonials', item.id);
  await setDoc(docRef, withServerTimestamps(sanitizePayload(item)), { merge: true });
}

export async function deleteHVACTestimonialDoc(id: string): Promise<void> {
  const docRef = doc(db, 'hvac_testimonials', id);
  await deleteDoc(docRef);
}

/**
 * Subscribes to HVAC Leads / Bookings in Firestore.
 */
export function subscribeHVACLeads(
  callback: (leads: HVACLead[]) => void
): Unsubscribe {
  const colRef = collection(db, 'hvac_leads');
  return onSnapshot(
    colRef,
    (snap) => {
      const list: HVACLead[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<HVACLead, 'id'>),
      }));
      callback(list);
    },
    (err) => {
      console.warn('[subscribeHVACLeads] Error reading HVAC leads:', err);
      callback(initialSampleLeads);
    }
  );
}

export async function saveHVACLeadDoc(leadData: HVACLead): Promise<void> {
  const docRef = doc(db, 'hvac_leads', leadData.id);
  await setDoc(docRef, withServerTimestamps(sanitizePayload(leadData)));
}

export async function updateHVACLeadStatusDoc(
  id: string,
  status: HVACLead['status']
): Promise<void> {
  const docRef = doc(db, 'hvac_leads', id);
  await updateDoc(docRef, withServerTimestamps({ status }));
}

export async function deleteHVACLeadDoc(id: string): Promise<void> {
  const docRef = doc(db, 'hvac_leads', id);
  await deleteDoc(docRef);
}
