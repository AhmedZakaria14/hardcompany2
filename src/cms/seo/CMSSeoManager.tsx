import React, { useState, useEffect } from 'react';
import { Language, PageId } from '../../types';
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
  applyPageSeoToHead,
} from '../../lib/seo/seoManager';
import { generateSitemapXml, buildPublicSitemapEntries } from '../../lib/seo/sitemapGenerator';
import { BilingualFormField } from '../components/BilingualFormField';
import { CMSImageUpload } from '../components/CMSImageUpload';
import {
  Globe,
  ShieldCheck,
  Search,
  Lock,
  Share2,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Download,
  ExternalLink,
  Eye,
  Save,
  Sparkles,
} from 'lucide-react';

interface CMSSeoManagerProps {
  language: Language;
}

export const CMSSeoManager: React.FC<CMSSeoManagerProps> = ({ language }) => {
  const isAr = language === 'ar';
  const { properties, projects, blogPosts } = useData();

  const [activeTab, setActiveTab] = useState<'seo' | 'legal'>('seo');
  const [seoConfigs, setSeoConfigs] = useState<Record<string, PageSeoConfig>>(getStoredSeoConfigs());
  const [legalPolicy, setLegalPolicy] = useState<LegalPolicyContent>(getStoredLegalPolicy());
  const [selectedPageKey, setSelectedPageKey] = useState<string>('portal');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Missing policy completeness validation
  const missingPolicyFlags = validateLegalPolicyCompleteness(legalPolicy);

  const currentSeo = seoConfigs[selectedPageKey] || {
    pageId: selectedPageKey as any,
    title: { en: 'HARD Group', ar: 'مجموعة هارد' },
    description: { en: 'HARD Group Portal', ar: 'بوابة هارد' },
    ogImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    indexable: true,
    canonicalPath: '/',
  };

  const handleUpdateCurrentSeo = (field: keyof PageSeoConfig, value: any) => {
    const updated = {
      ...currentSeo,
      [field]: value,
      updatedAt: new Date().toISOString(),
    };
    const newConfigs = { ...seoConfigs, [selectedPageKey]: updated };
    setSeoConfigs(newConfigs);
  };

  const handleSaveSeoSettings = () => {
    saveStoredSeoConfigs(seoConfigs);
    // Apply live SEO to current head
    applyPageSeoToHead(currentSeo, language);
    setSaveSuccessMsg(isAr ? 'تم حفظ إعدادات SEO وبيانات المشتركة بنجاح!' : 'SEO & Social metadata saved successfully!');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleSaveLegalPolicy = () => {
    saveStoredLegalPolicy(legalPolicy);
    setSaveSuccessMsg(isAr ? 'تم حفظ نصوص سياسة الخصوصية والشروط المعتمدة!' : 'Approved Privacy & Terms Policy saved successfully!');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleDownloadSitemapXml = () => {
    const xmlContent = generateSitemapXml(properties, projects, blogPosts);
    const blob = new Blob([xmlContent], { type: 'text/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const pagesList: { key: string; labelEn: string; labelAr: string; path: string }[] = [
    { key: 'portal', labelEn: 'Corporate Group Portal', labelAr: 'بوابة المجموعة القابضة', path: '/' },
    { key: 'home', labelEn: 'Real Estate Home', labelAr: 'الرئيسية - العقارات', path: '/realestate' },
    { key: 'properties', labelEn: 'Properties Search Index', labelAr: 'فهرس البحث عن العقارات', path: '/realestate/properties' },
    { key: 'projects', labelEn: 'Major Off-Plan Projects', labelAr: 'المشاريع التطويرية الكبرى', path: '/realestate/projects' },
    { key: 'marketing', labelEn: 'Real Estate Marketing', labelAr: 'التسويق والوساطة', path: '/realestate/marketing' },
    { key: 'about', labelEn: 'About Us Page', labelAr: 'من نحن والعقلية', path: '/realestate/about' },
    { key: 'blog', labelEn: 'Blog & Market Insights', labelAr: 'المدونة والتقارير', path: '/realestate/blog' },
    { key: 'contact', labelEn: 'Contact Us Page', labelAr: 'تواصل معنا', path: '/realestate/contact' },
    { key: 'construction', labelEn: 'Construction Sector', labelAr: 'قطاع المقاولات العامة', path: '/construction' },
    { key: 'hvac', labelEn: 'HVAC Solutions Sector', labelAr: 'قطاع أنظمة التكييف', path: '/hvac' },
    { key: 'privacy', labelEn: 'Privacy Policy Page', labelAr: 'صفحة سياسة الخصوصية', path: '/privacy' },
    { key: 'terms', labelEn: 'Terms of Service Page', labelAr: 'صفحة الشروط والأحكام', path: '/terms' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-600/10 text-blue-600 font-bold">
              <Globe className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 font-display-serif">
              {isAr ? 'إدارة محركات البحث (SEO) والوثائق القانونية' : 'Page SEO, Social Cards & Approved Legal Policies'}
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            {isAr
              ? 'تخصيص العناوين، صور المشاركة، فهرسة محركات البحث، وتوثيق سياسات الخصوصية والشروط.'
              : 'Page-specific meta tags, social share previews, indexability controls, and approved legal policy management.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleDownloadSitemapXml}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-colors flex items-center gap-2 shadow-xs"
          >
            <Download className="w-4 h-4 text-blue-400" />
            <span>{isAr ? 'تصدير sitemap.xml' : 'Export sitemap.xml'}</span>
          </button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('seo')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-xs sm:text-sm transition-colors cursor-pointer ${
            activeTab === 'seo'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>{isAr ? 'إعدادات SEO وبطاقات التواصل' : 'Page SEO & Social Cards'}</span>
        </button>

        <button
          onClick={() => setActiveTab('legal')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-xs sm:text-sm transition-colors cursor-pointer ${
            activeTab === 'legal'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{isAr ? 'سياسة الخصوصية والشروط المعتمدة' : 'Approved Privacy & Terms'}</span>
          {missingPolicyFlags.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          )}
        </button>
      </div>

      {saveSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* TAB 1: SEO & SOCIAL METADATA EDITOR */}
      {activeTab === 'seo' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Route Picker */}
          <div className="lg:col-span-4 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
              {isAr ? 'اختر الصفحة لتعديل الـ SEO:' : 'Select Page Route:'}
            </h3>
            <div className="space-y-1.5 max-h-[70vh] overflow-y-auto pe-1">
              {pagesList.map((pg) => {
                const isSelected = selectedPageKey === pg.key;
                const cfg = seoConfigs[pg.key];
                const isIndexable = cfg ? cfg.indexable : true;

                return (
                  <button
                    key={pg.key}
                    onClick={() => setSelectedPageKey(pg.key)}
                    className={`w-full p-3 rounded-2xl border text-start transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                        : 'bg-white text-slate-800 border-slate-200/90 hover:bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-bold block truncate">
                        {isAr ? pg.labelAr : pg.labelEn}
                      </span>
                      <span
                        className={`text-[10px] font-mono block truncate ${
                          isSelected ? 'text-blue-100' : 'text-slate-400'
                        }`}
                      >
                        {pg.path}
                      </span>
                    </div>

                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : isIndexable
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {isIndexable ? 'Index' : 'NoIndex'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: SEO Configuration Form & Live Social Preview */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-blue-600 font-mono">
                    {pagesList.find((p) => p.key === selectedPageKey)?.path}
                  </span>
                  <h2 className="text-base font-bold text-slate-900 font-display-serif">
                    {isAr
                      ? pagesList.find((p) => p.key === selectedPageKey)?.labelAr
                      : pagesList.find((p) => p.key === selectedPageKey)?.labelEn}
                  </h2>
                </div>

                <button
                  onClick={handleSaveSeoSettings}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{isAr ? 'حفظ إعدادات الصفحة' : 'Save SEO Settings'}</span>
                </button>
              </div>

              {/* Title & Description Fields */}
              <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <BilingualFormField
                  label={isAr ? 'عنوان الصفحة المخصص للمحركات' : 'SEO Page Title (<title>)'}
                  value={currentSeo.title}
                  onChange={(val) => handleUpdateCurrentSeo('title', val)}
                  required
                  language={language}
                />

                <BilingualFormField
                  label={isAr ? 'الوصف المختصر المخصص للمحركات' : "Meta Description (<meta name='description'>)"}
                  value={currentSeo.description}
                  onChange={(val) => handleUpdateCurrentSeo('description', val)}
                  type="textarea"
                  rows={2}
                  required
                  language={language}
                />
              </div>

              {/* Indexability & Canonical Path */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isAr ? 'حالة الفهرسة (Search Engine Robots)' : 'Search Indexability (Robots)'}
                  </label>
                  <select
                    value={currentSeo.indexable ? 'index' : 'noindex'}
                    onChange={(e) => handleUpdateCurrentSeo('indexable', e.target.value === 'index')}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="index">{isAr ? 'سماح بالفهرسة (index, follow)' : 'Allow Indexing (index, follow)'}</option>
                    <option value="noindex">{isAr ? 'منع الفهرسة (noindex, nofollow)' : 'Block Indexing (noindex, nofollow)'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isAr ? 'المسار المعياري (Canonical Path)' : 'Canonical Path'}
                  </label>
                  <input
                    type="text"
                    value={currentSeo.canonicalPath}
                    onChange={(e) => handleUpdateCurrentSeo('canonicalPath', e.target.value)}
                    placeholder="/realestate"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-mono"
                  />
                </div>
              </div>

              {/* Social Preview Image Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isAr ? 'صورة المعاينة لوسائل التواصل (OpenGraph / Twitter Image)' : 'Social Share Preview Image (OG / Twitter)'}
                </label>
                <CMSImageUpload
                  value={currentSeo.ogImage}
                  onChange={(val) => handleUpdateCurrentSeo('ogImage', val)}
                  language={language}
                />
              </div>

              {/* LIVE SOCIAL PREVIEW CARD */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Share2 className="w-4 h-4 text-blue-600" />
                    <span>{isAr ? 'معاينة بطاقة المشاركة الاجتماعية (Social Share Card)' : 'Live Social Media Share Preview'}</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-600" />
                    <span>XSS Sanitized</span>
                  </span>
                </div>

                {/* OpenGraph Card Mockup */}
                <div className="bg-slate-900 text-white rounded-3xl overflow-hidden border border-slate-800 shadow-lg max-w-lg mx-auto">
                  <div className="h-44 relative bg-slate-950">
                    <img
                      src={currentSeo.ogImage}
                      alt="Social Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  </div>
                  <div className="p-4 space-y-1 bg-slate-950">
                    <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider block">
                      {window.location.origin}{currentSeo.canonicalPath}
                    </span>
                    <h4 className="text-sm font-bold text-white line-clamp-1">
                      {sanitizeSeoString(getLocalizedText(currentSeo.title, language))}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {sanitizeSeoString(getLocalizedText(currentSeo.description, language))}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: APPROVED PRIVACY & TERMS POLICY EDITOR */}
      {activeTab === 'legal' && (
        <div className="space-y-6">
          {/* Missing Policy Flag Warning Box */}
          {missingPolicyFlags.length > 0 && (
            <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>{isAr ? '⚠️ إشعار عدم اكتمال البنود القانونية المطلوبة:' : '⚠️ Missing Required Approved Policy Text Notification:'}</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-xs font-semibold text-amber-800 ps-2">
                {missingPolicyFlags.map((flag, idx) => (
                  <li key={idx}>{flag}</li>
                ))}
              </ul>
              <p className="text-[11px] text-amber-700 italic pt-1">
                {isAr
                  ? 'ملاحظة: تلتزم المنصة بعرض البنود القانونية الحقيقية فقط ويتم تنبيه الإدارة في حال وجود نقص دون اختلاق بيانات وهمية.'
                  : 'Notice: Legal content adheres strictly to verified framework clauses. Missing items are explicitly flagged for compliance review instead of fabricating unverified terms.'}
              </p>
            </div>
          )}

          {/* Compliance Identifiers */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 font-display-serif flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>{isAr ? 'بيانات الاعتماد والتراخيص الرسمية (REGA & PDPL)' : 'Regulatory Governance Identifiers (REGA & PDPL)'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isAr ? 'رقم ترخيص الهيئة العامة للعقار (REGA)' : 'REGA Brokerage License ID'}
                </label>
                <input
                  type="text"
                  value={legalPolicy.complianceFlags.regaLicenseId}
                  onChange={(e) =>
                    setLegalPolicy({
                      ...legalPolicy,
                      complianceFlags: { ...legalPolicy.complianceFlags, regaLicenseId: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isAr ? 'رقم السجل التجاري' : 'Commercial Registration #'}
                </label>
                <input
                  type="text"
                  value={legalPolicy.complianceFlags.commercialRegNum}
                  onChange={(e) =>
                    setLegalPolicy({
                      ...legalPolicy,
                      complianceFlags: { ...legalPolicy.complianceFlags, commercialRegNum: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isAr ? 'بريد مسؤول حماية البيانات' : 'Data Controller Officer Email'}
                </label>
                <input
                  type="email"
                  value={legalPolicy.complianceFlags.dataControllerEmail}
                  onChange={(e) =>
                    setLegalPolicy({
                      ...legalPolicy,
                      complianceFlags: { ...legalPolicy.complianceFlags, dataControllerEmail: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Privacy Policy Sections Editor */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 font-display-serif flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-600" />
                <span>{isAr ? 'بنود سياسة الخصوصية المعالجة للبيانات (Privacy Clauses)' : 'Privacy Policy Clauses'}</span>
              </h3>

              <button
                onClick={handleSaveLegalPolicy}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>{isAr ? 'حفظ السياسات القانونية' : 'Save Legal Policies'}</span>
              </button>
            </div>

            <div className="space-y-4">
              {legalPolicy.privacyPolicy.sections.map((sec, idx) => (
                <div key={sec.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-600 font-mono">
                      Clause #{idx + 1}
                    </span>
                    {sec.isRequired && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        {isAr ? 'بند إلزامي' : 'Mandatory Clause'}
                      </span>
                    )}
                  </div>

                  <BilingualFormField
                    label={isAr ? 'عنوان البند' : 'Clause Heading'}
                    value={sec.heading}
                    onChange={(val) => {
                      const updatedSecs = [...legalPolicy.privacyPolicy.sections];
                      updatedSecs[idx].heading = val;
                      setLegalPolicy({
                        ...legalPolicy,
                        privacyPolicy: { ...legalPolicy.privacyPolicy, sections: updatedSecs },
                      });
                    }}
                    language={language}
                  />

                  <BilingualFormField
                    label={isAr ? 'نص البند القانوني' : 'Clause Body Paragraphs'}
                    value={sec.body}
                    onChange={(val) => {
                      const updatedSecs = [...legalPolicy.privacyPolicy.sections];
                      updatedSecs[idx].body = val;
                      setLegalPolicy({
                        ...legalPolicy,
                        privacyPolicy: { ...legalPolicy.privacyPolicy, sections: updatedSecs },
                      });
                    }}
                    type="textarea"
                    rows={3}
                    language={language}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
