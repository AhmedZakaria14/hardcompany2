import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { BlogPost, BlogCategory, BlogAuthor, BlogStatus, BlogPostSEO } from '../types';

/* =========================================================================
   DEFAULT CATALOG SEED DATA
   ========================================================================= */

export const INITIAL_BLOG_CATEGORIES: BlogCategory[] = [
  {
    id: 'cat-market-intel',
    slug: { en: 'market-intelligence', ar: 'tahleelat-al-souq' },
    name: { en: 'Market Intelligence', ar: 'تقارير وتحليلات السوق' },
    description: {
      en: 'Deep analytical reports, macroeconomic capital inflows, and demographic trends shaping the Saudi Eastern Province.',
      ar: 'قراءات تحليلية معمقة في حركة السيولة والاستثمارات وتوجهات السوق العقاري بالمنطقة الشرقية.',
    },
    color: 'from-blue-600 to-sky-500',
    order: 1,
    createdAt: '2025-01-01',
  },
  {
    id: 'cat-investment-guide',
    slug: { en: 'investment-guides', ar: 'adillat-al-istithmar' },
    name: { en: 'Investment Guides', ar: 'أدلة المستثمرين' },
    description: {
      en: 'Strategic guidance on yield benchmarks, prime rental portfolios, asset appraisal, and high-growth corridors.',
      ar: 'أدلة إرشادية حول مضاعفات العائد الاستثماري، التقييم المهني، ومناطق النمو الواعدة.',
    },
    color: 'from-amber-600 to-orange-500',
    order: 2,
    createdAt: '2025-01-01',
  },
  {
    id: 'cat-regulations',
    slug: { en: 'regulations-compliance', ar: 'al-anzima-wa-al-tashreeat' },
    name: { en: 'Regulations & Compliance', ar: 'اللوائح والتنظيمات' },
    description: {
      en: 'Authoritative breakdowns of REGA licensing, FAL brokerage governance, Ejar escrow protections, and Saudi property law.',
      ar: 'شرح متكامل لتشريعات الهيئة العامة للعقار، رخص فال، منصة إيجار وحماية حقوق المستثمرين.',
    },
    color: 'from-emerald-600 to-teal-500',
    order: 3,
    createdAt: '2025-01-01',
  },
  {
    id: 'cat-luxury-living',
    slug: { en: 'luxury-living-architecture', ar: 'al-hayat-al-fakhira' },
    name: { en: 'Luxury Living & Architecture', ar: 'الحياة الفاخرة والعمارة' },
    description: {
      en: 'Showcases of bespoke coastal mansions, private marinas, sustainable smart villas, and high-end living in Khobar & Dammam.',
      ar: 'استعراض للمشاريع الساحلية الفارهة، الفلل الذكية المستدامة، والمجمعات السكنية المغلقة.',
    },
    color: 'from-indigo-600 to-purple-500',
    order: 4,
    createdAt: '2025-01-01',
  },
];

export const INITIAL_BLOG_AUTHORS: BlogAuthor[] = [
  {
    id: 'auth-faisal',
    slug: { en: 'faisal-al-otaibi', ar: 'faisal-al-otaibi' },
    name: { en: 'Faisal Al-Otaibi', ar: 'فيصل العتيبي' },
    role: { en: 'Chief Investment Officer', ar: 'رئيس الاستثمار العقاري' },
    bio: {
      en: 'Over 15 years advising sovereign wealth vehicles and family offices on prime mixed-use portfolios across Khobar, Riyadh, and the GCC.',
      ar: 'أكثر من 15 عاماً في قيادة المحافظ الاستثمارية العقارية وتقديم الاستشارات الاستراتيجية في الخليج.',
    },
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    email: 'faisal@hardrealestate.sa',
    linkedin: 'https://linkedin.com',
    order: 1,
    createdAt: '2025-01-01',
  },
  {
    id: 'auth-reem',
    slug: { en: 'reem-al-qahtani', ar: 'reem-al-qahtani' },
    name: { en: 'Reem Al-Qahtani', ar: 'ريم القحطاني' },
    role: { en: 'Head of Legal & Regulatory Compliance', ar: 'رئيسة الشؤون القانونية والامتثال العقاري' },
    bio: {
      en: 'Certified REGA legal consultant specializing in off-plan sales governance, escrow structure, and certified FAL brokerage standards.',
      ar: 'مستشارة قانونية معتمدة لدى الهيئة العامة للعقار متخصصة في حسابات الضمان وتنظيمات البيع على الخارطة.',
    },
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    email: 'reem@hardrealestate.sa',
    linkedin: 'https://linkedin.com',
    order: 2,
    createdAt: '2025-01-01',
  },
  {
    id: 'auth-sultan',
    slug: { en: 'sultan-al-ghamdi', ar: 'sultan-al-ghamdi' },
    name: { en: 'Sultan Al-Ghamdi', ar: 'سلطان الغامدي' },
    role: { en: 'Waterfront Development Strategist', ar: 'أخصائي استراتيجيات المشاريع البحرية' },
    bio: {
      en: 'Leading urban economist with focus on Arabian Gulf coastal assets, marina developments, and luxury hospitality integration.',
      ar: 'خبير اقتصادي وتطوير عقاري متخصص في الواجهات البحرية والمشاريع الساحلية الفندقية بالخليج العربي.',
    },
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
    email: 'sultan@hardrealestate.sa',
    linkedin: 'https://linkedin.com',
    order: 3,
    createdAt: '2025-01-01',
  },
];

