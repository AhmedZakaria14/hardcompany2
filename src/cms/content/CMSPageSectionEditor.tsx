import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  Copy,
  MoveUp,
  MoveDown,
  Eye,
  EyeOff,
  Save,
  Send,
  Sparkles,
  Check,
  AlertCircle,
  Edit3,
  Globe,
  Sliders,
  History,
} from 'lucide-react';
import { Language } from '../../types';
import { getLocalizedText } from '../../lib/utils';
import {
  PageSection,
  PageDocument,
  REGISTERED_SECTION_TYPES,
  RegisteredSectionType,
  HeroContent,
  TextBlockContent,
  StatisticsContent,
  FeatureListContent,
  CardGridContent,
  FaqAccordionContent,
  CtaBannerContent,
  ImageGalleryContent,
} from '../../lib/sectionSchemas';
import { DynamicPageSectionRenderer } from '../../components/ui/DynamicPageSectionRenderer';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { withServerTimestamps } from '../../lib/firebase/serializers';
import { useDraftAutosave } from '../../lib/cms/useDraftAutosave';
import { DraftStatusBadge } from '../components/DraftStatusBadge';
import { PublishValidationModal } from '../components/PublishValidationModal';
import { DraftPreviewModal } from '../components/DraftPreviewModal';
import { RevisionHistoryModal } from '../components/RevisionHistoryModal';
import { PublisherUser } from '../../lib/cms/publicationTypes';

interface CMSPageSectionEditorProps {
  language: Language;
  adminUser?: PublisherUser;
}

const PAGES_CATALOG: { id: string; slug: string; nameAr: string; nameEn: string; sector: 'portal' | 'realestate' | 'construction' | 'hvac' }[] = [
  { id: 'page_portal', slug: '/', nameAr: 'بوابة المجموعة القابضة (الرئيسية)', nameEn: 'Group Portal Main Page', sector: 'portal' },
  { id: 'page_realestate', slug: '/realestate', nameAr: 'صفحة قطاع العقارات', nameEn: 'Real Estate Landing Page', sector: 'realestate' },
  { id: 'page_realestate_about', slug: '/realestate/about', nameAr: 'صفحة عن هارد والقصة', nameEn: 'About Us & Legacy Page', sector: 'realestate' },
  { id: 'page_construction', slug: '/construction', nameAr: 'صفحة قطاع المقاولات', nameEn: 'Construction Landing Page', sector: 'construction' },
  { id: 'page_hvac', slug: '/hvac', nameAr: 'صفحة أنظمة التكييف HVAC', nameEn: 'HVAC Engineering Landing Page', sector: 'hvac' },
];

