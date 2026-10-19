import { LocalizedText } from '../types/firestore-schema';

export type TranslationStatus = 'complete' | 'missing_en' | 'missing_ar' | 'empty';

/**
 * Evaluates translation completeness for a LocalizedText field.
 */
export function getTranslationStatus(text?: LocalizedText | null): TranslationStatus {
  if (!text) return 'empty';
  const hasAr = typeof text.ar === 'string' && text.ar.trim().length > 0;
  const hasEn = typeof text.en === 'string' && text.en.trim().length > 0;

  if (hasAr && hasEn) return 'complete';
  if (hasAr && !hasEn) return 'missing_en';
  if (!hasAr && hasEn) return 'missing_ar';
  return 'empty';
}

/**
 * Explicit Public Fallback Policy:
 * 1. Return requested language if available.
 * 2. Fall back to available alternative language (AR -> EN or EN -> AR).
 * 3. Fall back to default fallback text if both are empty.
 */
export function getLocalizedText(
  text?: LocalizedText | null | string,
  lang: 'ar' | 'en' = 'ar',
  fallbackText = ''
): string {
  if (!text) return fallbackText;

  // Handle plain string fallback
  if (typeof text === 'string') {
    return text.trim() || fallbackText;
  }

  const requested = lang === 'ar' ? text.ar : text.en;
  if (requested && typeof requested === 'string' && requested.trim().length > 0) {
    return requested.trim();
  }

  // Fallback to alternative language
  const alternative = lang === 'ar' ? text.en : text.ar;
  if (alternative && typeof alternative === 'string' && alternative.trim().length > 0) {
    return alternative.trim();
  }

  return fallbackText;
}

/**
 * Draft Auto-Translator Helper (creates reviewable draft)
 */
export function generateDraftTranslation(
  sourceText: string,
  sourceLang: 'ar' | 'en'
): { translatedText: string; isDraft: boolean } {
  if (!sourceText || !sourceText.trim()) {
    return { translatedText: '', isDraft: true };
  }

  const trimmed = sourceText.trim();

  // Common real estate domain phrase translation mappings for instant high-quality draft
  const domainDictionary: Record<string, string> = {
    // AR to EN
    'فلل فاخرة': 'Luxury Villas',
    'شقق للبيع': 'Apartments for Sale',
    'أراضي استثمارية': 'Investment Land Plots',
    'مشاريع تحت الإنشاء': 'Off-Plan Projects',
    'الرياض': 'Riyadh',
    'جدة': 'Jeddah',
    'الخبر': 'Khobar',
    'الدمام': 'Dammam',
    'مكة المكرمة': 'Makkah',
    'المدينة المنورة': 'Madinah',
    'مقاولات بناء': 'Building Contracting',
    'أنظمة تكييف': 'HVAC Systems',

    // EN to AR
    'Luxury Villas': 'فلل فاخرة',
    'Apartments for Sale': 'شقق للبيع',
    'Investment Land Plots': 'أراضي استثمارية',
    'Off-Plan Projects': 'مشاريع تحت الإنشاء',
    'Riyadh': 'الرياض',
    'Jeddah': 'جدة',
    'Khobar': 'الخبر',
    'Dammam': 'الدمام',
  };

  if (domainDictionary[trimmed]) {
    return { translatedText: domainDictionary[trimmed], isDraft: true };
  }

  // Fallback prefixed draft indicator
  if (sourceLang === 'ar') {
    return { translatedText: `[Draft EN] ${trimmed}`, isDraft: true };
  } else {
    return { translatedText: `[مسودة عربي] ${trimmed}`, isDraft: true };
  }
}
