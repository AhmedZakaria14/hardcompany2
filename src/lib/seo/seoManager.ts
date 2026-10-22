/**
 * HARD REAL ESTATE & GROUP - SEO, SOCIAL METADATA & SANITIZATION ENGINE
 * 
 * Manages page-specific SEO titles, descriptions, social preview images (OG/Twitter),
 * indexability settings (robots index/noindex), canonical URLs, and XSS sanitization.
 */

import { Language, PageId } from '../../types';

export interface PageSeoConfig {
  pageId: PageId | 'privacy' | 'terms';
  title: { en: string; ar: string };
  description: { en: string; ar: string };
  keywords?: { en: string; ar: string };
  ogImage: string;
  indexable: boolean; // true = "index, follow", false = "noindex, nofollow"
  canonicalPath: string;
  updatedAt?: string;
}

export interface LegalPolicyContent {
  privacyPolicy: {
    title: { en: string; ar: string };
    lastUpdated: string;
    sections: {
      id: string;
      heading: { en: string; ar: string };
      body: { en: string; ar: string };
      isRequired: boolean;
    }[];
  };
  termsOfService: {
    title: { en: string; ar: string };
    lastUpdated: string;
    sections: {
      id: string;
      heading: { en: string; ar: string };
      body: { en: string; ar: string };
      isRequired: boolean;
    }[];
  };
  complianceFlags: {
    regaLicenseId: string;
    commercialRegNum: string;
    dataControllerEmail: string;
    isRegaCompliant: boolean;
    isPdplCompliant: boolean;
    missingPolicyFlags: string[];
  };
}

/**
 * STRICT XSS SANITIZER
 * Strips HTML tags, script blocks, javascript: directives, event handlers, and unsafe characters.
 * Prevents arbitrary script injection through SEO text fields.
 */
export function sanitizeSeoString(input: string | null | undefined): string {
  if (!input) return '';
  
  return String(input)
    // Remove script tags and contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove style tags and contents
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Remove all HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove inline event handlers like onload=, onerror=
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    // Remove javascript: pseudo-protocols
    .replace(/javascript:/gi, '')
    // Trim extraneous whitespace
    .trim();
}

/**
 * Validates whether an image URL is safe and valid (http/https or relative data URL)
 */
export function sanitizeImageUrl(url: string | null | undefined, fallback: string): string {
  if (!url) return fallback;
  const clean = url.trim();
  if (clean.startsWith('javascript:') || clean.startsWith('data:text/html')) {
    return fallback;
  }
  if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('/')) {
    return clean;
  }
  return fallback;
}

