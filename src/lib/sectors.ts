import { PageId, Language } from '../types';

export type SectorId = 'portal' | 'realestate' | 'construction' | 'hvac';

export interface SectorDefinition {
  id: SectorId;
  pageId: PageId;
  href: string;
  name: {
    en: string;
    ar: string;
  };
  shortName: {
    en: string;
    ar: string;
  };
  tagline: {
    en: string;
    ar: string;
  };
  iconName: 'Building2' | 'Home' | 'HardHat' | 'ThermometerSnowflake';
}

export const HARD_GROUP_SECTORS: SectorDefinition[] = [
  {
    id: 'portal',
    pageId: 'portal',
    href: '/',
    name: {
      en: 'HARD Group Portal',
      ar: 'بوابة مجموعة هارد',
    },
    shortName: {
      en: 'Group Portal',
      ar: 'بوابة المجموعة',
    },
    tagline: {
      en: 'Corporate Holdings & Gateway',
      ar: 'البوابة القابضة للمجموعة',
    },
    iconName: 'Building2',
  },
  {
    id: 'realestate',
    pageId: 'home',
    href: '/realestate',
    name: {
      en: 'HARD Real Estate',
      ar: 'هارد للعقارات',
    },
    shortName: {
      en: 'Real Estate',
      ar: 'العقارات',
    },
    tagline: {
      en: 'Brokerage & Advisory',
      ar: 'الوساطة والتسويق العقاري',
    },
    iconName: 'Home',
  },
  {
    id: 'construction',
    pageId: 'construction',
    href: '/construction',
    name: {
      en: 'HARD Construction',
      ar: 'هارد للإنشاءات',
    },
    shortName: {
      en: 'Construction',
      ar: 'الإنشاءات',
    },
    tagline: {
      en: 'General Contracting & Engineering',
      ar: 'المقاولات العامة والتطوير الإنشائي',
    },
    iconName: 'HardHat',
  },
  {
    id: 'hvac',
    pageId: 'hvac',
    href: '/hvac',
    name: {
      en: 'HARD HVAC Maintenance',
      ar: 'هارد لصيانة التكييف',
    },
    shortName: {
      en: 'HVAC Maintenance',
      ar: 'صيانة التكييف',
    },
    tagline: {
      en: 'Cooling, VRF & Electromechanical',
      ar: 'التبريد المركزي والخدمات الكهروميكانيكية',
    },
    iconName: 'ThermometerSnowflake',
  },
];

/**
 * Centralized Verified Contact Registry for HARD Group Sectors
 */
export const SECTOR_CONTACT_DETAILS = {
  realestate: {
    phone: '+966 55 612 5711',
    whatsapp: '+966556125711',
    email: 'info@hardgp.com',
    address: {
      ar: 'حي طريق الملك فهد، الخبر، المنطقة الشرقية، المملكة العربية السعودية',
      en: 'King Fahd Road District, Al Khobar, Eastern Province, Kingdom of Saudi Arabia',
    },
    regaLicense: '7200018492',
    crNumber: '2051254311',
  },
  construction: {
    phone: '+966 13 800 4272',
    mobile: '+966 50 123 4567',
    whatsapp: '+966501234567',
    email: 'info@hard-sa.com',
    crNumber: '1010894231',
    taxId: '300192847100003',
    sceAccreditation: '#44091',
    address: {
      ar: 'طريق الملك فهد، حي الصحافة، الرياض 13321، المملكة العربية السعودية',
      en: 'King Fahd Road, Al-Sahafa District, Riyadh 13321, Saudi Arabia',
    },
    coordinates: {
      lat: 24.795822,
      lng: 46.634812,
    },
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=24.795822,46.634812',
    verificationStatus: {
      isVerifiedCoordinates: true,
      buildingNumberPending: true,
      ar: 'إحداثيات المقر الرئيسي الموثقة (حي الصحافة - 24.7958° N, 46.6348° E) [رقم المبنى والوحدة قيد الاعتماد البلدي النهائي]',
      en: 'Verified HQ Destination (Al-Sahafa District - 24.7958° N, 46.6348° E) [Building/Suite # Pending Final Municipal Assignment]',
    },
    easternProvinceBranch: {
      ar: 'طريق الأمير تركي، حي الكورنيش، الخبر، المنطقة الشرقية',
      en: 'Prince Turki Road, Corniche District, Al Khobar, Eastern Province',
    },
    easternCoordinates: {
      lat: 26.288412,
      lng: 50.210543,
    },
    easternGoogleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=26.288412,50.210543',
  },
  hvac: {
    phone: '+966 13 800 4274',
    mobile: '+966 50 123 4567',
    whatsapp: '+966501234567',
    email: 'info@hardgp.com',
    officeName: {
      ar: 'المكتب الإقليمي ومركز عمليات التكييف',
      en: 'HVAC Regional Operations & Dispatch Hub',
    },
    city: {
      ar: 'الخبر',
      en: 'Al Khobar',
    },
    district: {
      ar: 'حي الراكة الشمالية (طريق الملك فهد)',
      en: 'Al Rakah Al Shamaliya District (King Fahd Road)',
    },
    address: {
      ar: 'طريق الملك فهد، حي الراكة الشمالية، الخبر، المنطقة الشرقية، المملكة العربية السعودية',
      en: 'King Fahd Road, Al Rakah Al Shamaliya District, Al Khobar, Eastern Province, KSA',
    },
    coordinates: {
      lat: 26.373784,
      lng: 50.103001,
    },
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=26.373784,50.103001',
    verificationStatus: {
      isVerifiedCoordinates: true,
      buildingNumberPending: true,
      ar: 'إحداثيات المقر الإقليمي الموثقة (حي الراكة الشمالية - الخبر - 26.3737° N, 50.1030° E) [رقم المبنى والرمز البريدي قيد الاعتماد البلدي النهائي]',
      en: 'Verified Regional Operations Destination (Al Rakah District, Al Khobar - 26.3737° N, 50.1030° E) [Building/Unit # Pending Final Municipal Verification]',
    },
    serviceCoverage: {
      ar: 'نطاق الخدمة الميدانية: الخبر، الدمام، الظهران، الجبيل، القطيف، والرياض',
      en: 'Field Service Coverage: Al Khobar, Dammam, Dhahran, Jubail, Qatif, and Riyadh',
    },
  },
} as const;

/**
 * Returns the current active sector based on the page id.
 */
export function getActiveSector(currentPage: PageId): SectorId {
  switch (currentPage) {
    case 'portal':
      return 'portal';
    case 'construction':
      return 'construction';
    case 'hvac':
      return 'hvac';
    case 'not-found': {
      if (typeof window !== 'undefined') {
        const path = window.location.pathname.toLowerCase();
        if (path.startsWith('/construction')) return 'construction';
        if (path.startsWith('/hvac')) return 'hvac';
        if (path.startsWith('/realestate')) return 'realestate';
      }
      return 'portal';
    }
    default:
      // All real estate pages (home, about, properties, projects, marketing, blog, contact, admin)
      return 'realestate';
  }
}

/**
 * Helper to get localized sector name
 */
export function getSectorName(sector: SectorDefinition, language: Language): string {
  return sector.name[language];
}

/**
 * Helper to get localized short sector name
 */
export function getSectorShortName(sector: SectorDefinition, language: Language): string {
  return sector.shortName[language];
}
