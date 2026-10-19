import React, { useState, useEffect } from 'react';
import { Save, Send, Sparkles, RefreshCw, CheckCircle2, Globe, FileText, Layers, Layers3, AlertCircle, Search } from 'lucide-react';
import { Language } from '../../types';
import {
  saveCmsSectionDraft,
  publishCmsSection,
  getCmsSection,
  subscribeCmsSection,
  CmsSectionData,
} from '../../lib/firebaseService';
import { CMSNavigationManager } from './CMSNavigationManager';
import { CMSPageSectionEditor } from './CMSPageSectionEditor';
import { CMSSeoLegalEditor } from '../seo/CMSSeoLegalEditor';

interface CMSSiteContentEditorProps {
  language: Language;
}

export const CMSSiteContentEditor: React.FC<CMSSiteContentEditorProps> = ({ language }) => {
  const isAr = language === 'ar';
  const [editorView, setEditorView] = useState<'sections' | 'navigation' | 'seo_legal'>('sections');
  const [activeSector, setActiveSector] = useState<'portal' | 'realestate' | 'construction' | 'hvac'>('portal');
  const [sectionData, setSectionData] = useState<CmsSectionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Form states for active section
  const [heroTitleEn, setHeroTitleEn] = useState('');
  const [heroTitleAr, setHeroTitleAr] = useState('');
  const [heroSubEn, setHeroSubEn] = useState('');
  const [heroSubAr, setHeroSubAr] = useState('');
  const [phoneContact, setPhoneContact] = useState('');
  const [emailContact, setEmailContact] = useState('');
  const [aboutTextEn, setAboutTextEn] = useState('');
  const [aboutTextAr, setAboutTextAr] = useState('');

  const sectionId = `${activeSector}_content`;

  useEffect(() => {
    setIsLoading(true);
    const unsub = subscribeCmsSection(sectionId, (data) => {
      if (data) {
        setSectionData(data);
        const draft = data.draft || data.published || {};
        setHeroTitleEn(draft.heroTitleEn || defaultTitles[activeSector].en);
        setHeroTitleAr(draft.heroTitleAr || defaultTitles[activeSector].ar);
        setHeroSubEn(draft.heroSubEn || defaultSubtitles[activeSector].en);
        setHeroSubAr(draft.heroSubAr || defaultSubtitles[activeSector].ar);
        setPhoneContact(draft.phoneContact || '+966 13 800 4273');
        setEmailContact(draft.emailContact || 'info@hardgp.com');
        setAboutTextEn(draft.aboutTextEn || 'HARD Group delivers world-class solutions across real estate, construction, and HVAC.');
        setAboutTextAr(draft.aboutTextAr || 'مجموعة هارد تقدم حلولاً عالمية المستوى عبر العقارات والمقاولات والتكييف.');
      } else {
        // Init default
        setHeroTitleEn(defaultTitles[activeSector].en);
        setHeroTitleAr(defaultTitles[activeSector].ar);
        setHeroSubEn(defaultSubtitles[activeSector].en);
        setHeroSubAr(defaultSubtitles[activeSector].ar);
        setPhoneContact('+966 13 800 4273');
        setEmailContact('info@hardgp.com');
        setAboutTextEn('HARD Group delivers world-class solutions across real estate, construction, and HVAC.');
        setAboutTextAr('مجموعة هارد تقدم حلولاً عالمية المستوى عبر العقارات والمقاولات والتكييف.');
      }
      setIsLoading(false);
    });

    return () => unsub();
  }, [activeSector, sectionId]);

  const defaultTitles: Record<string, { en: string; ar: string }> = {
    portal: { en: 'Pioneering Excellence Across Real Estate, Construction & HVAC', ar: 'الريادة والتميز في العقارات والمقاولات وأنظمة التكييف' },
    realestate: { en: 'Luxury Real Estate & Prime Saudi Investment Portfolio', ar: 'العقارات الفاخرة ومحفظة الاستثمار العقاري بالمملكة' },
    construction: { en: 'Turnkey Contracting & Engineering Excellence', ar: 'مقاولات متكاملة وتميز هندسي معتمد' },
    hvac: { en: 'Advanced HVAC Systems & Precision Climate Maintenance', ar: 'أنظمة التكييف المتقدمة والصيانة الدقيقة للمناخ' },
  };

  const defaultSubtitles: Record<string, { en: string; ar: string }> = {
    portal: { en: 'Building sustainable infrastructure and premium living experiences across KSA.', ar: 'نبني البنية التحتية المستدامة ونوفر تجارب سكنية وفاخرة عبر المملكة.' },
    realestate: { en: 'Exclusive villas, commercial towers, and prime land plots in KSA.', ar: 'فلل حصرية، أبراج تجارية، وأراضٍ ممتازة في المملكة العربية السعودية.' },
    construction: { en: 'High-rise developments, civil engineering, and infrastructure projects.', ar: 'مشاريع الأبراج، الهندسة المدنية، ومشاريع البنية التحتية المتكاملة.' },
    hvac: { en: 'VRF, chillers, ductwork installation, and 24/7 emergency response.', ar: 'أنظمة VRF، المبردات، تركيب مجاري الهواء، وصيانة الطوارئ على مدار 24/7.' },
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    setStatusMessage(null);
    try {
      const draftContent = {
        heroTitleEn,
        heroTitleAr,
        heroSubEn,
        heroSubAr,
        phoneContact,
        emailContact,
        aboutTextEn,
        aboutTextAr,
        updatedAt: new Date().toISOString(),
      };
      await saveCmsSectionDraft(sectionId, activeSector, draftContent, 'Admin User');
      setStatusMessage(isAr ? 'تم حفظ المسودة بنجاح في Firestore.' : 'Draft autosaved to Firestore successfully.');
    } catch (e: any) {
      setStatusMessage(isAr ? 'حدث خطأ أثناء حفظ المسودة.' : 'Failed to save draft to Firestore.');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    setStatusMessage(null);
    try {
      // First save current draft
      await handleSaveDraft();
      // Explicit publish
      await publishCmsSection(sectionId, 'Admin User');
      setStatusMessage(isAr ? 'تم نشر المحتوى مباشرة إلى الموقع المباشر!' : 'Content published live to website successfully!');
    } catch (e: any) {
      setStatusMessage(isAr ? 'حدث خطأ أثناء النشر.' : 'Failed to publish section.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} className="space-y-6">
      {/* Top Navigation Mode Switcher */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setEditorView('sections')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            editorView === 'sections'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          {isAr ? 'محتوى الأقسام والمسودات' : 'Section Content & Drafts'}
        </button>
        <button
          onClick={() => setEditorView('navigation')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            editorView === 'navigation'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          {isAr ? 'القوائم والتوجيه وروابط القطاعات' : 'Navigation Menus & URL Redirects'}
        </button>
        <button
          onClick={() => setEditorView('seo_legal')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            editorView === 'seo_legal'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Search className="w-3.5 h-3.5 text-blue-500" />
          <span>{isAr ? 'تهيئة SEO، الخصوصية وSitemap' : 'SEO, Legal & Sitemap'}</span>
        </button>
      </div>

      {editorView === 'navigation' ? (
        <CMSNavigationManager language={language} />
      ) : editorView === 'seo_legal' ? (
        <CMSSeoLegalEditor language={language} />
      ) : (
        <CMSPageSectionEditor language={language} />
      )}
    </div>
  );
};
