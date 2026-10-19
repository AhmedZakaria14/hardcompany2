import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { translations as defaultTranslations } from '../lib/translations';
import { Language } from '../types';
import { isAuthorizedAdmin } from '../lib/adminAuth';

export interface TextOverrideItem {
  id: string;
  path: string; // e.g. 'home.heroSubtitle'
  category: string; // e.g. 'Hero', 'Navbar', 'CTA', 'Services'
  label: string; // descriptive name
  enDefault: string;
  arDefault: string;
}

export const EDITABLE_TEXT_CATALOG: TextOverrideItem[] = [
  {
    id: 'hero-tag',
    path: 'home.heroTag',
    category: 'Hero',
    label: 'Hero Tagline Badge',
    enDefault: defaultTranslations.en.home.heroTag,
    arDefault: defaultTranslations.ar.home.heroTag,
  },
  {
    id: 'hero-prefix',
    path: 'home.heroTitlePrefix',
    category: 'Hero',
    label: 'Hero Title Prefix',
    enDefault: defaultTranslations.en.home.heroTitlePrefix,
    arDefault: defaultTranslations.ar.home.heroTitlePrefix,
  },
  {
    id: 'hero-highlight',
    path: 'home.heroTitleHighlight',
    category: 'Hero',
    label: 'Hero Title Brand Highlight',
    enDefault: defaultTranslations.en.home.heroTitleHighlight,
    arDefault: defaultTranslations.ar.home.heroTitleHighlight,
  },
  {
    id: 'hero-subtitle',
    path: 'home.heroSubtitle',
    category: 'Hero',
    label: 'Hero Main Subtitle',
    enDefault: defaultTranslations.en.home.heroSubtitle,
    arDefault: defaultTranslations.ar.home.heroSubtitle,
  },
  {
    id: 'brand-tagline',
    path: 'brandTagline',
    category: 'Brand',
    label: 'Brand Tagline',
    enDefault: defaultTranslations.en.brandTagline,
    arDefault: defaultTranslations.ar.brandTagline,
  },
  {
    id: 'brand-bio',
    path: 'brandBio',
    category: 'Brand',
    label: 'Brand Corporate Description',
    enDefault: defaultTranslations.en.brandBio,
    arDefault: defaultTranslations.ar.brandBio,
  },
  {
    id: 'services-title',
    path: 'home.servicesSectionTitle',
    category: 'Services',
    label: 'Services Section Title',
    enDefault: defaultTranslations.en.home.servicesSectionTitle,
    arDefault: defaultTranslations.ar.home.servicesSectionTitle,
  },
  {
    id: 'services-subtitle',
    path: 'home.servicesSectionSubtitle',
    category: 'Services',
    label: 'Services Section Subtitle',
    enDefault: defaultTranslations.en.home.servicesSectionSubtitle,
    arDefault: defaultTranslations.ar.home.servicesSectionSubtitle,
  },
  {
    id: 'featured-title',
    path: 'home.featuredSectionTitle',
    category: 'Featured Properties',
    label: 'Featured Section Title',
    enDefault: defaultTranslations.en.home.featuredSectionTitle,
    arDefault: defaultTranslations.ar.home.featuredSectionTitle,
  },
  {
    id: 'featured-subtitle',
    path: 'home.featuredSectionSubtitle',
    category: 'Featured Properties',
    label: 'Featured Section Subtitle',
    enDefault: defaultTranslations.en.home.featuredSectionSubtitle,
    arDefault: defaultTranslations.ar.home.featuredSectionSubtitle,
  },
  {
    id: 'marketing-banner-title',
    path: 'home.marketingBannerTitle',
    category: 'Marketing Banner',
    label: 'Seller Banner Title',
    enDefault: defaultTranslations.en.home.marketingBannerTitle,
    arDefault: defaultTranslations.ar.home.marketingBannerTitle,
  },
  {
    id: 'marketing-banner-subtitle',
    path: 'home.marketingBannerSubtitle',
    category: 'Marketing Banner',
    label: 'Seller Banner Subtitle',
    enDefault: defaultTranslations.en.home.marketingBannerSubtitle,
    arDefault: defaultTranslations.ar.home.marketingBannerSubtitle,
  },
  {
    id: 'cta-primary-btn',
    path: 'cta.viewAvailableProperties',
    category: 'CTA Buttons',
    label: 'Explore Properties Button',
    enDefault: defaultTranslations.en.cta.viewAvailableProperties,
    arDefault: defaultTranslations.ar.cta.viewAvailableProperties,
  },
  {
    id: 'cta-book-btn',
    path: 'cta.bookViewing',
    category: 'CTA Buttons',
    label: 'Book Viewing Button',
    enDefault: defaultTranslations.en.cta.bookViewing,
    arDefault: defaultTranslations.ar.cta.bookViewing,
  },
  {
    id: 'cta-list-btn',
    path: 'cta.listProperty',
    category: 'CTA Buttons',
    label: 'List Property Button',
    enDefault: defaultTranslations.en.cta.listProperty,
    arDefault: defaultTranslations.ar.cta.listProperty,
  },
  {
    id: 'contact-heading',
    path: 'contact.pageTitle',
    category: 'Contact',
    label: 'Contact Page Heading',
    enDefault: defaultTranslations.en.contact.pageTitle,
    arDefault: defaultTranslations.ar.contact.pageTitle,
  },
  {
    id: 'contact-subtitle',
    path: 'contact.pageSubtitle',
    category: 'Contact',
    label: 'Contact Page Subtitle',
    enDefault: defaultTranslations.en.contact.pageSubtitle,
    arDefault: defaultTranslations.ar.contact.pageSubtitle,
  },
  {
    id: 'footer-newsletter-title',
    path: 'footer.newsletterTitle',
    category: 'Footer',
    label: 'Newsletter Title',
    enDefault: defaultTranslations.en.footer.newsletterTitle,
    arDefault: defaultTranslations.ar.footer.newsletterTitle,
  },
];

