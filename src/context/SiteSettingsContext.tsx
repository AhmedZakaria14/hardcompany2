import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LocalizedText, SectorId } from '../types/firestore-schema';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { sanitizePayload, withServerTimestamps } from '../lib/firebase/serializers';

export interface PublicBrandingSettings {
  sector: SectorId;
  isOverride: boolean;
  publicationStatus: 'draft' | 'published';
  updatedAt: string;
  updatedBy?: string;

  // Branding & Assets
  logoUrlLight: string;
  logoUrlDark: string;
  faviconUrl: string;
  siteName: LocalizedText;
  tagline: LocalizedText;
  aboutSummary: LocalizedText;

  // Contact Channels
  contactEmail: string;
  supportPhone: string;
  whatsappNumber: string;
  tollFreeNumber: string;
  workingHours: LocalizedText;

  // Social Links
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
    facebook?: string;
    snapchat?: string;
  };

  // Office & Location
  office: {
    address: LocalizedText;
    city: LocalizedText;
    googleMapsUrl?: string;
  };

  // Footer & Compliance
  footerContent: {
    copyrightText: LocalizedText;
    crNumber?: string;
    taxNumber?: string;
    licenses?: LocalizedText;
  };

  // Design Tokens
  designTokens: {
    primaryAccent: string;
    secondaryAccent: string;
    darkBgToken: string;
    fontFamily: string;
  };
}

export const DEFAULT_PORTAL_SETTINGS: PublicBrandingSettings = {
  sector: 'portal',
  isOverride: false,
  publicationStatus: 'published',
  updatedAt: new Date().toISOString(),

  logoUrlLight: '/logo.svg',
  logoUrlDark: '/logo.svg',
  faviconUrl: '/favicon.ico',
  siteName: {
    ar: 'مجموعة هارد القابضة',
    en: 'HARD Group Holding',
  },
  tagline: {
    ar: 'الرائدة في العقارات، الإنشاءات، وحلول التكييف بالمملكة',
    en: 'Leading Real Estate, Construction & HVAC Solutions in Saudi Arabia',
  },
  aboutSummary: {
    ar: 'مجموعة استثمارية وتطويرية سعودية متكاملة تقدم أرفع معايير الجودة والابتكار في شتى القطاعات الحيوية.',
    en: 'A premier Saudi investment & development group delivering excellence across real estate, construction, and HVAC engineering.',
  },

  contactEmail: 'info@hardgp.com',
  supportPhone: '+966 9200 00000',
  whatsappNumber: '+966 50 000 0000',
  tollFreeNumber: '800 123 4567',
  workingHours: {
    ar: 'الأحد - الخميس: 8:00 صباحاً - 5:00 مساءً',
    en: 'Sun - Thu: 8:00 AM - 5:00 PM',
  },

  socialLinks: {
    twitter: 'https://twitter.com/hardgroup_sa',
    linkedin: 'https://linkedin.com/company/hardgroup-sa',
    instagram: 'https://instagram.com/hardgroup_sa',
    youtube: 'https://youtube.com/@hardgroup_sa',
  },

  office: {
    address: {
      ar: 'طريق الملك فهد، البرج الإستثماري، الرياض 12211',
      en: 'King Fahd Road, Investment Tower, Riyadh 12211',
    },
    city: {
      ar: 'الرياض، المملكة العربية السعودية',
      en: 'Riyadh, Kingdom of Saudi Arabia',
    },
    googleMapsUrl: 'https://maps.google.com/?q=Riyadh+Saudi+Arabia',
  },

  footerContent: {
    copyrightText: {
      ar: '© 2026 مجموعة هارد القابضة. جميع الحقوق محفوظة.',
      en: '© 2026 HARD Group Holding. All rights reserved.',
    },
    crNumber: '1010892341',
    taxNumber: '310982341200003',
    licenses: {
      ar: 'مرخصة من الهيئة العامة للعقار برقم 12000189',
      en: 'Licensed by Real Estate General Authority #12000189',
    },
  },

  designTokens: {
    primaryAccent: '#0284c7',
    secondaryAccent: '#0f172a',
    darkBgToken: '#090d16',
    fontFamily: 'Tajawal, Cairo, sans-serif',
  },
};

