import React, { useState, useEffect } from 'react';
import { X, User, Save, Sparkles, Mail, Linkedin } from 'lucide-react';
import { Language, BlogAuthor } from '../../types';
import { generateSlug } from '../../lib/blogFirestore';
import { CMSImageUpload } from '../components/CMSImageUpload';

interface CMSAuthorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (authorData: Partial<BlogAuthor>) => Promise<void>;
  initialData?: BlogAuthor | null;
  language: Language;
}

export const CMSAuthorModal: React.FC<CMSAuthorModalProps> = ({
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
  const [roleEn, setRoleEn] = useState('');
  const [roleAr, setRoleAr] = useState('');
  const [bioEn, setBioEn] = useState('');
  const [bioAr, setBioAr] = useState('');
  const [avatar, setAvatar] = useState('');
  const [email, setEmail] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [order, setOrder] = useState<number>(1);

  useEffect(() => {
    if (initialData) {
      setNameEn(initialData.name?.en || '');
      setNameAr(initialData.name?.ar || '');
      setRoleEn(initialData.role?.en || '');
      setRoleAr(initialData.role?.ar || '');
      setBioEn(initialData.bio?.en || '');
      setBioAr(initialData.bio?.ar || '');
      setAvatar(initialData.avatar || '');
      setEmail(initialData.email || '');
      setLinkedin(initialData.linkedin || '');
      setOrder(initialData.order ?? 1);
    } else {
      setNameEn('');
      setNameAr('');
      setRoleEn('');
      setRoleAr('');
      setBioEn('');
      setBioAr('');
      setAvatar('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80');
      setEmail('');
      setLinkedin('');
      setOrder(1);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({
        name: { en: nameEn, ar: nameAr },
        slug: {
          en: generateSlug(nameEn, 'en'),
          ar: generateSlug(nameAr, 'ar'),
        },
        role: { en: roleEn, ar: roleAr },
        bio: { en: bioEn, ar: bioAr },
        avatar: avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        email,
        linkedin,
        order: Number(order) || 1,
      });
      onClose();
    } catch (err) {
      console.error('Error saving author:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        dir={isAr ? 'rtl' : 'ltr'}
        className="bg-white w-full max-w-xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display-serif">
                {initialData
                  ? isAr ? 'تعديل بيانات الكاتب / المحلل' : 'Edit Author Profile'
                  : isAr ? 'إضافة كاتب ومحلل جديد' : 'New Author Profile'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isAr ? 'إدارة كتّاب المقالات والخبراء والمحللين المعتمدين' : 'Manage contributing writers, analysts, and editors'}
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
                {isAr ? 'اسم الكاتب (English)' : 'Author Name (English)'} *
              </label>
              <input
                type="text"
                required
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900"
                placeholder="e.g. Faisal Al-Otaibi"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                {isAr ? 'اسم الكاتب (العربية)' : 'Author Name (Arabic)'} *
              </label>
              <input
                type="text"
                required
                dir="rtl"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900"
                placeholder="مثال: فيصل العتيبي"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                {isAr ? 'المسمى الوظيفي (English)' : 'Role / Title (English)'} *
              </label>
              <input
                type="text"
                required
                value={roleEn}
                onChange={(e) => setRoleEn(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                placeholder="Chief Investment Officer"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                {isAr ? 'المسمى الوظيفي (العربية)' : 'Role / Title (Arabic)'} *
              </label>
              <input
                type="text"
                required
                dir="rtl"
                value={roleAr}
                onChange={(e) => setRoleAr(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                placeholder="رئيس الاستثمار العقاري"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">
              {isAr ? 'نبذة عن الكاتب (English Bio)' : 'Author Bio (English)'}
            </label>
            <textarea
              rows={2}
              value={bioEn}
              onChange={(e) => setBioEn(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              placeholder="Professional biography and background..."
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">
              {isAr ? 'نبذة عن الكاتب (العربية)' : 'Author Bio (Arabic)'}
            </label>
            <textarea
              rows={2}
              dir="rtl"
              value={bioAr}
              onChange={(e) => setBioAr(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              placeholder="نبذة مهنية عن الكاتب والخبرات السابقة..."
            />
          </div>

          <CMSImageUpload
            value={avatar}
            onChange={(val) => setAvatar(val)}
            language={language}
            label={isAr ? 'الصورة الشخصية للكاتب' : 'Author Profile Photo'}
            aspectRatio="avatar"
            presets={[
              { label: 'Analyst 1', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
              { label: 'Legal Advisor', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80' },
              { label: 'Senior Planner', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80' },
            ]}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{isAr ? 'البريد المهني' : 'Work Email'}</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                placeholder="author@hardrealestate.sa"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Linkedin className="w-3.5 h-3.5 text-slate-400" />
                <span>{isAr ? 'رابط لينكد إن' : 'LinkedIn Profile'}</span>
              </label>
              <input
                type="url"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                placeholder="https://linkedin.com/in/username"
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
              <span>{isSubmitting ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ الكاتب' : 'Save Author')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
