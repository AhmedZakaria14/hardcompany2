import React, { useState } from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, Languages } from 'lucide-react';
import { LocalizedText } from '../../types/firestore-schema';
import {
  getTranslationStatus,
  generateDraftTranslation,
  TranslationStatus,
} from '../../lib/bilingualUtils';

interface BilingualFormFieldProps {
  label?: string;
  labelEn?: string;
  labelAr?: string;
  value: LocalizedText;
  onChange: (value: LocalizedText) => void;
  type?: 'text' | 'textarea';
  multiline?: boolean;
  rows?: number;
  placeholderAr?: string;
  placeholderEn?: string;
  helpTextEn?: string;
  helpTextAr?: string;
  required?: boolean;
  language?: 'ar' | 'en';
}

export const BilingualFormField: React.FC<BilingualFormFieldProps> = ({
  label = '',
  labelEn,
  labelAr,
  value,
  onChange,
  type = 'text',
  multiline = false,
  rows = 3,
  placeholderAr = 'أدخل النص بالعربية...',
  placeholderEn = 'Enter text in English...',
  helpTextEn,
  helpTextAr,
  required = false,
  language = 'ar',
}) => {
  const isArUi = language === 'ar';
  const computedLabel = isArUi ? (labelAr || label || labelEn || '') : (labelEn || label || labelAr || '');
  const computedType = multiline ? 'textarea' : type;
  const status = getTranslationStatus(value);
  const [hasDraftNotice, setHasDraftNotice] = useState(false);

  const handleArabicChange = (val: string) => {
    onChange({
      ar: val,
      en: value?.en || '',
    });
    setHasDraftNotice(false);
  };

  const handleEnglishChange = (val: string) => {
    onChange({
      ar: value?.ar || '',
      en: val,
    });
    setHasDraftNotice(false);
  };

  const handleAutoTranslateDraft = () => {
    if (value?.ar && !value?.en) {
      const draft = generateDraftTranslation(value.ar, 'ar');
      onChange({ ...value, en: draft.translatedText });
      setHasDraftNotice(true);
    } else if (value?.en && !value?.ar) {
      const draft = generateDraftTranslation(value.en, 'en');
      onChange({ ...value, ar: draft.translatedText });
      setHasDraftNotice(true);
    }
  };

  const statusBadgeMap: Record<
    TranslationStatus,
    { labelAr: string; labelEn: string; bgClass: string; textClass: string; icon: any }
  > = {
    complete: {
      labelAr: 'ترجمة مكتملة (AR & EN)',
      labelEn: 'Complete (AR & EN)',
      bgClass: 'bg-emerald-100 border-emerald-200',
      textClass: 'text-emerald-800',
      icon: CheckCircle2,
    },
    missing_en: {
      labelAr: 'تنبيه: مفقود الإنجليزية',
      labelEn: 'Missing English',
      bgClass: 'bg-amber-100 border-amber-200',
      textClass: 'text-amber-800',
      icon: AlertTriangle,
    },
    missing_ar: {
      labelAr: 'تنبيه: مفقود العربية',
      labelEn: 'Missing Arabic',
      bgClass: 'bg-amber-100 border-amber-200',
      textClass: 'text-amber-800',
      icon: AlertTriangle,
    },
    empty: {
      labelAr: 'فارغ',
      labelEn: 'Empty',
      bgClass: 'bg-slate-100 border-slate-200',
      textClass: 'text-slate-600',
      icon: Languages,
    },
  };

  const currentBadge = statusBadgeMap[status] || statusBadgeMap.empty || {
    labelAr: 'فارغ',
    labelEn: 'Empty',
    bgClass: 'bg-slate-100 border-slate-200',
    textClass: 'text-slate-600',
    icon: Languages,
  };
  const BadgeIcon = currentBadge.icon || Languages;

  return (
    <div className="space-y-2 p-4 bg-slate-50/70 border border-slate-200 rounded-2xl">
      {/* Field Header & Status Badge */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <span>{computedLabel}</span>
          {required && <span className="text-rose-500 font-bold">*</span>}
        </label>

        <div className="flex items-center gap-2">
          {/* Translation Status Badge */}
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${currentBadge.bgClass} ${currentBadge.textClass}`}
          >
            <BadgeIcon className="w-3 h-3 shrink-0" />
            <span>{isArUi ? currentBadge.labelAr : currentBadge.labelEn}</span>
          </span>

          {/* Auto Translate Draft Button */}
          {(status === 'missing_en' || status === 'missing_ar') && (
            <button
              type="button"
              onClick={handleAutoTranslateDraft}
              className="px-2.5 py-0.5 bg-sky-100 hover:bg-sky-200 text-sky-800 text-[10px] font-bold rounded-full transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-sky-600" />
              <span>{isArUi ? 'مسودة ترجمة آلياً' : 'Auto-Draft Translation'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Input Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Arabic Input Field (RTL) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
              العربية (AR)
            </span>
            <span className="text-[10px] text-slate-400 font-mono">RTL</span>
          </div>

          {computedType === 'textarea' ? (
            <textarea
              dir="rtl"
              rows={rows}
              value={value?.ar || ''}
              onChange={(e) => handleArabicChange(e.target.value)}
              placeholder={placeholderAr}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-sans focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
            />
          ) : (
            <input
              type="text"
              dir="rtl"
              value={value?.ar || ''}
              onChange={(e) => handleArabicChange(e.target.value)}
              placeholder={placeholderAr}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-sans focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
            />
          )}
        </div>

        {/* English Input Field (LTR) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
              ENGLISH (EN)
            </span>
            <span className="text-[10px] text-slate-400 font-mono">LTR</span>
          </div>

          {computedType === 'textarea' ? (
            <textarea
              dir="ltr"
              rows={rows}
              value={value?.en || ''}
              onChange={(e) => handleEnglishChange(e.target.value)}
              placeholder={placeholderEn}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-sans focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
            />
          ) : (
            <input
              type="text"
              dir="ltr"
              value={value?.en || ''}
              onChange={(e) => handleEnglishChange(e.target.value)}
              placeholder={placeholderEn}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-sans focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
            />
          )}
        </div>
      </div>

      {hasDraftNotice && (
        <p className="text-[10px] text-sky-700 bg-sky-50 p-1.5 rounded-lg border border-sky-200">
          💡 {isArUi ? 'تم إنشاء مسودة ترجمة قابلة للمراجعة والتعديل قبل النشر.' : 'Draft translation generated. Review and approve before publishing.'}
        </p>
      )}
    </div>
  );
};
