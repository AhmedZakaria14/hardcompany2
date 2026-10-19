import DOMPurify from 'dompurify';
import { BlogPost, BlogCategory, BlogAuthor, Language } from '../types';

/**
 * Initial Default Blog Categories for HARD Real Estate
 */
export const INITIAL_BLOG_CATEGORIES: BlogCategory[] = [
  {
    id: 'cat-market-intel',
    name: {
      en: 'Market Intelligence',
      ar: 'دراسات وتقارير السوق',
    },
    slug: {
      en: 'market-intelligence',
      ar: 'دراسات-وتقارير-السوق',
    },
    description: {
      en: 'Macroeconomic analysis, property yield indices, and demographic expansion in Eastern Province.',
      ar: 'تحليلات اقتصادية كلية، مؤشرات عوائد الأصول العقارية، وحركة النمو الديموغرافي بالمنطقة الشرقية.',
    },
    color: 'blue',
    order: 1,
  },
  {
    id: 'cat-invest-guide',
    name: {
      en: 'Investment Strategy',
      ar: 'استراتيجيات الاستثمار',
    },
    slug: {
      en: 'investment-strategy',
      ar: 'استراتيجيات-الاستثمار',
    },
    description: {
      en: 'Institutional portfolio construction, luxury waterfront yields, and off-plan capital growth.',
      ar: 'بناء المحافظ العقارية المؤسسية، عوائد الأصول البحرية الفاخرة، ونمو رأس المال على الخارطة.',
    },
    color: 'emerald',
    order: 2,
  },
  {
    id: 'cat-regulations',
    name: {
      en: 'Regulatory Insights',
      ar: 'إرشادات وتنظيمات عقارية',
    },
    slug: {
      en: 'regulatory-insights',
      ar: 'إرشادات-وتنظيمات-عقارية',
    },
    description: {
      en: 'REGA legislation, FAL brokerage compliance, Ejar escrow protections, and foreign ownership bylaws.',
      ar: 'تشريعات الهيئة العامة للعقار، تراخيص فال للوساطة، حماية حسابات الضمان، ولوائح التملك الأجنبي.',
    },
    color: 'amber',
    order: 3,
  },
  {
    id: 'cat-luxury-living',
    name: {
      en: 'Luxury Living & Architecture',
      ar: 'العيش الفاخر والهندسة المعمارية',
    },
    slug: {
      en: 'luxury-living',
      ar: 'العيش-الفاخر-والهندسة-المعمارية',
    },
    description: {
      en: 'Architectural waterfront estates, smart villa automation, and bespoke master developments.',
      ar: 'قصور وفلل الواجهات البحرية، أنظمة المنازل الذكية، والتصاميم المعمارية الأيقونية.',
    },
    color: 'purple',
    order: 4,
  },
];

/**
 * Initial Default Authors for HARD Real Estate
 */
export const INITIAL_BLOG_AUTHORS: BlogAuthor[] = [
  {
    id: 'auth-faisal',
    name: {
      en: 'Faisal Al-Otaibi',
      ar: 'فيصل العتيبي',
    },
    role: {
      en: 'Chief Investment Officer',
      ar: 'رئيس الاستثمار العقاري',
    },
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    bio: {
      en: 'Over 16 years leading real estate investment strategy and private wealth advisory in the Eastern Province.',
      ar: 'أكثر من 16 عاماً في إدارة استراتيجيات الاستثمار العقاري واستشارات الثروات الخاصة بالمنطقة الشرقية.',
    },
    email: 'faisal@hardrealestate.sa',
  },
  {
    id: 'auth-reem',
    name: {
      en: 'Reem Al-Qahtani',
      ar: 'ريم القحطاني',
    },
    role: {
      en: 'Head of Legal & Regulatory Compliance',
      ar: 'رئيس الشؤون القانونية والامتثال العقاري',
    },
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    bio: {
      en: 'Specialized in REGA institutional compliance, FAL licensing, escrow structuring, and foreign property ownership laws.',
      ar: 'متخصصة في الامتثال التنظيمي للأنشطة العقارية، وتراخيص فال، وهيكلة حسابات الضمان والتملك الأجنبي.',
    },
    email: 'reem@hardrealestate.sa',
  },
  {
    id: 'auth-sultan',
    name: {
      en: 'Sultan Al-Ghamdi',
      ar: 'سلطان الغامدي',
    },
    role: {
      en: 'Senior Waterfront Portfolio Director',
      ar: 'مدير محفظة العقارات والواجهات البحرية',
    },
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
    bio: {
      en: 'Directing luxury prime coastal acquisitions across Khobar Corniche, Al Shobaily Bay, and Dammam Marina.',
      ar: 'إدارة وتطوير الاستثمارات الساحلية الفاخرة على كورنيش الخُبر وخليج الشبيلي وواجهات الدمام.',
    },
    email: 'sultan@hardrealestate.sa',
  },
];