export const CMSPageSectionEditor: React.FC<CMSPageSectionEditorProps> = ({
  language,
  adminUser = { uid: 'admin-1', email: 'admin@hard.sa', role: 'superadmin' },
}) => {
  const isAr = language === 'ar';

  const [selectedPageId, setSelectedPageId] = useState<string>('page_portal');
  const [sections, setSections] = useState<PageSection[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(true);

  const currentPageMeta = PAGES_CATALOG.find((p) => p.id === selectedPageId) || PAGES_CATALOG[0];

  const draftState = useDraftAutosave({
    entityType: 'page_document',
    entityId: selectedPageId,
    sector: currentPageMeta.sector,
    currentData: { sections },
    userEmail: 'admin@hardgp.com',
    debounceMs: 1500,
    onDraftLoaded: (record) => {
      if (record.data?.sections && Array.isArray(record.data.sections) && record.data.sections.length > 0) {
        setSections(record.data.sections.sort((a: PageSection, b: PageSection) => a.order - b.order));
        setSelectedSectionId(record.data.sections[0].id);
      }
    },
  });

  // Load page document sections from Firestore
  useEffect(() => {
    async function loadPageDoc() {
      try {
        const docRef = doc(db, 'pages', selectedPageId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data() as PageDocument;
          if (data.sections && data.sections.length > 0) {
            setSections(data.sections.sort((a, b) => a.order - b.order));
            setSelectedSectionId(data.sections[0].id);
            return;
          }
        }
      } catch (e) {
        console.warn(`[CMSPageSectionEditor] Failed to load ${selectedPageId}:`, e);
      }

      // Default fallback sections
      const defaultSecs: PageSection[] = [
        {
          id: `sec-${Date.now()}-hero`,
          type: 'hero',
          title: { ar: 'قسم البانر الرئيسي', en: 'Hero Banner Section' },
          isVisible: true,
          order: 1,
          content: REGISTERED_SECTION_TYPES.find((s) => s.type === 'hero')!.defaultContent,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: `sec-${Date.now()}-text`,
          type: 'text_block',
          title: { ar: 'الرؤية والفقرة التعريفية', en: 'Vision Text Block' },
          isVisible: true,
          order: 2,
          content: REGISTERED_SECTION_TYPES.find((s) => s.type === 'text_block')!.defaultContent,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      setSections(defaultSecs);
      setSelectedSectionId(defaultSecs[0].id);
    }

    loadPageDoc();
  }, [selectedPageId]);

  const activeSection = sections.find((s) => s.id === selectedSectionId) || sections[0];

  const handleAddSectionFromType = (type: RegisteredSectionType) => {
    const registered = REGISTERED_SECTION_TYPES.find((r) => r.type === type);
    if (!registered) return;

    const newSec: PageSection = {
      id: `sec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      title: { ar: registered.nameAr, en: registered.nameEn },
      isVisible: true,
      order: sections.length + 1,
      content: JSON.parse(JSON.stringify(registered.defaultContent)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [...sections, newSec];
    setSections(updated);
    setSelectedSectionId(newSec.id);
    setIsCatalogModalOpen(false);
    setSaveStatus({ type: 'success', text: isAr ? 'تمت إضافة القسم الجديد' : 'Section added successfully' });
  };

  const handleDuplicateSection = (secId: string) => {
    const target = sections.find((s) => s.id === secId);
    if (!target) return;

    const clone: PageSection = {
      ...JSON.parse(JSON.stringify(target)),
      id: `sec-${Date.now()}-copy`,
      title: {
        ar: `${getLocalizedText(target.title, 'ar')} (نسخة)`,
        en: `${getLocalizedText(target.title, 'en')} (Copy)`,
      },
      order: sections.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSections([...sections, clone]);
    setSelectedSectionId(clone.id);
  };

  const handleRemoveSection = (secId: string) => {
    if (sections.length <= 1) {
      alert(isAr ? 'يجب أن تحتوي الصفحة على قسم واحد على الأقل' : 'Page must contain at least one section');
      return;
    }
    const filtered = sections.filter((s) => s.id !== secId);
    setSections(filtered);
    if (selectedSectionId === secId) {
      setSelectedSectionId(filtered[0]?.id || null);
    }
  };

  const handleMoveOrder = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === sections.length - 1)) {
      return;
    }
    const updated = [...sections];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    const reordered = updated.map((sec, idx) => ({ ...sec, order: idx + 1 }));
    setSections(reordered);
  };

  const handleToggleVisibility = (secId: string) => {
    setSections(
      sections.map((s) => (s.id === secId ? { ...s, isVisible: !s.isVisible } : s))
    );
  };

  const handleUpdateActiveSectionContent = (newContent: any) => {
    if (!selectedSectionId) return;
    setSections(
      sections.map((s) => (s.id === selectedSectionId ? { ...s, content: newContent, updatedAt: new Date().toISOString() } : s))
    );
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    setSaveStatus(null);
    try {
      const pageDoc: PageDocument = {
        id: selectedPageId,
        slug: currentPageMeta.slug,
        sector: currentPageMeta.sector,
        title: { ar: currentPageMeta.nameAr, en: currentPageMeta.nameEn },
        sections,
        publicationStatus: 'draft',
        updatedAt: new Date().toISOString(),
      };

      const docRef = doc(db, 'pages', selectedPageId);
      await setDoc(docRef, withServerTimestamps(pageDoc));
      setSaveStatus({ type: 'success', text: isAr ? 'تم حفظ مسودة الصفحة في Firestore' : 'Page draft saved to Firestore' });
    } catch (e: any) {
      setSaveStatus({ type: 'error', text: e?.message || (isAr ? 'فشل حفظ الصفحة' : 'Failed to save page draft') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async () => {
    setIsSubmitting(true);
    setSaveStatus(null);
    try {
      const pageDoc: PageDocument = {
        id: selectedPageId,
        slug: currentPageMeta.slug,
        sector: currentPageMeta.sector,
        title: { ar: currentPageMeta.nameAr, en: currentPageMeta.nameEn },
        sections,
        publicationStatus: 'published',
        updatedAt: new Date().toISOString(),
      };

      const docRef = doc(db, 'pages', selectedPageId);
      await setDoc(docRef, withServerTimestamps(pageDoc));
      setSaveStatus({ type: 'success', text: isAr ? 'تم نشر أقسام الصفحة مباشرة على الموقع!' : 'Page sections published live!' });
    } catch (e: any) {
      setSaveStatus({ type: 'error', text: e?.message || (isAr ? 'فشل النشر المباشر' : 'Publishing failed') });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-sky-100 text-sky-700 font-bold">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-display-serif">
              {isAr ? 'مُنشئ ومُحرر أقسام الصفحات العامة (Structured Page Builder)' : 'Structured Page Section Builder'}
            </h2>
            <p className="text-xs text-slate-500">
              {isAr
                ? 'إضافة، ترتيب، إخفاء، تكرار، وتعديل كافة أقسام صفحات الموقع مع الحفاظ على الهوية البصرية'
                : 'Add, reorder, hide, duplicate, and edit structured page sections using verified component schemas'}
            </p>
          </div>
        </div>

        {/* Page Selector, Preview & Publish Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <DraftStatusBadge
            status={draftState.saveStatus}
            revision={draftState.revision}
            lastSavedAt={draftState.lastSavedAt}
            errorMessage={draftState.errorMessage}
            isOffline={draftState.isOffline}
            conflictRemoteRecord={draftState.conflictRemoteRecord}
            language={language}
            onForceSave={draftState.forceSave}
            onResolveUseRemote={draftState.resolveConflictUseRemote}
            onResolveForceOverwrite={draftState.resolveConflictForceOverwrite}
          />

          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <Globe className="w-4 h-4 text-sky-600 shrink-0 ml-1" />
            <select
              value={selectedPageId}
              onChange={(e) => setSelectedPageId(e.target.value)}
              className="bg-white font-bold text-xs text-slate-800 rounded-xl px-3 py-2 border border-slate-200 cursor-pointer w-full"
            >
              {PAGES_CATALOG.map((p) => (
                <option key={p.id} value={p.id}>
                  {isAr ? p.nameAr : p.nameEn} ({p.slug})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRevisionModalOpen(true)}
              type="button"
              className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <History className="w-3.5 h-3.5 text-amber-600" />
              <span>{isAr ? 'السجل التاريخي' : 'Revision History'}</span>
            </button>

            <button
              onClick={() => setIsPreviewModalOpen(true)}
              type="button"
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAr ? 'معاينة المسودة' : 'Preview Draft'}</span>
            </button>

            <button
              onClick={() => setIsPublishModalOpen(true)}
              type="button"
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isAr ? 'اعتماد والنشر' : 'Publish Live'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Section Stack Manager + Form Editor + Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Section Stack List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 font-mono">
                {isAr ? 'ترتيب أقسام الصفحة' : 'PAGE SECTION STACK'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCatalogModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAr ? 'إضافة قسم' : 'Add Section'}</span>
              </button>
            </div>

            <div className="space-y-2">
              {sections.map((sec, index) => {
                const isSelected = sec.id === selectedSectionId;
                return (
                  <div
                    key={sec.id}
                    onClick={() => setSelectedSectionId(sec.id)}
                    className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-50/90 border-sky-300 ring-2 ring-sky-400/30'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="w-5 h-5 rounded-md bg-slate-200 text-slate-700 font-bold font-mono text-[10px] flex items-center justify-center shrink-0">
                        {sec.order}
                      </span>
                      <div className="truncate">
                        <span className="font-bold text-slate-900 block truncate">
                          {getLocalizedText(sec.title, language)}
                        </span>
                        <span className="text-[10px] text-sky-700 font-mono block">
                          {sec.type}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleMoveOrder(index, 'up')}
                        disabled={index === 0}
                        className="p-1 rounded bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                      >
                        <MoveUp className="w-3 h-3 text-slate-700" />
                      </button>
                      <button
                        onClick={() => handleMoveOrder(index, 'down')}
                        disabled={index === sections.length - 1}
                        className="p-1 rounded bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                      >
                        <MoveDown className="w-3 h-3 text-slate-700" />
                      </button>
                      <button
                        onClick={() => handleToggleVisibility(sec.id)}
                        className={`p-1 rounded border cursor-pointer ${
                          sec.isVisible ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-200 text-slate-500 border-slate-300'
                        }`}
                      >
                        {sec.isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      </button>
                      <button
                        onClick={() => handleDuplicateSection(sec.id)}
                        className="p-1 rounded bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleRemoveSection(sec.id)}
                        className="p-1 rounded bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Save & Publish Buttons */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              {saveStatus && (
                <p className={`text-xs font-bold ${saveStatus.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {saveStatus.text}
                </p>
              )}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isSubmitting}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isAr ? 'حفظ مسودة' : 'Save Draft'}</span>
                </button>
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={isSubmitting}
                  className="px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isAr ? 'نشر مباشر' : 'Publish Live'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Active Section Form Editor */}
        <div className="lg:col-span-8 space-y-6">
          {activeSection ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-sky-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    {isAr ? 'مُحرر بيانات القسم المحنوى:' : 'Editing Section:'} <span className="text-sky-600 font-mono">{activeSection.type}</span>
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-mono text-[10px] font-bold">
                  {activeSection.id}
                </span>
              </div>

              {/* Form Controls by Type */}
              {activeSection.type === 'hero' && (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">{isAr ? 'العنوان الرئيسي (بالعربية)' : 'Hero Title (Arabic)'}</label>
                    <input
                      type="text"
                      value={(activeSection.content as HeroContent).title?.ar || ''}
                      onChange={(e) => handleUpdateActiveSectionContent({ ...activeSection.content, title: { ...(activeSection.content as HeroContent).title, ar: e.target.value } })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">{isAr ? 'العنوان الرئيسي (بالإنجليزية)' : 'Hero Title (English)'}</label>
                    <input
                      type="text"
                      value={(activeSection.content as HeroContent).title?.en || ''}
                      onChange={(e) => handleUpdateActiveSectionContent({ ...activeSection.content, title: { ...(activeSection.content as HeroContent).title, en: e.target.value } })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">{isAr ? 'الوصف الفرعي (بالعربية)' : 'Hero Subtitle (Arabic)'}</label>
                    <textarea
                      rows={2}
                      value={(activeSection.content as HeroContent).subtitle?.ar || ''}
                      onChange={(e) => handleUpdateActiveSectionContent({ ...activeSection.content, subtitle: { ...(activeSection.content as HeroContent).subtitle, ar: e.target.value } })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">{isAr ? 'رابط صورة الخلفية (Background Image URL)' : 'Background Image URL'}</label>
                    <input
                      type="text"
                      value={(activeSection.content as HeroContent).bgImageUrl || ''}
                      onChange={(e) => handleUpdateActiveSectionContent({ ...activeSection.content, bgImageUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                    />
                  </div>
                </div>
              )}

              {activeSection.type === 'text_block' && (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">{isAr ? 'العنوان الرئيسي (بالعربية)' : 'Heading (Arabic)'}</label>
                    <input
                      type="text"
                      value={(activeSection.content as TextBlockContent).heading?.ar || ''}
                      onChange={(e) => handleUpdateActiveSectionContent({ ...activeSection.content, heading: { ...(activeSection.content as TextBlockContent).heading, ar: e.target.value } })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">{isAr ? 'محتوى الفقرة (بالعربية)' : 'Paragraph Body (Arabic)'}</label>
                    <textarea
                      rows={4}
                      value={(activeSection.content as TextBlockContent).bodyParagraphs?.ar || ''}
                      onChange={(e) => handleUpdateActiveSectionContent({ ...activeSection.content, bodyParagraphs: { ...(activeSection.content as TextBlockContent).bodyParagraphs, ar: e.target.value } })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
              )}

              {/* Render Section Live Preview Container */}
              <div className="pt-6 border-t border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-500 font-mono">{isAr ? 'المعاينة المباشرة لهيكل الصفحة الحالية:' : 'LIVE PAGE STACK PREVIEW'}</h4>
                <div className="p-4 bg-slate-100 rounded-3xl border border-slate-200/80">
                  <DynamicPageSectionRenderer sections={sections} language={language} />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-xs">
              {isAr ? 'اختر قسماً من القائمة لتعديله' : 'Select a section from the stack to edit'}
            </div>
          )}
        </div>
      </div>

      {/* Catalog Modal to Add New Sections */}
      {isCatalogModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 font-display-serif">
                {isAr ? 'كتالوج أشكال وهياكل الأقسام المعتمدة' : 'Select Section Schema from Catalog'}
              </h3>
              <button
                onClick={() => setIsCatalogModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {REGISTERED_SECTION_TYPES.map((reg) => (
                <div
                  key={reg.type}
                  onClick={() => handleAddSectionFromType(reg.type)}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-sky-50/80 hover:border-sky-300 transition-all cursor-pointer space-y-1 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 group-hover:text-sky-700">
                      {isAr ? reg.nameAr : reg.nameEn}
                    </span>
                    <span className="text-[10px] font-mono bg-slate-200 group-hover:bg-sky-200 text-slate-700 px-1.5 py-0.5 rounded">
                      {reg.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    {isAr ? reg.descriptionAr : reg.descriptionEn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Publish Validation & Audit Modal */}
      <PublishValidationModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onSuccess={(v) => setSaveStatus({ type: 'success', text: isAr ? `تم النشر بنجاح كإصدار v${v}` : `Published live as v${v}` })}
        entityType="page_document"
        entityId={selectedPageId}
        sector={currentPageMeta.sector}
        draftData={{
          id: selectedPageId,
          slug: currentPageMeta.slug,
          sector: currentPageMeta.sector,
          title: { ar: currentPageMeta.nameAr, en: currentPageMeta.nameEn },
          sections,
        }}
        publisherUser={adminUser}
        language={language}
      />

      {/* Secure Draft Preview Viewport Modal */}
      <DraftPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        onOpenPublishModal={() => {
          setIsPreviewModalOpen(false);
          setIsPublishModalOpen(true);
        }}
        title={isAr ? currentPageMeta.nameAr : currentPageMeta.nameEn}
        sections={sections}
        language={language}
      />

      {/* Revision History & Version Control Modal */}
      <RevisionHistoryModal
        isOpen={isRevisionModalOpen}
        onClose={() => setIsRevisionModalOpen(false)}
        entityType="page_document"
        entityId={selectedPageId}
        language={language}
        userEmail={adminUser?.email || 'admin@hard.sa'}
        onRestoreSuccess={(restoredContent, newVer) => {
          if (Array.isArray(restoredContent)) {
            setSections(restoredContent);
          } else if (restoredContent?.sections) {
            setSections(restoredContent.sections);
          }
          setSaveStatus({
            type: 'success',
            text: isAr ? `تم استرجاع الاصدار بنجاح كمسودة جديدة رقم v${newVer}` : `Restored version as new draft v${newVer}`,
          });
        }}
      />
    </div>
  );
};
