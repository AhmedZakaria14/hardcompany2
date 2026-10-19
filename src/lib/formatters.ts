import { Language } from '../types';

/**
 * Centralized Locale-Aware Formatting & Localization Utilities
 * Serves Real Estate, Construction, and HVAC sectors with consistent Arabic (RTL) & English (LTR) formatting.
 */

// ============================================================================
// 1. CURRENCY & FINANCIAL FORMATTING
// ============================================================================

export function formatCurrency(
  amount: number,
  currency: 'SAR' = 'SAR',
  language: Language = 'en'
): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return language === 'ar' ? '٠ ر.س' : '0 SAR';
  }

  const isAr = language === 'ar';
  const formattedNum = Number(amount).toLocaleString(isAr ? 'ar-SA' : 'en-US', {
    maximumFractionDigits: 0,
  });

  return isAr ? `${formattedNum} ر.س` : `${formattedNum} ${currency}`;
}

export function formatCompactCurrency(
  amount: number,
  language: Language = 'en'
): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return language === 'ar' ? '٠ ر.س' : '0 SAR';
  }

  const isAr = language === 'ar';

  if (amount >= 1_000_000) {
    const millionVal = (amount / 1_000_000).toLocaleString(isAr ? 'ar-SA' : 'en-US', {
      maximumFractionDigits: 1,
    });
    return isAr ? `${millionVal} مليون ر.س` : `${millionVal}M SAR`;
  }

  if (amount >= 1_000) {
    const thousandVal = (amount / 1_000).toLocaleString(isAr ? 'ar-SA' : 'en-US', {
      maximumFractionDigits: 0,
    });
    return isAr ? `${thousandVal} ألف ر.س` : `${thousandVal}K SAR`;
  }

  return formatCurrency(amount, 'SAR', language);
}

// ============================================================================
// 2. AREA & DIMENSION FORMATTING
// ============================================================================

export function formatArea(
  areaM2: number,
  language: Language = 'en',
  options?: { showSecondarySqFt?: boolean }
): string {
  const isAr = language === 'ar';
  const safeArea = Math.max(0, Math.round(areaM2 || 0));
  const formattedM2 = safeArea.toLocaleString(isAr ? 'ar-SA' : 'en-US');
  const unitM2 = isAr ? 'م²' : 'm²';

  if (!options?.showSecondarySqFt) {
    return `${formattedM2} ${unitM2}`;
  }

  const sqFt = Math.round(safeArea * 10.7639);
  const formattedSqFt = sqFt.toLocaleString(isAr ? 'ar-SA' : 'en-US');
  const unitSqFt = isAr ? 'قدم²' : 'sq ft';

  return `${formattedM2} ${unitM2} (${formattedSqFt} ${unitSqFt})`;
}

export function formatBUA(areaM2: number, language: Language = 'en'): string {
  const isAr = language === 'ar';
  const formattedNum = Number(areaM2 || 0).toLocaleString(isAr ? 'ar-SA' : 'en-US');
  return isAr ? `${formattedNum} م² مسطح بناء` : `${formattedNum} m² BUA`;
}

export function formatPricePerSqM(
  priceSar: number,
  areaM2: number,
  language: Language = 'en'
): string {
  if (!areaM2 || areaM2 <= 0) return '';
  const pricePerSqM = Math.round(priceSar / areaM2);
  const isAr = language === 'ar';
  const formattedNum = pricePerSqM.toLocaleString(isAr ? 'ar-SA' : 'en-US');
  return isAr ? `${formattedNum} ر.س / م²` : `${formattedNum} SAR / m²`;
}

// ============================================================================
// 3. BILLING PERIOD FORMATTING
// ============================================================================

export function formatBillingPeriod(
  period: 'year' | 'month' | 'day' | string,
  language: Language = 'en',
  format: 'short' | 'long' = 'short'
): string {
  const isAr = language === 'ar';
  if (period === 'year' || period === 'annually') {
    if (format === 'long') return isAr ? 'سنوياً' : 'per year';
    return isAr ? '/ سنوياً' : '/ yr';
  }
  if (period === 'month' || period === 'monthly') {
    if (format === 'long') return isAr ? 'شهرياً' : 'per month';
    return isAr ? '/ شهرياً' : '/ mo';
  }
  if (period === 'day' || period === 'daily') {
    if (format === 'long') return isAr ? 'يومياً' : 'per day';
    return isAr ? '/ يومياً' : '/ day';
  }
  return '';
}

// ============================================================================
// 4. ARABIC & ENGLISH PLURALIZATION & COUNT FORMATTING
// ============================================================================

export function formatBedroomsCount(count: number, language: Language = 'en'): string {
  const isAr = language === 'ar';
  if (count <= 0) return isAr ? 'عقار تجاري' : 'Commercial';

  if (isAr) {
    if (count === 1) return 'غرفة نوم واحدة';
    if (count === 2) return 'غرفتان نوم';
    if (count >= 3 && count <= 10) return `${count.toLocaleString('ar-SA')} غرف نوم`;
    return `${count.toLocaleString('ar-SA')} غرفة نوم`;
  }

  return `${count} ${count === 1 ? 'Bed' : 'Beds'}`;
}