export interface PromptPreset {
  id: string;
  title: string;
  category: string;
  description: string;
  promptTemplate: string;
}

export const PROMPT_PRESETS: PromptPreset[] = [
  {
    id: 'ultra-luxury-saudi',
    title: '👑 Ultra-Luxury Saudi HNW Tone',
    category: 'Tone & Style',
    description: 'Transform copy into an elite, prestigious voice tailored for royal and ultra-high-net-worth investors in Khobar & Dhahran.',
    promptTemplate: 'Please refine the hero headline and subtitle to sound ultra-prestigious and tailored for high-net-worth Saudi investors in Khobar and Dhahran, emphasizing prime waterfront estates, discreet advisory, and generational wealth.',
  },
  {
    id: 'coastal-waterfront',
    title: '🌊 Coastal Waterfront Storytelling',
    category: 'Storytelling',
    description: 'Evoke panoramic Arabian Gulf sunsets, private marinas, and relaxed luxury living along Khobar Corniche.',
    promptTemplate: 'Update the homepage hero and property descriptions to evoke inspiring coastal living along Khobar Corniche and Half Moon Bay with cinematic marine imagery and private yacht lifestyle references.',
  },
  {
    id: 'investor-yield-rega',
    title: '💼 REGA Certified & High Yield',
    category: 'Investment',
    description: 'Focus heavily on verified REGA compliance, official escrow security, and 9%+ rental yield dynamics.',
    promptTemplate: 'Emphasize institutional investor confidence with explicit mentions of REGA/FAL license protections, certified escrow accounts, and strong 8-10% rental yield projections across the Eastern Province.',
  },
  {
    id: 'short-punchy-mobile',
    title: '⚡ Crisp & Punchy Mobile Copy',
    category: 'Mobile UX',
    description: 'Shorten headlines and subtitles by 40% for rapid mobile scannability and impactful conversion.',
    promptTemplate: 'Make the hero and key section headlines shorter, punchier, and easier to scan on mobile screens while maintaining elegance.',
  },
  {
    id: 'vision-2030-growth',
    title: '🇸🇦 Saudi Vision 2030 Momentum',
    category: 'National Vision',
    description: 'Highlight the Eastern Province real estate expansion within the broader Kingdom Vision 2030 framework.',
    promptTemplate: 'Infuse the brand narrative and project highlights with the ambition of Saudi Vision 2030 and the booming Eastern Province urban expansion.',
  },
];

type OverridesState = {
  en: Record<string, string>;
  ar: Record<string, string>;
};