export const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: 'post-1',
    slug: {
      en: 'eastern-province-real-estate-outlook-2026',
      ar: 'afaq-al-souq-al-aqari-bil-mintaqah-al-sharqiyah-2026',
    },
    title: {
      en: 'Eastern Province Real Estate Outlook 2026: Capital Inflows & Waterfront Demand',
      ar: 'آفاق السوق العقاري بالمنطقة الشرقية 2026: تدفقات رؤوس الأموال والطلب على الواجهات البحرية',
    },
    excerpt: {
      en: 'An in-depth macroeconomic analysis examining institutional liquidity, luxury residential appreciation, and Vision 2030 waterfront milestones across Khobar and Dammam.',
      ar: 'تحليل معمق يرصد تدفقات الاستثمار المؤسسي ونمو عوائد الأصول الفاخرة وتسارع مشاريع الواجهات البحرية بالخُبر والدمام وفق مستهدفات رؤية 2030.',
    },
    category: { en: 'Market Intelligence', ar: 'تقارير وتحليلات السوق' },
    categoryId: 'cat-market-intel',
    date: 'February 10, 2026',
    publishedAt: '2026-02-10T09:00:00Z',
    readTime: { en: '6 min read', ar: 'قراءة 6 دقائق' },
    author: { en: 'Faisal Al-Otaibi', ar: 'فيصل العتيبي' },
    authorId: 'auth-faisal',
    authorRole: { en: 'Chief Investment Officer', ar: 'رئيس الاستثمار العقاري' },
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    imageAlt: {
      en: 'Modern high-rise commercial and luxury residential towers in Eastern Province',
      ar: 'أبراج حديثة تجارية وسكنية فاخرة في المنطقة الشرقية',
    },
    content: {
      en: `The Saudi Eastern Province real estate sector continues to experience sustained structural tailwinds in 2026, driven by unprecedented industrial expansions, sovereign infrastructure funding, and resilient high-net-worth demographic shifts.

### Macroeconomic Growth Drivers
Cities across the Eastern Province—most prominently Al Khobar, Dammam, and Dhahran—are witnessing robust capital inflows. Key catalytic forces include:
- **Vision 2030 Quality-of-Life Program:** Substantial waterfront promenade developments, eco-friendly transit, and cultural epicenters.
- **Energy & Tech Corridors:** Sustained corporate headquarters concentration surrounding Dhahran Techno Valley and King Salman Energy Park (SPARK).
- **International Capital Allocation:** Foreign direct investment frameworks and transparent digital notarization easing cross-border transactions.

### Prime Residential Yield Resilience
Unlike volatile secondary markets, prime coastal developments along Al Shobaily Bay, Sunset Marina, and Al Shati Corniche have demonstrated net operational yields between 8.2% and 9.6%. 

Investor confidence is underpinned by the strict escrow guarantees mandated by the Real Estate General Authority (REGA), ensuring that development capital is safeguarded throughout construction cycles.`,
      ar: `يشهد القطاع العقاري في المنطقة الشرقية بالمملكة العربية السعودية زخماً استثمارياً متصاعداً مع مطلع عام 2026، مدفوعاً بنمو الاستثمارات النوعية في قطاعات الطاقة والتقنية ومشاريع جودة الحياة.

### محركات النمو الاقتصادي في المنطقة الشرقية
تسجل مدن الخُبر والدمام والظهران نمواً ملحوظاً في الطلب على المشاريع السكنية والواجهات البحرية الفاخرة، وذلك بفضل:
- **مبادرات رؤية المملكة 2030:** تطوير الكورنيشات البحرية والمماشي الترفيهية والمرافق الذكية.
- **استقرار العوائد الاستثمارية:** تحقيق العقارات الساحلية لعوائد تشغيلية صافية تتراوح بين 8.2% و 9.6%.
- **البيئة التشريعية المحفزة:** حماية أموال المستثمرين عبر حسابات الضمان البنكية والتوثيق الإلكتروني المعتمد من الهيئة العامة للعقار.

### فرص الاستثمار في المشاريع الساحلية
تتصدر مشاريع خليج الشبيلي، العزيزية، وكورنيش الشاطئ قائمة الوجهات الأكثر جذباً للمستثمرين الباحثين عن عوائد طويلة الأجل وأصول استثنائية تحافظ على قيمتها الرأسمالية.`,
    },
    status: 'published',
    featured: true,
    tags: ['Vision 2030', 'Al Khobar', 'Market Trends', 'Waterfront', 'Investment'],
    seo: {
      metaTitle: {
        en: 'Eastern Province Real Estate Outlook 2026 | HARD Group Market Intelligence',
        ar: 'آفاق السوق العقاري بالمنطقة الشرقية 2026 | تقارير مجموعة هارد',
      },
      metaDescription: {
        en: 'Read HARD Group strategic report on Saudi Eastern Province real estate capital flows, waterfront yields, and Vision 2030 developments.',
        ar: 'تقرير شامل من مجموعة هارد العقارية حول مؤشرات السوق بالمنطقة الشرقية وعوائد المشاريع الساحلية بالخُبر والدمام.',
      },
      keywords: {
        en: ['Khobar Real Estate', 'Dammam Luxury Villas', 'Saudi Real Estate 2026', 'REGA Compliance'],
        ar: ['عقارات الخُبر', 'فلل الدمام الفاخرة', 'استثمار عقاري السعودية 2026', 'الهيئة العامة للعقار'],
      },
      ogImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    },
  },
  {
    id: 'post-2',
    slug: {
      en: 'navigating-rega-and-fal-brokerage-regulations',
      ar: 'daleel-al-mustathmir-li-tanzimat-al-hai-ah-al-aamah-lil-aqaar-fal',
    },
    title: {
      en: 'Navigating REGA & FAL Brokerage Regulations in Saudi Arabia',
      ar: 'دليل المستثمر للوائح الهيئة العامة للعقار ورخص الوساطة (فال)',
    },
    excerpt: {
      en: 'Essential legal considerations, escrow protection frameworks, and compliance standards for local and international investors entering the Saudi market.',
      ar: 'أبرز الإرشادات القانونية، والضمانات البنكية، وتوثيق العقود عبر منصات الهيئة العامة للعقار وبرنامج إيجار.',
    },
    category: { en: 'Regulations & Compliance', ar: 'اللوائح والتنظيمات' },
    categoryId: 'cat-regulations',
    date: 'January 22, 2026',
    publishedAt: '2026-01-22T10:00:00Z',
    readTime: { en: '5 min read', ar: 'قراءة 5 دقائق' },
    author: { en: 'Reem Al-Qahtani', ar: 'ريم القحطاني' },
    authorId: 'auth-reem',
    authorRole: { en: 'Head of Legal & Regulatory Compliance', ar: 'رئيسة الشؤون القانونية والامتثال العقاري' },
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    image: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80',
    imageAlt: {
      en: 'Legal documentation, corporate stamp, and real estate governance contract in Saudi Arabia',
      ar: 'وثائق حوكمة وعقود عقارية موثقة رسمياً في المملكة العربية السعودية',
    },
    content: {
      en: `Transparency and institutional protection in the Kingdom of Saudi Arabia have set global governance benchmarks through the regulatory frameworks overseen by the Real Estate General Authority (REGA).

### The Foundation of FAL Licensing
The FAL brokerage law mandates that every market intermediary—whether individual agent or corporate broker—must possess verified credentials and adhere strictly to ethical disclosure guidelines. Key features include:
1. **Mandatory Digital Advertising Licensing:** Every public property listing must feature an authorized FAL advertisement license number.
2. **Standardized Escrow Protections:** Eliminating unverified deposit practices and securing transactions through authorized national clearing systems.
3. **Electronic Contract Authentication (Ejar):** Providing legal enforceability as executive instruments within the Saudi Ministry of Justice.`,
      ar: `حققت المملكة العربية السعودية قفزات نوعية في تعزيز الشفافية وحماية حقوق المستثمرين والمتعاملين في السوق العقاري عبر منظومة التشريعات المعتمدة من الهيئة العامة للعقار.

### رخصة فال للوساطة والتسويق العقاري
ألزم نظام الوساطة العقارية ولائحته التنفيذية جميع العاملين والشركات بالحصول على رخصة فال النظامية وربط الإعلانات العقارية برقم ترخيص معتمد، مما يحقق:
1. **الحد من الإعلانات الوهمية:** ضمان صحة بيانات العقار وملكيته الرسمية قبل النشر.
2. **حسابات الضمان المعتمدة:** حماية العربونات والدفعات المالية من خلال القنوات البنكية الآمنة.
3. **عقود إيجار الإلكترونية:** سندات تنفيذية ملزمة تحمي المؤجر والمستأجر وتضمن حقوق الطرفين.`,
    },
    status: 'published',
    featured: false,
    tags: ['REGA', 'FAL License', 'Ejar', 'Saudi Legal Framework'],
    seo: {
      metaTitle: {
        en: 'REGA & FAL Licensing Guide | HARD Real Estate Regulatory Insights',
        ar: 'دليل رخص فال وتشريعات الهيئة العامة للعقار | هارد للعقارات',
      },
      metaDescription: {
        en: 'Explore mandatory compliance standards, advertising licenses, and escrow protections under REGA in Saudi Arabia.',
        ar: 'تعرف على اشتراطات رخصة فال وعقود الوساطة المعتمدة وحماية حقوق المستثمرين في المملكة.',
      },
      keywords: {
        en: ['REGA Saudi Arabia', 'FAL license real estate', 'Ejar contracts', 'Real estate law Khobar'],
        ar: ['الهيئة العامة للعقار', 'رخصة فال', 'عقود إيجار الموثقة', 'الوساطة العقارية السعودية'],
      },
      ogImage: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80',
    },
  },
  {
    id: 'post-3',
    slug: {
      en: 'luxury-waterfront-living-khobar-shobaily-bay',
      ar: 'al-hayat-al-fakhira-ala-shati-al-khobar-shobaily',
    },
    title: {
      en: 'Why Luxury Waterfront Living in Al Shobaily & Khobar Corniche Outperforms',
      ar: 'لماذا تتفوق العقارات الساحلية في الشبيلي وكورنيش الخُبر استثمارياً؟',
    },
    excerpt: {
      en: 'A strategic review of capital preservation, high occupancy rates, and lifestyle premium in Eastern Province coastal communities.',
      ar: 'تحليل مقارن لمعدلات الإشغال وارتفاع القيمة الإيجارية في المشاريع والواجهات البحرية بالمنطقة الشرقية.',
    },
    category: { en: 'Luxury Living & Architecture', ar: 'الحياة الفاخرة والعمارة' },
    categoryId: 'cat-luxury-living',
    date: 'January 05, 2026',
    publishedAt: '2026-01-05T08:00:00Z',
    readTime: { en: '4 min read', ar: 'قراءة 4 دقائق' },
    author: { en: 'Sultan Al-Ghamdi', ar: 'سلطان الغامدي' },
    authorId: 'auth-sultan',
    authorRole: { en: 'Waterfront Development Strategist', ar: 'أخصائي استراتيجيات المشاريع البحرية' },
    authorAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    imageAlt: {
      en: 'Luxury waterfront modern villa with private pool overlooking the Arabian Gulf in Al Khobar',
      ar: 'فيلا حديثة فاخرة مع مسبح خاص مطلة على الخليج العربي في الخُبر',
    },
    content: {
      en: `Coastal properties in Al Khobar consistently command the highest tenant retention and premium pricing across the Eastern Province.

Driven by the demand for open-air waterfront lifestyles, yacht berthing facilities, and direct proximity to King Fahd Causeway leading to Bahrain, developments such as Al Shobaily Bay represent the pinnacle of modern coastal architecture in Saudi Arabia.`,
      ar: `تسجل العقارات البحرية في مدينة الخُبر أعلى نسب إقبال واستقرار إيجاري بالمنطقة الشرقية، بفضل ما توفره من نمط عيش ساحلي فريد، ومراسي لليخوت، وقرب استراتيجي من جسر الملك فهد المؤدي إلى البحرين.`,
    },
    status: 'published',
    featured: false,
    tags: ['Luxury Villas', 'Al Khobar Corniche', 'Waterfront', 'ROI'],
    seo: {
      metaTitle: {
        en: 'Luxury Waterfront Living in Khobar | HARD Real Estate Insights',
        ar: 'العقارات الساحلية الفاخرة بالخُبر | هارد للعقارات',
      },
      metaDescription: {
        en: 'Discover why coastal assets in Al Shobaily and Khobar Corniche outperform in capital appreciation and rental yield.',
        ar: 'تحليل أداء العقارات الساحلية بالخُبر وعوائد الفلل البحرية في خليج الشبيلي.',
      },
      keywords: {
        en: ['Khobar Waterfront', 'Shobaily Bay Villas', 'Luxury Real Estate Saudi', 'Corniche Properties'],
        ar: ['واجهة الخُبر البحرية', 'فلل خليج الشبيلي', 'عقارات فاخرة السعودية', 'شقق كورنيش الخُبر'],
      },
      ogImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    },
  },
];

