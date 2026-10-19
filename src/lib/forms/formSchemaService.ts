import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { CustomerFormType, SectorId } from './formSubmissionService';

// Whitelist of supported field types
export const ALLOWED_FIELD_TYPES = [
  'text',
  'email',
  'tel',
  'select',
  'textarea',
  'date',
  'number',
  'file_attachment',
  'checkbox',
] as const;

export type AllowedFieldType = typeof ALLOWED_FIELD_TYPES[number];

export interface FormFieldOption {
  value: string;
  label: { ar: string; en: string };
}

export interface FormFieldConfig {
  id: string; // Stable field ID (e.g., 'fullName', 'email', 'phone')
  type: AllowedFieldType;
  label: { ar: string; en: string };
  helpText?: { ar: string; en: string };
  placeholder?: { ar: string; en: string };
  required: boolean;
  isSystemCritical?: boolean; // Cannot remove required validation if true
  options?: FormFieldOption[]; // For select or radio
}

export interface FormWorkflowSettings {
  trackingPrefix: string;
  dispatchDepartment: string;
  notificationEmail: string;
  autoResponseEnabled: boolean;
}

export interface FormSchemaConfig {
  formType: CustomerFormType;
  sector: SectorId;
  title: { ar: string; en: string };
  description: { ar: string; en: string };
  schemaVersion: string;
  updatedAt: string;
  updatedBy: string;
  fields: FormFieldConfig[];
  serviceOptions?: FormFieldOption[];
  confirmationCopy: {
    title: { ar: string; en: string };
    message: { ar: string; en: string };
  };
  workflowSettings: FormWorkflowSettings;
}

// Approved email domains for customer lead notifications
const APPROVED_EMAIL_DOMAINS = ['hardgp.com', 'hard.com.sa', 'hard-realestate.com', 'hard-group.sa'];

/**
 * Strips dangerous HTML/Script tags to prevent arbitrary script injection in copy
 */
export function sanitizeTextContent(text: string): string {
  if (!text) return '';
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/onerror=/gi, '')
    .replace(/onload=/gi, '');
}

/**
 * Validates a form schema against server security rules & schema constraints
 */