const DEFAULT_SEO_CONFIGS: Record<string, PageSeoConfig> = {
  portal: {
    pageId: 'portal',
    title: {
      en: 'HARD Group | Corporate Holding Division',
      ar: 'مجموعة هارد القابضة | البوابة الرئيسية للقطاعات',
    },
    description: {
      en: 'HARD Group Holding - Unified multi-sector platform for Real Estate Brokerage, General Contracting, and Enterprise HVAC Solutions in Saudi Arabia.',
      ar: 'مجموعة هارد القابضة - البوابة الموحدة لقطاعات التطوير والوساطة العقارية، المقاولات العامة، وأنظمة التكييف بالمملكة العربية السعودية.',
    },
    ogImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    indexable: true,
    canonicalPath: '/',
  },
  home: {
    pageId: 'home',
    title: {
      en: 'HARD Real Estate | Certified Saudi Brokerage & Investment',
      ar: 'هارد للعقارات | الوساطة والاستثمار العقاري المعتمد',
    },
    description: {
      en: 'HARD Real Estate - REGA certified real estate marketing and luxury property acquisitions across Al Khobar, Riyadh, and Eastern Province.',
      ar: 'شركة هارد للعقارات - منصة تسويق ووساطة عقارية معتمدة من الهيئة العامة للعقار (فال)، متخصصة بالفلل الفاخرة والأراضي بالشرقية والرياض.',
    },
    ogImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    indexable: true,
    canonicalPath: '/realestate',
  },
  properties: {
    pageId: 'properties',
    title: {
      en: 'Luxury Properties For Sale & Rent | HARD Real Estate',
      ar: 'العقارات والفلل المتاحة للبيع والإيجار | هارد للعقارات',
    },
    description: {
      en: 'Browse verified luxury villas, sea-view apartments, townhouses, and commercial assets available for sale and rent in Saudi Arabia.',
      ar: 'استعرض أحدث العقارات الموثقة، الفلل الملكية، والشقق المتاحة للبيع والإيجار بأسعار محدثة وضمانات رسمية.',
    },
    ogImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
    indexable: true,
    canonicalPath: '/realestate/properties',
  },
  projects: {
    pageId: 'projects',
    title: {
      en: 'Master Off-Plan Developments | HARD Real Estate',
      ar: 'المشاريع التطويرية والواجهات البحرية | هارد للعقارات',
    },
    description: {
      en: 'Explore prime residential and commercial master developments in Al Khobar and Riyadh with official escrow guarantees.',
      ar: 'استكشف كبرى المشاريع التطويرية السكنية والتجارية مع خطط سداد مرنة وضمانات حسابات الضمان المعتمدة.',
    },
    ogImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    indexable: true,
    canonicalPath: '/realestate/projects',
  },
  marketing: {
    pageId: 'marketing',
    title: {
      en: 'Real Estate Marketing & Asset Advisory | HARD Group',
      ar: 'التسويق والوساطة العقارية | هارد للعقارات',
    },
    description: {
      en: 'Professional asset evaluation, luxury marketing campaigns, and REGA-compliant transaction closing.',
      ar: 'خدمات التقييم والتسويق العقاري الاحترافي للأصول الفاخرة والمحافِظ الاستثمارية مع توثيق إلكتروني معتمد.',
    },
    ogImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    indexable: true,
    canonicalPath: '/realestate/marketing',
  },
  about: {
    pageId: 'about',
    title: {
      en: 'About HARD Real Estate & Group Holding',
      ar: 'من نحن والعقلية التطويرية | هارد للعقارات',
    },
    description: {
      en: 'Pioneering Saudi real estate development, general contracting, and engineering excellence.',
      ar: 'تعرف على رؤية وقيم مجموعة هارد القابضة وإنجازاتها التنموية في قطاعات العقار والبناء والتكييف بالمملكة.',
    },
    ogImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    indexable: true,
    canonicalPath: '/realestate/about',
  },
  blog: {
    pageId: 'blog',
    title: {
      en: 'Saudi Real Estate Market Reports & Articles | HARD',
      ar: 'المدونة والتقارير العقارية | هارد للعقارات',
    },
    description: {
      en: 'Expert market analysis on Saudi property investment trends, rental yields, and REGA regulatory frameworks.',
      ar: 'تقارير ودراسات تحليليية لحركة أداء السوق العقاري السعودي وفرص الاستثمار بالمنطقة الشرقية والرياض.',
    },
    ogImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    indexable: true,
    canonicalPath: '/realestate/blog',
  },
  contact: {
    pageId: 'contact',
    title: {
      en: 'Contact Senior Advisors | HARD Real Estate',
      ar: 'تواصل مع مستشارينا | هارد للعقارات',
    },
    description: {
      en: 'Connect with HARD Group offices in Al Khobar, Riyadh, and Dammam for inquiries and private viewings.',
      ar: 'تواصل مباشر مع فروع مجموعة هارد بالخُبر والرياض والدمام لاستشارات الاستثمار وحجز المعاينات.',
    },
    ogImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    indexable: true,
    canonicalPath: '/realestate/contact',
  },
  construction: {
    pageId: 'construction',
    title: {
      en: 'HARD Contracting | Class-1 General Construction',
      ar: 'هارد للمقاولات العامة والإنشاءات | كود البناء السعودي',
    },
    description: {
      en: 'Class-1 certified general contractor delivering commercial towers and residential communities with SBC compliance.',
      ar: 'الذراع الهندسي لمجموعة هارد - مقاولات عامة مصنفة فئة أولى لتنفيذ المباني والأبراج التجارية بكود البناء السعودي.',
    },
    ogImage: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=1200&q=80',
    indexable: true,
    canonicalPath: '/construction',
  },
  hvac: {
    pageId: 'hvac',
    title: {
      en: 'HARD HVAC | Enterprise Climate & Maintenance Solutions',
      ar: 'هارد لأنظمة التكييف والحلول المركزية | صيانة 24/7',
    },
    description: {
      en: 'Enterprise HVAC chilled water systems, VRF installations, and 24/7 rapid emergency dispatch.',
      ar: 'حلول التكييف المركزي والمياه المثلجة وأنظمة VRF والخدمات الكهروميكانيكية الطارئة للمنشآت.',
    },
    ogImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80',
    indexable: true,
    canonicalPath: '/hvac',
  },
  privacy: {
    pageId: 'privacy',
    title: {
      en: 'Privacy Policy & Personal Data Protection | HARD Group',
      ar: 'سياسة الخصوصية وحماية البيانات | مجموعة هارد',
    },
    description: {
      en: 'Official privacy policy and data governance practices of HARD Group in compliance with Saudi PDPL regulations.',
      ar: 'سياسة الخصوصية الرسمية وحماية البيانات الشخصية لمجموعة هارد وفق نظام حماية البيانات الشخصية (PDPL).',
    },
    ogImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    indexable: true,
    canonicalPath: '/privacy',
  },
  terms: {
    pageId: 'terms',
    title: {
      en: 'Terms of Service & Operational Conditions | HARD Group',
      ar: 'الشروط والأحكام والضوابط التشغيلية | مجموعة هارد',
    },
    description: {
      en: 'Operational terms and brokerage advisory conditions governed by REGA License #7200018492 and Saudi laws.',
      ar: 'الشروط والأحكام المعتمدة والضوابط التنظيمية لمجموعة هارد وخدمات الوساطة العقارية المرخصة.',
    },
    ogImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    indexable: true,
    canonicalPath: '/terms',
  },
};

