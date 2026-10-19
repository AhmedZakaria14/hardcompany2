import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Building,
  MapPin,
  DollarSign,
  Image as ImageIcon,
  CheckCircle2,
  Plus,
  Trash2,
  HelpCircle,
  Eye,
  Sliders,
  UserCheck,
} from 'lucide-react';
import { Property, PropertyType, ListingStatus, Language } from '../../types';
import { SAUDI_CITIES } from '../../data/cities';
import { CMSImageUpload, CMSMultiImageGallery } from '../components/CMSImageUpload';
import { BilingualFormField } from '../components/BilingualFormField';

interface CMSPropertyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (propertyData: Partial<Property>) => Promise<void>;
  initialData?: Property | null;
  language: Language;
}

export const CMSPropertyFormModal: React.FC<CMSPropertyFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  language,
}) => {
  const isAr = language === 'ar';
  const isEditing = !!initialData;

  const [activeTab, setActiveTab] = useState<'basic' | 'location' | 'pricing' | 'media' | 'amenities' | 'licensing' | 'agent' | 'preview'>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [titleEn, setTitleEn] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descAr, setDescAr] = useState('');
  const [type, setType] = useState<PropertyType>('villa');
  const [status, setStatus] = useState<ListingStatus>('for-sale');
  const [availabilityStatus, setAvailabilityStatus] = useState<'available' | 'reserved' | 'sold' | 'rented'>('available');
  const [publicationStatus, setPublicationStatus] = useState<'draft' | 'published' | 'archived'>('published');
  const [featured, setFeatured] = useState(false);

  // Licensing & REGA Compliance
  const [regaLicenseNumber, setRegaLicenseNumber] = useState('1200018923');
  const [adLicenseNumber, setAdLicenseNumber] = useState('7200018942');
  const [wafiPermitNumber, setWafiPermitNumber] = useState('');

  // Location
  const [cityEn, setCityEn] = useState('Al Khobar');
  const [cityAr, setCityAr] = useState('الخُبر');
  const [areaEn, setAreaEn] = useState('Corniche Waterfront');
  const [areaAr, setAreaAr] = useState('كورنيش الخُبر');
  const [addressEn, setAddressEn] = useState('Prince Turki Street, Al Khobar');
  const [addressAr, setAddressAr] = useState('طريق الأمير تركي، الخُبر');
  const [lat, setLat] = useState<number>(26.2886);
  const [lng, setLng] = useState<number>(50.2185);

  // Pricing & Specs
  const [priceSAR, setPriceSAR] = useState<number>(15000000);
  const [period, setPeriod] = useState<'year' | 'month' | undefined>(undefined);
  const [bedrooms, setBedrooms] = useState<number>(5);
  const [bathrooms, setBathrooms] = useState<number>(6);
  const [areaSqM, setAreaSqM] = useState<number>(650);
  const [yearBuilt, setYearBuilt] = useState<number>(2025);
  const [parkingSpaces, setParkingSpaces] = useState<number>(3);
  const [furnishingEn, setFurnishingEn] = useState('Fully Furnished');
  const [furnishingAr, setFurnishingAr] = useState('مفروش بالكامل');
  const [viewEn, setViewEn] = useState('Arabian Gulf Sea View');
  const [viewAr, setViewAr] = useState('إطلالة بانورامية على البحر');

  // Media
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  ]);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Amenities
  const [amenitiesEn, setAmenitiesEn] = useState<string[]>([
    'Private Swimming Pool',
    'Smart Home Automation',
    'Landscaped Garden',
    'Private Elevator',
    'Maid and Driver Quarters',
  ]);
  const [newAmenityEn, setNewAmenityEn] = useState('');
  const [newAmenityAr, setNewAmenityAr] = useState('');

  // Agent
  const [agentNameEn, setAgentNameEn] = useState('Faisal Al-Otaibi');
  const [agentNameAr, setAgentNameAr] = useState('فيصل العتيبي');
  const [agentTitleEn, setAgentTitleEn] = useState('Senior Luxury Property Advisor');
  const [agentTitleAr, setAgentTitleAr] = useState('مستشار أول للعقارات الفاخرة');
  const [agentPhone, setAgentPhone] = useState('+966 13 800 4273');
  const [agentWhatsapp, setAgentWhatsapp] = useState('966556125711');
  const [agentEmail, setAgentEmail] = useState('faisal@hardrealestate.sa');
  const [agentAvatar, setAgentAvatar] = useState('https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80');

  // Initialize data if editing
  useEffect(() => {
    if (initialData) {
      setTitleEn(initialData.title?.en || '');
      setTitleAr(initialData.title?.ar || '');
      setDescEn(initialData.description?.en || '');
      setDescAr(initialData.description?.ar || '');
      setType(initialData.type || 'villa');
      setStatus(initialData.status || 'for-sale');
      setFeatured(!!initialData.featured);

      setCityEn(initialData.location?.city?.en || 'Al Khobar');
      setCityAr(initialData.location?.city?.ar || 'الخُبر');
      setAreaEn(initialData.location?.area?.en || 'Corniche');
      setAreaAr(initialData.location?.area?.ar || 'الكورنيش');
      setAddressEn(initialData.location?.address?.en || '');
      setAddressAr(initialData.location?.address?.ar || '');
      if (initialData.location?.coordinates) {
        setLat(initialData.location.coordinates.lat);
        setLng(initialData.location.coordinates.lng);
      }

      setPriceSAR(initialData.price?.sar || 10000000);
      setPeriod(initialData.price?.period);
      setBedrooms(initialData.bedrooms || 4);
      setBathrooms(initialData.bathrooms || 5);
      setAreaSqM(initialData.areaSqM || 500);
      setYearBuilt(initialData.features?.yearBuilt || 2025);
      setParkingSpaces(initialData.features?.parkingSpaces || 2);
      setFurnishingEn(initialData.features?.furnishing?.en || 'Fully Furnished');
      setFurnishingAr(initialData.features?.furnishing?.ar || 'مفروش بالكامل');
      setViewEn(initialData.features?.view?.en || 'Sea View');
      setViewAr(initialData.features?.view?.ar || 'إطلالة بحرية');

      setImages(initialData.images?.length ? initialData.images : ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=85']);
      setAmenitiesEn(initialData.amenities?.en || ['Private Pool', 'Smart Home']);

      if (initialData.agent) {
        setAgentNameEn(initialData.agent.name?.en || 'Faisal Al-Otaibi');
        setAgentNameAr(initialData.agent.name?.ar || 'فيصل العتيبي');
        setAgentTitleEn(initialData.agent.title?.en || 'Senior Luxury Advisor');
        setAgentTitleAr(initialData.agent.title?.ar || 'مستشار عقاري أول');
        setAgentPhone(initialData.agent.phone || '+966 13 800 4273');
        setAgentWhatsapp(initialData.agent.whatsapp || '966556125711');
        setAgentEmail(initialData.agent.email || 'faisal@hardrealestate.sa');
        setAgentAvatar(initialData.agent.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80');
      }
    } else {
      // Default reset
      setTitleEn('');
      setTitleAr('');
      setDescEn('');
      setDescAr('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setImages([...images, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleAddAmenity = () => {
    if (newAmenityEn.trim()) {
      setAmenitiesEn([...amenitiesEn, newAmenityEn.trim()]);
      setNewAmenityEn('');
      setNewAmenityAr('');
    }
  };

  const handleRemoveAmenity = (index: number) => {
    setAmenitiesEn(amenitiesEn.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Specification Guard: Prevent contradictory specifications
      let sanitizedBedrooms = Number(bedrooms);
      let sanitizedBathrooms = Number(bathrooms);
      let sanitizedPeriod = period;

      if (type === ('land' as any)) {
        sanitizedBedrooms = 0;
        sanitizedBathrooms = 0;
      }

      if (status === 'for-sale' || status === 'exclusive' || status === 'new-launch') {
        sanitizedPeriod = undefined;
      } else if (status === 'for-rent' && !sanitizedPeriod) {
        sanitizedPeriod = 'year';
      }

      const formattedPrice = `${priceSAR.toLocaleString()} SAR${sanitizedPeriod ? ` / ${sanitizedPeriod}` : ''}`;
      const areaSqFt = Math.round(areaSqM * 10.7639);

      const propertyPayload: Partial<Property> = {
        title: {
          en: titleEn || 'Luxury Estate',
          ar: titleAr || 'عقار فاخر',
        },
        slug: titleEn
          ? titleEn.toLowerCase().replace(/[^a-z0-9]+/g, '-')
          : `property-${Date.now()}`,
        description: {
          en: descEn,
          ar: descAr,
        },
        type,
        status,
        featured,
        price: {
          sar: Number(priceSAR),
          formattedSAR: formattedPrice,
          period: sanitizedPeriod,
        },
        bedrooms: sanitizedBedrooms,
        bathrooms: sanitizedBathrooms,
        areaSqM: Number(areaSqM),
        areaSqFt,
        location: {
          city: { en: cityEn, ar: cityAr },
          area: { en: areaEn, ar: areaAr },
          country: { en: 'Saudi Arabia', ar: 'المملكة العربية السعودية' },
          address: { en: addressEn, ar: addressAr },
          coordinates: { lat: Number(lat), lng: Number(lng) },
        },
        images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=85'],
        amenities: {
          en: amenitiesEn,
          ar: amenitiesEn.map((item) => (isAr ? item : `${item}`)),
        },
        features: {
          yearBuilt: Number(yearBuilt),
          parkingSpaces: Number(parkingSpaces),
          furnishing: { en: furnishingEn, ar: furnishingAr },
          view: { en: viewEn, ar: viewAr },
        },
        agent: {
          name: { en: agentNameEn, ar: agentNameAr },
          title: { en: agentTitleEn, ar: agentTitleAr },
          phone: agentPhone,
          whatsapp: agentWhatsapp,
          email: agentEmail,
          avatar: agentAvatar,
        },
      };

      await onSave(propertyPayload);
      onClose();
    } catch (err) {
      console.error('Failed to save property:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/75 backdrop-blur-sm animate-in fade-in"
    >
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-display-serif">
                {isEditing
                  ? isAr
                    ? 'تعديل العقار الحالي'
                    : 'Edit Property Listing'
                  : isAr
                  ? 'إضافة عقار فاخر جديد'
                  : 'Add New Luxury Property'}
              </h2>
              <p className="text-xs text-slate-500">
                {isAr
                  ? 'قم بإدخال بيانات العقار ثنائية اللغة لظهورها فوراً على المنصة'
                  : 'Fill in the bilingual details to publish directly to the live platform'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Tab Navigation */}
        <div className="flex items-center gap-1 px-6 border-b border-slate-100 overflow-x-auto py-2 bg-slate-50/40 text-xs font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'basic' ? 'bg-blue-600 text-white shadow-xs' : 'hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>{isAr ? 'البيانات الأساسية' : 'Basic Info'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('location')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'location' ? 'bg-blue-600 text-white shadow-xs' : 'hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{isAr ? 'الموقع والعنوان' : 'Location & Address'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pricing')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'pricing' ? 'bg-blue-600 text-white shadow-xs' : 'hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>{isAr ? 'السعر والمواصفات' : 'Pricing & Specs'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('media')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'media' ? 'bg-blue-600 text-white shadow-xs' : 'hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>{isAr ? 'معرض الصور' : 'Media Gallery'}</span>
            <span className="px-1.5 py-0.2 bg-white/20 rounded-full text-[10px]">{images.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('amenities')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'amenities' ? 'bg-blue-600 text-white shadow-xs' : 'hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isAr ? 'المزايا والخدمات' : 'Amenities'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('licensing')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'licensing' ? 'bg-blue-600 text-white shadow-xs' : 'hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{isAr ? 'التراخيص ورخص REGA' : 'REGA Licenses'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('agent')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'agent' ? 'bg-blue-600 text-white shadow-xs' : 'hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{isAr ? 'المستشار العقاري' : 'Assigned Advisor'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'preview' ? 'bg-emerald-600 text-white shadow-xs font-bold' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isAr ? 'معاينة العرض' : 'Draft Preview'}</span>
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: BASIC INFO */}
          {activeTab === 'basic' && (
            <div className="space-y-4 animate-in fade-in">
              {/* Bilingual Title */}
              <BilingualFormField
                label={isAr ? 'عنوان العقار' : 'Property Title'}
                value={{ ar: titleAr, en: titleEn }}
                onChange={(val) => {
                  setTitleAr(val.ar);
                  setTitleEn(val.en);
                }}
                required
                language={language}
                placeholderAr="مثال: فيلا شاطئية فائقة الفخامة في كورنيش الخُبر"
                placeholderEn="e.g. Ultra-Modern Waterfront Villa in Khobar"
              />

              {/* Bilingual Description */}
              <BilingualFormField
                label={isAr ? 'وصف العقار والتفاصيل' : 'Property Detailed Description'}
                type="textarea"
                rows={4}
                value={{ ar: descAr, en: descEn }}
                onChange={(val) => {
                  setDescAr(val.ar);
                  setDescEn(val.en);
                }}
                language={language}
                placeholderAr="أدخل الوصف التفصيلي والمميزات المعمارية..."
                placeholderEn="Enter detailed property description and architectural highlights..."
              />

              {/* Type & Status & Featured */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 text-start">
                    {isAr ? 'نوع العقار' : 'Property Type'}
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as PropertyType)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="villa">{isAr ? 'فيلا (Villa)' : 'Villa'}</option>
                    <option value="apartment">{isAr ? 'شقة سكنية (Apartment)' : 'Apartment'}</option>
                    <option value="penthouse">{isAr ? 'بنتهاوس (Penthouse)' : 'Penthouse'}</option>
                    <option value="townhouse">{isAr ? 'تاون هاوس (Townhouse)' : 'Townhouse'}</option>
                    <option value="commercial">{isAr ? 'عقار تجاري (Commercial)' : 'Commercial'}</option>
                    <option value="mansion">{isAr ? 'قصر فاخر (Mansion)' : 'Mansion'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 text-start">
                    {isAr ? 'حالة العرض' : 'Listing Status'}
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ListingStatus)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="for-sale">{isAr ? 'للبيع (For Sale)' : 'For Sale'}</option>
                    <option value="for-rent">{isAr ? 'للإيجار (For Rent)' : 'For Rent'}</option>
                    <option value="off-plan">{isAr ? 'على الخارطة (Off-Plan)' : 'Off-Plan'}</option>
                    <option value="exclusive">{isAr ? 'حصري (Exclusive)' : 'Exclusive'}</option>
                    <option value="new-launch">{isAr ? 'إطلاق جديد (New Launch)' : 'New Launch'}</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-800">
                      {isAr ? '⭐ تثبيت كعقار مميز في الصفحة الأولى' : '⭐ Mark as Featured Listing'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 text-start">
                    Description (English)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Provide a detailed luxury narrative..."
                    value={descEn}
                    onChange={(e) => setDescEn(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 text-start">
                    الوصف التفصيلي (بالعربية)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="اكتب وصفاً جذاباً يعكس فخامة العقار ومميزاته..."
                    value={descAr}
                    onChange={(e) => setDescAr(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed text-start"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LOCATION & ADDRESS */}
          {activeTab === 'location' && (
            <div className="space-y-4 animate-in fade-in">
              {/* Quick City Dropdown Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 text-start">
                  {isAr ? 'اختر المدينة من القائمة' : 'Select City from list'}
                </label>
                <select
                  value={cityAr}
                  onChange={(e) => {
                    const match = SAUDI_CITIES.find((c) => c.ar === e.target.value || c.en === e.target.value);
                    if (match) {
                      setCityAr(match.ar);
                      setCityEn(match.en);
                    } else {
                      setCityAr(e.target.value);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="" disabled>{isAr ? '-- اختر المدينة --' : '-- Select City --'}</option>
                  {SAUDI_CITIES.map((c) => (
                    <option key={c.en} value={c.ar}>
                      {c.ar} - {c.en}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 text-start">
                    City (English)
                  </label>
                  <input
                    type="text"
                    value={cityEn}
                    onChange={(e) => setCityEn(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 text-start">
                    المدينة (بالعربية)
                  </label>
                  <input
                    type="text"
                    value={cityAr}
                    onChange={(e) => setCityAr(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-start"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 text-start">
                    District / Area (English)
                  </label>
                  <input
                    type="text"
                    value={areaEn}
                    onChange={(e) => setAreaEn(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 text-start">
                    الحي أو المنطقة (بالعربية)
                  </label>
                  <input
                    type="text"
                    value={areaAr}
                    onChange={(e) => setAreaAr(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-start"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 text-start">
                    Full Address (English)
                  </label>
                  <input
                    type="text"
                    value={addressEn}
                    onChange={(e) => setAddressEn(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 text-start">
                    العنوان التفصيلي (بالعربية)
                  </label>
                  <input
                    type="text"
                    value={addressAr}
                    onChange={(e) => setAddressAr(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-start"
                  />
                </div>
              </div>

              {/* Coordinates */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-800 block text-start">
                  📍 {isAr ? 'إحداثيات الخريطة (GPS Coordinates)' : 'GPS Map Coordinates'}
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1 text-start">Latitude (خط العرض)</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={lat}
                      onChange={(e) => setLat(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1 text-start">Longitude (خط الطول)</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={lng}
                      onChange={(e) => setLng(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRICING & SPECS */}
          {activeTab === 'pricing' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 text-start">
                    {isAr ? 'السعر بالريال السعودي (SAR)' : 'Price in SAR *'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={0}
                      value={priceSAR}
                      onChange={(e) => setPriceSAR(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="absolute top-2.5 end-3 text-xs font-bold text-slate-400">SAR</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 text-start">
                    {isAr ? 'فترة الدفع (للإيجار فقط)' : 'Rental Period (If applicable)'}
                  </label>
                  <select
                    value={period || ''}
                    onChange={(e) => setPeriod(e.target.value ? (e.target.value as 'year' | 'month') : undefined)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="">{isAr ? 'سعر إجمالي (بيع)' : 'Total Sale Price'}</option>
                    <option value="year">{isAr ? 'سنوياً (/ year)' : 'Per Year'}</option>
                    <option value="month">{isAr ? 'شهرياً (/ month)' : 'Per Month'}</option>
                  </select>
                </div>
              </div>

              {/* Bedrooms, Bathrooms, Area */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 text-start">
                    {isAr ? 'غرف النوم' : 'Bedrooms'}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={bedrooms}
                    onChange={(e) => setBedrooms(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 text-start">
                    {isAr ? 'دورات المياه' : 'Bathrooms'}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={bathrooms}
                    onChange={(e) => setBathrooms(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 text-start">
                    {isAr ? 'المساحة (م²)' : 'Area (m²)'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={areaSqM}
                    onChange={(e) => setAreaSqM(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 text-start">
                    {isAr ? 'مواقف السيارات' : 'Parking'}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={parkingSpaces}
                    onChange={(e) => setParkingSpaces(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                  />
                </div>
              </div>

              {/* View & Furnishing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 text-start">
                    {isAr ? 'الإطلالة (عربي / إنجليزي)' : 'View (EN / AR)'}
                  </label>
                  <input
                    type="text"
                    value={isAr ? viewAr : viewEn}
                    onChange={(e) => {
                      if (isAr) setViewAr(e.target.value);
                      else setViewEn(e.target.value);
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 text-start">
                    {isAr ? 'حالة التأثيث' : 'Furnishing'}
                  </label>
                  <select
                    value={furnishingEn}
                    onChange={(e) => {
                      setFurnishingEn(e.target.value);
                      setFurnishingAr(e.target.value === 'Fully Furnished' ? 'مفروش بالكامل' : 'غير مفروش');
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                  >
                    <option value="Fully Furnished">{isAr ? 'مفروش بالكامل' : 'Fully Furnished'}</option>
                    <option value="Semi Furnished">{isAr ? 'مفروش جزئياً' : 'Semi Furnished'}</option>
                    <option value="Unfurnished">{isAr ? 'غير مفروش' : 'Unfurnished'}</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MEDIA & GALLERY */}
          {activeTab === 'media' && (
            <div className="space-y-4 animate-in fade-in">
              <CMSMultiImageGallery
                images={images}
                onChange={(newImages) => setImages(newImages)}
                language={language}
                label={isAr ? 'معرض صور العقار' : 'Property Photos & Renders'}
                description={
                  isAr
                    ? 'أول صورة هي الغلاف الرئيسي للعقار'
                    : 'The first image is the main listing cover'
                }
              />
            </div>
          )}

          {/* TAB 5: AMENITIES */}
          {activeTab === 'amenities' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={isAr ? 'أدخل ميزة جديدة (مثال: سينما خاصة)' : 'Enter amenity (e.g. Private Cinema)'}
                  value={newAmenityEn}
                  onChange={(e) => setNewAmenityEn(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
                <button
                  type="button"
                  onClick={handleAddAmenity}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAr ? 'إضافة' : 'Add'}</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {amenitiesEn.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-800 rounded-xl text-xs font-medium border border-slate-200"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAmenity(idx)}
                      className="text-slate-400 hover:text-red-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: AGENT ASSIGNMENT */}
          {activeTab === 'agent' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 text-start">
                    Advisor Name (English)
                  </label>
                  <input
                    type="text"
                    value={agentNameEn}
                    onChange={(e) => setAgentNameEn(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 text-start">
                    اسم المستشار (بالعربية)
                  </label>
                  <input
                    type="text"
                    value={agentNameAr}
                    onChange={(e) => setAgentNameAr(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-start"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 text-start">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={agentPhone}
                    onChange={(e) => setAgentPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm dir-ltr text-start"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 text-start">
                    WhatsApp Number
                  </label>
                  <input
                    type="text"
                    value={agentWhatsapp}
                    onChange={(e) => setAgentWhatsapp(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm dir-ltr text-start"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 text-start">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={agentEmail}
                    onChange={(e) => setAgentEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm dir-ltr text-start"
                  />
                </div>
              </div>

              {/* Agent Avatar Upload */}
              <div className="pt-2 border-t border-slate-100">
                <CMSImageUpload
                  value={agentAvatar}
                  onChange={(val) => setAgentAvatar(val)}
                  language={language}
                  label={isAr ? 'صورة المستشار العقاري الشخصية' : 'Advisor Avatar & Portrait'}
                  aspectRatio="avatar"
                  presets={[
                    { label: 'Faisal (Advisor 1)', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80' },
                    { label: 'Tariq (Advisor 2)', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80' },
                    { label: 'Layla (Advisor 3)', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80' },
                  ]}
                />
              </div>
            </div>
          )}

          {/* TAB: LICENSING & REGA COMPLIANCE */}
          {activeTab === 'licensing' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl space-y-1">
                <h4 className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-sky-600" />
                  <span>{isAr ? 'الامتثال لتراخيص الهيئة العامة للعقار (REGA)' : 'REGA Compliance & Approved Licenses'}</span>
                </h4>
                <p className="text-[11px] text-sky-800 leading-relaxed">
                  {isAr
                    ? 'يتم عرض أرقام التراخيص الرسمية على كروت وصفحات العقار للالتزام بالنظام العقاري السعودي'
                    : 'Official license IDs are displayed on listing cards and property details to ensure full Saudi REGA compliance.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 text-start">
                    {isAr ? 'رقم ترخيص الهيئة العامة للعقار (REGA License)' : 'REGA License Number'}
                  </label>
                  <input
                    type="text"
                    value={regaLicenseNumber}
                    onChange={(e) => setRegaLicenseNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono"
                    placeholder="1200018923"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 text-start">
                    {isAr ? 'رقم ترخيص الإعلان العقاري (Ad License)' : 'Ad License Permit Number'}
                  </label>
                  <input
                    type="text"
                    value={adLicenseNumber}
                    onChange={(e) => setAdLicenseNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono"
                    placeholder="7200018942"
                  />
                </div>
              </div>

              {status === 'off-plan' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 text-start">
                    {isAr ? 'رقم تصريح برنامج وافي (Wafi Off-Plan Permit)' : 'Wafi Off-Plan Permit Number'}
                  </label>
                  <input
                    type="text"
                    value={wafiPermitNumber}
                    onChange={(e) => setWafiPermitNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono"
                    placeholder="WF-2026-9901"
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB: DRAFT PREVIEW */}
          {activeTab === 'preview' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-3 bg-slate-900 text-white rounded-2xl flex items-center justify-between text-xs font-bold">
                <span>{isAr ? 'معاينة كارت العقار قبل النشر:' : 'Listing Card Live Preview:'}</span>
                <span className="px-2 py-0.5 rounded bg-sky-600 text-[10px] font-mono">{status}</span>
              </div>

              <div className="max-w-sm mx-auto bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-lg">
                <div className="h-48 relative overflow-hidden bg-slate-100">
                  <img src={images[0] || 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80'} alt="Preview" className="w-full h-full object-cover" />
                  <span className="absolute top-3 left-3 bg-slate-900/80 text-white text-[10px] font-mono px-2 py-1 rounded-lg">
                    {priceSAR.toLocaleString()} SAR
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  <h4 className="font-bold text-sm text-slate-900">{isAr ? titleAr || 'عنوان العقار' : titleEn || 'Property Title'}</h4>
                  <p className="text-xs text-slate-500 font-mono">{isAr ? `${areaAr}، ${cityAr}` : `${areaEn}, ${cityEn}`}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-600 pt-2 border-t border-slate-100 font-mono">
                    <span>🛏️ {bedrooms} beds</span>
                    <span>🛁 {bathrooms} baths</span>
                    <span>📐 {areaSqM} sqm</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {isAr ? 'إلغاء التراجع' : 'Cancel'}
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-hard-gradient text-white text-xs sm:text-sm font-bold rounded-xl shadow-md hover:brightness-105 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>{isAr ? 'جاري الحفظ...' : 'Saving...'}</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEditing ? (isAr ? 'حفظ التعديلات' : 'Save Changes') : isAr ? 'نشر العقار الآن' : 'Publish Property'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
