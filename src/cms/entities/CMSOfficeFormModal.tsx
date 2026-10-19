import React, { useState, useEffect } from 'react';
import { OfficeLocation, SectorScope, PublicationStatus } from '../../types/businessEntities';
import { Language } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { BilingualFormField } from '../components/BilingualFormField';
import { CMSImageUpload } from '../components/CMSImageUpload';
import { MapPin, Phone, Mail, Clock, Globe } from 'lucide-react';

interface CMSOfficeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<OfficeLocation>) => Promise<void>;
  initialData?: OfficeLocation | null;
  language: Language;
}

export const CMSOfficeFormModal: React.FC<CMSOfficeFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  language,
}) => {
  const isAr = language === 'ar';
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState({ en: '', ar: '' });
  const [city, setCity] = useState({ en: '', ar: '' });
  const [address, setAddress] = useState({ en: '', ar: '' });
  const [workingHours, setWorkingHours] = useState({ en: '', ar: '' });
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [googleMapUrl, setGoogleMapUrl] = useState('');
  const [image, setImage] = useState('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80');
  const [isHeadquarters, setIsHeadquarters] = useState(false);
  const [sector, setSector] = useState<SectorScope>('group');
  const [order, setOrder] = useState<number>(1);
  const [status, setStatus] = useState<PublicationStatus>('published');
  const [lat, setLat] = useState<number>(26.2886);
  const [lng, setLng] = useState<number>(50.2185);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || { en: '', ar: '' });
      setCity(initialData.city || { en: '', ar: '' });
      setAddress(initialData.address || { en: '', ar: '' });
      setWorkingHours(initialData.workingHours || { en: '', ar: '' });
      setPhone(initialData.phone || '');
      setEmail(initialData.email || '');
      setGoogleMapUrl(initialData.googleMapUrl || '');
      setImage(initialData.image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80');
      setIsHeadquarters(Boolean(initialData.isHeadquarters));
      setSector(initialData.sector || 'group');
      setOrder(initialData.order || 1);
      setStatus(initialData.status || 'published');
      if (initialData.coordinates) {
        setLat(initialData.coordinates.lat);
        setLng(initialData.coordinates.lng);
      }
    } else {
      setName({ en: '', ar: '' });
      setCity({ en: '', ar: '' });
      setAddress({ en: '', ar: '' });
      setWorkingHours({ en: '', ar: '' });
      setPhone('');
      setEmail('');
      setGoogleMapUrl('');
      setImage('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80');
      setIsHeadquarters(false);
      setSector('group');
      setOrder(1);
      setStatus('published');
      setLat(26.2886);
      setLng(50.2185);
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({
        ...(initialData ? { id: initialData.id } : {}),
        name,
        city,
        address,
        workingHours,
        phone,
        email,
        googleMapUrl,
        image,
        isHeadquarters,
        sector,
        order: Number(order) || 1,
        status,
        coordinates: { lat: Number(lat) || 26.2886, lng: Number(lng) || 50.2185 },
      });
      onClose();
    } catch (err) {
      console.error('Failed to save office:', err);
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
          ? isAr ? 'تعديل بيانات فرع / مقر' : 'Edit Office Location'
          : isAr ? 'إضافة فرع / مقر جديد' : 'Add Office Location'
      }
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <BilingualFormField
            labelEn="Office / Branch Title"
            labelAr="اسم المكاتب / الفرع"
            value={name}
            onChange={setName}
            required
            language={language}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BilingualFormField
              labelEn="City"
              labelAr="المدينة"
              value={city}
              onChange={setCity}
              required
              language={language}
            />

            <BilingualFormField
              labelEn="Working Hours"
              labelAr="أوقات العمل"
              value={workingHours}
              onChange={setWorkingHours}
              language={language}
            />
          </div>

          <BilingualFormField
            labelEn="Full Street Address"
            labelAr="العنوان الوطني التفصيلي"
            value={address}
            onChange={setAddress}
            required
            language={language}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isAr ? 'الهاتف المباشر' : 'Phone Number'}
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+966 13 800 4273"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isAr ? 'البريد الإلكتروني للفرع' : 'Branch Email'}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="info@hardgp.com"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isAr ? 'القطاع المخصص' : 'Sector Assignment'}
            </label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value as SectorScope)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold focus:ring-2 focus:ring-blue-500"
            >
              <option value="group">{isAr ? 'إدارة المجموعة' : 'Group Holding'}</option>
              <option value="realestate">{isAr ? 'العقارات والوساطة' : 'Real Estate'}</option>
              <option value="construction">{isAr ? 'المقاولات والهندسة' : 'Construction'}</option>
              <option value="hvac">{isAr ? 'أنظمة التكييف' : 'HVAC'}</option>
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

        <div className="flex items-center gap-2 p-3 bg-slate-100 rounded-xl">
          <input
            type="checkbox"
            id="isHq"
            checked={isHeadquarters}
            onChange={(e) => setIsHeadquarters(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="isHq" className="text-xs font-bold text-slate-800 cursor-pointer">
            {isAr ? 'تحديد كـ المقر الرئيسي للشركة (Headquarters)' : 'Mark as Main Headquarters'}
          </label>
        </div>

        {/* Office Image */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            {isAr ? 'صورة المقر / الفرع' : 'Office Image'}
          </label>
          <CMSImageUpload value={image} onChange={setImage} language={language} />
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
              : (isAr ? 'حفظ الفرع' : 'Save Office')}
          </button>
        </div>
      </form>
    </Modal>
  );
};