export const DEFAULT_SECTOR_SETTINGS: Record<SectorId, Partial<PublicBrandingSettings>> = {
  portal: {},
  realestate: {
    sector: 'realestate',
    siteName: { ar: 'هارد للعقارات', en: 'HARD Real Estate' },
    tagline: { ar: 'تسويق ووساطة عقارية فاخرة بالمملكة', en: 'Luxury Real Estate Marketing & Brokerage' },
    designTokens: {
      primaryAccent: '#0284c7', // Sky Blue
      secondaryAccent: '#0369a1',
      darkBgToken: '#090d16',
      fontFamily: 'Tajawal, sans-serif',
    },
  },
  construction: {
    sector: 'construction',
    siteName: { ar: 'هارد للمقاولات والإنشاءات', en: 'HARD Contracting & Construction' },
    tagline: { ar: 'بناء وتطوير المشاريع الكبرى والتطوير العمراني', en: 'Master Contracting & Urban Infrastructure' },
    designTokens: {
      primaryAccent: '#d97706', // Amber Gold
      secondaryAccent: '#b45309',
      darkBgToken: '#120d06',
      fontFamily: 'Tajawal, sans-serif',
    },
  },
  hvac: {
    sector: 'hvac',
    siteName: { ar: 'هارد لأنظمة التكييف HVAC', en: 'HARD HVAC & Engineering' },
    tagline: { ar: 'حلول التكييف والتبريد الهندسي للمنشآت الكبرى', en: 'Enterprise HVAC Engineering & Cooling Solutions' },
    designTokens: {
      primaryAccent: '#0d9488', // Teal Cyan
      secondaryAccent: '#0f766e',
      darkBgToken: '#061314',
      fontFamily: 'Tajawal, sans-serif',
    },
  },
};

// URL Sanitization Utility to prevent script injection
export function sanitizeUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:text/html') ||
    lower.startsWith('vbscript:') ||
    lower.includes('<script')
  ) {
    return '#invalid-url';
  }
  return trimmed;
}

// Text Sanitization Utility
export function sanitizeText(text: string): string {
  if (!text) return '';
  return text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').trim();
}

// Hex color validation
export function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color.trim());
}