interface TextOverrideContextType {
  translations: typeof defaultTranslations;
  getDynamicText: (path: string, lang: Language, fallback: string) => string;
  updateText: (path: string, lang: Language, value: string) => void;
  resetText: (path: string, lang: Language) => void;
  resetAll: () => void;
  overrides: OverridesState;
  overrideCount: number;
  isClickToEditActive: boolean;
  setIsClickToEditActive: (active: boolean | ((prev: boolean) => boolean)) => void;
  selectedTextItem: TextOverrideItem | null;
  setSelectedTextItem: (item: TextOverrideItem | null) => void;
}

const STORAGE_KEY = 'hard_real_estate_text_overrides_v1';

const TextOverrideContext = createContext<TextOverrideContextType | undefined>(undefined);

function getNestedValue(obj: any, path: string): string | undefined {
  const parts = path.split('.');
  let curr = obj;
  for (const part of parts) {
    if (curr && typeof curr === 'object' && part in curr) {
      curr = curr[part];
    } else {
      return undefined;
    }
  }
  return typeof curr === 'string' ? curr : undefined;
}

function setNestedValue(obj: any, path: string, value: string): void {
  const parts = path.split('.');
  let curr = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!curr[part] || typeof curr[part] !== 'object') {
      curr[part] = {};
    }
    curr = curr[part];
  }
  curr[parts[parts.length - 1]] = value;
}

export function TextOverrideProvider({ children }: { children: React.ReactNode }) {
  const [overrides, setOverrides] = useState<OverridesState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return { en: {}, ar: {} };
  });

  const [isClickToEditActive, setIsClickToEditActive] = useState<boolean>(false);
  const [selectedTextItem, setSelectedTextItem] = useState<TextOverrideItem | null>(null);

  // Save overrides to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
    } catch (e) {
      console.warn('Failed to save text overrides to localStorage', e);
    }
  }, [overrides]);

  // Compute merged translations
  const activeTranslations = useMemo(() => {
    // Deep clone default translations
    const merged = JSON.parse(JSON.stringify(defaultTranslations));

    // Apply EN overrides
    Object.entries(overrides.en).forEach(([path, val]) => {
      if (typeof val === 'string') {
        setNestedValue(merged.en, path, val);
      }
    });

    // Apply AR overrides
    Object.entries(overrides.ar).forEach(([path, val]) => {
      if (typeof val === 'string') {
        setNestedValue(merged.ar, path, val);
      }
    });

    return merged;
  }, [overrides]);

  const updateText = useCallback((path: string, lang: Language, value: string) => {
    if (!isAuthorizedAdmin()) {
      console.warn('[Authorization Guard] Refused text override write for unauthorized user.');
      return;
    }
    setOverrides((prev) => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        [path]: value,
      },
    }));
  }, []);

  const resetText = useCallback((path: string, lang: Language) => {
    if (!isAuthorizedAdmin()) {
      console.warn('[Authorization Guard] Refused text override reset for unauthorized user.');
      return;
    }
    setOverrides((prev) => {
      const newLangOverrides = { ...prev[lang] };
      delete newLangOverrides[path];
      return {
        ...prev,
        [lang]: newLangOverrides,
      };
    });
  }, []);

  const resetAll = useCallback(() => {
    if (!isAuthorizedAdmin()) {
      console.warn('[Authorization Guard] Refused text override resetAll for unauthorized user.');
      return;
    }
    setOverrides({ en: {}, ar: {} });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const getDynamicText = useCallback(
    (path: string, lang: Language, fallback: string): string => {
      const overrideVal = overrides[lang]?.[path];
      if (overrideVal !== undefined) return overrideVal;
      const defaultVal = getNestedValue(defaultTranslations[lang], path);
      return defaultVal !== undefined ? defaultVal : fallback;
    },
    [overrides]
  );

  const overrideCount = Object.keys(overrides.en).length + Object.keys(overrides.ar).length;

  return (
    <TextOverrideContext.Provider
      value={{
        translations: activeTranslations,
        getDynamicText,
        updateText,
        resetText,
        resetAll,
        overrides,
        overrideCount,
        isClickToEditActive,
        setIsClickToEditActive,
        selectedTextItem,
        setSelectedTextItem,
      }}
    >
      {children}
    </TextOverrideContext.Provider>
  );
}

export function useTextOverride() {
  const context = useContext(TextOverrideContext);
  if (!context) {
    throw new Error('useTextOverride must be used within a TextOverrideProvider');
  }
  return context;
}
