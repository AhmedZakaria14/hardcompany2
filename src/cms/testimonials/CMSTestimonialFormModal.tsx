import React, { useState, useEffect } from 'react';
import { X, Award, Sparkles, Star, Image, MapPin, User, Save, Check } from 'lucide-react';
import { Language, Testimonial } from '../../types';
import { CMSImageUpload } from '../components/CMSImageUpload';

interface CMSTestimonialFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (testimonialData: Partial<Testimonial>) => void;
  initialData?: Testimonial | null;
  language: Language;
}

const AVATAR_PRESETS = [
  { label: 'Executive Male 1', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80' },
  { label: 'Executive Male 2', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80' },
  { label: 'Executive Female 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' },
  { label: 'Executive Female 2', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80' },
  { label: 'Corporate Leader', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80' },
];

export const CMSTestimonialFormModal: React.FC<CMSTestimonialFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  language,
}) => {
  const isAr = language === 'ar';

  const [formData, setFormData] = useState<Partial<Testimonial>>({
    name: { en: '', ar: '' },
    role: { en: 'Real Estate Investor', ar: 'مستثمر عقاري' },
    location: { en: 'Al Khobar, Eastern Province', ar: 'الخُبر، المنطقة الشرقية' },
    avatar: AVATAR_PRESETS[0].url,
    rating: 5,
    dealHighlight: { en: 'Luxury Waterfront Villa Acquisition', ar: 'شراء فيلا فاخرة على الواجهة البحرية' },
    quote: {
      en: 'The HARD Real Estate team demonstrated exceptional transparency and handled our acquisition seamlessly from valuation to legal closure.',
      ar: 'أظهر فريق هارد العقارية شفافية استثنائية وأدار صفقة الاستحواذ بسلاسة تامة بدءاً من التقييم وحتى الإفراغ النهائي.',
    },
    category: 'buyer',
    featured: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          id: initialData.id,
          name: {
            en: initialData.name?.en || '',
            ar: initialData.name?.ar || '',
          },
          role: {
            en: initialData.role?.en || '',
            ar: initialData.role?.ar || '',
          },
          location: {
            en: initialData.location?.en || '',
            ar: initialData.location?.ar || '',
          },
          avatar: initialData.avatar || AVATAR_PRESETS[0].url,
          rating: initialData.rating || 5,
          dealHighlight: {
            en: initialData.dealHighlight?.en || '',
            ar: initialData.dealHighlight?.ar || '',
          },
          quote: {
            en: initialData.quote?.en || '',
            ar: initialData.quote?.ar || '',
          },
          category: initialData.category || 'buyer',
          featured: initialData.featured ?? true,
        });
      } else {
        setFormData({
          name: { en: '', ar: '' },
          role: { en: 'Real Estate Investor', ar: 'مستثمر عقاري' },
          location: { en: 'Al Khobar, Eastern Province', ar: 'الخُبر، المنطقة الشرقية' },
          avatar: AVATAR_PRESETS[0].url,
          rating: 5,
          dealHighlight: { en: 'Luxury Waterfront Villa Acquisition', ar: 'شراء فيلا فاخرة على الواجهة البحرية' },
          quote: {
            en: 'The HARD Real Estate team demonstrated exceptional transparency and handled our acquisition seamlessly from valuation to legal closure.',
            ar: 'أظهر فريق هارد العقارية شفافية استثنائية وأدار صفقة الاستحواذ بسلاسة تامة بدءاً من التقييم وحتى الإفراغ النهائي.',
          },
          category: 'buyer',
          featured: true,
        });
      }
      setErrors({});
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name?.en?.trim()) {
      newErrors.nameEn = isAr ? 'الاسم بالإنجليزية مطلوب' : 'English name is required';
    }
    if (!formData.name?.ar?.trim()) {
      newErrors.nameAr = isAr ? 'الاسم بالعربية مطلوب' : 'Arabic name is required';
    }
    if (!formData.quote?.en?.trim()) {
      newErrors.quoteEn = isAr ? 'الشهادة بالإنجليزية مطلوبة' : 'English quote is required';
    }
    if (!formData.quote?.ar?.trim()) {
      newErrors.quoteAr = isAr ? 'الشهادة بالعربية مطلوبة' : 'Arabic quote is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-display-serif">
                {initialData
                  ? isAr
                    ? 'تعديل قصة نجاح العميل'
                    : 'Edit Client Success Story'
                  : isAr
                  ? 'إضافة قصة نجاح عميل جديدة'
                  : 'Add New Client Success Story'}
              </h2>
              <p className="text-xs text-slate-500">
                {isAr
                  ? 'أدخل بيانات العميل وتقييمه وتفاصيل الصفقة باللغتين العربية والإنجليزية'
                  : 'Configure verified client testimonial, deal metrics, and ratings in both languages'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          {/* Avatar & Rating Row */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
            <CMSImageUpload
              value={formData.avatar || ''}
              onChange={(val) => setFormData({ ...formData, avatar: val })}
              language={language}
              label={isAr ? 'صورة العميل الرمزية (Client Avatar)' : 'Client Avatar Image'}
              aspectRatio="avatar"
              presets={AVATAR_PRESETS}
            />

            {/* Category & Rating */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200/60">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isAr ? 'فئة العميل' : 'Client Category'}
                </label>
                <select
                  value={formData.category || 'buyer'}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                >
                  <option value="buyer">{isAr ? 'مشتري عقار (Buyer)' : 'Buyer'}</option>
                  <option value="seller">{isAr ? 'بائع / مالك عقار (Seller)' : 'Seller'}</option>
                  <option value="investor">{isAr ? 'مستثمر ومحفظة (Investor)' : 'Investor'}</option>
                  <option value="tenant">{isAr ? 'مستأجر تنفيذي (Executive Tenant)' : 'Executive Tenant'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isAr ? 'التقييم (عدد النجوم)' : 'Rating (Stars)'}
                </label>
                <div className="flex items-center gap-2 h-9">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= (formData.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ms-2">
                    {formData.rating || 5}.0 / 5.0
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Client Name EN & AR */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isAr ? 'اسم العميل (الإنجليزية) *' : 'Client Name (English) *'}
              </label>
              <input
                type="text"
                value={formData.name?.en || ''}
                onChange={(e) =>
                  setFormData({ ...formData, name: { ...(formData.name as any), en: e.target.value } })
                }
                placeholder="e.g. Eng. Khalid Al-Zahrani"
                className={`w-full px-3 py-2 bg-slate-50 border ${
                  errors.nameEn ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'
                } rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
              {errors.nameEn && <p className="text-red-500 text-[11px] mt-1">{errors.nameEn}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isAr ? 'اسم العميل (العربية) *' : 'Client Name (Arabic) *'}
              </label>
              <input
                type="text"
                dir="rtl"
                value={formData.name?.ar || ''}
                onChange={(e) =>
                  setFormData({ ...formData, name: { ...(formData.name as any), ar: e.target.value } })
                }
                placeholder="مثال: م. خالد الزهراني"
                className={`w-full px-3 py-2 bg-slate-50 border ${
                  errors.nameAr ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'
                } rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
              {errors.nameAr && <p className="text-red-500 text-[11px] mt-1">{errors.nameAr}</p>}
            </div>
          </div>

          {/* Role / Job Title EN & AR */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isAr ? 'الصفة / المنصب (الإنجليزية)' : 'Role / Title (English)'}
              </label>
              <input
                type="text"
                value={formData.role?.en || ''}
                onChange={(e) =>
                  setFormData({ ...formData, role: { ...(formData.role as any), en: e.target.value } })
                }
                placeholder="e.g. Commercial Portfolio Investor"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isAr ? 'الصفة / المنصب (العربية)' : 'Role / Title (Arabic)'}
              </label>
              <input
                type="text"
                dir="rtl"
                value={formData.role?.ar || ''}
                onChange={(e) =>
                  setFormData({ ...formData, role: { ...(formData.role as any), ar: e.target.value } })
                }
                placeholder="مثال: مستثمر محافظ تجارية"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Location EN & AR */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isAr ? 'المدينة / المنطقة (الإنجليزية)' : 'Location / City (English)'}
              </label>
              <input
                type="text"
                value={formData.location?.en || ''}
                onChange={(e) =>
                  setFormData({ ...formData, location: { ...(formData.location as any), en: e.target.value } })
                }
                placeholder="e.g. Al Khobar, Saudi Arabia"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isAr ? 'المدينة / المنطقة (العربية)' : 'Location / City (Arabic)'}
              </label>
              <input
                type="text"
                dir="rtl"
                value={formData.location?.ar || ''}
                onChange={(e) =>
                  setFormData({ ...formData, location: { ...(formData.location as any), ar: e.target.value } })
                }
                placeholder="مثال: الخُبر، المملكة العربية السعودية"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Deal Highlight EN & AR */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>{isAr ? 'أبرز تفاصيل الصفقة (الإنجليزية)' : 'Deal Highlight Tag (English)'}</span>
              </label>
              <input
                type="text"
                value={formData.dealHighlight?.en || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dealHighlight: { ...(formData.dealHighlight as any), en: e.target.value },
                  })
                }
                placeholder="e.g. SAR 8.2M Waterfront Villa"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>{isAr ? 'أبرز تفاصيل الصفقة (العربية)' : 'Deal Highlight Tag (Arabic)'}</span>
              </label>
              <input
                type="text"
                dir="rtl"
                value={formData.dealHighlight?.ar || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dealHighlight: { ...(formData.dealHighlight as any), ar: e.target.value },
                  })
                }
                placeholder="مثال: صفقة فيلا شاطئية بقيمة 8.2 مليون ريال"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Quote EN & AR */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isAr ? 'نص تقييم وتجربة العميل (الإنجليزية) *' : 'Client Quote / Testimonial (English) *'}
              </label>
              <textarea
                rows={3}
                value={formData.quote?.en || ''}
                onChange={(e) =>
                  setFormData({ ...formData, quote: { ...(formData.quote as any), en: e.target.value } })
                }
                placeholder="Write the full quote in English..."
                className={`w-full px-3 py-2 bg-slate-50 border ${
                  errors.quoteEn ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'
                } rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
              {errors.quoteEn && <p className="text-red-500 text-[11px] mt-1">{errors.quoteEn}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isAr ? 'نص تقييم وتجربة العميل (العربية) *' : 'Client Quote / Testimonial (Arabic) *'}
              </label>
              <textarea
                rows={3}
                dir="rtl"
                value={formData.quote?.ar || ''}
                onChange={(e) =>
                  setFormData({ ...formData, quote: { ...(formData.quote as any), ar: e.target.value } })
                }
                placeholder="اكتب التقييم الكامل بالعربية..."
                className={`w-full px-3 py-2 bg-slate-50 border ${
                  errors.quoteAr ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'
                } rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
              {errors.quoteAr && <p className="text-red-500 text-[11px] mt-1">{errors.quoteAr}</p>}
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-sky-500 hover:brightness-110 active:scale-95 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{initialData ? (isAr ? 'حفظ التعديلات' : 'Save Changes') : isAr ? 'إضافة القصة' : 'Publish Story'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