const SEO_STORAGE_KEY = 'hard_cms_page_seo_configs_v1';
const LEGAL_STORAGE_KEY = 'hard_cms_approved_legal_policy_v1';

export function getStoredSeoConfigs(): Record<string, PageSeoConfig> {
  try {
    const raw = localStorage.getItem(SEO_STORAGE_KEY);
    if (!raw) return DEFAULT_SEO_CONFIGS;
    const parsed = JSON.parse(raw);
    const merged: Record<string, PageSeoConfig> = { ...DEFAULT_SEO_CONFIGS };
    if (parsed && typeof parsed === 'object') {
      Object.keys(parsed).forEach((k) => {
        const item = parsed[k];
        if (item && typeof item === 'object') {
          merged[k] = {
            ...DEFAULT_SEO_CONFIGS[k],
            ...item,
            title: {
              ar: item.title?.ar || DEFAULT_SEO_CONFIGS[k]?.title?.ar || 'مجموعة هارد',
              en: item.title?.en || DEFAULT_SEO_CONFIGS[k]?.title?.en || 'HARD Group',
            },
            description: {
              ar: item.description?.ar || DEFAULT_SEO_CONFIGS[k]?.description?.ar || '',
              en: item.description?.en || DEFAULT_SEO_CONFIGS[k]?.description?.en || '',
            },
          };
        }
      });
    }
    return merged;
  } catch {
    return DEFAULT_SEO_CONFIGS;
  }
}

export function saveStoredSeoConfigs(configs: Record<string, PageSeoConfig>): void {
  try {
    localStorage.setItem(SEO_STORAGE_KEY, JSON.stringify(configs));
  } catch (e) {
    console.warn('Failed to save SEO configs to localStorage:', e);
  }
}

