import React, { useState, useEffect } from 'react';
import {
  Globe,
  Palette,
  Image as ImageIcon,
  Phone,
  Share2,
  MapPin,
  FileText,
  ShieldCheck,
  Check,
  AlertCircle,
  Save,
  Send,
  RotateCcw,
  Eye,
  Sliders,
  ExternalLink,
  Building2,
  Home,
  HardHat,
  ThermometerSnowflake,
  Copy,
} from 'lucide-react';
import { Language } from '../../types';
import { SectorId } from '../../types/firestore-schema';
import {
  useSiteSettings,
  PublicBrandingSettings,
  sanitizeUrl,
  sanitizeText,
  isValidHexColor,
} from '../../context/SiteSettingsContext';

interface CMSBrandingSettingsProps {
  language: Language;
  currentAdminRole?: string;
}

const SECTORS: { id: SectorId; nameAr: string; nameEn: string; icon: any }[] = [
  { id: 'portal', nameAr: 'المجموعة القابضة (عام)', nameEn: 'HARD Group (Shared)', icon: Building2 },
  { id: 'realestate', nameAr: 'قطاع العقارات', nameEn: 'Real Estate Sector', icon: Home },
  { id: 'construction', nameAr: 'قطاع المقاولات', nameEn: 'Construction Sector', icon: HardHat },
  { id: 'hvac', nameAr: 'قطاع التكييف HVAC', nameEn: 'HVAC Engineering', icon: ThermometerSnowflake },
];

