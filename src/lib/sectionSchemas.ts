import { LocalizedText, SectorId } from '../types/firestore-schema';
import { SectorScope } from '../types/businessEntities';

export type RegisteredSectionType =
  | 'hero'
  | 'text_block'
  | 'image_banner'
  | 'statistics'
  | 'feature_list'
  | 'card_grid'
  | 'faq_accordion'
  | 'cta_banner'
  | 'image_gallery'
  | 'team'
  | 'offices'
  | 'certifications'
  | 'partners'
  | 'testimonials';

export interface StatItem {
  id: string;
  value: string;
  label: LocalizedText;
  iconName?: string;
}

export interface FeatureItem {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  iconName?: string;
}

export interface CardItem {
  id: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  imageUrl: string;
  linkUrl?: string;
}

export interface FaqItem {
  id: string;
  question: LocalizedText;
  answer: LocalizedText;
}

export interface GalleryItem {
  id: string;
  imageUrl: string;
  caption?: LocalizedText;
}

export interface HeroContent {
  title: LocalizedText;
  subtitle: LocalizedText;
  bgImageUrl: string;
  primaryCtaText: LocalizedText;
  primaryCtaUrl: string;
  secondaryCtaText?: LocalizedText;
  secondaryCtaUrl?: string;
}

export interface TextBlockContent {
  heading: LocalizedText;
  subheading?: LocalizedText;
  bodyParagraphs: LocalizedText;
  alignment: 'start' | 'center';
}

export interface ImageBannerContent {
  imageUrl: string;
  altText: LocalizedText;
  overlayBadge?: LocalizedText;
  headline?: LocalizedText;
  linkUrl?: string;
}

export interface StatisticsContent {
  heading: LocalizedText;
  subheading?: LocalizedText;
  items?: StatItem[];
  sectorFilter?: SectorScope;
  selectedEntityIds?: string[];
}

export interface FeatureListContent {
  heading: LocalizedText;
  description?: LocalizedText;
  items: FeatureItem[];
}

export interface CardGridContent {
  heading: LocalizedText;
  subheading?: LocalizedText;
  columns: 2 | 3 | 4;
  cards: CardItem[];
}

export interface FaqAccordionContent {
  heading: LocalizedText;
  subheading?: LocalizedText;
  faqs?: FaqItem[];
  sectorFilter?: SectorScope;
  selectedEntityIds?: string[];
}

export interface CtaBannerContent {
  title: LocalizedText;
  subtitle: LocalizedText;
  primaryCtaText: LocalizedText;
  primaryCtaUrl: string;
  secondaryCtaText?: LocalizedText;
  secondaryCtaUrl?: string;
  styleVariant: 'gradient' | 'dark' | 'accent';
}

export interface ImageGalleryContent {
  heading: LocalizedText;
  subheading?: LocalizedText;
  images: GalleryItem[];
}

export interface EntityReferenceContent {
  heading: LocalizedText;
  subheading?: LocalizedText;
  sectorFilter?: SectorScope;
  selectedEntityIds?: string[];
}

export type SectionPayload =
  | HeroContent
  | TextBlockContent
  | ImageBannerContent
  | StatisticsContent
  | FeatureListContent
  | CardGridContent
  | FaqAccordionContent
  | CtaBannerContent
  | ImageGalleryContent
  | EntityReferenceContent;

export interface PageSection {
  id: string;
  type: RegisteredSectionType;
  title: LocalizedText; // Administrative or display title
  isVisible: boolean;
  order: number;
  content: SectionPayload;
  createdAt: string;
  updatedAt: string;
}

export interface PageDocument {
  id: string; // e.g., 'page_portal', 'page_realestate_home'
  slug: string;
  sector: SectorId;
  title: LocalizedText;
  sections: PageSection[];
  publicationStatus: 'draft' | 'published';
  updatedAt: string;
  updatedBy?: string;
}