/**
 * APPROVED DEFAULT LEGAL POLICY DATA
 */
export const DEFAULT_LEGAL_POLICY: LegalPolicyContent = {
  privacyPolicy: {
    title: {
      en: 'Privacy Policy & Personal Data Protection Framework',
      ar: 'سياسة الخصوصية وإطار حماية البيانات الشخصية',
    },
    lastUpdated: '2026-10-10',
    sections: [
      {
        id: 'sec-1',
        heading: {
          en: '1. Data Controller Identification & Scope',
          ar: '1. هوية جهة التحكم ونطاق سياسة الخصوصية',
        },
        body: {
          en: 'HARD Real Estate Group (Commercial Registration #2051254311, REGA License #7200018492, Al Khobar, Saudi Arabia) acts as the Data Controller under the Saudi Personal Data Protection Law (PDPL). This policy applies to all personal data collected through our web portals.',
          ar: 'تعد شركة هارد للعقارات (السجل التجاري رقم 2051254311 وترخيص الهيئة العامة للعقار رقم 7200018492، الخُبر، المملكة العربية السعودية) جهة التحكم بالبيانات وفق نظام حماية البيانات الشخصية (PDPL) بالمملكة.',
        },
        isRequired: true,
      },
      {
        id: 'sec-2',
        heading: {
          en: '2. Collected Personal Data & Purpose',
          ar: '2. البيانات الشخصية المجمعة وأغراض المعالجة',
        },
        body: {
          en: 'We collect client full names, verified phone/WhatsApp numbers, email addresses, and specific property inquiry parameters strictly for facilitating property viewings, issuing non-binding investment offers, and complying with REGA brokerage record-keeping regulations.',
          ar: 'نقوم بجمع أسماء العملاء، أرقام التواصل الموثقة، العناوين البريدية، ومواصفات العقارات المطلوبة حصرياً لغرض تنظيم المعاينات، إعداد عروض الاستثمار، والالتزام بمتطلبات السجلات لدى الهيئة العامة للعقار.',
        },
        isRequired: true,
      },
      {
        id: 'sec-3',
        heading: {
          en: '3. Data Security, Storage & Cookies',
          ar: '3. أمن البيانات والتخزين وملفات التعريف (Cookies)',
        },
        body: {
          en: 'All client communications and submission payloads are transmitted via SSL encryption. Local storage is strictly utilized for UI language preferences and authentication tokens. We do not sell client data to third parties.',
          ar: 'تتم كافة المراسلات عبر تشفير آمن. يُستخدم التخزين المحلي للمتصفح لحفظ تفضيلات اللغة والحرص على حماية البيانات، ولا يتم بيع أو مشاركة بيانات العملاء مع أي طرف ثالث.',
        },
        isRequired: true,
      },
      {
        id: 'sec-4',
        heading: {
          en: '4. Data Subject Rights & Data Officer Contact',
          ar: '4. حقوق صاحب البيانات والتواصل مع ضابط الحماية',
        },
        body: {
          en: 'In accordance with PDPL, you retain the right to request access, correction, or destruction of your personal records. Contact our Privacy Compliance Officer at info@hardgp.com or +966 13 800 4273.',
          ar: 'يحق لك وفق نظام PDPL طلب الاطلاع أو تصحيح أو إتلاف بياناتك الشخصية من سجلاتنا عبر التواصل المباشر مع مسئول حماية البيانات عبر info@hardgp.com أو الهاتف +966 13 800 4273.',
        },
        isRequired: true,
      },
    ],
  },
  termsOfService: {
    title: {
      en: 'Terms of Service & Operational Governance',
      ar: 'الشروط والأحكام والضوابط التشغيلية المعتمدة',
    },
    lastUpdated: '2026-10-10',
    sections: [
      {
        id: 'term-1',
        heading: {
          en: '1. Official Regulatory Licensing Identity',
          ar: '1. التراخيص والتسجيل الرسمي',
        },
        body: {
          en: 'HARD Real Estate is an officially registered brokerage and real estate services company under REGA License #7200018492 and Commercial Registration #2051254311, operating in Eastern Province, Riyadh, and Jeddah.',
          ar: 'شركة هارد للعقارات هي مؤسسة عقارية ووساطة مرخصة رسمياً من الهيئة العامة للعقار بموجب ترخيص رقم 7200018492 والسجل التجاري رقم 2051254311.',
        },
        isRequired: true,
      },
      {
        id: 'term-2',
        heading: {
          en: '2. Non-Binding Inquiries & Official Contracting',
          ar: '2. الاستفسارات غير الملزمة والتعاقد الرسمي',
        },
        body: {
          en: 'All online inquiry forms, valuation calculators, and brochure requests constitute non-binding consultation requests. Enforceable property transactions occur strictly through notarized contracts executed via approved Saudi government platforms (Ejar, Najiz, Real Estate Exchange).',
          ar: 'تعتبر الاستفسارات الإلكترونية وحسابات التقدير طلبات استشارية غير ملزمة. ينعقد الالتزام القانوني حصرياً عبر توثيق العقود الرسمية بموجب الأنظمة المعتمدة (منصة إيجار، البورصة العقارية، ناجز).',
        },
        isRequired: true,
      },
      {
        id: 'term-3',
        heading: {
          en: '3. Accuracy of Listing Specifications & Blueprint Specs',
          ar: '3. دقة بيانات العقارات والمواصفات المعتمدة',
        },
        body: {
          en: 'Property dimensions, architectural blueprints, starting prices, and estimated yields are compiled from official engineering blueprints and verified title deeds. Pricing and availability remain subject to final bilateral contract execution.',
          ar: 'يتم تدقيق بيانات المساحات، والمواصفات الإنشائية، والأسعار بناءً على الصكوك والمخططات المعتمدة، وتظل خاضعة للتوافر والتعاقد النهائي.',
        },
        isRequired: true,
      },
    ],
  },
  complianceFlags: {
    regaLicenseId: '7200018492',
    commercialRegNum: '2051254311',
    dataControllerEmail: 'info@hardgp.com',
    isRegaCompliant: true,
    isPdplCompliant: true,
    missingPolicyFlags: [],
  },
};

