import { Language, PageId } from '../types';

export interface PageTitleOptions {
  page: PageId;
  language: Language;
  propertyTitle?: {
    ar: string;
    en: string;
  } | null;
  constructionProjectTitle?: {
    ar: string;
    en: string;
  } | null;
  isConstructionCMS?: boolean;
  isConstructionProjectList?: boolean;
  isConstructionUnknownProject?: boolean;
  isHvacCMS?: boolean;
  articleTitle?: {
    ar: string;
    en: string;
  } | null;
}

/**
 * Returns the localized document title for a given page, sector, and state.
 */
export function getPageTitle(options: PageTitleOptions): string {
  const { page, language } = options;
  const isAr = language === 'ar';

  switch (page) {
    case 'portal':
      return isAr
        ? 'مجموعة هارد | بوابة المجموعة القابضة'
        : 'HARD Group | Corporate Group Portal';

    case 'home':
      return isAr
        ? 'هارد للعقارات | الريادة في الوساطة والتسويق العقاري'
        : 'HARD Real Estate | Premier Marketing & Brokerage';

    case 'properties':
      return isAr
        ? 'العقارات المتاحة للبيع والإيجار | هارد للعقارات'
        : 'Available Property Listings | HARD Real Estate';

    case 'property-details':
      if (options.propertyTitle) {
        const title = isAr ? options.propertyTitle.ar : options.propertyTitle.en;
        return isAr
          ? `${title} | هارد للعقارات`
          : `${title} | HARD Real Estate`;
      }
      return isAr
        ? 'تفاصيل العقار | هارد للعقارات'
        : 'Property Details | HARD Real Estate';

    case 'projects':
      return isAr
        ? 'المشاريع التطويرية الكبرى | هارد للعقارات'
        : 'Master Projects & New Launches | HARD Real Estate';

    case 'blog':
      if (options.articleTitle) {
        const title = isAr ? options.articleTitle.ar : options.articleTitle.en;
        return isAr
          ? `${title} | هارد للعقارات`
          : `${title} | HARD Real Estate`;
      }
      return isAr
        ? 'المقالات والتقارير العقارية | هارد للعقارات'
        : 'Real Estate Insights & Articles | HARD Real Estate';

    case 'marketing':
      return isAr
        ? 'خدمات التسويق والوساطة العقارية | هارد للعقارات'
        : 'Real Estate Marketing & Advisory | HARD Real Estate';

    case 'about':
      return isAr
        ? 'من نحن | هارد للعقارات'
        : 'About Us | HARD Real Estate';

    case 'contact':
      return isAr
        ? 'تواصل معنا | هارد للعقارات'
        : 'Contact Us | HARD Real Estate';

    case 'admin':
      return isAr
        ? 'لوحة التحكم العقارية | هارد للعقارات'
        : 'Real Estate CMS Admin | HARD Real Estate';

    case 'construction':
      if (options.isConstructionCMS) {
        return isAr
          ? 'إدارة محتوى المشاريع الإنشائية | هارد للمقاولات'
          : 'Construction CMS | HARD Contracting';
      }
      if (options.constructionProjectTitle) {
        const title = isAr
          ? options.constructionProjectTitle.ar
          : options.constructionProjectTitle.en;
        return isAr
          ? `${title} | هارد للمقاولات`
          : `${title} | HARD Contracting`;
      }
      if (options.isConstructionUnknownProject) {
        return isAr
          ? 'المشروع غير موجود | هارد للمقاولات'
          : 'Project Not Found | HARD Contracting';
      }
      if (options.isConstructionProjectList) {
        return isAr
          ? 'المشاريع الإنشائية | هارد للمقاولات'
          : 'Construction Projects | HARD Contracting';
      }
      return isAr
        ? 'هارد للمقاولات العامة والإنشاءات | مجموعة هارد'
        : 'HARD Contracting & General Construction | HARD Group';

    case 'hvac':
      if (options.isHvacCMS) {
        return isAr
          ? 'إدارة محتوى التكييف | هارد للتكييف والصيانة'
          : 'HVAC CMS Dashboard | HARD HVAC Maintenance';
      }
      return isAr
        ? 'هارد لصيانة وتكييف الهواء | مجموعة هارد'
        : 'HARD HVAC Maintenance | HARD Group';

    case 'not-found':
      return isAr
        ? '404 - الصفحة غير موجودة | مجموعة هارد'
        : '404 - Page Not Found | HARD Group';

    default:
      return isAr
        ? 'مجموعة هارد | بوابة المجموعة القابضة'
        : 'HARD Group | Corporate Group Portal';
  }
}