export const CMSBrandingSettings: React.FC<CMSBrandingSettingsProps> = ({
  language,
  currentAdminRole = 'superadmin',
}) => {
  const isAr = language === 'ar';
  const {
    getEffectiveSettings,
    allSectorSettings,
    saveDraftSettings,
    publishSettings,
    resetSectorSettings,
  } = useSiteSettings();

  const [activeSector, setActiveSector] = useState<SectorId>('portal');
  const [activeTab, setActiveTab] = useState<'branding' | 'contact' | 'social' | 'office' | 'footer' | 'tokens'>('branding');
  const [formData, setFormData] = useState<PublicBrandingSettings>(() => getEffectiveSettings('portal'));
  
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(true);

  // Sync state whenever activeSector changes
  useEffect(() => {
    setFormData(getEffectiveSettings(activeSector));
    setValidationErrors({});
    setSaveMessage(null);
  }, [activeSector, getEffectiveSettings]);

  const validateForm = (data: PublicBrandingSettings): boolean => {
    const errors: Record<string, string> = {};

    // URL validations
    if (data.logoUrlLight && sanitizeUrl(data.logoUrlLight) === '#invalid-url') {
      errors.logoUrlLight = isAr ? 'رابط شعار غير آمن أو يحتوي على كود برمجي' : 'Unsafe logo URL or contains executable script';
    }
    if (data.logoUrlDark && sanitizeUrl(data.logoUrlDark) === '#invalid-url') {
      errors.logoUrlDark = isAr ? 'رابط شعار غير آمن' : 'Unsafe logo URL';
    }
    if (data.office.googleMapsUrl && sanitizeUrl(data.office.googleMapsUrl) === '#invalid-url') {
      errors.googleMapsUrl = isAr ? 'رابط خرائط جوجل غير صالح' : 'Invalid Google Maps URL';
    }

    // Color validations
    if (data.designTokens.primaryAccent && !isValidHexColor(data.designTokens.primaryAccent)) {
      errors.primaryAccent = isAr ? 'كود لون Hex غير صالح (مثال: #0284c7)' : 'Invalid Hex color code (e.g. #0284c7)';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveDraft = async () => {
    if (!validateForm(formData)) {
      setSaveMessage({
        type: 'error',
        text: isAr ? 'يرجى تصحيح الأخطاء الموضحة قبل الحفظ' : 'Please fix the errors before saving',
      });
      return;
    }

    setIsSubmitting(true);
    setSaveMessage(null);
    try {
      await saveDraftSettings(activeSector, formData);
      setSaveMessage({
        type: 'success',
        text: isAr ? 'تم حفظ المسودة بنجاح' : 'Draft saved successfully',
      });
    } catch (e: any) {
      setSaveMessage({
        type: 'error',
        text: e?.message || (isAr ? 'فشل حفظ المسودة' : 'Failed to save draft'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async () => {
    if (!validateForm(formData)) {
      setSaveMessage({
        type: 'error',
        text: isAr ? 'يرجى تصحيح الأخطاء الموضحة قبل النشر' : 'Please fix errors before publishing',
      });
      return;
    }

    setIsSubmitting(true);
    setSaveMessage(null);
    try {
      await saveDraftSettings(activeSector, formData);
      await publishSettings(activeSector);
      setSaveMessage({
        type: 'success',
        text: isAr ? 'تم نشر إعدادات الهوية والعلامة التجارية بنجاح وتطبيقها على المكونات العامة!' : 'Branding settings published & applied live!',
      });
    } catch (e: any) {
      setSaveMessage({
        type: 'error',
        text: e?.message || (isAr ? 'فشل عملية النشر' : 'Publishing failed'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm(isAr ? 'هل أنت أصل من إعادة الضبط إلى الإعدادات الأصلية؟' : 'Are you sure you want to restore default settings?')) {
      await resetSectorSettings(activeSector);
      setFormData(getEffectiveSettings(activeSector));
      setSaveMessage({
        type: 'success',
        text: isAr ? 'تمت إعادة الضبط للقيم الافتراضية' : 'Restored to defaults',
      });
    }
  };

  const isSharedPortal = activeSector === 'portal';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-2xl bg-sky-100 text-sky-700 font-bold">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-display-serif">
                {isAr ? 'إدارة الهوية البصرية والعلامة التجارية وإعدادات الموقع' : 'Branding, Identity & Public Settings'}
              </h2>
              <p className="text-xs text-slate-500">
                {isAr
                  ? 'التحكم بالشعارات، أسماء القطاعات، قنوات التواصل، ألوان التصميم، والتراخيص المعتمدة'
                  : 'Manage logos, brand names, contact details, design tokens, and verified licenses'}
              </p>
            </div>
          </div>
        </div>

        {/* Live Preview Toggle & Status */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowLivePreview(!showLivePreview)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
              showLivePreview
                ? 'bg-sky-50 border-sky-300 text-sky-800'
                : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>{showLivePreview ? (isAr ? 'إخفاء المعاينة' : 'Hide Preview') : (isAr ? 'معاينة فورية' : 'Live Preview')}</span>
          </button>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
              formData.publicationStatus === 'published'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-amber-100 text-amber-800 border border-amber-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{formData.publicationStatus === 'published' ? (isAr ? 'منشور مباشرة' : 'Published Live') : (isAr ? 'مسودة معدلة' : 'Draft Modified')}</span>
          </span>
        </div>
      </div>

      {/* Sector Selection Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
        {SECTORS.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSector === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => setActiveSector(sec.id)}
              className={`p-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                isActive
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
              <span>{isAr ? sec.nameAr : sec.nameEn}</span>
            </button>
          );
        })}
      </div>

      {/* Precedence Indicator Banner */}
      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between text-slate-700">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-sky-600 shrink-0" />
          <span>
            {isSharedPortal
              ? (isAr ? 'أنت تعدل الإعدادات العامة الأساسية للمجموعة القابضة (تطبق كأصل لكافة القطاعات).' : 'Editing base group settings (inherits to all sectors unless overridden).')
              : (isAr ? `أنت تعدل تخصيصات قطاع: ${SECTORS.find(s => s.id === activeSector)?.nameAr}` : `Editing overrides for: ${SECTORS.find(s => s.id === activeSector)?.nameEn}`)}
          </span>
        </div>

        <span className="px-2.5 py-0.5 rounded-md bg-sky-100 text-sky-800 font-mono text-[11px] font-bold">
          {isSharedPortal ? (isAr ? 'المستوى الأول (Group Standard)' : 'Base Standard') : (isAr ? 'أولوية التخصيص (Sector Override)' : 'Sector Override')}
        </span>
      </div>

      {/* Main Settings Grid (Form + Live Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Container */}
        <div className={showLivePreview ? 'lg:col-span-7 space-y-6' : 'lg:col-span-12 space-y-6'}>
          {/* Internal Navigation Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
            {[
              { id: 'branding', labelAr: 'الشعارات والهوية', labelEn: 'Logos & Identity', icon: ImageIcon },
              { id: 'contact', labelAr: 'التواصل والخدمة', labelEn: 'Contact Channels', icon: Phone },
              { id: 'office', labelAr: 'المقر الرئيسي والخرائط', labelEn: 'Office Location', icon: MapPin },
              { id: 'social', labelAr: 'وسائل التواصل', labelEn: 'Social Media', icon: Share2 },
              { id: 'footer', labelAr: 'الفوتر والتراخيص', labelEn: 'Footer & Licenses', icon: FileText },
              { id: 'tokens', labelAr: 'ألوان التصميم', labelEn: 'Design Tokens', icon: Palette },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isCurrent = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isCurrent
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  <span>{isAr ? tab.labelAr : tab.labelEn}</span>
                </button>
              );
            })}
          </div>

          {/* Form Content Panel */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-xs">
            {/* 1. BRANDING & LOGOS */}
            {activeTab === 'branding' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-sky-600" />
                  <span>{isAr ? 'الأصول البصرية والأسماء الرسمية' : 'Visual Assets & Official Branding'}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isAr ? 'رابط الشعار المضيء (الخلفية الداكنة)' : 'Light Logo URL (Dark Theme)'}
                    </label>
                    <input
                      type="text"
                      value={formData.logoUrlLight}
                      onChange={(e) => setFormData({ ...formData, logoUrlLight: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:bg-white focus:ring-2 focus:ring-sky-500"
                      placeholder="/logo.svg or https://..."
                    />
                    {validationErrors.logoUrlLight && (
                      <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{validationErrors.logoUrlLight}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isAr ? 'رابط الشعار الداكن (الخلفية الفاتحة)' : 'Dark Logo URL (Light Theme)'}
                    </label>
                    <input
                      type="text"
                      value={formData.logoUrlDark}
                      onChange={(e) => setFormData({ ...formData, logoUrlDark: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:bg-white focus:ring-2 focus:ring-sky-500"
                      placeholder="/logo.svg or https://..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isAr ? 'اسم العلامة / القطاع (بالعربية)' : 'Brand Name (Arabic)'}
                    </label>
                    <input
                      type="text"
                      value={formData.siteName?.ar || ''}
                      onChange={(e) => setFormData({ ...formData, siteName: { ...formData.siteName, ar: e.target.value } })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isAr ? 'اسم العلامة / القطاع (بالإنجليزية)' : 'Brand Name (English)'}
                    </label>
                    <input
                      type="text"
                      value={formData.siteName?.en || ''}
                      onChange={(e) => setFormData({ ...formData, siteName: { ...formData.siteName, en: e.target.value } })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isAr ? 'الشعار اللفظي / Tagline (بالعربية)' : 'Tagline / Slogan (Arabic)'}
                    </label>
                    <input
                      type="text"
                      value={formData.tagline?.ar || ''}
                      onChange={(e) => setFormData({ ...formData, tagline: { ...formData.tagline, ar: e.target.value } })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isAr ? 'الشعار اللفظي / Tagline (بالإنجليزية)' : 'Tagline / Slogan (English)'}
                    </label>
                    <input
                      type="text"
                      value={formData.tagline?.en || ''}
                      onChange={(e) => setFormData({ ...formData, tagline: { ...formData.tagline, en: e.target.value } })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isAr ? 'الملخص التعريفي للعلامة التجارية (بالعربية)' : 'About Summary (Arabic)'}
                  </label>
                  <textarea
                    rows={2}
                    value={formData.aboutSummary?.ar || ''}
                    onChange={(e) => setFormData({ ...formData, aboutSummary: { ...formData.aboutSummary, ar: e.target.value } })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            )}

            {/* 2. CONTACT CHANNELS */}
            {activeTab === 'contact' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-sky-600" />
                  <span>{isAr ? 'قنوات الاتصال المباشر وخدمة العملاء' : 'Contact Channels & Customer Care'}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isAr ? 'البريد الإلكتروني الرسمي' : 'Official Email Address'}
                    </label>
                    <input
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isAr ? 'رقم الهاتف المباشر' : 'Direct Support Phone'}
                    </label>
                    <input
                      type="text"
                      value={formData.supportPhone}
                      onChange={(e) => setFormData({ ...formData, supportPhone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isAr ? 'رقم الواتساب الرسمي (WhatsApp)' : 'Official WhatsApp Number'}
                    </label>
                    <input
                      type="text"
                      value={formData.whatsappNumber}
                      onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isAr ? 'الرقم المجاني (Toll Free)' : 'Toll Free Hotline'}
                    </label>
                    <input
                      type="text"
                      value={formData.tollFreeNumber}
                      onChange={(e) => setFormData({ ...formData, tollFreeNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isAr ? 'ساعات العمل الرسمية (بالعربية)' : 'Working Hours (Arabic)'}
                    </label>
                    <input
                      type="text"
                      value={formData.workingHours?.ar || ''}
                      onChange={(e) => setFormData({ ...formData, workingHours: { ...formData.workingHours, ar: e.target.value } })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isAr ? 'ساعات العمل الرسمية (بالإنجليزية)' : 'Working Hours (English)'}
                    </label>
                    <input
                      type="text"
                      value={formData.workingHours?.en || ''}
                      onChange={(e) => setFormData({ ...formData, workingHours: { ...formData.workingHours, en: e.target.value } })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3. OFFICE LOCATION */}
            {activeTab === 'office' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-sky-600" />
                  <span>{isAr ? 'بيانات مقر الشركة الرئيسي والخرائط' : 'HQ Office Location & Maps'}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isAr ? 'العنوان الوطني التفصيلي (بالعربية)' : 'Full Address (Arabic)'}
                    </label>
                    <input
                      type="text"
                      value={formData.office?.address?.ar || ''}
                      onChange={(e) => setFormData({ ...formData, office: { ...formData.office, address: { ...formData.office?.address, ar: e.target.value } } })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isAr ? 'العنوان التفصيلي (بالإنجليزية)' : 'Full Address (English)'}
                    </label>
                    <input
                      type="text"
                      value={formData.office?.address?.en || ''}
                      onChange={(e) => setFormData({ ...formData, office: { ...formData.office, address: { ...formData.office.address, en: e.target.value } } })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isAr ? 'رابط موقع خرائط جوجل (Google Maps Link)' : 'Google Maps Link'}
                  </label>
                  <input
                    type="text"
                    value={formData.office.googleMapsUrl || ''}
                    onChange={(e) => setFormData({ ...formData, office: { ...formData.office, googleMapsUrl: e.target.value } })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:bg-white focus:ring-2 focus:ring-sky-500"
                    placeholder="https://maps.google.com/..."
                  />
                  {validationErrors.googleMapsUrl && (
                    <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{validationErrors.googleMapsUrl}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* 4. SOCIAL MEDIA */}
            {activeTab === 'social' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-sky-600" />
                  <span>{isAr ? 'حسابات منصات التواصل الاجتماعي' : 'Social Media Profiles'}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Twitter / X</label>
                    <input
                      type="text"
                      value={formData.socialLinks.twitter || ''}
                      onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, twitter: e.target.value } })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">LinkedIn</label>
                    <input
                      type="text"
                      value={formData.socialLinks.linkedin || ''}
                      onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, linkedin: e.target.value } })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Instagram</label>
                    <input
                      type="text"
                      value={formData.socialLinks.instagram || ''}
                      onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, instagram: e.target.value } })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">YouTube</label>
                    <input
                      type="text"
                      value={formData.socialLinks.youtube || ''}
                      onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, youtube: e.target.value } })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 5. FOOTER & LICENSES */}
            {activeTab === 'footer' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-sky-600" />
                  <span>{isAr ? 'تراخيص الشركة وسجل الحقوق والملاءة القانونية' : 'Footer, Legal & Regulatory Licenses'}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isAr ? 'حقوق النشر والملكية (بالعربية)' : 'Copyright Text (Arabic)'}
                    </label>
                    <input
                      type="text"
                      value={formData.footerContent.copyrightText.ar}
                      onChange={(e) => setFormData({ ...formData, footerContent: { ...formData.footerContent, copyrightText: { ...formData.footerContent.copyrightText, ar: e.target.value } } })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isAr ? 'حقوق النشر والملكية (بالإنجليزية)' : 'Copyright Text (English)'}
                    </label>
                    <input
                      type="text"
                      value={formData.footerContent.copyrightText.en}
                      onChange={(e) => setFormData({ ...formData, footerContent: { ...formData.footerContent, copyrightText: { ...formData.footerContent.copyrightText, en: e.target.value } } })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isAr ? 'رقم السجل التجاري (CR Number)' : 'Commercial Registration (CR)'}
                    </label>
                    <input
                      type="text"
                      value={formData.footerContent.crNumber || ''}
                      onChange={(e) => setFormData({ ...formData, footerContent: { ...formData.footerContent, crNumber: e.target.value } })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isAr ? 'الرقم الضريبي (VAT Number)' : 'Tax Identification Number (VAT)'}
                    </label>
                    <input
                      type="text"
                      value={formData.footerContent.taxNumber || ''}
                      onChange={(e) => setFormData({ ...formData, footerContent: { ...formData.footerContent, taxNumber: e.target.value } })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 6. DESIGN TOKENS */}
            {activeTab === 'tokens' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-sky-600" />
                  <span>{isAr ? 'رموز التصميم وألوان الهوية البصرية (Design Tokens)' : 'Design Tokens & Theme Colors'}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isAr ? 'اللون الرئيسي للقطاع (Primary Accent)' : 'Primary Accent Color'}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.designTokens.primaryAccent || '#0284c7'}
                        onChange={(e) => setFormData({ ...formData, designTokens: { ...formData.designTokens, primaryAccent: e.target.value } })}
                        className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0"
                      />
                      <input
                        type="text"
                        value={formData.designTokens.primaryAccent}
                        onChange={(e) => setFormData({ ...formData, designTokens: { ...formData.designTokens, primaryAccent: e.target.value } })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800"
                        placeholder="#0284c7"
                      />
                    </div>
                    {validationErrors.primaryAccent && (
                      <p className="text-[11px] text-rose-600 mt-1">{validationErrors.primaryAccent}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isAr ? 'اللون الثانوي (Secondary Accent)' : 'Secondary Accent Color'}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.designTokens.secondaryAccent || '#0f172a'}
                        onChange={(e) => setFormData({ ...formData, designTokens: { ...formData.designTokens, secondaryAccent: e.target.value } })}
                        className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0"
                      />
                      <input
                        type="text"
                        value={formData.designTokens.secondaryAccent}
                        onChange={(e) => setFormData({ ...formData, designTokens: { ...formData.designTokens, secondaryAccent: e.target.value } })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800"
                        placeholder="#0f172a"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Status Message Alert */}
            {saveMessage && (
              <div
                className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between animate-in fade-in ${
                  saveMessage.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  {saveMessage.type === 'success' ? (
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span className="font-semibold">{saveMessage.text}</span>
                </div>
              </div>
            )}

            {/* Submit Toolbar */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isAr ? 'إعادة الضبط' : 'Restore Defaults'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isAr ? 'حفظ مسودة' : 'Save Draft'}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isAr ? 'نشر مباشر للموقع' : 'Publish Live'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Live Interactive Preview Panel */}
        {showLivePreview && (
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 space-y-4 sticky top-6 shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: formData.designTokens.primaryAccent || '#0284c7' }}
                  />
                  <span className="text-xs font-bold font-mono">
                    {isAr ? 'معاينة المكونات المباشرة' : 'Live Component Preview'}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono">
                  {formData.sector.toUpperCase()}
                </span>
              </div>

              {/* Simulated Public Navbar */}
              <div className="bg-slate-950/80 rounded-2xl p-3 border border-slate-800 space-y-2">
                <span className="text-[10px] text-slate-500 font-mono block">NAVBAR HEADER</span>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={formData.logoUrlLight || '/logo.svg'}
                      alt="Logo"
                      className="h-7 w-auto object-contain"
                      onError={(e: any) => { e.target.src = '/logo.svg'; }}
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white">{isAr ? (formData.siteName?.ar || formData.siteName?.en || '') : (formData.siteName?.en || formData.siteName?.ar || '')}</h4>
                      <p className="text-[9px] text-slate-400 truncate max-w-[150px]">
                        {isAr ? (formData.tagline?.ar || formData.tagline?.en || '') : (formData.tagline?.en || formData.tagline?.ar || '')}
                      </p>
                    </div>
                  </div>

                  <span
                    className="px-2 py-1 rounded-lg text-[10px] font-bold text-white"
                    style={{ backgroundColor: formData.designTokens.primaryAccent || '#0284c7' }}
                  >
                    {isAr ? 'اتصل بنا' : 'Contact Us'}
                  </span>
                </div>
              </div>

              {/* Simulated Contact Badges */}
              <div className="bg-slate-950/80 rounded-2xl p-3 border border-slate-800 space-y-2">
                <span className="text-[10px] text-slate-500 font-mono block">CONTACT BADGES</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span className="font-mono text-slate-200 truncate">{formData.supportPhone}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="font-mono text-slate-200 truncate">{formData.contactEmail}</span>
                  </div>
                </div>
              </div>

              {/* Simulated Footer Licenses */}
              <div className="bg-slate-950/80 rounded-2xl p-3 border border-slate-800 space-y-2 text-[10px]">
                <span className="text-[10px] text-slate-500 font-mono block">FOOTER LEGAL</span>
                <p className="text-slate-300 font-sans">
                  {isAr ? (formData.footerContent?.copyrightText?.ar || formData.footerContent?.copyrightText?.en || '') : (formData.footerContent?.copyrightText?.en || formData.footerContent?.copyrightText?.ar || '')}
                </p>
                <div className="flex flex-wrap gap-2 pt-1 font-mono text-[9px] text-slate-400">
                  {formData.footerContent.crNumber && (
                    <span className="px-1.5 py-0.5 bg-slate-900 rounded border border-slate-800">
                      CR: {formData.footerContent.crNumber}
                    </span>
                  )}
                  {formData.footerContent.taxNumber && (
                    <span className="px-1.5 py-0.5 bg-slate-900 rounded border border-slate-800">
                      VAT: {formData.footerContent.taxNumber}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