/**
 * Calculates bilingual reading time from the article body.
 * Average reading speed:
 * - English: ~200-220 words per minute
 * - Arabic: ~160 words per minute
 */
export function calculateReadingTime(contentEn: string = '', contentAr: string = ''): {
  minutesEn: number;
  minutesAr: number;
  wordsEn: number;
  wordsAr: number;
  readTime: { en: string; ar: string };
} {
  // Strip tags and special formatting characters
  const cleanEn = contentEn
    .replace(/<[^>]*>/g, ' ')
    .replace(/[#*_`~>\\-]/g, ' ')
    .trim();

  const cleanAr = contentAr
    .replace(/<[^>]*>/g, ' ')
    .replace(/[#*_`~>\\-]/g, ' ')
    .trim();

  // Word extraction
  const wordsEn = cleanEn ? (cleanEn.match(/[a-zA-Z0-9_\u00C0-\u024F]+/g) || []).length : 0;
  const wordsAr = cleanAr ? (cleanAr.match(/[\u0600-\u06FFa-zA-Z0-9]+/g) || []).length : 0;

  const minutesEn = Math.max(1, Math.ceil(wordsEn / 200));
  const minutesAr = Math.max(1, Math.ceil(wordsAr / 160));

  return {
    minutesEn,
    minutesAr,
    wordsEn,
    wordsAr,
    readTime: {
      en: `${minutesEn} min read`,
      ar: `قراءة ${minutesAr} ${minutesAr <= 10 ? 'دقائق' : 'دقيقة'}`,
    },
  };
}

/**
 * Generates URL-safe localized slugs from title.
 */
export function generateLocalizedSlug(title: string, language: 'en' | 'ar'): string {
  if (!title) return '';

  if (language === 'en') {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Arabic slug: preserve Arabic unicode range 0600-06FF, latin letters and digits
  return title
    .trim()
    .replace(/[^\u0600-\u06FFa-zA-Z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Safely extracts canonical or localized slug string from BlogPost
 */
export function getBlogSlug(post: BlogPost, language: Language): string {
  if (!post) return '';

  if (post.slugLocalized && post.slugLocalized[language]) {
    return post.slugLocalized[language];
  }

  if (typeof post.slug === 'object' && post.slug !== null) {
    const slugObj = post.slug as { en?: string; ar?: string };
    if (slugObj[language]) return slugObj[language]!;
    if (slugObj.en) return slugObj.en;
    if (slugObj.ar) return slugObj.ar;
  }

  if (typeof post.slug === 'string' && post.slug.trim()) {
    return post.slug.trim();
  }

  if (post.title && post.title[language]) {
    return generateLocalizedSlug(post.title[language], language);
  }

  return post.id;
}

/**
 * Color classes mapping for category badges
 */
export function getCategoryBadgeClasses(color?: string): {
  badge: string;
  dot: string;
  border: string;
} {
  switch (color) {
    case 'emerald':
    case 'green':
      return {
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
        border: 'border-emerald-500',
      };
    case 'amber':
    case 'yellow':
      return {
        badge: 'bg-amber-50 text-amber-800 border-amber-200',
        dot: 'bg-amber-500',
        border: 'border-amber-500',
      };
    case 'purple':
    case 'indigo':
      return {
        badge: 'bg-purple-50 text-purple-700 border-purple-200',
        dot: 'bg-purple-500',
        border: 'border-purple-500',
      };
    case 'rose':
    case 'red':
      return {
        badge: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
        border: 'border-rose-500',
      };
    case 'blue':
    default:
      return {
        badge: 'bg-blue-50 text-blue-700 border-blue-200',
        dot: 'bg-blue-500',
        border: 'border-blue-500',
      };
  }
}

/**
 * Sanitizes rich HTML content using DOMPurify with strict allowlist.
 * Ensures zero script injection, safe attributes, and external link security.
 */
export function sanitizeHtmlContent(html: string): string {
  if (!html) return '';

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'b',
      'em',
      'i',
      'u',
      's',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'ul',
      'ol',
      'li',
      'blockquote',
      'pre',
      'code',
      'a',
      'img',
      'hr',
      'div',
      'span',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
    ],
    ALLOWED_ATTR: [
      'href',
      'target',
      'rel',
      'src',
      'alt',
      'title',
      'class',
      'loading',
      'width',
      'height',
      'dir',
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
    ADD_ATTR: ['target', 'rel'],
    FORCE_BODY: true,
  });
}

/**
 * Converts Markdown or structured text into safe sanitized HTML.
 * Supports headings (#, ##, ###), bold (**), italic (*), blockquotes (>),
 * bullet lists (- or *), numbered lists (1.), callouts ([!NOTE]), and paragraphs.
 */
export function renderRichContentToHtml(content: string): string {
  if (!content) return '';

  // Check if content already contains HTML block tags
  const hasHtml = /<\/?(p|h[1-6]|ul|ol|li|blockquote|div|table)[^>]*>/i.test(content);

  if (hasHtml) {
    return sanitizeHtmlContent(content);
  }

  // Parse markdown lines
  const lines = content.split('\n');
  const htmlParts: string[] = [];
  let inUl = false;
  let inOl = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // End open lists if empty line or non-list line
    if (!line.startsWith('- ') && !line.startsWith('* ') && !/^\d+\.\s/.test(line)) {
      if (inUl) {
        htmlParts.push('</ul>');
        inUl = false;
      }
      if (inOl) {
        htmlParts.push('</ol>');
        inOl = false;
      }
    }

    if (!line) {
      continue;
    }

    // Heading 1
    if (line.startsWith('# ')) {
      htmlParts.push(`<h2>${formatInlineMarkdown(line.substring(2))}</h2>`);
      continue;
    }

    // Heading 2
    if (line.startsWith('## ')) {
      htmlParts.push(`<h2>${formatInlineMarkdown(line.substring(3))}</h2>`);
      continue;
    }

    // Heading 3
    if (line.startsWith('### ')) {
      htmlParts.push(`<h3>${formatInlineMarkdown(line.substring(4))}</h3>`);
      continue;
    }

    // Heading 4
    if (line.startsWith('#### ')) {
      htmlParts.push(`<h4>${formatInlineMarkdown(line.substring(5))}</h4>`);
      continue;
    }

    // Blockquote or Callout
    if (line.startsWith('> ')) {
      const quoteText = line.substring(2);
      htmlParts.push(`<blockquote><p>${formatInlineMarkdown(quoteText)}</p></blockquote>`);
      continue;
    }

    // Unordered list item
    if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inUl) {
        htmlParts.push('<ul>');
        inUl = true;
      }
      htmlParts.push(`<li>${formatInlineMarkdown(line.substring(2))}</li>`);
      continue;
    }

    // Ordered list item
    const olMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (olMatch) {
      if (!inOl) {
        htmlParts.push('<ol>');
        inOl = true;
      }
      htmlParts.push(`<li>${formatInlineMarkdown(olMatch[2])}</li>`);
      continue;
    }

    // Horizontal Rule
    if (line === '---' || line === '***' || line === '___') {
      htmlParts.push('<hr />');
      continue;
    }

    // Regular paragraph
    htmlParts.push(`<p>${formatInlineMarkdown(line)}</p>`);
  }

  if (inUl) htmlParts.push('</ul>');
  if (inOl) htmlParts.push('</ol>');

  const rawResult = htmlParts.join('\n');
  return sanitizeHtmlContent(rawResult);
}

/**
 * Formats inline bold, italic, code, and links within a string.
 */
function formatInlineMarkdown(text: string): string {
  let formatted = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Bold: **text** or __text__
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/__(.*?)__/g, '<strong>$1</strong>');

  // Italic: *text* or _text_
  formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
  formatted = formatted.replace(/_(.*?)_/g, '<em>$1</em>');

  // Inline code: `code`
  formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Links: [text](url)
  formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  return formatted;
}