/* =========================================================================
   UTILITIES: READING TIME & SLUG GENERATION
   ========================================================================= */

/**
 * Calculates reading time dynamically based on word count.
 * Standard rates: ~200 words/min for English, ~160 words/min for Arabic.
 */
export function calculateReadingTime(contentEn: string, contentAr: string): { en: string; ar: string } {
  const wordsEn = (contentEn || '').trim().split(/\s+/).filter(Boolean).length;
  const wordsAr = (contentAr || '').trim().split(/\s+/).filter(Boolean).length;

  const minutesEn = Math.max(1, Math.ceil(wordsEn / 200));
  const minutesAr = Math.max(1, Math.ceil(wordsAr / 160));

  return {
    en: `${minutesEn} min read`,
    ar: `قراءة ${minutesAr} ${minutesAr === 1 ? 'دقيقة' : minutesAr <= 10 ? 'دقائق' : 'دقيقة'}`,
  };
}

/**
 * Generates clean, URL-safe slugs for English and Arabic.
 */
export function generateSlug(text: string, lang: 'en' | 'ar'): string {
  if (!text) return `article-${Date.now()}`;

  if (lang === 'ar') {
    // Retain Arabic letters, digits, and replace spaces/symbols with dashes
    return text
      .trim()
      .replace(/[^\u0621-\u064A\u0660-\u0669a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || `article-${Date.now()}`;
  }

  // English slug
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || `article-${Date.now()}`;
}

/* =========================================================================
   SANITIZATION & SAFE RICH-TEXT RENDERING
   ========================================================================= */

/**
 * Sanitizes an HTML or markdown-derived string to eliminate script injection,
 * unapproved protocols, and dangerous event handlers.
 */
export function sanitizeHtml(raw: string): string {
  if (!raw) return '';

  let sanitized = raw;

  // 1. Remove script tags and contents
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // 2. Remove dangerous event handlers like onload, onerror, onclick, etc.
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '');

  // 3. Remove javascript: and vbscript: URLs
  sanitized = sanitized.replace(/(href|src)\s*=\s*(['"])\s*(?:javascript|vbscript|data(?!\s*:\s*image)):/gi, '$1=$2#');

  // 4. Remove iframe, object, embed, applet tags
  sanitized = sanitized.replace(/<\/?(iframe|object|embed|applet|form|input|button)\b[^>]*>/gi, '');

  return sanitized;
}

/* =========================================================================
   FIRESTORE SUBSCRIPTIONS & CRUD
   ========================================================================= */

const STORAGE_KEY_POSTS = 'hard_blog_posts_cache_v2';
const STORAGE_KEY_CATEGORIES = 'hard_blog_categories_cache_v2';
const STORAGE_KEY_AUTHORS = 'hard_blog_authors_cache_v2';

/**
 * Normalizes a stored or Firestore blog post object so all fields are sound.
 */
export function normalizeBlogPost(raw: any): BlogPost {
  const id = raw.id || `post-${Date.now()}`;
  const slug = raw.slug
    ? typeof raw.slug === 'object'
      ? { en: raw.slug.en || '', ar: raw.slug.ar || '' }
      : { en: String(raw.slug), ar: String(raw.slug) }
    : { en: `article-${id}`, ar: `article-${id}` };

  const contentEn = raw.content?.en || raw.content_en || '';
  const contentAr = raw.content?.ar || raw.content_ar || '';

  const dynamicReadTime = calculateReadingTime(contentEn, contentAr);

  return {
    id,
    slug,
    title: {
      en: raw.title?.en || raw.title_en || 'Market Insight',
      ar: raw.title?.ar || raw.title_ar || 'تقرير وتحليل عقاري',
    },
    excerpt: {
      en: raw.excerpt?.en || raw.excerpt_en || '',
      ar: raw.excerpt?.ar || raw.excerpt_ar || '',
    },
    category: {
      en: raw.category?.en || raw.category_en || 'Market Intelligence',
      ar: raw.category?.ar || raw.category_ar || 'تقارير وتحليلات السوق',
    },
    categoryId: raw.categoryId || undefined,
    date: raw.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    publishedAt: raw.publishedAt || raw.created_at || new Date().toISOString(),
    readTime: {
      en: raw.readTime?.en || raw.read_time_en || dynamicReadTime.en,
      ar: raw.readTime?.ar || raw.read_time_ar || dynamicReadTime.ar,
    },
    author: {
      en: raw.author?.en || raw.author_en || 'Faisal Al-Otaibi',
      ar: raw.author?.ar || raw.author_ar || 'فيصل العتيبي',
    },
    authorId: raw.authorId || undefined,
    authorRole: raw.authorRole || {
      en: raw.author_role_en || 'Chief Investment Officer',
      ar: raw.author_role_ar || 'رئيس الاستثمار العقاري',
    },
    authorAvatar: raw.authorAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    image: raw.image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    imageAlt: raw.imageAlt || {
      en: raw.title?.en || 'Market Insight Article Image',
      ar: raw.title?.ar || 'صورة المقال العقاري',
    },
    content: {
      en: contentEn,
      ar: contentAr,
    },
    status: (raw.status || raw.publicationStatus || 'published') as BlogStatus,
    featured: Boolean(raw.featured),
    tags: Array.isArray(raw.tags) ? raw.tags : ['Real Estate', 'Vision 2030', 'Investment'],
    seo: raw.seo || {
      metaTitle: { en: raw.title?.en || '', ar: raw.title?.ar || '' },
      metaDescription: { en: raw.excerpt?.en || '', ar: raw.excerpt?.ar || '' },
      keywords: { en: raw.tags || [], ar: raw.tags || [] },
      ogImage: raw.image,
    },
    createdAt: raw.createdAt || raw.created_at,
    updatedAt: raw.updatedAt || raw.updated_at,
  };
}

/**
 * Real-time subscription to Firestore `blog_posts` collection.
 */
export function subscribeBlogPosts(callback: (posts: BlogPost[]) => void): Unsubscribe {
  let initialLoaded = false;

  // 1. Initial cached fallback
  try {
    const cached = localStorage.getItem(STORAGE_KEY_POSTS);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        callback(parsed.map(normalizeBlogPost));
        initialLoaded = true;
      }
    }
  } catch (e) {
    console.warn('[Blog Firestore] Cache read warning:', e);
  }

  if (!initialLoaded) {
    callback(INITIAL_BLOG_POSTS);
  }

  // 2. Real-time Firestore onSnapshot listener
  try {
    const colRef = collection(db, 'blog_posts');
    const unsub = onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: BlogPost[] = [];
          snapshot.forEach((docSnap) => {
            list.push(normalizeBlogPost({ id: docSnap.id, ...docSnap.data() }));
          });
          // Sort by publishedAt or date descending
          list.sort((a, b) => {
            const dateA = new Date(a.publishedAt || a.date).getTime() || 0;
            const dateB = new Date(b.publishedAt || b.date).getTime() || 0;
            return dateB - dateA;
          });

          localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(list));
          callback(list);
        } else {
          // If Firestore is empty, seed with initial catalog
          seedInitialBlogPosts().then((seeded) => {
            callback(seeded);
          });
        }
      },
      (error) => {
        console.warn('[Blog Firestore] Real-time listener notice (using local cache):', error);
      }
    );

    return unsub;
  } catch (err) {
    console.warn('[Blog Firestore] Listener init warning:', err);
    return () => {};
  }
}