export function validateFormSchemaDefinition(schema: FormSchemaConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // 1. Whitelist Field Types Check
  for (const field of schema.fields) {
    if (!ALLOWED_FIELD_TYPES.includes(field.type)) {
      errors.push(`Field '${field.id}' uses invalid field type '${field.type}'. Whitelisted types: ${ALLOWED_FIELD_TYPES.join(', ')}`);
    }

    // Stable ID format check
    if (!field.id || !/^[a-zA-Z0-9_]+$/.test(field.id)) {
      errors.push(`Field ID '${field.id}' must be alphanumeric without spaces.`);
    }

    // Essential System Critical Validation Guards
    if (field.isSystemCritical && !field.required) {
      errors.push(`System-critical field '${field.id}' (${field.type}) must remain required.`);
    }
  }

  // 2. Email destination domain safety check
  const emailDomain = schema.workflowSettings.notificationEmail.split('@')[1]?.toLowerCase();
  if (
    schema.workflowSettings.notificationEmail &&
    emailDomain &&
    !APPROVED_EMAIL_DOMAINS.includes(emailDomain)
  ) {
    errors.push(
      `Notification destination email domain '@${emailDomain}' is not an approved company domain. Approved domains: ${APPROVED_EMAIL_DOMAINS.map(d => '@' + d).join(', ')}`
    );
  }

  // 3. Ensure essential stable fields exist for the form type
  if (schema.formType !== 'newsletter_signup') {
    const hasName = schema.fields.some(f => f.id === 'fullName' || f.id === 'name');
    if (!hasName) {
      errors.push("Form schema must include a stable 'fullName' or 'name' field.");
    }
  }

  const hasEmail = schema.fields.some(f => f.id === 'email');
  if (!hasEmail) {
    errors.push("Form schema must include a stable 'email' field.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ==========================================
// DEFAULT DEFAULT SCHEMAS FOR ALL 9 FORM TYPES
// ==========================================

export const DEFAULT_FORM_SCHEMAS: Record<CustomerFormType, FormSchemaConfig> = {
  general_contact: {
    formType: 'general_contact',
    sector: 'group',
    title: { ar: 'تواصل معنا (المقر الرئيسي)', en: 'General Inquiry (Group HQ)' },
    description: {
      ar: 'أرسل لنا استفسارك وسيقوم فريق خدمة العملاء بالتواصل معك خلال 24 ساعة.',
      en: 'Send us your inquiry and our client relations team will contact you within 24 hours.',
    },
    schemaVersion: '1.0.0',
    updatedAt: new Date().toISOString(),
    updatedBy: 'system',
    fields: [
      {
        id: 'fullName',
        type: 'text',
        label: { ar: 'الاسم الكامل', en: 'Full Name' },
        placeholder: { ar: 'أدخل اسمك الكريم', en: 'Enter your full name' },
        required: true,
        isSystemCritical: true,
      },
      {
        id: 'email',
        type: 'email',
        label: { ar: 'البريد الإلكتروني', en: 'Email Address' },
        placeholder: { ar: 'name@domain.com', en: 'name@domain.com' },
        required: true,
        isSystemCritical: true,
      },
      {
        id: 'phone',
        type: 'tel',
        label: { ar: 'رقم الهاتف / الواتساب', en: 'Phone / WhatsApp' },
        placeholder: { ar: '+966 5x xxx xxxx', en: '+966 5x xxx xxxx' },
        required: true,
        isSystemCritical: true,
      },
      {
        id: 'preferredContactMethod',
        type: 'select',
        label: { ar: 'وسيلة التواصل المفضلة', en: 'Preferred Contact Method' },
        required: false,
        options: [
          { value: 'whatsapp', label: { ar: 'واتساب (WhatsApp)', en: 'WhatsApp' } },
          { value: 'phone', label: { ar: 'اتصال هاتفي', en: 'Phone Call' } },
          { value: 'email', label: { ar: 'بريد إلكتروني', en: 'Email' } },
        ],
      },
      {
        id: 'message',
        type: 'textarea',
        label: { ar: 'تفاصيل الاستفسار', en: 'Inquiry Details' },
        placeholder: { ar: 'اكتب تفاصيل طلبك هنا...', en: 'Describe your inquiry here...' },
        required: false,
      },
    ],
    confirmationCopy: {
      title: { ar: 'تم إرسال استفسارك بنجاح', en: 'Inquiry Submitted Successfully' },
      message: {
        ar: 'شكراً لتواصلك مع مجموعة HARD. تم تسجيل طلبك وسيقوم مستشارنا بالتواصل معك قريباً.',
        en: 'Thank you for contacting HARD Group. Your inquiry has been registered and a specialist will contact you shortly.',
      },
    },
    workflowSettings: {
      trackingPrefix: 'CNT',
      dispatchDepartment: 'Customer Relations',
      notificationEmail: 'info@hardgp.com',
      autoResponseEnabled: true,
    },
  },

  property_inquiry: {
    formType: 'property_inquiry',
    sector: 'realestate',
    title: { ar: 'استفسار عن عقار', en: 'Property Inquiry' },
    description: {
      ar: 'استفسر عن العقارات المتاحة للبيع أو الإيجار واستلم التفاصيل من مستشارنا العقاري.',
      en: 'Inquire about properties for sale or rent and receive details from our advisor.',
    },
    schemaVersion: '1.0.0',
    updatedAt: new Date().toISOString(),
    updatedBy: 'system',
    fields: [
      {
        id: 'fullName',
        type: 'text',
        label: { ar: 'الاسم الكامل', en: 'Full Name' },
        placeholder: { ar: 'أدخل اسمك الكريم', en: 'Enter full name' },
        required: true,
        isSystemCritical: true,
      },
      {
        id: 'email',
        type: 'email',
        label: { ar: 'البريد الإلكتروني', en: 'Email' },
        placeholder: { ar: 'name@example.com', en: 'name@example.com' },
        required: true,
        isSystemCritical: true,
      },
      {
        id: 'phone',
        type: 'tel',
        label: { ar: 'رقم الجوال', en: 'Mobile Number' },
        placeholder: { ar: '+966 5xxxxxxxx', en: '+966 5xxxxxxxx' },
        required: true,
        isSystemCritical: true,
      },
      {
        id: 'preferredContactMethod',
        type: 'select',
        label: { ar: 'طريقة التواصل المفضلة', en: 'Preferred Contact' },
        required: false,
        options: [
          { value: 'whatsapp', label: { ar: 'واتساب', en: 'WhatsApp' } },
          { value: 'phone', label: { ar: 'اتصال مباشر', en: 'Direct Call' } },
        ],
      },
      {
        id: 'message',
        type: 'textarea',
        label: { ar: 'الرسالة أو الاستفسار الخاصة', en: 'Message or Special Request' },
        required: false,
      },
    ],
    confirmationCopy: {
      title: { ar: 'تم تسجيل طلب الاستفسار', en: 'Property Inquiry Received' },
      message: {
        ar: 'تم توجيه طلبك لمستشار العقارات المعتمد لهذه الوحدة وسيتواصل معك مباشرة.',
        en: 'Your inquiry was routed to the designated advisor for this property.',
      },
    },
    workflowSettings: {
      trackingPrefix: 'INQ',
      dispatchDepartment: 'Real Estate Sales',
      notificationEmail: 'info@hardgp.com',
      autoResponseEnabled: true,
    },
  },

  list_property: {
    formType: 'list_property',
    sector: 'realestate',
    title: { ar: 'عرض عقارك للبيع أو الإيجار', en: 'List Your Property' },
    description: {
      ar: 'اعرض عقارك عبر منصتنا للوصول إلى قاعدة عملائنا ونخبة المستثمرين.',
      en: 'List your property with us to reach our verified buyer network.',
    },
    schemaVersion: '1.0.0',
    updatedAt: new Date().toISOString(),
    updatedBy: 'system',
    fields: [
      { id: 'fullName', type: 'text', label: { ar: 'اسم المالك / الوكيل', en: 'Owner / Agent Name' }, required: true, isSystemCritical: true },
      { id: 'email', type: 'email', label: { ar: 'البريد الإلكتروني', en: 'Email' }, required: true, isSystemCritical: true },
      { id: 'phone', type: 'tel', label: { ar: 'رقم التواصل', en: 'Phone Number' }, required: true, isSystemCritical: true },
      { id: 'propertyType', type: 'select', label: { ar: 'نوع العقار', en: 'Property Type' }, required: true, options: [
        { value: 'villa', label: { ar: 'فيلا سكني', en: 'Residential Villa' } },
        { value: 'commercial', label: { ar: 'مبنى تجاري / مكاتب', en: 'Commercial Building / Offices' } },
        { value: 'land', label: { ar: 'أرض خام / استثمارية', en: 'Plot / Raw Land' } },
      ]},
      { id: 'city', type: 'text', label: { ar: 'المدينة والحي', en: 'City & District' }, required: true },
    ],
    confirmationCopy: {
      title: { ar: 'تم استقبال طلب إدراج العقار', en: 'Property Listing Request Received' },
      message: { ar: 'سيقوم فريق الوساطة والأصول بمراجعة بيانات العقار والتواصل لتأكيد الإدراج.', en: 'Our brokerage team will verify your property details and contact you for listing confirmation.' },
    },
    workflowSettings: {
      trackingPrefix: 'LST',
      dispatchDepartment: 'Property Listings',
      notificationEmail: 'info@hardgp.com',
      autoResponseEnabled: true,
    },
  },

  valuation_request: {
    formType: 'valuation_request',
    sector: 'realestate',
    title: { ar: 'طلب تقييم وتثمين عقاري', en: 'Property Valuation Request' },
    description: { ar: 'احصل على تقييم عقاري معتمد ومعتمد من خبراء التقاط الهيكلي والتثمين.', en: 'Request an accredited property valuation report from certified appraisers.' },
    schemaVersion: '1.0.0',
    updatedAt: new Date().toISOString(),
    updatedBy: 'system',
    fields: [
      { id: 'fullName', type: 'text', label: { ar: 'الاسم الكامل', en: 'Full Name' }, required: true, isSystemCritical: true },
      { id: 'email', type: 'email', label: { ar: 'البريد الإلكتروني', en: 'Email' }, required: true, isSystemCritical: true },
      { id: 'phone', type: 'tel', label: { ar: 'رقم الجوال', en: 'Phone' }, required: true, isSystemCritical: true },
      { id: 'propertyType', type: 'text', label: { ar: 'نوع العقار المراد تقييمه', en: 'Property Type for Valuation' }, required: true },
    ],
    confirmationCopy: {
      title: { ar: 'تم استلام طلب التقييم', en: 'Valuation Request Received' },
      message: { ar: 'تم إحالة طلبكم إلى قسم التثمين العقاري لإعداد التقرير المبدئي.', en: 'Your valuation request has been assigned to our certified appraisal department.' },
    },
    workflowSettings: {
      trackingPrefix: 'VAL',
      dispatchDepartment: 'Valuation & Appraisal',
      notificationEmail: 'info@hardgp.com',
      autoResponseEnabled: true,
    },
  },

  book_viewing: {
    formType: 'book_viewing',
    sector: 'realestate',
    title: { ar: 'حجز معاينة ميدانية', en: 'Book On-Site Viewing' },
    description: { ar: 'احجز موعداً لمعاينة العقار على الطبيعة برفقة مستشارنا.', en: 'Schedule a private guided viewing on-site with our consultant.' },
    schemaVersion: '1.0.0',
    updatedAt: new Date().toISOString(),
    updatedBy: 'system',
    fields: [
      { id: 'fullName', type: 'text', label: { ar: 'الاسم الكامل', en: 'Full Name' }, required: true, isSystemCritical: true },
      { id: 'email', type: 'email', label: { ar: 'البريد الإلكتروني', en: 'Email' }, required: true, isSystemCritical: true },
      { id: 'phone', type: 'tel', label: { ar: 'رقم الجوال', en: 'Phone Number' }, required: true, isSystemCritical: true },
      { id: 'preferredDate', type: 'date', label: { ar: 'التاريخ المفضل للمعاينة', en: 'Preferred Viewing Date' }, required: true },
    ],
    confirmationCopy: {
      title: { ar: 'تم تأكيد طلب معاينة العقار', en: 'Viewing Booking Submitted' },
      message: { ar: 'سيتواصل معك المستشار العقاري قبل الموعد بـ 24 ساعة لتأكيد التفاصيل.', en: 'Our advisor will contact you 24 hours prior to confirm location details.' },
    },
    workflowSettings: {
      trackingPrefix: 'VIEW',
      dispatchDepartment: 'Viewing Scheduling',
      notificationEmail: 'info@hardgp.com',
      autoResponseEnabled: true,
    },
  },

  project_inquiry: {
    formType: 'project_inquiry',
    sector: 'construction',
    title: { ar: 'استفسار عن مشروع تطويري', en: 'Development Project Inquiry' },
    description: { ar: 'استفسر عن المشاريع التطويرية والفرص على الخارطة.', en: 'Inquire about development projects and off-plan investment opportunities.' },
    schemaVersion: '1.0.0',
    updatedAt: new Date().toISOString(),
    updatedBy: 'system',
    fields: [
      { id: 'fullName', type: 'text', label: { ar: 'الاسم الكامل', en: 'Full Name' }, required: true, isSystemCritical: true },
      { id: 'email', type: 'email', label: { ar: 'البريد الإلكتروني', en: 'Email' }, required: true, isSystemCritical: true },
      { id: 'phone', type: 'tel', label: { ar: 'رقم الهاتف', en: 'Phone Number' }, required: true, isSystemCritical: true },
      { id: 'message', type: 'textarea', label: { ar: 'تفاصيل الاستفسار', en: 'Inquiry Message' }, required: false },
    ],
    confirmationCopy: {
      title: { ar: 'تم استلام طلب المشروع', en: 'Project Inquiry Received' },
      message: { ar: 'تم تسجيل طلبك وسيقوم مسؤول المبيعات بالتواصل معك بخصوص كتيب المشروع والأسعار.', en: 'Your request was routed to project sales for brochure and pricing delivery.' },
    },
    workflowSettings: {
      trackingPrefix: 'PRJ',
      dispatchDepartment: 'Development Sales',
      notificationEmail: 'info@hardgp.com',
      autoResponseEnabled: true,
    },
  },

  construction_quote: {
    formType: 'construction_quote',
    sector: 'construction',
    title: { ar: 'طلب تسعير وتسليم مفتاح', en: 'Construction & Turnkey Quote' },
    description: { ar: 'احصل على عرض سعر تفصيلي لمشروعك السكني أو التجاري.', en: 'Request a detailed engineering construction cost estimate.' },
    schemaVersion: '1.0.0',
    updatedAt: new Date().toISOString(),
    updatedBy: 'system',
    fields: [
      { id: 'fullName', type: 'text', label: { ar: 'الاسم الكامل', en: 'Full Name' }, required: true, isSystemCritical: true },
      { id: 'email', type: 'email', label: { ar: 'البريد الإلكتروني', en: 'Email' }, required: true, isSystemCritical: true },
      { id: 'phone', type: 'tel', label: { ar: 'رقم التواصل', en: 'Phone Number' }, required: true, isSystemCritical: true },
      { id: 'projectType', type: 'select', label: { ar: 'نوع المشروع', en: 'Project Type' }, required: true, options: [
        { value: 'villa', label: { ar: 'فيلا سكنية', en: 'Villa' } },
        { value: 'commercial-building', label: { ar: 'مبنى تجاري', en: 'Commercial Building' } },
        { value: 'duplex', label: { ar: 'دوبلكس', en: 'Duplex' } },
        { value: 'residential-compound', label: { ar: 'مجمع سكني', en: 'Residential Compound' } },
      ]},
    ],
    confirmationCopy: {
      title: { ar: 'تم استلام طلب التكاليف والتسعير', en: 'Construction Quote Request Received' },
      message: { ar: 'سيقوم المهندس المختص بدراسة الكميات والمواصفات وإعداد العرض الفني والمالي.', en: 'Our estimation engineer will review quantities and specifications to prepare a formal quote.' },
    },
    workflowSettings: {
      trackingPrefix: 'CST',
      dispatchDepartment: 'Contracting & Tenders',
      notificationEmail: 'info@hardgp.com',
      autoResponseEnabled: true,
    },
  },

  hvac_service: {
    formType: 'hvac_service',
    sector: 'hvac',
    title: { ar: 'طلب خدمات التكييف والتهوية (HVAC)', en: 'HVAC Service & Maintenance Request' },
    description: { ar: 'حجز خدمات الصيانة، التركيب، والتصاميم الهندسية للتكييف.', en: 'Book HVAC maintenance, installation, or engineering design services.' },
    schemaVersion: '1.0.0',
    updatedAt: new Date().toISOString(),
    updatedBy: 'system',
    fields: [
      { id: 'fullName', type: 'text', label: { ar: 'الاسم الكامل', en: 'Full Name' }, required: true, isSystemCritical: true },
      { id: 'email', type: 'email', label: { ar: 'البريد الإلكتروني', en: 'Email' }, required: false },
      { id: 'phone', type: 'tel', label: { ar: 'رقم الهاتف', en: 'Phone Number' }, required: true, isSystemCritical: true },
      { id: 'serviceType', type: 'select', label: { ar: 'نوع خدمة التكييف', en: 'Service Type' }, required: true, options: [
        { value: 'maintenance', label: { ar: 'صيانة وقائية / دورية', en: 'Preventive Maintenance' } },
        { value: 'installation', label: { ar: 'توريد وتركيب تكييف جديد', en: 'Supply & Installation' } },
        { value: 'duct_design', label: { ar: 'تصميم وتشغيل مجاري الهواء (Duct)', en: 'Duct Design & Contracting' } },
      ]},
    ],
    confirmationCopy: {
      title: { ar: 'تم تسجيل طلب خدمة التكييف', en: 'HVAC Service Booking Submitted' },
      message: { ar: 'تم تحويل الطلب إلى قسم الصيانة والتشغيل وسيتواصل معك الفني المباشر.', en: 'Assigned to HVAC operations team; field technician will reach out for scheduling.' },
    },
    workflowSettings: {
      trackingPrefix: 'HVAC',
      dispatchDepartment: 'HVAC Operations',
      notificationEmail: 'info@hardgp.com',
      autoResponseEnabled: true,
    },
  },

  newsletter_signup: {
    formType: 'newsletter_signup',
    sector: 'group',
    title: { ar: 'الاشتراك في النشرة البريدية', en: 'Newsletter Subscription' },
    description: { ar: 'اشترك للحصول على أحدث التقارير العقارية والفرص الاستثمارية.', en: 'Subscribe to receive market insights and investment opportunities.' },
    schemaVersion: '1.0.0',
    updatedAt: new Date().toISOString(),
    updatedBy: 'system',
    fields: [
      { id: 'email', type: 'email', label: { ar: 'البريد الإلكتروني', en: 'Email Address' }, required: true, isSystemCritical: true },
    ],
    confirmationCopy: {
      title: { ar: 'شكراً لاشتراكك', en: 'Subscription Confirmed' },
      message: { ar: 'تم إضافة بريدك الإلكتروني بنجاح لقائمة النشرة الإخبارية.', en: 'Your email address has been added to our newsletter list.' },
    },
    workflowSettings: {
      trackingPrefix: 'SUB',
      dispatchDepartment: 'Marketing & PR',
      notificationEmail: 'info@hardgp.com',
      autoResponseEnabled: false,
    },
  },
};

// In-memory cache for fast UI loading
const schemaCache: Partial<Record<CustomerFormType, FormSchemaConfig>> = {};

/**
 * Retrieves the form schema configuration for a given form type (from Firestore with fallback)
 */
export async function getFormSchemaConfig(formType: CustomerFormType): Promise<FormSchemaConfig> {
  if (schemaCache[formType]) {
    return schemaCache[formType]!;
  }

  try {
    const docRef = doc(db, 'forms', formType);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as FormSchemaConfig;
      // Sanitize text content to ensure no injected scripts exist in cached data
      const sanitizedSchema: FormSchemaConfig = {
        ...data,
        title: {
          ar: sanitizeTextContent(data.title?.ar || ''),
          en: sanitizeTextContent(data.title?.en || ''),
        },
        description: {
          ar: sanitizeTextContent(data.description?.ar || ''),
          en: sanitizeTextContent(data.description?.en || ''),
        },
        fields: (data.fields || []).map(f => ({
          ...f,
          label: {
            ar: sanitizeTextContent(f.label?.ar || ''),
            en: sanitizeTextContent(f.label?.en || ''),
          },
          helpText: f.helpText ? {
            ar: sanitizeTextContent(f.helpText.ar || ''),
            en: sanitizeTextContent(f.helpText.en || ''),
          } : undefined,
          placeholder: f.placeholder ? {
            ar: sanitizeTextContent(f.placeholder.ar || ''),
            en: sanitizeTextContent(f.placeholder.en || ''),
          } : undefined,
        })),
        confirmationCopy: {
          title: {
            ar: sanitizeTextContent(data.confirmationCopy?.title?.ar || ''),
            en: sanitizeTextContent(data.confirmationCopy?.title?.en || ''),
          },
          message: {
            ar: sanitizeTextContent(data.confirmationCopy?.message?.ar || ''),
            en: sanitizeTextContent(data.confirmationCopy?.message?.en || ''),
          },
        },
      };
      schemaCache[formType] = sanitizedSchema;
      return sanitizedSchema;
    }
  } catch (e) {
    console.warn(`[formSchemaService] Firestore read failed for form '${formType}', using default:`, e);
  }

  const defaultSchema = DEFAULT_FORM_SCHEMAS[formType] || DEFAULT_FORM_SCHEMAS.general_contact;
  schemaCache[formType] = defaultSchema;
  return defaultSchema;
}

/**
 * Saves an updated form schema configuration to Firestore after server/schema validation
 */
export async function saveFormSchemaConfig(
  formType: CustomerFormType,
  updatedConfig: FormSchemaConfig,
  actorEmail: string = 'admin@hardgp.com'
): Promise<{ success: boolean; newVersion: string; errors?: string[] }> {
  // 1. Sanitize all incoming text fields to prevent XSS / script injection
  const sanitizedSchema: FormSchemaConfig = {
    ...updatedConfig,
    title: {
      ar: sanitizeTextContent(updatedConfig.title.ar),
      en: sanitizeTextContent(updatedConfig.title.en),
    },
    description: {
      ar: sanitizeTextContent(updatedConfig.description.ar),
      en: sanitizeTextContent(updatedConfig.description.en),
    },
    fields: updatedConfig.fields.map(f => ({
      ...f,
      label: {
        ar: sanitizeTextContent(f.label.ar),
        en: sanitizeTextContent(f.label.en),
      },
      helpText: f.helpText ? {
        ar: sanitizeTextContent(f.helpText.ar),
        en: sanitizeTextContent(f.helpText.en),
      } : undefined,
      placeholder: f.placeholder ? {
        ar: sanitizeTextContent(f.placeholder.ar),
        en: sanitizeTextContent(f.placeholder.en),
      } : undefined,
    })),
    confirmationCopy: {
      title: {
        ar: sanitizeTextContent(updatedConfig.confirmationCopy.title.ar),
        en: sanitizeTextContent(updatedConfig.confirmationCopy.title.en),
      },
      message: {
        ar: sanitizeTextContent(updatedConfig.confirmationCopy.message.ar),
        en: sanitizeTextContent(updatedConfig.confirmationCopy.message.en),
      },
    },
  };

  // 2. Validate against Whitelist & Security Rules
  const validation = validateFormSchemaDefinition(sanitizedSchema);
  if (!validation.valid) {
    return {
      success: false,
      newVersion: updatedConfig.schemaVersion,
      errors: validation.errors,
    };
  }

  // 3. Increment semver automatically for form schema tracking
  const versionParts = (updatedConfig.schemaVersion || '1.0.0').split('.');
  const patchNum = (parseInt(versionParts[2] || '0', 10) + 1) || 1;
  const newVersion = `${versionParts[0] || '1'}.${versionParts[1] || '0'}.${patchNum}`;

  const finalSchema: FormSchemaConfig = {
    ...sanitizedSchema,
    schemaVersion: newVersion,
    updatedAt: new Date().toISOString(),
    updatedBy: actorEmail,
  };

  try {
    const docRef = doc(db, 'forms', formType);
    await setDoc(docRef, finalSchema);
    schemaCache[formType] = finalSchema;
    return {
      success: true,
      newVersion,
    };
  } catch (err: any) {
    console.error(`[formSchemaService] Failed to save form schema for '${formType}':`, err);
    return {
      success: false,
      newVersion: updatedConfig.schemaVersion,
      errors: [err?.message || 'Database write error while saving form configuration'],
    };
  }
}
