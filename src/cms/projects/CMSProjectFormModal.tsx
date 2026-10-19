import React, { useState, useEffect } from 'react';
import {
  X,
  Building,
  Save,
  Sparkles,
  Layers,
  MapPin,
  Image as ImageIcon,
  CheckCircle2,
  Calendar,
  Percent,
  Plus,
  Trash2,
  Star,
  Info,
} from 'lucide-react';
import { Language, Project, ProjectStatus } from '../../types';
import { SAUDI_CITIES } from '../../data/cities';
import { CMSImageUpload, CMSMultiImageGallery } from '../components/CMSImageUpload';

interface CMSProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: Partial<Project>) => Promise<void>;
  initialData?: Project | null;
  language: Language;
}

type TabType = 'basic' | 'metrics' | 'location' | 'media' | 'highlights';

export const CMSProjectFormModal: React.FC<CMSProjectFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  language,
}) => {
  const isAr = language === 'ar';
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [titleEn, setTitleEn] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [slug, setSlug] = useState('');
  const [developerEn, setDeveloperEn] = useState('');
  const [developerAr, setDeveloperAr] = useState('');
  const [categoryEn, setCategoryEn] = useState('');
  const [categoryAr, setCategoryAr] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('under-construction');
  const [progressPercentage, setProgressPercentage] = useState<number>(45);
  const [startingPriceSAR, setStartingPriceSAR] = useState('2,500,000 SAR');
  const [handoverDateEn, setHandoverDateEn] = useState('Q4 2026');
  const [handoverDateAr, setHandoverDateAr] = useState('الربع الرابع 2026');
  const [unitsTotal, setUnitsTotal] = useState<number>(100);
  const [unitsAvailable, setUnitsAvailable] = useState<number>(30);
  const [roiProjected, setRoiProjected] = useState('8.5% Projected Yield');
  const [locationEn, setLocationEn] = useState('Al Khobar Waterfront');
  const [locationAr, setLocationAr] = useState('واجهة الخُبر البحرية');
  const [cityEn, setCityEn] = useState('Al Khobar');
  const [cityAr, setCityAr] = useState('الخُبر');
  const [image, setImage] = useState('');
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [highlightsEn, setHighlightsEn] = useState<string[]>([]);
  const [highlightsAr, setHighlightsAr] = useState<string[]>([]);
  const [newHighlightEn, setNewHighlightEn] = useState('');
  const [newHighlightAr, setNewHighlightAr] = useState('');
  const [featured, setFeatured] = useState(false);

  // Hydrate form on open
  useEffect(() => {
    if (initialData) {
      setTitleEn(initialData.title?.en || '');
      setTitleAr(initialData.title?.ar || '');
      setSlug(initialData.slug || '');
      setDeveloperEn(initialData.developer?.en || '');
      setDeveloperAr(initialData.developer?.ar || '');
      setCategoryEn(initialData.category?.en || '');
      setCategoryAr(initialData.category?.ar || '');
      setDescriptionEn(initialData.description?.en || '');
      setDescriptionAr(initialData.description?.ar || '');
      setStatus(initialData.status || 'under-construction');
      setProgressPercentage(initialData.progressPercentage ?? 50);
      setStartingPriceSAR(initialData.startingPriceSAR || '');
      setHandoverDateEn(initialData.handoverDate?.en || '');
      setHandoverDateAr(initialData.handoverDate?.ar || '');
      setUnitsTotal(initialData.unitsTotal || 0);
      setUnitsAvailable(initialData.unitsAvailable || 0);
      setRoiProjected(initialData.roiProjected || '');
      setLocationEn(initialData.location?.en || '');
      setLocationAr(initialData.location?.ar || '');
      setCityEn(initialData.city?.en || 'Al Khobar');
      setCityAr(initialData.city?.ar || 'الخُبر');
      setImage(initialData.image || '');
      setGalleryUrls(initialData.gallery || [initialData.image]);
      setHighlightsEn(initialData.highlights?.en || []);
      setHighlightsAr(initialData.highlights?.ar || []);
      setFeatured(initialData.featured ?? false);
    } else {
      // Defaults for brand-new project
      setTitleEn('Al Khobar Horizon Sky Residences');
      setTitleAr('أبراج أفق الخُبر السحابية');
      setSlug(`project-${Date.now()}`);
      setDeveloperEn('HARD Capital & Developments');
      setDeveloperAr('هارد كابيتال والتطوير العقاري');
      setCategoryEn('Waterfront Masterplan');
      setCategoryAr('مشروع ساحلي متكامل');
      setDescriptionEn('An architectural landmark on Al Khobar waterfront with panoramic marine vistas, luxury concierge, and world-class leisure facilities.');
      setDescriptionAr('صرح معماري استثنائي على واجهة الخُبر البحرية بإطلالات بحرية مفتوحة ومرافق ترفيهية وخدمية متكاملة.');
      setStatus('off-plan');
      setProgressPercentage(35);
      setStartingPriceSAR('2,750,000 SAR');
      setHandoverDateEn('Q2 2027');
      setHandoverDateAr('الربع الثاني 2027');
      setUnitsTotal(140);
      setUnitsAvailable(45);
      setRoiProjected('9.2% Anticipated Rental Yield');
      setLocationEn('Corniche Road, Al Khobar');
      setLocationAr('طريق الكورنيش، الخُبر');
      setCityEn('Al Khobar');
      setCityAr('الخُبر');
      setImage('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80');
      setGalleryUrls([
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      ]);
      setHighlightsEn([
        'Direct Arabian Gulf Views',
        'Official Escrow Banking Protocol',
        'Smart Energy Management System',
        'Infinity Ocean Rooftop Pool',
      ]);
      setHighlightsAr([
        'إطلالات بحرية مباشرة على الخليج العربي',
        'ضمان حساب بنكي رسمي معتمد',
        'نظام إدارة طاقة ذكي متكامل',
        'مسبح معلق على الروف بإطلالة ساحلية',
      ]);
      setFeatured(true);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleAddGalleryUrl = () => {
    if (newGalleryUrl.trim()) {
      setGalleryUrls([...galleryUrls, newGalleryUrl.trim()]);
      setNewGalleryUrl('');
    }
  };

  const handleRemoveGalleryUrl = (idx: number) => {
    setGalleryUrls(galleryUrls.filter((_, i) => i !== idx));
  };

  const handleAddHighlight = () => {
    if (newHighlightEn.trim() || newHighlightAr.trim()) {
      setHighlightsEn([...highlightsEn, newHighlightEn.trim() || newHighlightAr.trim()]);
      setHighlightsAr([...highlightsAr, newHighlightAr.trim() || newHighlightEn.trim()]);
      setNewHighlightEn('');
      setNewHighlightAr('');
    }
  };

  const handleRemoveHighlight = (idx: number) => {
    setHighlightsEn(highlightsEn.filter((_, i) => i !== idx));
    setHighlightsAr(highlightsAr.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const projectPayload: Partial<Project> = {
        title: { en: titleEn, ar: titleAr },
        slug: slug || `project-${Date.now()}`,
        developer: { en: developerEn, ar: developerAr },
        category: { en: categoryEn, ar: categoryAr },
        description: { en: descriptionEn, ar: descriptionAr },
        status,
        progressPercentage: Number(progressPercentage),
        startingPriceSAR,
        handoverDate: { en: handoverDateEn, ar: handoverDateAr },
        unitsTotal: Number(unitsTotal),
        unitsAvailable: Number(unitsAvailable),
        roiProjected,
        location: { en: locationEn, ar: locationAr },
        city: { en: cityEn, ar: cityAr },
        image: image || galleryUrls[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
        gallery: galleryUrls.length > 0 ? galleryUrls : [image],
        highlights: { en: highlightsEn, ar: highlightsAr },
        featured,
      };

      await onSave(projectPayload);
      onClose();
    } catch (err) {
      console.error('Error saving project:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs: { id: TabType; labelEn: string; labelAr: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'basic', labelEn: '1. Basic Info', labelAr: '١. البيانات الأساسية', icon: Building },
    { id: 'metrics', labelEn: '2. Units & Timeline', labelAr: '٢. الوحدات والجدول الزمني', icon: Percent },
    { id: 'location', labelEn: '3. Location', labelAr: '٣. الموقع والجغرافيا', icon: MapPin },
    { id: 'media', labelEn: '4. Visuals & Media', labelAr: '٤. الوسائط والصور', icon: ImageIcon },
    { id: 'highlights', labelEn: '5. Key Highlights', labelAr: '٥. المزايا التنافسية', icon: CheckCircle2 },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div
        dir={isAr ? 'rtl' : 'ltr'}
        className="bg-white w-full max-w-4xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-xs">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display-serif">
                {initialData
                  ? isAr ? 'تعديل بيانات المشروع التطويري' : 'Edit Major Project'
                  : isAr ? 'إدراج مشروع تطويري جديد' : 'New Development Project'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isAr
                  ? 'برنامج إدارة الطروحات والمشاريع الكبرى والبيع على الخارطة'
                  : 'Master-planned development lifecycle & off-plan allocation manager'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 flex gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'border-blue-600 text-blue-600 bg-white shadow-2xs'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{isAr ? tab.labelAr : tab.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: BASIC INFO */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {isAr ? 'اسم المشروع (English)' : 'Project Title (English)'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Al Khobar Horizon Sky Residences"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {isAr ? 'اسم المشروع (العربية)' : 'Project Title (Arabic)'} *
                  </label>
                  <input
                    type="text"
                    required
                    dir="rtl"
                    value={titleAr}
                    onChange={(e) => setTitleAr(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                    placeholder="مثال: أبراج أفق الخُبر السحابية"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {isAr ? 'اسم المطور (EN)' : 'Developer (English)'}
                  </label>
                  <input
                    type="text"
                    value={developerEn}
                    onChange={(e) => setDeveloperEn(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                    placeholder="e.g. HARD Capital"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {isAr ? 'اسم المطور (عربي)' : 'Developer (Arabic)'}
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={developerAr}
                    onChange={(e) => setDeveloperAr(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                    placeholder="مثال: هارد للتطوير العقاري"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {isAr ? 'تصنيف المشروع (EN)' : 'Category (English)'}
                  </label>
                  <input
                    type="text"
                    value={categoryEn}
                    onChange={(e) => setCategoryEn(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                    placeholder="e.g. Luxury Waterfront Residences"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {isAr ? 'الوصف التسويقي (English)' : 'Project Description (English)'}
                </label>
                <textarea
                  rows={3}
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  placeholder="Comprehensive description of the masterplan..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {isAr ? 'الوصف التسويقي (العربية)' : 'Project Description (Arabic)'}
                </label>
                <textarea
                  rows={3}
                  dir="rtl"
                  value={descriptionAr}
                  onChange={(e) => setDescriptionAr(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  placeholder="وصف تسويقي شامل ومميزات المشروع..."
                />
              </div>

              {/* Featured toggle */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      {isAr ? 'تمييز المشروع على الصفحة الرئيسية (Featured Project)' : 'Feature on Homepage'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {isAr ? 'عرض المشروع في الصدارة كطرح رئيسي' : 'Pin this development at the top of the projects showcase'}
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB 2: METRICS & TIMELINE */}
          {activeTab === 'metrics' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {isAr ? 'حالة المشروع' : 'Project Lifecycle Status'}
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    <option value="planning">{isAr ? 'مرحلة التخطيط والتصميم (Planning)' : 'Planning & Architectural Design'}</option>
                    <option value="off-plan">{isAr ? 'إطلاق مرحلي أولي (Launch Phase)' : 'Launch Phase (Initial Allocation)'}</option>
                    <option value="under-construction">{isAr ? 'قيد الإنشاء والتطوير (Under Construction)' : 'Under Construction'}</option>
                    <option value="completed">{isAr ? 'مكتمل وجاهز للتسليم (Completed / Handover)' : 'Completed / Ready for Handover'}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>{isAr ? 'نسبة الإنجاز الإنشائي' : 'Construction Progress'}</span>
                    <span className="text-blue-600 font-extrabold">{progressPercentage}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={progressPercentage}
                    onChange={(e) => setProgressPercentage(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {isAr ? 'السعر يبدأ من (SAR)' : 'Starting Price (SAR)'}
                  </label>
                  <input
                    type="text"
                    value={startingPriceSAR}
                    onChange={(e) => setStartingPriceSAR(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                    placeholder="e.g. 2,750,000 SAR"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {isAr ? 'العائد الاستثماري المتوقع' : 'Projected ROI / Yield'}
                  </label>
                  <input
                    type="text"
                    value={roiProjected}
                    onChange={(e) => setRoiProjected(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                    placeholder="e.g. 8.9% High Rental Demand"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {isAr ? 'موعد التسليم المتوقع' : 'Handover Timeline'}
                  </label>
                  <input
                    type="text"
                    value={handoverDateEn}
                    onChange={(e) => {
                      setHandoverDateEn(e.target.value);
                      if (!handoverDateAr) setHandoverDateAr(e.target.value);
                    }}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                    placeholder="e.g. Q4 2026"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {isAr ? 'إجمالي عدد الوحدات' : 'Total Units in Masterplan'}
                  </label>
                  <input
                    type="number"
                    value={unitsTotal}
                    onChange={(e) => setUnitsTotal(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {isAr ? 'الوحدات المتبقية المتاحة للحجز' : 'Units Available For Sale'}
                  </label>
                  <input
                    type="number"
                    value={unitsAvailable}
                    onChange={(e) => setUnitsAvailable(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LOCATION */}
          {activeTab === 'location' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {isAr ? 'الموقع والعنوان (English)' : 'Location & Address (English)'}
                  </label>
                  <input
                    type="text"
                    value={locationEn}
                    onChange={(e) => setLocationEn(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                    placeholder="e.g. Corniche Road, Al Khobar"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {isAr ? 'الموقع والعنوان (العربية)' : 'Location & Address (Arabic)'}
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={locationAr}
                    onChange={(e) => setLocationAr(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                    placeholder="مثال: طريق الكورنيش، الخُبر"
                  />
                </div>
              </div>

              {/* Quick City Dropdown Selector */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
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
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 cursor-pointer"
                >
                  <option value="" disabled>{isAr ? '-- اختر المدينة --' : '-- Select City --'}</option>
                  {SAUDI_CITIES.map((c) => (
                    <option key={c.en} value={c.ar}>
                      {c.ar} - {c.en}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {isAr ? 'المدينة (EN)' : 'City (English)'}
                  </label>
                  <input
                    type="text"
                    value={cityEn}
                    onChange={(e) => setCityEn(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                    placeholder="Al Khobar"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {isAr ? 'المدينة (عربي)' : 'City (Arabic)'}
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={cityAr}
                    onChange={(e) => setCityAr(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                    placeholder="الخُبر"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MEDIA */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              {/* Main Cover Image */}
              <CMSImageUpload
                value={image}
                onChange={(newVal) => setImage(newVal)}
                language={language}
                label={isAr ? 'الصورة الرئيسية للمشروع (Hero Cover)' : 'Hero Cover Image'}
                description={isAr ? 'الصورة البارزة في أعلى صفحة المشروع والبطاقات' : 'Featured in the project banner & grid card'}
                aspectRatio="video"
                required
              />

              {/* Additional Gallery Renders */}
              <div className="pt-3 border-t border-slate-100">
                <CMSMultiImageGallery
                  images={galleryUrls}
                  onChange={(newImgs) => setGalleryUrls(newImgs)}
                  language={language}
                  label={isAr ? 'صور المعرض والمخططات الإضافية' : 'Project Gallery & Architectural Renders'}
                  description={isAr ? 'صور التصاميم والمرافق والمخططات' : 'Floor plans, renders, and lifestyle amenities'}
                />
              </div>
            </div>
          )}

          {/* TAB 5: HIGHLIGHTS */}
          {activeTab === 'highlights' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                {isAr
                  ? 'أضف نقاط القوة التنافسية والمزايا الاستثمارية للمشروع (تظهر في صفحة المشاريع والبروشور)'
                  : 'Add key selling points and investment guarantees for the project brochure'}
              </p>

              {/* Add highlight input */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newHighlightEn}
                    onChange={(e) => setNewHighlightEn(e.target.value)}
                    placeholder="Highlight in English..."
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                  <input
                    type="text"
                    dir="rtl"
                    value={newHighlightAr}
                    onChange={(e) => setNewHighlightAr(e.target.value)}
                    placeholder="الميزة بالعربية..."
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddHighlight}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAr ? 'إدراج ميزة جديدة' : 'Add Highlight'}</span>
                </button>
              </div>

              {/* List of highlights */}
              <div className="space-y-2">
                {highlightsEn.map((hEn, idx) => {
                  const hAr = highlightsAr[idx] || hEn;
                  return (
                    <div
                      key={idx}
                      className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">{hEn}</span>
                          <span className="text-[11px] text-slate-500 block">{hAr}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveHighlight(idx)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer Save Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shadow-blue-900/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? isAr ? 'جاري الحفظ...' : 'Saving...'
                    : isAr ? 'حفظ ونشر المشروع' : 'Save & Publish Project'}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