/**
 * Real-time subscription to Firestore `blog_categories` collection.
 */
export function subscribeBlogCategories(callback: (categories: BlogCategory[]) => void): Unsubscribe {
  // Local cache fallback
  try {
    const cached = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        callback(parsed);
      }
    }
  } catch {
    // Ignore
  }

  callback(INITIAL_BLOG_CATEGORIES);

  try {
    const colRef = collection(db, 'blog_categories');
    const unsub = onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: BlogCategory[] = [];
          snapshot.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
          list.sort((a, b) => (a.order || 99) - (b.order || 99));
          localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(list));
          callback(list);
        } else {
          seedInitialBlogCategories().then(callback);
        }
      },
      (err) => {
        console.warn('[Blog Categories] Firestore listener notice:', err);
      }
    );
    return unsub;
  } catch {
    return () => {};
  }
}

/**
 * Real-time subscription to Firestore `blog_authors` collection.
 */
export function subscribeBlogAuthors(callback: (authors: BlogAuthor[]) => void): Unsubscribe {
  // Local cache fallback
  try {
    const cached = localStorage.getItem(STORAGE_KEY_AUTHORS);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        callback(parsed);
      }
    }
  } catch {
    // Ignore
  }

  callback(INITIAL_BLOG_AUTHORS);

  try {
    const colRef = collection(db, 'blog_authors');
    const unsub = onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: BlogAuthor[] = [];
          snapshot.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
          list.sort((a, b) => (a.order || 99) - (b.order || 99));
          localStorage.setItem(STORAGE_KEY_AUTHORS, JSON.stringify(list));
          callback(list);
        } else {
          seedInitialBlogAuthors().then(callback);
        }
      },
      (err) => {
        console.warn('[Blog Authors] Firestore listener notice:', err);
      }
    );
    return unsub;
  } catch {
    return () => {};
  }
}

