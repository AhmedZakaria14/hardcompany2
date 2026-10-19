import React, { useState, useEffect } from 'react';
import { X, Tag, Save, Sparkles, FolderTree } from 'lucide-react';
import { Language, BlogCategory } from '../../types';
import { generateSlug } from '../../lib/blogFirestore';

interface CMSCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (catData: Partial<BlogCategory>) => Promise<void>;
  initialData?: BlogCategory | null;
  language: Language;
}

export const CMSCategoryModal: React.FC<CMSCategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  language,
}) => {
  const isAr = language === 'ar';
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [slugEn, setSlugEn] = useState('');
  const [slugAr, setSlugAr] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descAr, setDescAr] = useState('');
  const [color, setColor] = useState('from-blue-600 to-sky-500');
  const [order, setOrder] = useState<number>(1);

  useEffect(() => {
    if (initialData) {
      setNameEn(initialData.name?.en || '');
      setNameAr(initialData.name?.ar || '');
      setSlugEn(typeof initialData.slug === 'object' ? initialData.slug.en : initialData.slug || '');
      setSlugAr(typeof initialData.slug === 'object' ? initialData.slug.ar : '');
      setDescEn(initialData.description?.en || '');
      setDescAr(initialData.description?.ar || '');
      setColor(initialData.color || 'from-blue-600 to-sky-500');
      setOrder(initialData.order ?? 1);
    } else {
      setNameEn('');
      setNameAr('');
      setSlugEn('');
      setSlugAr('');
      setDescEn('');
      setDescAr('');
      setColor('from-blue-600 to-sky-500');
      setOrder(1);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleGenerateSlugs = () => {
    if (nameEn) setSlugEn(generateSlug(nameEn, 'en'));
    if (nameAr) setSlugAr(generateSlug(nameAr, 'ar'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({
        name: { en: nameEn, ar: nameAr },
        slug: {
          en: slugEn || generateSlug(nameEn, 'en'),
          ar: slugAr || generateSlug(nameAr, 'ar'),
        },
        description: { en: descEn, ar: descAr },
        color,
        order: Number(order) || 1,
      });
      onClose();
    } catch (err) {
      console.error('Error saving category:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const colorPresets = [
    { label: 'Blue Sky', value: 'from-blue-600 to-sky-500' },
    { label: 'Amber Gold', value: 'from-amber-600 to-orange-500' },
    { label: 'Emerald Teal', value: 'from-emerald-600 to-teal-500' },
    { label: 'Indigo Purple', value: 'from-indigo-600 to-purple-500' },
    { label: 'Rose Pink', value: 'from-rose-600 to-pink-500' },
    { label: 'Slate Gray', value: 'from-slate-700 to-slate-900' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        dir={isAr ? 'rtl' : 'ltr'}
        className="bg-white w-full max-w-xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display-serif">
                {initialData
                  ? isAr ? 'تعديل تصنيف المقالات' : 'Edit Blog Category'
                  : isAr ? 'إضافة تصنيف جديد' : 'New Blog Category'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isAr ? 'إدارة الهيكل التنظيمي ومحاور المحتوى والتقارير' : 'Organize article taxonomies and report streams'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                {isAr ? 'اسم التصنيف (English)' : 'Category Name (English)'} *
              </label>
              <input
                type="text"
                required
                value={nameEn}
                onChange={(e) => {
                  setNameEn(e.target.value);
                  if (!slugEn) setSlugEn(generateSlug(e.target.value, 'en'));
                }}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900"
                placeholder="e.g. Market Intelligence"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                {isAr ? 'اسم التصنيف (العربية)' : 'Category Name (Arabic)'} *
              </label>
              <input
                type="text"
                required
                dir="rtl"
                value={nameAr}
                onChange={(e) => {
                  setNameAr(e.target.value);
                  if (!slugAr) setSlugAr(generateSlug(e.target.value, 'ar'));
                }}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900"
                placeholder="مثال: تقارير وتحليلات السوق"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {isAr ? 'المسارات والروابط المخصصة (Localized Slugs)' : 'Localized URL Slugs'}
            </span>
            <button
              type="button"
              onClick={handleGenerateSlugs}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>{isAr ? 'توليد تلقائي من الاسم' : 'Auto-Generate Slugs'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                {isAr ? 'المعرف اللاتيني (Slug EN)' : 'URL Slug (English)'}
              </label>
              <input
                type="text"
                value={slugEn}
                onChange={(e) => setSlugEn(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                placeholder="market-intelligence"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                {isAr ? 'المعرف العربي (Slug AR)' : 'URL Slug (Arabic)'}
              </label>
              <input
                type="text"
                dir="rtl"
                value={slugAr}
                onChange={(e) => setSlugAr(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                placeholder="tahleelat-al-souq"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">
              {isAr ? 'وصف التصنيف (English)' : 'Description (English)'}
            </label>
            <textarea
              rows={2}
              value={descEn}
              onChange={(e) => setDescEn(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              placeholder="Brief summary of articles in this category..."
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">
              {isAr ? 'وصف التصنيف (العربية)' : 'Description (Arabic)'}
            </label>
            <textarea
              rows={2}
              dir="rtl"
              value={descAr}
              onChange={(e) => setDescAr(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              placeholder="وصف مختصر لمحتوى ومجالات هذا التصنيف..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                {isAr ? 'لون الشارة والتدرج' : 'Badge Color Gradient'}
              </label>
              <select
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
              >
                {colorPresets.map((preset) => (
                  <option key={preset.value} value={preset.value}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                {isAr ? 'ترتيب الظهور' : 'Sort Order'}
              </label>
              <input
                type="number"
                min={1}
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ التصنيف' : 'Save Category')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