/**
 * Returns localized meta description for each page/sector.
 */
export function getPageDescription(options: PageTitleOptions): string {
  const { page, language } = options;
  const isAr = language === 'ar';

  switch (page) {
    case 'portal':
      return isAr
        ? 'مجموعة هارد القابضة - البوابة الموحدة لقطاعات العقارات والإنشاءات والمقاولات العامة وصيانة وتكييف الهواء في المملكة العربية السعودية.'
        : 'HARD Group Corporate Portal - Unified multi-sector platform for Real Estate Advisory, General Contracting & Construction, and HVAC Maintenance across Saudi Arabia.';

    case 'home':
      return isAr
        ? 'شركة هارد للعقارات - منصة وساطة وتسويق عقاري رائدة في المملكة العربية السعودية، معتمدة من الهيئة العامة للعقار (فال).'
        : 'HARD Real Estate - Premier Saudi real estate marketing and certified brokerage platform for prime residential, luxury, and commercial properties.';

    case 'properties':
      return isAr
        ? 'استعرض أحدث العقارات الموثقة، الفلل الفاخرة، الشقق السكنية، والبنتهاوس المتاحة للبيع والإيجار في الرياض والمنطقة الشرقية.'
        : 'Explore verified apartments, luxury villas, modern penthouses, and commercial real estate available for sale and rent across Saudi Arabia.';

    case 'projects':
      return isAr
        ? 'استكشف كبرى المشاريع التطويرية والمخططات السكنية والتجارية الجديدة مع خطط سداد مرنة وعوائد استثمارية واعدة.'
        : 'Discover prime residential and commercial master developments with flexible payment milestones and strong capital appreciation.';

    case 'blog':
      return isAr
        ? 'تحليلات متعمقة لاتجاهات السوق العقاري السعودي، وأدلة الاستثمار، ودراسات العوائد الإيجارية والتنظيمات المعتمدة.'
        : 'Expert market analysis on Saudi property investment trends, market forecasts, legal guides, and buyer playbooks.';

    case 'construction':
      return isAr
        ? 'الذراع الهندسي والإنشائي لمجموعة هارد - مقاولات عامة مصنفة فئة أولى، تنفيذ الأبراج والمجمعات التجارية والسكنية وفق كود البناء السعودي.'
        : 'Class-A certified general contractor delivering turnkey commercial towers, residential communities, and infrastructure with Saudi Building Code compliance.';

    case 'hvac':
      return isAr
        ? 'الذراع التخصصي للخدمات الكهروميكانيكية والتبريد - عقود صيانة وقائية للمكيفات المركزية والتشيلرات وأنظمة VRF وطوارئ على مدار 24/7.'
        : 'Specialized electro-mechanical engineering services providing chiller overhauls, VRF installations, smart climate automation, and 24/7 emergency dispatch.';

    case 'not-found':
      return isAr
        ? 'عذراً، الصفحة أو الرابط المطلوب غير متوفر أو تم نقله في بوابة مجموعة هارد.'
        : 'The requested page or link does not exist or has been moved across HARD Group sectors.';

    default:
      return isAr
        ? 'مجموعة هارد - ريادة الأعمال والاستثمار في قطاعات العقارات والمقاولات والتكييف.'
        : 'HARD Group - Excellence across Real Estate, Construction, and HVAC sectors in Saudi Arabia.';
  }
}

/**
 * Updates document.title and synchronization meta tags (og:title, twitter:title, description).
 */
export function updateDocumentTitle(title: string, description?: string): void {
  if (typeof document === 'undefined') return;

  document.title = title;

  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) {
    ogTitle.setAttribute('content', title);
  }

  const twitterTitle = document.querySelector('meta[name="twitter:title"]');
  if (twitterTitle) {
    twitterTitle.setAttribute('content', title);
  }

  if (description) {
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description);
    }
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute('content', description);
    }
    const twitterDesc = document.querySelector('meta[name="twitter:description"]');
    if (twitterDesc) {
      twitterDesc.setAttribute('content', description);
    }
  }
}