/* =========================================================================
   SEEDING HELPERS
   ========================================================================= */

export async function seedInitialBlogPosts(): Promise<BlogPost[]> {
  try {
    for (const post of INITIAL_BLOG_POSTS) {
      const docRef = doc(db, 'blog_posts', post.id);
      await setDoc(docRef, { ...post, updatedAt: new Date().toISOString() }, { merge: true });
    }
  } catch (err) {
    console.warn('[Blog Firestore] Seeding notice:', err);
  }
  return INITIAL_BLOG_POSTS;
}

export async function seedInitialBlogCategories(): Promise<BlogCategory[]> {
  try {
    for (const cat of INITIAL_BLOG_CATEGORIES) {
      const docRef = doc(db, 'blog_categories', cat.id);
      await setDoc(docRef, { ...cat, updatedAt: new Date().toISOString() }, { merge: true });
    }
  } catch (err) {
    console.warn('[Blog Categories] Seeding notice:', err);
  }
  return INITIAL_BLOG_CATEGORIES;
}

export async function seedInitialBlogAuthors(): Promise<BlogAuthor[]> {
  try {
    for (const author of INITIAL_BLOG_AUTHORS) {
      const docRef = doc(db, 'blog_authors', author.id);
      await setDoc(docRef, { ...author, updatedAt: new Date().toISOString() }, { merge: true });
    }
  } catch (err) {
    console.warn('[Blog Authors] Seeding notice:', err);
  }
  return INITIAL_BLOG_AUTHORS;
}