export function getStoredLegalPolicy(): LegalPolicyContent {
  try {
    const raw = localStorage.getItem(LEGAL_STORAGE_KEY);
    if (!raw) return DEFAULT_LEGAL_POLICY;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_LEGAL_POLICY, ...parsed };
  } catch {
    return DEFAULT_LEGAL_POLICY;
  }
}

export function saveStoredLegalPolicy(policy: LegalPolicyContent): void {
  try {
    localStorage.setItem(LEGAL_STORAGE_KEY, JSON.stringify(policy));
  } catch (e) {
    console.warn('Failed to save legal policy to localStorage:', e);
  }
}

/**
 * Checks for missing required legal policy text and returns flagged missing policy notices.
 * Never fabricates missing legal clauses; flags them for admin review instead!
 */
export function validateLegalPolicyCompleteness(policy: LegalPolicyContent): string[] {
  const flags: string[] = [];

  if (!policy.complianceFlags.regaLicenseId) {
    flags.push('Missing REGA Brokerage License ID (الهيئة العامة للعقار)');
  }
  if (!policy.complianceFlags.commercialRegNum) {
    flags.push('Missing Commercial Registration Number (السجل التجاري)');
  }
  if (!policy.complianceFlags.dataControllerEmail) {
    flags.push('Missing Data Controller Contact Email (مسئول حماية البيانات)');
  }

  // Check Privacy Policy Sections
  policy.privacyPolicy.sections.forEach((sec, idx) => {
    if (sec.isRequired && (!sec.body.en.trim() || !sec.body.ar.trim())) {
      flags.push(`Incomplete Privacy Policy Clause #${idx + 1}: ${sec.heading.en || sec.heading.ar}`);
    }
  });

  // Check Terms Sections
  policy.termsOfService.sections.forEach((sec, idx) => {
    if (sec.isRequired && (!sec.body.en.trim() || !sec.body.ar.trim())) {
      flags.push(`Incomplete Terms of Service Clause #${idx + 1}: ${sec.heading.en || sec.heading.ar}`);
    }
  });

  return flags;
}