export function formatBathroomsCount(count: number, language: Language = 'en'): string {
  const isAr = language === 'ar';
  if (count <= 0) return isAr ? 'بدون دورات مياه' : '0 Baths';

  if (isAr) {
    if (count === 1) return 'دورة مياه واحدة';
    if (count === 2) return 'دورتان مياه';
    if (count >= 3 && count <= 10) return `${count.toLocaleString('ar-SA')} دورات مياه`;
    return `${count.toLocaleString('ar-SA')} دورة مياه`;
  }

  return `${count} ${count === 1 ? 'Bath' : 'Baths'}`;
}

export function formatYearsCount(years: number, language: Language = 'en'): string {
  const isAr = language === 'ar';
  if (isAr) {
    if (years === 1) return 'سنة واحدة';
    if (years === 2) return 'سنتان';
    if (years >= 3 && years <= 10) return `${years.toLocaleString('ar-SA')} سنوات`;
    return `${years.toLocaleString('ar-SA')} سنة`;
  }
  return `${years} ${years === 1 ? 'Yr' : 'Yrs'}`;
}

export function formatHoursCount(hours: number, language: Language = 'en'): string {
  const isAr = language === 'ar';
  if (isAr) {
    if (hours === 1) return 'ساعة واحدة يومياً';
    if (hours === 2) return 'ساعتان يومياً';
    if (hours >= 3 && hours <= 10) return `${hours.toLocaleString('ar-SA')} ساعات يومياً`;
    return `${hours.toLocaleString('ar-SA')} ساعة يومياً`;
  }
  return `${hours} hrs/day`;
}

// ============================================================================
// 5. DATE FORMATTING
// ============================================================================

export function formatLocaleDate(
  dateInput: string | Date,
  language: Language = 'en'
): string {
  if (!dateInput) return '';
  const dateObj = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(dateObj.getTime())) return String(dateInput);

  const isAr = language === 'ar';
  return dateObj.toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ============================================================================
// 6. CATEGORY & STATUS LOCALIZATION
// ============================================================================

export function getPropertyStatusLabel(status: string, language: Language = 'en'): string {
  const isAr = language === 'ar';
  switch (status) {
    case 'for-sale':
      return isAr ? 'للبيع' : 'For Sale';
    case 'for-rent':
      return isAr ? 'للتأجير' : 'For Rent';
    case 'exclusive':
      return isAr ? 'حصري' : 'Exclusive';
    case 'off-plan':
      return isAr ? 'على الخارطة' : 'Off-Plan';
    default:
      return isAr ? 'عقار' : 'Property';
  }
}

export function getConstructionCategoryLabel(category: string, language: Language = 'en'): string {
  const isAr = language === 'ar';
  switch (category) {
    case 'residential':
      return isAr ? 'القصور والفلل السكنية' : 'Residential & Luxury Villas';
    case 'commercial':
      return isAr ? 'الأبراج والمباني التجارية' : 'Commercial Towers & Plazas';
    case 'industrial':
      return isAr ? 'المشاريع الصناعية واللوجستية' : 'Industrial & Logistics';
    case 'finishing':
      return isAr ? 'التشطيبات الفندقية الفاخرة' : 'Ultra-Luxury Fit-Out';
    default:
      return isAr ? 'مشروع إنشائي' : 'Construction Project';
  }
}

export function getHVACServiceLabel(serviceId: string, language: Language = 'en'): string {
  const isAr = language === 'ar';
  switch (serviceId) {
    case 'repair':
      return isAr ? 'صيانة وإصلاح أجهزة التكييف' : 'HVAC Maintenance & Repair';
    case 'cleaning':
      return isAr ? 'تنظيف وغسيل كيميائي شامل' : 'Chemical Cleaning & Washing';
    case 'installation':
      return isAr ? 'توريد وتركيب أنظمة التكييف' : 'Cooling System Supply & Installation';
    case 'duct':
      return isAr ? 'تنظيف دكت وتطهير مجاري الهواء' : 'Air Duct Cleaning & Sanitization';
    default:
      return isAr ? 'خدمة تكييف' : 'HVAC Service';
  }
}

// ============================================================================
// 7. COMMON ACTION LABELS
// ============================================================================

export const COMMON_ACTION_LABELS = {
  viewDetails: {
    en: 'View Details',
    ar: 'عرض التفاصيل',
  },
  bookViewing: {
    en: 'Book Viewing',
    ar: 'حجز معاينة',
  },
  bookMaintenance: {
    en: 'Schedule Service',
    ar: 'حجز صيانة',
  },
  whatsapp: {
    en: 'WhatsApp',
    ar: 'واتساب',
  },
  call: {
    en: 'Call Direct',
    ar: 'اتصال مباشر',
  },
  share: {
    en: 'Share Link',
    ar: 'مشاركة الرابط',
  },
  submit: {
    en: 'Submit Request',
    ar: 'إرسال الطلب',
  },
} as const;