/* =========================================================================
   MUTATION OPERATIONS (POSTS, CATEGORIES, AUTHORS)
   ========================================================================= */

/**
 * Saves (create or update) a blog post in Firestore.
 */
export async function saveBlogPostDoc(postData: Partial<BlogPost>): Promise<BlogPost> {
  const id = postData.id || `post-${Date.now()}`;
  const now = new Date().toISOString();

  // Auto-calculate reading time if not explicitly provided
  const readingTime = postData.readTime || calculateReadingTime(postData.content?.en || '', postData.content?.ar || '');

  // Auto-generate slugs if missing
  const slug = postData.slug
    ? typeof postData.slug === 'object'
      ? postData.slug
      : { en: String(postData.slug), ar: String(postData.slug) }
    : {
        en: generateSlug(postData.title?.en || '', 'en'),
        ar: generateSlug(postData.title?.ar || '', 'ar'),
      };

  const normalized: BlogPost = {
    ...normalizeBlogPost(postData),
    id,
    slug,
    readTime: readingTime,
    updatedAt: now,
    publishedAt: postData.publishedAt || now,
  };

  try {
    const docRef = doc(db, 'blog_posts', id);
    await setDoc(docRef, normalized, { merge: true });
  } catch (err) {
    console.warn('[Blog Firestore] Save to Firestore warning:', err);
  }

  // Update local cache
  try {
    const cached = localStorage.getItem(STORAGE_KEY_POSTS);
    const list: BlogPost[] = cached ? JSON.parse(cached) : INITIAL_BLOG_POSTS;
    const existingIdx = list.findIndex((p) => p.id === id);
    if (existingIdx >= 0) {
      list[existingIdx] = normalized;
    } else {
      list.unshift(normalized);
    }
    localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(list));
  } catch {
    // Ignore
  }

  return normalized;
}

