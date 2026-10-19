import React, { useState, useEffect } from 'react';
import {
  Search,
  Shield,
  FileText,
  Lock,
  Globe,
  Share2,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
  Copy,
  Download,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  ShieldCheck,
  Link as LinkIcon,
  Code,
  Sparkles,
  FileCheck,
} from 'lucide-react';
import { Language } from '../../types';
import { getLocalizedText } from '../../lib/utils';
import { useData } from '../../context/DataContext';
import {
  PageSeoConfig,
  LegalPolicyContent,
  getStoredSeoConfigs,
  saveStoredSeoConfigs,
  getStoredLegalPolicy,
  saveStoredLegalPolicy,
  validateLegalPolicyCompleteness,
  sanitizeSeoString,
  sanitizeImageUrl,
  applyPageSeoToHead,
} from '../../lib/seo/seoManager';
import { buildPublicSitemapEntries, generateSitemapXml } from '../../lib/seo/sitemapGenerator';
import { BilingualFormField } from '../components/BilingualFormField';
import { CMSImageUpload } from '../components/CMSImageUpload';

interface CMSSeoLegalEditorProps {
  language: Language;
}

export const CMSSeoLegalEditor: React.FC<CMSSeoLegalEditorProps> = ({ language }) => {
  const isAr = language === 'ar';
  const { properties, projects, blogPosts } = useData();

  const [activeSubTab, setActiveSubTab] = useState<'seo' | 'legal' | 'sitemap'>('seo');

  // --- STATE 1: SEO CONFIGS ---
  const [seoConfigs, setSeoConfigs] = useState<Record<string, PageSeoConfig>>(() => getStoredSeoConfigs());
  const [selectedPageKey, setSelectedPageKey] = useState<string>('home');
  const [seoStatusMessage, setSeoStatusMessage] = useState<string | null>(null);

  // Active SEO Page Editing State
  const activeSeo = seoConfigs[selectedPageKey] || {
    pageId: selectedPageKey as any,
    title: { en: '', ar: '' },
    description: { en: '', ar: '' },
    ogImage: '',
    indexable: true,
    canonicalPath: '/',
  };

  const handleUpdateSeoField = (field: keyof PageSeoConfig, val: any) => {
    setSeoConfigs((prev) => ({
      ...prev,
      [selectedPageKey]: {
        ...prev[selectedPageKey],
        [field]: val,
      },
    }));
  };

  const handleSaveSeoConfigs = () => {
    // Sanitize configs before saving to prevent injection
    const sanitized: Record<string, PageSeoConfig> = {};
    Object.entries(seoConfigs).forEach(([key, cfg]) => {
      const pageCfg = cfg as PageSeoConfig;
      sanitized[key] = {
        ...pageCfg,
        title: {
          en: sanitizeSeoString(pageCfg.title?.en),
          ar: sanitizeSeoString(pageCfg.title?.ar),
        },
        description: {
          en: sanitizeSeoString(pageCfg.description?.en),
          ar: sanitizeSeoString(pageCfg.description?.ar),
        },
        ogImage: sanitizeImageUrl(pageCfg.ogImage, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'),
        indexable: Boolean(pageCfg.indexable),
      };
    });

    saveStoredSeoConfigs(sanitized);
    setSeoConfigs(sanitized);

    // Apply to current head if active page matches
    if (sanitized[selectedPageKey]) {
      applyPageSeoToHead(sanitized[selectedPageKey], language);
    }

    setSeoStatusMessage(isAr ? 'تم حفظ وإعادة تطبيق إعدادات SEO بنجاح!' : 'SEO metadata saved and applied successfully!');
    setTimeout(() => setSeoStatusMessage(null), 3500);
  };

  // --- STATE 2: LEGAL POLICY CONFIGS ---
  const [legalPolicy, setLegalPolicy] = useState<LegalPolicyContent>(() => getStoredLegalPolicy());
  const [legalTab, setLegalTab] = useState<'privacy' | 'terms' | 'governance'>('privacy');
  const [legalStatusMessage, setLegalStatusMessage] = useState<string | null>(null);

  const missingLegalFlags = validateLegalPolicyCompleteness(legalPolicy);

  const handleSaveLegalPolicy = () => {
    saveStoredLegalPolicy(legalPolicy);
    setLegalStatusMessage(
      isAr
        ? 'تم حفظ واعتماد وثيقة السياسات والشروط المعتمدة بنجاح!'
        : 'Approved legal policy document saved successfully!'
    );
    setTimeout(() => setLegalStatusMessage(null), 3500);
  };

  const handleAddPrivacySection = () => {
    const newSec = {
      id: `privacy-sec-${Date.now()}`,
      heading: { en: 'New Privacy Clause', ar: 'بند جديد في سياسة الخصوصية' },
      body: { en: '', ar: '' },
      isRequired: true,
    };
    setLegalPolicy((prev) => ({
      ...prev,
      privacyPolicy: {
        ...prev.privacyPolicy,
        sections: [...prev.privacyPolicy.sections, newSec],
      },
    }));
  };

  const handleRemovePrivacySection = (id: string) => {
    setLegalPolicy((prev) => ({
      ...prev,
      privacyPolicy: {
        ...prev.privacyPolicy,
        sections: prev.privacyPolicy.sections.filter((s) => s.id !== id),
      },
    }));
  };

  const handleAddTermsSection = () => {
    const newSec = {
      id: `terms-sec-${Date.now()}`,
      heading: { en: 'New Terms Condition', ar: 'شرط جديد في لائحة الخدمات' },
      body: { en: '', ar: '' },
      isRequired: true,
    };
    setLegalPolicy((prev) => ({
      ...prev,
      termsOfService: {
        ...prev.termsOfService,
        sections: [...prev.termsOfService.sections, newSec],
      },
    }));
  };

  const handleRemoveTermsSection = (id: string) => {
    setLegalPolicy((prev) => ({
      ...prev,
      termsOfService: {
        ...prev.termsOfService,
        sections: prev.termsOfService.sections.filter((s) => s.id !== id),
      },
    }));
  };

  // --- STATE 3: SITEMAP XML ---
  const [copiedXml, setCopiedXml] = useState(false);
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ai-hard-real-estate.vercel.app';
  const sitemapEntries = buildPublicSitemapEntries(properties, projects, blogPosts, origin);
  const sitemapXmlContent = generateSitemapXml(properties, projects, blogPosts, origin);

  const handleCopySitemapXml = async () => {
    try {
      await navigator.clipboard.writeText(sitemapXmlContent);
      setCopiedXml(true);
      setTimeout(() => setCopiedXml(false), 3000);
    } catch (e) {
      console.error('Failed to copy sitemap XML', e);
    }
  };

  const handleDownloadSitemapXml = () => {
    const blob = new Blob([sitemapXmlContent], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const pageRouteLabels: Record<string, { en: string; ar: string }> = {
    portal: { en: 'Corporate Portal (/)', ar: 'البوابة الرئيسية القابضة (/)' },
    home: { en: 'Real Estate Home (/realestate)', ar: 'الرئيسية للعقارات (/realestate)' },
    properties: { en: 'Properties Index (/realestate/properties)', ar: 'فهرس العقارات (/realestate/properties)' },
    projects: { en: 'Off-Plan Projects (/realestate/projects)', ar: 'المشاريع التطويرية (/realestate/projects)' },
    marketing: { en: 'Asset Marketing (/realestate/marketing)', ar: 'التسويق والوساطة (/realestate/marketing)' },
    about: { en: 'About Corporate (/realestate/about)', ar: 'من نحن والمجموعة (/realestate/about)' },
    blog: { en: 'Market Intelligence (/realestate/blog)', ar: 'المدونة والتقارير (/realestate/blog)' },
    contact: { en: 'Contact Offices (/realestate/contact)', ar: 'التواصل والفروع (/realestate/contact)' },
    construction: { en: 'General Contracting (/construction)', ar: 'المقاولات العامة (/construction)' },
    hvac: { en: 'HVAC Division (/hvac)', ar: 'قطاع أنظمة التكييف (/hvac)' },
    privacy: { en: 'Privacy Policy (/privacy)', ar: 'سياسة الخصوصية (/privacy)' },
    terms: { en: 'Terms of Service (/terms)', ar: 'الشروط والأحكام (/terms)' },
  };

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} className="space-y-6">
      {/* Top Header & Subtab Switcher */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 font-display-serif flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              <span>
                {isAr
                  ? 'إدارة تهيئة SEO، الصفحات القانونية وخريطة الموقع (Sitemap)'
                  : 'SEO, Approved Legal Policy & Sitemap Manager'}
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              {isAr
                ? 'ضبط العناوين والأوصاف لكل صفحة، بطاقات المشاركة الاجتماعية، حماية البيانات والخصوصية المعتمدة، وتوليد Sitemap للبحث'
                : 'Configure page-specific meta tags, social share cards, approved privacy/terms policy, and generate dynamic sitemap XML.'}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => setActiveSubTab('seo')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'seo'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>{isAr ? 'SEO وبطاقات التواصل' : 'Page SEO & Meta'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('legal')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'legal'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isAr ? 'الخصوصية والشروط المعتمدة' : 'Privacy & Terms'}</span>
              {missingLegalFlags.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('sitemap')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'sitemap'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>{isAr ? 'خريطة الموقع (Sitemap XML)' : 'Sitemap XML'}</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SUBTAB 1: PAGE-SPECIFIC SEO & SOCIAL PREVIEW CARDS */}
        {/* ========================================================================= */}
        {activeSubTab === 'seo' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Page Route Selector Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-700 font-mono me-1">
                {isAr ? 'اختر المسار لتعديله:' : 'Select Page Route:'}
              </span>
              {Object.keys(pageRouteLabels).map((key) => {
                const label = pageRouteLabels[key];
                const isSelected = selectedPageKey === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedPageKey(key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    {isAr ? label.ar : label.en}
                  </button>
                );
              })}
            </div>

            {/* Editing Form for Selected Page Route */}
            <div className="p-6 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 font-display-serif">
                    {isAr
                      ? `إعدادات SEO لمسار: ${pageRouteLabels[selectedPageKey]?.ar || selectedPageKey}`
                      : `SEO Settings for: ${pageRouteLabels[selectedPageKey]?.en || selectedPageKey}`}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Canonical Path: <strong className="text-blue-600">{activeSeo.canonicalPath}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Indexability Toggle */}
                  <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl cursor-pointer text-xs font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={activeSeo.indexable}
                      onChange={(e) => handleUpdateSeoField('indexable', e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    />
                    <span>{activeSeo.indexable ? (isAr ? 'مفهرس (index, follow)' : 'Indexable (index, follow)') : (isAr ? 'غير مفهرس (noindex)' : 'Noindex (noindex, nofollow)')}</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleSaveSeoConfigs}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isAr ? 'حفظ إعدادات SEO' : 'Save SEO Configs'}</span>
                  </button>
                </div>
              </div>

              {seoStatusMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{seoStatusMessage}</span>
                </div>
              )}

              {/* Title & Description Fields */}
              <div className="space-y-4">
                <BilingualFormField
                  label={isAr ? 'عنوان الصفحة في نتائج البحث والتواصل' : 'Page Search Title (<title> & og:title)'}
                  value={activeSeo.title}
                  onChange={(val) => handleUpdateSeoField('title', val)}
                  language={language}
                  placeholderEn="e.g., HARD Real Estate | Certified Saudi Brokerage"
                  placeholderAr="مثال: هارد للعقارات | الوساطة والاستثمار المعتمد"
                />

                <BilingualFormField
                  label={isAr ? 'الوصف المختصر للصفحة في محركات البحث' : "Meta Description (<meta name='description'>)"}
                  value={activeSeo.description}
                  onChange={(val) => handleUpdateSeoField('description', val)}
                  language={language}
                  type="textarea"
                  rows={3}
                  placeholderEn="e.g., REGA certified real estate marketing and luxury property acquisitions."
                  placeholderAr="مثال: منصة تسويق ووساطة عقارية معتمدة من الهيئة العامة للعقار (فال)."
                />
              </div>

              {/* OpenGraph & Social Preview Image */}
              <div className="space-y-3 pt-4 border-t border-slate-200/80">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Share2 className="w-4 h-4 text-blue-600" />
                    <span>{isAr ? 'صورة المعاينة لبطاقات التواصل (OpenGraph / Twitter Card Image)' : 'Social Share Preview Image (og:image)'}</span>
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">1200 x 630 px</span>
                </div>

                <CMSImageUpload
                  value={activeSeo.ogImage}
                  onChange={(url) => handleUpdateSeoField('ogImage', url)}
                  label={isAr ? 'صورة بطاقة المشاركة Social Card' : 'Social Card Preview Image'}
                  language={language}
                />
              </div>

              {/* Social Card Live Visual Preview Box */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                  {isAr ? 'معاينة البطاقة الاجتماعية الحية (Social Card Preview):' : 'Live Social Share Card Preview:'}
                </span>

                <div className="rounded-xl overflow-hidden border border-slate-200 max-w-md bg-slate-50">
                  <div className="h-44 bg-slate-200 overflow-hidden relative">
                    <img
                      src={activeSeo.ogImage || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'}
                      alt="Social Card Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80';
                      }}
                    />
                    <div className="absolute top-2 end-2 px-2 py-0.5 bg-slate-900/80 text-white font-mono text-[9px] rounded-md font-bold">
                      og:image
                    </div>
                  </div>
                  <div className="p-3 space-y-1">
                    <span className="text-[10px] text-slate-400 font-mono truncate block">
                      {origin}{activeSeo.canonicalPath}
                    </span>
                    <h5 className="font-bold text-slate-900 text-xs line-clamp-1">
                      {getLocalizedText(activeSeo.title, language)}
                    </h5>
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                      {getLocalizedText(activeSeo.description, language)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBTAB 2: APPROVED PRIVACY POLICY & TERMS OF SERVICE EDITOR */}
        {/* ========================================================================= */}
        {activeSubTab === 'legal' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Legal Nav Tabs & Missing Completeness Notice */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLegalTab('privacy')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    legalTab === 'privacy'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isAr ? 'سياسة الخصوصية (Privacy)' : 'Privacy Policy'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLegalTab('terms')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    legalTab === 'terms'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{isAr ? 'الشروط والأحكام (Terms)' : 'Terms of Service'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLegalTab('governance')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    legalTab === 'governance'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>{isAr ? 'التراخيص والهوية التنظيمية' : 'Compliance Licenses'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleSaveLegalPolicy}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isAr ? 'اعتماد ونشر الوثيقة القانونية' : 'Save & Publish Legal Policy'}</span>
              </button>
            </div>

            {legalStatusMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{legalStatusMessage}</span>
              </div>
            )}

            {/* Compliance Completeness Warning Banner (FLAGS MISSING CLAUSES WITHOUT FABRICATING) */}
            {missingLegalFlags.length > 0 ? (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>
                    {isAr
                      ? 'تنبيه تدقيق الاكتمال القانوني (تم رصد نواقص في البنود المعتمدة):'
                      : 'Legal Compliance Audit Alert (Missing Approved Policy Text Flagged):'}
                  </span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  {isAr
                    ? 'المنظومة مصممة لرفع البنود المعتمدة رسمياً فقط. لتفادي أي نصوص وهمية، يرجى استكمال البيانات أدناه أو إرسالها للمراجعة القانونية:'
                    : 'The platform strictly displays approved text only. Missing required clauses below are flagged for legal review instead of fabricating placeholder policy text:'}
                </p>
                <ul className="list-disc list-inside space-y-1 font-mono text-[11px] text-amber-900 ps-2">
                  {missingLegalFlags.map((flag, idx) => (
                    <li key={idx}>{flag}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2.5 font-bold">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  {isAr
                    ? 'كافة البنود والتراخيص الرسمية مكتملة ومطابقة لمتطلبات الهيئة العامة للعقار ונظام PDPL.'
                    : 'All required legal clauses and REGA/PDPL compliance licenses are fully approved.'}
                </span>
              </div>
            )}

            {/* TAB CONTENT 1: PRIVACY POLICY SECTIONS */}
            {legalTab === 'privacy' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 font-display-serif">
                      {isAr ? 'بنود سياسة الخصوصية وحماية البيانات الشخصية (PDPL)' : 'Privacy Policy Sections (PDPL Compliant)'}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {isAr ? 'تتيح تعديل العناوين والنصوص باللغتين العربية والإنجليزية مع الحفاظ على التوثيق الرسمي.' : 'Edit localized headings and body clauses for approved data protection policies.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddPrivacySection}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAr ? 'إضافة بند خصوصية جديد' : 'Add Clause'}</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {legalPolicy.privacyPolicy.sections.map((sec, idx) => (
                    <div key={sec.id} className="p-5 rounded-2xl bg-slate-50/90 border border-slate-200/90 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                        <span className="font-bold text-xs text-slate-900 font-mono flex items-center gap-2">
                          <Lock className="w-4 h-4 text-blue-600" />
                          <span>{isAr ? `البند رقم #${idx + 1}` : `Clause #${idx + 1}`}</span>
                        </span>

                        <div className="flex items-center gap-2">
                          <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 font-bold cursor-pointer">
                            <input
                              type="checkbox"
                              checked={sec.isRequired}
                              onChange={(e) => {
                                const val = e.target.checked;
                                setLegalPolicy((prev) => ({
                                  ...prev,
                                  privacyPolicy: {
                                    ...prev.privacyPolicy,
                                    sections: prev.privacyPolicy.sections.map((s) =>
                                      s.id === sec.id ? { ...s, isRequired: val } : s
                                    ),
                                  },
                                }));
                              }}
                              className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                            />
                            <span>{isAr ? 'بند إلزامي' : 'Mandatory'}</span>
                          </label>

                          <button
                            type="button"
                            onClick={() => handleRemovePrivacySection(sec.id)}
                            className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                            title="Remove clause"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <BilingualFormField
                        label={isAr ? 'عنوان البند' : 'Clause Heading'}
                        value={sec.heading}
                        onChange={(val) => {
                          setLegalPolicy((prev) => ({
                            ...prev,
                            privacyPolicy: {
                              ...prev.privacyPolicy,
                              sections: prev.privacyPolicy.sections.map((s) =>
                                s.id === sec.id ? { ...s, heading: val } : s
                              ),
                            },
                          }));
                        }}
                        language={language}
                      />

                      <BilingualFormField
                        label={isAr ? 'النص المعتمد للبند' : 'Approved Body Text'}
                        value={sec.body}
                        onChange={(val) => {
                          setLegalPolicy((prev) => ({
                            ...prev,
                            privacyPolicy: {
                              ...prev.privacyPolicy,
                              sections: prev.privacyPolicy.sections.map((s) =>
                                s.id === sec.id ? { ...s, body: val } : s
                              ),
                            },
                          }));
                        }}
                        language={language}
                        multiline
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: TERMS OF SERVICE SECTIONS */}
            {legalTab === 'terms' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 font-display-serif">
                      {isAr ? 'بنود الشروط والأحكام والضوابط التشغيلية' : 'Terms of Service Sections'}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {isAr ? 'تغطي شروط الاستخدام، الاستفسارات غير الملزمة، والتعاقد الرسمي عبر المنصات المعتمدة.' : 'Covers operational conditions, non-binding web forms, and notarized contracting rules.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddTermsSection}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAr ? 'إضافة شرط جديد' : 'Add Condition'}</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {legalPolicy.termsOfService.sections.map((sec, idx) => (
                    <div key={sec.id} className="p-5 rounded-2xl bg-slate-50/90 border border-slate-200/90 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                        <span className="font-bold text-xs text-slate-900 font-mono flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span>{isAr ? `الشرط رقم #${idx + 1}` : `Condition #${idx + 1}`}</span>
                        </span>

                        <div className="flex items-center gap-2">
                          <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 font-bold cursor-pointer">
                            <input
                              type="checkbox"
                              checked={sec.isRequired}
                              onChange={(e) => {
                                const val = e.target.checked;
                                setLegalPolicy((prev) => ({
                                  ...prev,
                                  termsOfService: {
                                    ...prev.termsOfService,
                                    sections: prev.termsOfService.sections.map((s) =>
                                      s.id === sec.id ? { ...s, isRequired: val } : s
                                    ),
                                  },
                                }));
                              }}
                              className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                            />
                            <span>{isAr ? 'شرط إلزامي' : 'Mandatory'}</span>
                          </label>

                          <button
                            type="button"
                            onClick={() => handleRemoveTermsSection(sec.id)}
                            className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                            title="Remove condition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <BilingualFormField
                        label={isAr ? 'عنوان الشرط' : 'Condition Heading'}
                        value={sec.heading}
                        onChange={(val) => {
                          setLegalPolicy((prev) => ({
                            ...prev,
                            termsOfService: {
                              ...prev.termsOfService,
                              sections: prev.termsOfService.sections.map((s) =>
                                s.id === sec.id ? { ...s, heading: val } : s
                              ),
                            },
                          }));
                        }}
                        language={language}
                      />

                      <BilingualFormField
                        label={isAr ? 'النص المعتمد للشرط' : 'Approved Text'}
                        value={sec.body}
                        onChange={(val) => {
                          setLegalPolicy((prev) => ({
                            ...prev,
                            termsOfService: {
                              ...prev.termsOfService,
                              sections: prev.termsOfService.sections.map((s) =>
                                s.id === sec.id ? { ...s, body: val } : s
                              ),
                            },
                          }));
                        }}
                        language={language}
                        multiline
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: REGULATORY COMPLIANCE GOVERNANCE */}
            {legalTab === 'governance' && (
              <div className="p-5 rounded-2xl bg-slate-50/90 border border-slate-200/90 space-y-4">
                <h4 className="text-sm font-bold text-slate-900 font-display-serif">
                  {isAr ? 'التراخيص المعتمدة وبيانات مسئول حماية البيانات' : 'Official Licenses & Data Controller Details'}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      {isAr ? 'رقم ترخيص الهيئة العامة للعقار (REGA)' : 'REGA Brokerage License #'}
                    </label>
                    <input
                      type="text"
                      value={legalPolicy.complianceFlags.regaLicenseId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setLegalPolicy((prev) => ({
                          ...prev,
                          complianceFlags: { ...prev.complianceFlags, regaLicenseId: val },
                        }));
                      }}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900"
                      placeholder="7200018492"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      {isAr ? 'رقم السجل التجاري (CR)' : 'Commercial Registration (CR) #'}
                    </label>
                    <input
                      type="text"
                      value={legalPolicy.complianceFlags.commercialRegNum}
                      onChange={(e) => {
                        const val = e.target.value;
                        setLegalPolicy((prev) => ({
                          ...prev,
                          complianceFlags: { ...prev.complianceFlags, commercialRegNum: val },
                        }));
                      }}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900"
                      placeholder="2051254311"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      {isAr ? 'بريد مسئول حماية البيانات (PDPL Email)' : 'Data Protection Officer Email'}
                    </label>
                    <input
                      type="email"
                      value={legalPolicy.complianceFlags.dataControllerEmail}
                      onChange={(e) => {
                        const val = e.target.value;
                        setLegalPolicy((prev) => ({
                          ...prev,
                          complianceFlags: { ...prev.complianceFlags, dataControllerEmail: val },
                        }));
                      }}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                      placeholder="info@hardgp.com"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBTAB 3: DYNAMIC PUBLIC SITEMAP GENERATOR & CANONICAL INDEX */}
        {/* ========================================================================= */}
        {activeSubTab === 'sitemap' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 font-display-serif flex items-center gap-2">
                  <Code className="w-4 h-4 text-blue-600" />
                  <span>
                    {isAr
                      ? `خريطة الموقع المباشرة (${sitemapEntries.length} مسار منشور ومستثنى منه المسودات)`
                      : `Live Generated Sitemap XML (${sitemapEntries.length} Published Routes, Drafts Excluded)`}
                  </span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  {isAr
                    ? 'يتم توليد الخريطة تلقائياً من العقارات، المشاريع، والمقالات المنشورة فقط، وتضمن العناوين والرُّوابط الرسمية.'
                    : 'Generated strictly from published, indexable items. Drafts and unlisted records are completely filtered out.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopySitemapXml}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedXml ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ كود XML' : 'Copy XML')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadSitemapXml}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تحميل ملف sitemap.xml' : 'Download sitemap.xml'}</span>
                </button>
              </div>
            </div>

            {/* List of Included Canonical Routes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pe-1">
              {sitemapEntries.map((entry, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col justify-between gap-1 font-mono"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 truncate">{entry.title}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      entry.type === 'page'
                        ? 'bg-blue-100 text-blue-800'
                        : entry.type === 'property'
                        ? 'bg-emerald-100 text-emerald-800'
                        : entry.type === 'project'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {entry.type}
                    </span>
                  </div>
                  <span className="text-[11px] text-blue-600 truncate">{entry.url}</span>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-200/60 pt-1 mt-1">
                    <span>Priority: {entry.priority}</span>
                    <span>Change: {entry.changeFreq}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* XML Code Viewer */}
            <div className="relative">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono mb-1">
                {isAr ? 'معاينة كود XML الناتجة (sitemap.xml):' : 'Raw sitemap.xml Output:'}
              </span>
              <pre className="p-4 bg-slate-900 text-blue-300 font-mono text-[11px] rounded-2xl overflow-x-auto select-all max-h-64 leading-relaxed border border-slate-800">
                {sitemapXmlContent}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