// Registry of supported section types with metadata
export const REGISTERED_SECTION_TYPES: {
  type: RegisteredSectionType;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  defaultContent: SectionPayload;
}[] = [
  {
    type: 'hero',
    nameAr: 'قسم البانر الرئيسي (Hero Banner)',
    nameEn: 'Hero Banner Section',
    descriptionAr: 'عنوان كاسح، خلفية صورية مكثفة، وأزرار توجيه رئيسية',
    descriptionEn: 'Prominent headline, immersive background image, and call-to-action buttons',
    defaultContent: {
      title: { ar: 'مجموعة هارد القابضة', en: 'HARD Group Holding' },
      subtitle: { ar: 'الريادة والتميز في العقارات والإنشاءات وأنظمة التكييف بالمملكة', en: 'Pioneering Excellence Across Real Estate, Construction & HVAC' },
      bgImageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80',
      primaryCtaText: { ar: 'استكشف عقاراتنا', en: 'Explore Properties' },
      primaryCtaUrl: '/realestate/properties',
      secondaryCtaText: { ar: 'تواصل معنا', en: 'Contact Us' },
      secondaryCtaUrl: '/realestate/contact',
    } as HeroContent,
  },
  {
    type: 'text_block',
    nameAr: 'فقرة نصية ومحتوى تعريفي',
    nameEn: 'Structured Text Block',
    descriptionAr: 'عناوين فرعية وفقرات نصية غنية منسقة بدقة',
    descriptionEn: 'Structured headings, subheadings, and readable body paragraphs',
    defaultContent: {
      heading: { ar: 'عن المجموعة ورؤيتنا المستقبلية', en: 'About The Group & Future Vision' },
      subheading: { ar: 'التزام راسخ بالجودة والتطوير المستدام', en: 'Unwavering commitment to quality & sustainable development' },
      bodyParagraphs: {
        ar: 'تعد مجموعة هارد القابضة واحدة من أبرز المجموعات الاستثمارية والتطويرية في المملكة العربية السعودية، حيث تقدم محفظة متكاملة تشمل التطوير العقاري الفاخر، المقاولات الكبرى، وهندسة أنظمة التكييف والتبريد.',
        en: 'HARD Group Holding is a premier investment and development entity in the Kingdom of Saudi Arabia, delivering a comprehensive portfolio across luxury real estate, master contracting, and enterprise HVAC engineering.',
      },
      alignment: 'start',
    } as TextBlockContent,
  },
  {
    type: 'statistics',
    nameAr: 'شبكة أرقام وإحصائيات النجاح',
    nameEn: 'Key Statistics Grid',
    descriptionAr: 'إحصائيات إنجازات المجموعة بالأرقام والأيقونات من سجلات الأصول المركزية',
    descriptionEn: 'Display group metrics and achievement figures referenced from central statistics entity store',
    defaultContent: {
      heading: { ar: 'إنجازاتنا بالأرقام', en: 'Our Achievements in Numbers' },
      subheading: { ar: 'مسيرة حافلة بالنمو والنجاح بالمملكة', en: 'A track record of growth and Saudi excellence' },
      sectorFilter: 'all',
      items: [
        { id: 'stat-1', value: '+1.8B SAR', label: { ar: 'قيمة المشاريع المنجزة', en: 'Completed Projects Value' } },
        { id: 'stat-2', value: '+350', label: { ar: 'وحدة عقارية فاخرة', en: 'Luxury Units Delivered' } },
        { id: 'stat-3', value: '100%', label: { ar: 'التزام بكود البناء السعودي', en: 'Saudi Building Code Compliance' } },
      ],
    } as StatisticsContent,
  },
  {
    type: 'team',
    nameAr: 'عرض قيادات وفريق العمل',
    nameEn: 'Team Members & Leadership',
    descriptionAr: 'عرض التخصصات والأدوار من سجل أعضاء الفريق المركزي بدون تكرار',
    descriptionEn: 'Display leadership profiles referenced directly from central Team Members store',
    defaultContent: {
      heading: { ar: 'قيادات ومستشارو المجموعة', en: 'Group Executive Leadership & Advisors' },
      subheading: { ar: 'خبرات وطنية وعالمية تقود مسيرة التميز', en: 'Pioneering professionals shaping Saudi developments' },
      sectorFilter: 'all',
    } as EntityReferenceContent,
  },
  {
    type: 'testimonials',
    nameAr: 'قصص نجاح وتقييمات العملاء',
    nameEn: 'Client Testimonials & Stories',
    descriptionAr: 'عرض قصص نجاح وتجارب العملاء الموثقة من سجل التوصيات المركزي',
    descriptionEn: 'Showcase verified client success stories referenced from central Testimonials store',
    defaultContent: {
      heading: { ar: 'قصص نجاح وتجارب شركائنا', en: 'Client Success Stories & Testimonials' },
      subheading: { ar: 'ثقة نعتز بها من كبار الملاك والمستثمرين', en: 'Endorsements from property investors and partners' },
      sectorFilter: 'all',
    } as EntityReferenceContent,
  },
  {
    type: 'offices',
    nameAr: 'شبكة الفروع والمقرات الرسمية',
    nameEn: 'Office Network & Headquarters',
    descriptionAr: 'عرض شبكة فروع ومقرات الشركة من سجل المكاتب المركزي',
    descriptionEn: 'Showcase branch network and headquarters referenced from central Offices store',
    defaultContent: {
      heading: { ar: 'فروع ومقرات المجموعة بالمملكة', en: 'Kingdom-Wide Office Network' },
      subheading: { ar: 'تواجد استراتيجي بالشرقية والرياض وجدة', en: 'Strategic hubs serving Al Khobar, Riyadh & Jeddah' },
      sectorFilter: 'all',
    } as EntityReferenceContent,
  },
  {
    type: 'certifications',
    nameAr: 'الاعتمادات وتراخيص الجودة',
    nameEn: 'Certifications & Accreditations',
    descriptionAr: 'عرض شهادات الجودة والتراخيص الرسمية من سجل الاعتمادات المركزي',
    descriptionEn: 'Display ISO quality certifications and REGA/MOMRAH licenses from central Certifications store',
    defaultContent: {
      heading: { ar: 'الاعتمادات والجودة المعتمدة', en: 'Official Accreditations & Quality Standards' },
      subheading: { ar: 'التزام بأعلى المعايير التنظيمية بالمملكة', en: 'Full compliance with REGA, MOMRAH, and ISO standards' },
      sectorFilter: 'all',
    } as EntityReferenceContent,
  },
  {
    type: 'partners',
    nameAr: 'العلامات والشركاء الاستراتيجيون',
    nameEn: 'Partner Brands & Strategic Alliances',
    descriptionAr: 'عرض شعارات الشركاء والموردين المعتمدين من سجل الشركاء المركزي',
    descriptionEn: 'Display vendor logos and partner brands referenced from central Partners store',
    defaultContent: {
      heading: { ar: 'شركاء النجاح والعلامات العالمية', en: 'Strategic Alliances & Trusted Brands' },
      subheading: { ar: 'شراكات مثمرة مع كبرى المؤسسات والشركات العالمية', en: 'Collaborating with industry leaders across the Kingdom' },
      sectorFilter: 'all',
    } as EntityReferenceContent,
  },
  {
    type: 'faq_accordion',
    nameAr: 'أسئلة شائعة وتوضيحات (FAQ)',
    nameEn: 'FAQ Accordion Section',
    descriptionAr: 'قائمة إجابات وتوضيحات موثقة مرجعية من مكتبة الأسئلة المركزية',
    descriptionEn: 'Structured question and answer list dynamically referencing central FAQs store',
    defaultContent: {
      heading: { ar: 'الأسئلة الأكثر شيوعاً', en: 'Frequently Asked Questions' },
      subheading: { ar: 'إجابات وافية على كافة استفسارات الاستثمار والخدمات', en: 'Clear answers regarding investments and services' },
      sectorFilter: 'all',
      faqs: [
        {
          id: 'faq-1',
          question: { ar: 'كيف يمكنني حجز معاينة عقار أو طلب استشارة؟', en: 'How do I book a viewing or consult an expert?' },
          answer: { ar: 'يمكنك النقر على زر "حجز معاينة" في صفحة العقار أو التواصل عبر الرقم المباشر والواتساب.', en: 'Click "Book Viewing" on any listing page or reach us directly via phone or WhatsApp.' },
        },
      ],
    } as FaqAccordionContent,
  },
  {
    type: 'feature_list',
    nameAr: 'قائمة المميزات والخدمات',
    nameEn: 'Feature & Service List',
    descriptionAr: 'عرض نقاط القوة والمميزات التنافسية للخدمات',
    descriptionEn: 'Highlight key service features, pillars, and competitive advantages',
    defaultContent: {
      heading: { ar: 'لماذا تختار مجموعة هارد؟', en: 'Why Choose HARD Group?' },
      description: { ar: 'نقدم حلولاً متكاملة ترتكز على أعلى المعايير العالمية', en: 'Integrated solutions adhering to the highest global standards' },
      items: [
        {
          id: 'feat-1',
          title: { ar: 'تطوير عقاري مستدام', en: 'Sustainable Development' },
          description: { ar: 'تصاميم معمارية هادفة تحافظ على البيئة وترفع جودة الحياة.', en: 'Purposeful architectural designs elevating quality of life.' },
        },
      ],
    } as FeatureListContent,
  },
  {
    type: 'card_grid',
    nameAr: 'شبكة كروت وبطاقات تفاعلية',
    nameEn: 'Interactive Card Grid',
    descriptionAr: 'بطاقات بصرية بعناوين وصور وروابط استكشاف',
    descriptionEn: 'Visual card collection with thumbnails, titles, and links',
    defaultContent: {
      heading: { ar: 'قطاعات ومجالات تميزنا', en: 'Our Pillars of Excellence' },
      subheading: { ar: 'حلول متكاملة تغطي كافة تخصصات العقار والبناء', en: 'Integrated solutions covering real estate and construction' },
      columns: 3,
      cards: [
        {
          id: 'card-1',
          title: { ar: 'التسويق والوساطة العقارية', en: 'Real Estate Marketing' },
          excerpt: { ar: 'تسويق العقارات الفاخرة وإدارة الأصول بطرق احترافية.', en: 'Marketing luxury assets and commercial properties.' },
          imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
          linkUrl: '/realestate/properties',
        },
      ],
    } as CardGridContent,
  },
  {
    type: 'cta_banner',
    nameAr: 'بانر دعوة للتفاعل (CTA Banner)',
    nameEn: 'Call-To-Action Banner',
    descriptionAr: 'شريط بارز يجذب انتباه الزائر لاتخاذ إجراء حاسم',
    descriptionEn: 'High-visibility banner encouraging user conversion',
    defaultContent: {
      title: { ar: 'هل تبحث عن فرصة استثمارية عقارية فاخرة؟', en: 'Seeking Premier Saudi Real Estate Opportunities?' },
      subtitle: { ar: 'فريقنا الاستشاري متواجد لمساعدتك في اختيار الأفضل لمستقبلك.', en: 'Our expert advisors are ready to guide your investment journey.' },
      primaryCtaText: { ar: 'تواصل مع مستشار', en: 'Speak to an Advisor' },
      primaryCtaUrl: '/realestate/contact',
      styleVariant: 'gradient',
    } as CtaBannerContent,
  },
  {
    type: 'image_gallery',
    nameAr: 'معرض صور واستعراض مشاريع',
    nameEn: 'Visual Image Gallery',
    descriptionAr: 'معرض صور عالي الدقة يستعرض جودة البناء والتصاميم',
    descriptionEn: 'High-resolution photo gallery showcasing construction quality',
    defaultContent: {
      heading: { ar: 'معرض الصور والجودة المعمارية', en: 'Architectural Photo Gallery' },
      subheading: { ar: 'لقطات حية تعكس دقة التنفيذ واللمسات الفاخرة', en: 'Live captures showcasing craftsmanship and luxury details' },
      images: [
        {
          id: 'gal-1',
          imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
          caption: { ar: 'التشطيبات الخارجية للفلل الملكية', en: 'Royal Villa Exterior Finishes' },
        },
      ],
    } as ImageGalleryContent,
  },
];