/**
 * Deletes a blog post from Firestore.
 */
export async function deleteBlogPostDoc(id: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'blog_posts', id);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('[Blog Firestore] Delete warning:', err);
  }

  try {
    const cached = localStorage.getItem(STORAGE_KEY_POSTS);
    if (cached) {
      const list: BlogPost[] = JSON.parse(cached);
      const filtered = list.filter((p) => p.id !== id);
      localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(filtered));
    }
  } catch {
    // Ignore
  }

  return true;
}

/**
 * Saves a blog category in Firestore.
 */
export async function saveBlogCategoryDoc(catData: Partial<BlogCategory>): Promise<BlogCategory> {
  const id = catData.id || `cat-${Date.now()}`;
  const now = new Date().toISOString();

  const category: BlogCategory = {
    id,
    slug: catData.slug || {
      en: generateSlug(catData.name?.en || '', 'en'),
      ar: generateSlug(catData.name?.ar || '', 'ar'),
    },
    name: catData.name || { en: 'New Category', ar: 'تصنيف جديد' },
    description: catData.description || { en: '', ar: '' },
    color: catData.color || 'from-blue-600 to-sky-500',
    order: catData.order ?? 99,
    updatedAt: now,
    createdAt: catData.createdAt || now,
  };

  try {
    const docRef = doc(db, 'blog_categories', id);
    await setDoc(docRef, category, { merge: true });
  } catch (err) {
    console.warn('[Blog Categories] Save warning:', err);
  }

  return category;
}

/**
 * Deletes a blog category from Firestore.
 */
export async function deleteBlogCategoryDoc(id: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'blog_categories', id);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.warn('[Blog Categories] Delete warning:', err);
    return false;
  }
}

/**
 * Saves a blog author in Firestore.
 */
export async function saveBlogAuthorDoc(authorData: Partial<BlogAuthor>): Promise<BlogAuthor> {
  const id = authorData.id || `auth-${Date.now()}`;
  const now = new Date().toISOString();

  const author: BlogAuthor = {
    id,
    slug: authorData.slug || {
      en: generateSlug(authorData.name?.en || '', 'en'),
      ar: generateSlug(authorData.name?.ar || '', 'ar'),
    },
    name: authorData.name || { en: 'Author Name', ar: 'اسم الكاتب' },
    role: authorData.role || { en: 'Contributing Analyst', ar: 'محلل ومستشار عقاري' },
    bio: authorData.bio || { en: '', ar: '' },
    avatar: authorData.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    email: authorData.email || '',
    linkedin: authorData.linkedin || '',
    order: authorData.order ?? 99,
    updatedAt: now,
    createdAt: authorData.createdAt || now,
  };

  try {
    const docRef = doc(db, 'blog_authors', id);
    await setDoc(docRef, author, { merge: true });
  } catch (err) {
    console.warn('[Blog Authors] Save warning:', err);
  }

  return author;
}

/**
 * Deletes a blog author from Firestore.
 */
export async function deleteBlogAuthorDoc(id: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'blog_authors', id);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.warn('[Blog Authors] Delete warning:', err);
    return false;
  }
}

/* =========================================================================
   ORPHANED REFERENCE PREVENTION & CASCADING REASSIGNMENT
   ========================================================================= */

