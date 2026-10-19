import React, { useState, useEffect } from 'react';
import { PartnerBrand, SectorScope, PublicationStatus } from '../../types/businessEntities';
import { Language } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { BilingualFormField } from '../components/BilingualFormField';
import { CMSImageUpload } from '../components/CMSImageUpload';
import { Building2, Globe } from 'lucide-react';

interface CMSPartnerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<PartnerBrand>) => Promise<void>;
  initialData?: PartnerBrand | null;
  language: Language;
}

export const CMSPartnerFormModal: React.FC<CMSPartnerFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  language,
}) => {
  const isAr = language === 'ar';
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState({ en: '', ar: '' });
  const [category, setCategory] = useState({ en: '', ar: '' });
  const [logoUrl, setLogoUrl] = useState('https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=300&q=80');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [sector, setSector] = useState<SectorScope>('group');
  const [order, setOrder] = useState<number>(1);
  const [status, setStatus] = useState<PublicationStatus>('published');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || { en: '', ar: '' });
      setCategory(initialData.category || { en: '', ar: '' });
      setLogoUrl(initialData.logoUrl || 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=300&q=80');
      setWebsiteUrl(initialData.websiteUrl || '');
      setSector(initialData.sector || 'group');
      setOrder(initialData.order || 1);
      setStatus(initialData.status || 'published');
    } else {
      setName({ en: '', ar: '' });
      setCategory({ en: '', ar: '' });
      setLogoUrl('https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=300&q=80');
      setWebsiteUrl('');
      setSector('group');
      setOrder(1);
      setStatus('published');
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({
        ...(initialData ? { id: initialData.id } : {}),
        name,
        category,
        logoUrl,
        websiteUrl,
        sector,
        order: Number(order) || 1,
        status,
      });
      onClose();
    } catch (err) {
      console.error('Failed to save partner brand:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        initialData
          ? isAr ? 'تعديل بيانات الشريك' : 'Edit Partner Brand'
          : isAr ? 'إضافة شريك / علامة جديدة' : 'Add New Partner Brand'
      }
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <BilingualFormField
            labelEn="Partner Name"
            labelAr="اسم الشريك / العلامة"
            value={name}
            onChange={setName}
            required
            language={language}
          />

          <BilingualFormField
            labelEn="Category / Industry"
            labelAr="تصنيف الشراكة"
            value={category}
            onChange={setCategory}
            language={language}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            {isAr ? 'الموقع الإلكتروني للشريك' : 'Official Website URL'}
          </label>
          <input
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-mono"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isAr ? 'القطاع المخصص' : 'Sector Scope'}
            </label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value as SectorScope)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold focus:ring-2 focus:ring-blue-500"
            >
              <option value="group">{isAr ? 'إدارة المجموعة' : 'Group Holding'}</option>
              <option value="realestate">{isAr ? 'العقارات والوساطة' : 'Real Estate'}</option>
              <option value="construction">{isAr ? 'المقاولات والهندسة' : 'Construction'}</option>
              <option value="hvac">{isAr ? 'أنظمة التكييف' : 'HVAC Division'}</option>
              <option value="all">{isAr ? 'كافة القطاعات' : 'All Sectors'}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isAr ? 'ترتيب العرض' : 'Display Order'}
            </label>
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold focus:ring-2 focus:ring-blue-500"
              min={1}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isAr ? 'حالة النشر' : 'Publication Status'}
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as PublicationStatus)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold focus:ring-2 focus:ring-blue-500"
            >
              <option value="published">{isAr ? 'منشور (Published)' : 'Published'}</option>
              <option value="draft">{isAr ? 'مسودة (Draft)' : 'Draft'}</option>
              <option value="archived">{isAr ? 'مؤرشف (Archived)' : 'Archived'}</option>
            </select>
          </div>
        </div>

        {/* Logo Image */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            {isAr ? 'شعار الشريك (Logo)' : 'Partner Logo'}
          </label>
          <CMSImageUpload value={logoUrl} onChange={setLogoUrl} language={language} />
        </div>

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl bg-slate-100 hover:bg-slate-200"
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md disabled:opacity-50"
          >
            {isSubmitting
              ? (isAr ? 'جاري الحفظ...' : 'Saving...')
              : (isAr ? 'حفظ الشريك' : 'Save Partner')}
          </button>
        </div>
      </form>
    </Modal>
  );
};