/**
 * UPDATES DOCUMENT HEAD DYNAMICALLY WITH SANITIZED SEO METADATA
 */
export function applyPageSeoToHead(config: PageSeoConfig, language: Language): void {
  if (typeof document === 'undefined') return;
  if (!config) return;

  const isAr = language === 'ar';
  const titleObj = (typeof config.title === 'object' && config.title !== null)
    ? config.title
    : (typeof config.title === 'string' ? { ar: config.title, en: config.title } : { ar: 'مجموعة هارد', en: 'HARD Group' });
  const descObj = (typeof config.description === 'object' && config.description !== null)
    ? config.description
    : (typeof config.description === 'string' ? { ar: config.description, en: config.description } : { ar: '', en: '' });

  const rawTitle = isAr ? (titleObj.ar || titleObj.en || 'مجموعة هارد') : (titleObj.en || titleObj.ar || 'HARD Group');
  const rawDesc = isAr ? (descObj.ar || descObj.en || '') : (descObj.en || descObj.ar || '');

  const safeTitle = sanitizeSeoString(rawTitle);
  const safeDesc = sanitizeSeoString(rawDesc);
  const safeOgImage = sanitizeImageUrl(config.ogImage, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80');

  // Compute canonical URL
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ai-hard-real-estate.vercel.app';
  const canonicalPath = config.canonicalPath.startsWith('/') ? config.canonicalPath : `/${config.canonicalPath}`;
  const safeCanonicalUrl = `${origin}${canonicalPath}`;

  // 1. Update Title
  document.title = safeTitle;

  // Helper to upsert meta tag
  const setMetaTag = (selector: string, attrName: string, attrVal: string, contentVal: string) => {
    let el = document.querySelector(selector);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attrName, attrVal);
      document.head.appendChild(el);
    }
    el.setAttribute('content', sanitizeSeoString(contentVal));
  };

  // 2. Standard Meta Tags
  setMetaTag('meta[name="description"]', 'name', 'description', safeDesc);
  
  // Robots Indexability
  const robotsVal = config.indexable ? 'index, follow' : 'noindex, nofollow';
  setMetaTag('meta[name="robots"]', 'name', 'robots', robotsVal);

  // 3. OpenGraph Social Tags
  setMetaTag('meta[property="og:title"]', 'property', 'og:title', safeTitle);
  setMetaTag('meta[property="og:description"]', 'property', 'og:description', safeDesc);
  
  let ogImgEl = document.querySelector('meta[property="og:image"]');
  if (!ogImgEl) {
    ogImgEl = document.createElement('meta');
    ogImgEl.setAttribute('property', 'og:image');
    document.head.appendChild(ogImgEl);
  }
  ogImgEl.setAttribute('content', safeOgImage);

  let ogUrlEl = document.querySelector('meta[property="og:url"]');
  if (!ogUrlEl) {
    ogUrlEl = document.createElement('meta');
    ogUrlEl.setAttribute('property', 'og:url');
    document.head.appendChild(ogUrlEl);
  }
  ogUrlEl.setAttribute('content', safeCanonicalUrl);

  // 4. Twitter Social Tags
  setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
  setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', safeTitle);
  setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', safeDesc);

  let twImgEl = document.querySelector('meta[name="twitter:image"]');
  if (!twImgEl) {
    twImgEl = document.createElement('meta');
    twImgEl.setAttribute('name', 'twitter:image');
    document.head.appendChild(twImgEl);
  }
  twImgEl.setAttribute('content', safeOgImage);

  // 5. Canonical Link
  let canonicalEl = document.querySelector('link[rel="canonical"]');
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', safeCanonicalUrl);
}