export interface ReferenceCheckResult {
  canDelete: boolean;
  count: number;
  messageEn: string;
  messageAr: string;
  affectedPosts: { id: string; titleEn: string; titleAr: string }[];
}

/**
 * Checks whether a Category can be safely deleted or if existing articles reference it.
 */
export function checkCategoryDeletionSafety(categoryId: string, categoryNameEn: string, posts: BlogPost[]): ReferenceCheckResult {
  const matching = posts.filter(
    (p) => p.categoryId === categoryId || p.category?.en?.trim().toLowerCase() === categoryNameEn.trim().toLowerCase()
  );

  if (matching.length > 0) {
    return {
      canDelete: false,
      count: matching.length,
      messageEn: `Cannot delete category: ${matching.length} article(s) are currently assigned to it. Reassign these articles before deleting.`,
      messageAr: `لا يمكن حذف هذا التصنيف: يوجد ${matching.length} مقال مرتبط به حالياً. يرجى إعادة تعيين المقالات إلى تصنيف آخر أولاً.`,
      affectedPosts: matching.map((p) => ({ id: p.id, titleEn: p.title.en, titleAr: p.title.ar })),
    };
  }

  return {
    canDelete: true,
    count: 0,
    messageEn: 'Category has no linked articles and can be safely deleted.',
    messageAr: 'التصنيف غير مرتبط بأي مقالات ويمكن حذفه بأمان.',
    affectedPosts: [],
  };
}

/**
 * Safely reassigns all articles pointing to old category to a new target category.
 */
export async function reassignCategoryCascade(
  oldCategoryId: string,
  oldCategoryNameEn: string,
  targetCategory: BlogCategory,
  posts: BlogPost[]
): Promise<number> {
  const affected = posts.filter(
    (p) => p.categoryId === oldCategoryId || p.category?.en?.trim().toLowerCase() === oldCategoryNameEn.trim().toLowerCase()
  );

  for (const post of affected) {
    const updated: Partial<BlogPost> = {
      ...post,
      categoryId: targetCategory.id,
      category: targetCategory.name,
    };
    await saveBlogPostDoc(updated);
  }

  return affected.length;
}

/**
 * Checks whether an Author can be safely deleted or if existing articles reference them.
 */
export function checkAuthorDeletionSafety(authorId: string, authorNameEn: string, posts: BlogPost[]): ReferenceCheckResult {
  const matching = posts.filter(
    (p) => p.authorId === authorId || p.author?.en?.trim().toLowerCase() === authorNameEn.trim().toLowerCase()
  );

  if (matching.length > 0) {
    return {
      canDelete: false,
      count: matching.length,
      messageEn: `Cannot delete author: ${matching.length} article(s) are credited to them. Reassign these articles to another author first.`,
      messageAr: `لا يمكن حذف هذا الكاتب: يوجد ${matching.length} مقال منسوب إليه. يرجى نقل المقالات إلى كاتب آخر أولاً.`,
      affectedPosts: matching.map((p) => ({ id: p.id, titleEn: p.title.en, titleAr: p.title.ar })),
    };
  }

  return {
    canDelete: true,
    count: 0,
    messageEn: 'Author has no linked articles and can be safely deleted.',
    messageAr: 'الكاتب غير منسوب إليه أي مقالات ويمكن حذفه بأمان.',
    affectedPosts: [],
  };
}

/**
 * Safely reassigns all articles credited to an old author to a new author.
 */
export async function reassignAuthorCascade(
  oldAuthorId: string,
  oldAuthorNameEn: string,
  targetAuthor: BlogAuthor,
  posts: BlogPost[]
): Promise<number> {
  const affected = posts.filter(
    (p) => p.authorId === oldAuthorId || p.author?.en?.trim().toLowerCase() === oldAuthorNameEn.trim().toLowerCase()
  );

  for (const post of affected) {
    const updated: Partial<BlogPost> = {
      ...post,
      authorId: targetAuthor.id,
      author: targetAuthor.name,
      authorRole: targetAuthor.role,
      authorAvatar: targetAuthor.avatar,
    };
    await saveBlogPostDoc(updated);
  }

  return affected.length;
}

/**
 * Cascades updates to an author (name, role, avatar) across all articles referencing their authorId.
 */
export async function syncAuthorDetailsCascade(author: BlogAuthor, posts: BlogPost[]): Promise<void> {
  const affected = posts.filter((p) => p.authorId === author.id);
  for (const post of affected) {
    await saveBlogPostDoc({
      ...post,
      author: author.name,
      authorRole: author.role,
      authorAvatar: author.avatar,
    });
  }
}

/**
 * Cascades updates to a category (name) across all articles referencing their categoryId.
 */
export async function syncCategoryDetailsCascade(category: BlogCategory, posts: BlogPost[]): Promise<void> {
  const affected = posts.filter((p) => p.categoryId === category.id);
  for (const post of affected) {
    await saveBlogPostDoc({
      ...post,
      category: category.name,
    });
  }
}