interface SiteSettingsContextType {
  getEffectiveSettings: (sector?: SectorId) => PublicBrandingSettings;
  allSectorSettings: Record<SectorId, PublicBrandingSettings>;
  saveDraftSettings: (sector: SectorId, settings: PublicBrandingSettings, authorUid?: string) => Promise<void>;
  publishSettings: (sector: SectorId, authorUid?: string) => Promise<void>;
  resetSectorSettings: (sector: SectorId) => Promise<void>;
  isLoading: boolean;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allSectorSettings, setAllSectorSettings] = useState<Record<SectorId, PublicBrandingSettings>>({
    portal: DEFAULT_PORTAL_SETTINGS,
    realestate: { ...DEFAULT_PORTAL_SETTINGS, ...DEFAULT_SECTOR_SETTINGS.realestate, sector: 'realestate' },
    construction: { ...DEFAULT_PORTAL_SETTINGS, ...DEFAULT_SECTOR_SETTINGS.construction, sector: 'construction' },
    hvac: { ...DEFAULT_PORTAL_SETTINGS, ...DEFAULT_SECTOR_SETTINGS.hvac, sector: 'hvac' },
  });
  const [isLoading, setIsLoading] = useState(true);

  // Subscribe to Firestore /site_settings for real-time changes
  useEffect(() => {
    const unsubscribers: (() => void)[] = [];
    const sectors: SectorId[] = ['portal', 'realestate', 'construction', 'hvac'];

    sectors.forEach((sec) => {
      const docRef = doc(db, 'site_settings', sec);
      const unsub = onSnapshot(
        docRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data() as PublicBrandingSettings;
            // Public visitors ONLY adopt settings if published or default
            if (!data.publicationStatus || data.publicationStatus === 'published') {
              setAllSectorSettings((prev) => ({
                ...prev,
                [sec]: { ...prev[sec], ...data, sector: sec },
              }));
            }
          }
        },
        (err) => {
          console.warn(`[SiteSettingsContext] Listener warning for ${sec}:`, err);
        }
      );
      unsubscribers.push(unsub);
    });

    setIsLoading(false);
    return () => {
      unsubscribers.forEach((u) => u());
    };
  }, []);

  /**
   * Evaluates precedence: Sector Overrides merge over Shared Group (portal) settings.
   */
  const getEffectiveSettings = useCallback(
    (sector: SectorId = 'portal'): PublicBrandingSettings => {
      const portalSettings = allSectorSettings.portal || DEFAULT_PORTAL_SETTINGS;
      if (sector === 'portal') {
        return portalSettings;
      }

      const sectorSettings = allSectorSettings[sector];
      if (!sectorSettings) {
        return { ...portalSettings, sector };
      }

      // Merge sector settings over shared portal settings
      return {
        ...portalSettings,
        ...sectorSettings,
        sector,
        siteName: sectorSettings.siteName?.ar ? sectorSettings.siteName : portalSettings.siteName,
        tagline: sectorSettings.tagline?.ar ? sectorSettings.tagline : portalSettings.tagline,
        aboutSummary: sectorSettings.aboutSummary?.ar ? sectorSettings.aboutSummary : portalSettings.aboutSummary,
        contactEmail: sectorSettings.contactEmail || portalSettings.contactEmail,
        supportPhone: sectorSettings.supportPhone || portalSettings.supportPhone,
        whatsappNumber: sectorSettings.whatsappNumber || portalSettings.whatsappNumber,
        designTokens: {
          ...portalSettings.designTokens,
          ...(sectorSettings.designTokens || {}),
        },
        office: {
          ...portalSettings.office,
          ...(sectorSettings.office || {}),
        },
        footerContent: {
          ...portalSettings.footerContent,
          ...(sectorSettings.footerContent || {}),
        },
      };
    },
    [allSectorSettings]
  );

  const saveDraftSettings = async (sector: SectorId, settings: PublicBrandingSettings, authorUid = 'admin') => {
    const sanitizedPayload: PublicBrandingSettings = {
      ...settings,
      sector,
      publicationStatus: 'draft',
      logoUrlLight: sanitizeUrl(settings.logoUrlLight),
      logoUrlDark: sanitizeUrl(settings.logoUrlDark),
      faviconUrl: sanitizeUrl(settings.faviconUrl),
      contactEmail: sanitizeText(settings.contactEmail),
      supportPhone: sanitizeText(settings.supportPhone),
      whatsappNumber: sanitizeText(settings.whatsappNumber),
      office: {
        ...settings.office,
        googleMapsUrl: sanitizeUrl(settings.office.googleMapsUrl || ''),
      },
      updatedAt: new Date().toISOString(),
      updatedBy: authorUid,
    };

    setAllSectorSettings((prev) => ({
      ...prev,
      [sector]: sanitizedPayload,
    }));

    try {
      const docRef = doc(db, 'site_settings', sector);
      await setDoc(docRef, withServerTimestamps(sanitizedPayload));
    } catch (e) {
      console.error('[SiteSettingsContext] Failed to save draft to Firestore:', e);
    }
  };

  const publishSettings = async (sector: SectorId, authorUid = 'admin') => {
    const currentSettings = allSectorSettings[sector] || getEffectiveSettings(sector);
    const publishedPayload: PublicBrandingSettings = {
      ...currentSettings,
      publicationStatus: 'published',
      updatedAt: new Date().toISOString(),
      updatedBy: authorUid,
    };

    setAllSectorSettings((prev) => ({
      ...prev,
      [sector]: publishedPayload,
    }));

    try {
      const docRef = doc(db, 'site_settings', sector);
      await setDoc(docRef, withServerTimestamps(publishedPayload));
    } catch (e) {
      console.error('[SiteSettingsContext] Failed to publish settings to Firestore:', e);
    }
  };

  const resetSectorSettings = async (sector: SectorId) => {
    let defaultVal: PublicBrandingSettings;
    if (sector === 'portal') {
      defaultVal = DEFAULT_PORTAL_SETTINGS;
    } else {
      defaultVal = { ...DEFAULT_PORTAL_SETTINGS, ...DEFAULT_SECTOR_SETTINGS[sector], sector };
    }

    setAllSectorSettings((prev) => ({
      ...prev,
      [sector]: defaultVal,
    }));

    try {
      const docRef = doc(db, 'site_settings', sector);
      await setDoc(docRef, sanitizePayload(defaultVal));
    } catch (e) {
      console.error('[SiteSettingsContext] Failed to reset sector settings in Firestore:', e);
    }
  };

  return (
    <SiteSettingsContext.Provider
      value={{
        getEffectiveSettings,
        allSectorSettings,
        saveDraftSettings,
        publishSettings,
        resetSectorSettings,
        isLoading,
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
};

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
}
