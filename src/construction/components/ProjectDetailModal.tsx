import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Building2,
  ArrowRight,
  ArrowLeft,
  FileText,
  Clock,
  Coins,
  Share2,
  AlertTriangle,
} from 'lucide-react';
import { useConstruction } from '../context/ConstructionContext';
import { constructionTranslations } from '../utils/translations';
import { buildConstructionProjectUrl } from '../utils/constructionUrlParams';
import { getLocalizedCategoryLabel, formatAreaBUA } from '../utils/constructionFormatters';

export function ProjectDetailModal() {
  const {
    language,
    selectedProjectForModal,
    unknownProjectId,
    closeProjectModal,
    openQuoteModal,
  } = useConstruction();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isCopied, setIsCopied] = useState(false);

  // Reset active image index when project changes
  useEffect(() => {
    setActiveImageIndex(0);
    setIsCopied(false);
  }, [selectedProjectForModal?.id, unknownProjectId]);

  // Handle keyboard Escape to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeProjectModal();
      }
    };
    if (selectedProjectForModal || unknownProjectId) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProjectForModal, unknownProjectId, closeProjectModal]);

  if (!selectedProjectForModal && !unknownProjectId) return null;

  const t = constructionTranslations[language];
  const isAr = language === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;
  const ReturnIcon = isAr ? ArrowRight : ArrowLeft;

  // Unknown project fallback state
  if (unknownProjectId && !selectedProjectForModal) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            closeProjectModal();
          }
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="unknown-project-title"
      >
        <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-8 text-slate-900 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <button
            type="button"
            onClick={closeProjectModal}
            className="absolute top-4 end-4 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
              <span>{t.projects.notFoundTitle}</span>
            </div>
            <h2 id="unknown-project-title" className="text-xl sm:text-2xl font-bold font-display-serif text-[#0f243e]">
              {isAr ? 'لم نتمكن من العثور على المشروع' : 'Project Not Found'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
              {isAr
                ? `المعرف "${unknownProjectId}" غير موجود في قائمة مشاريع شركة هارد للإنشاءات أو ربما تم حذفه.`
                : `The project ID "${unknownProjectId}" was not found in our construction portfolio or may have been removed.`}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button
              type="button"
              onClick={closeProjectModal}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#009ee2] hover:bg-[#008bc7] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-sky-500/20"
            >
              <ReturnIcon className="w-4 h-4" />
              <span>{t.projects.backToAllProjects}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const proj = selectedProjectForModal!;
  const images = proj.galleryImages && proj.galleryImages.length > 0 ? proj.galleryImages : [proj.image];
  const scopes = isAr ? proj.scopeAr : proj.scopeEn;

  const handleCopyStableUrl = async () => {
    if (typeof window === 'undefined') return;
    const stableUrl = window.location.origin + buildConstructionProjectUrl(proj.id);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(stableUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 3000);
      }
    } catch {
      // Fallback if clipboard API is blocked
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    }
  };

  const handleInquire = () => {
    closeProjectModal();
    openQuoteModal({
      projectType:
        proj.category === 'residential'
          ? 'villa'
          : proj.category === 'commercial'
          ? 'commercial-building'
          : proj.category === 'industrial'
          ? 'warehouse'
          : 'villa',
      builtUpArea: proj.buaM2,
      source: 'project_inquiry',
      inquiredProjectId: proj.id,
      notes: `Inquiry regarding: ${isAr ? proj.titleAr : proj.titleEn} (${isAr ? proj.locationAr : proj.locationEn})`,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeProjectModal();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
    >
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-8 text-slate-900 animate-in fade-in zoom-in-95 duration-200">
        {/* Navigation & Actions Top Bar */}
        <div className="px-6 py-3.5 bg-slate-100/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          {/* Return Path to Project List */}
          <button
            type="button"
            onClick={closeProjectModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-[#009ee2] bg-white border border-slate-200 hover:border-sky-300 transition-colors cursor-pointer shadow-2xs"
            aria-label={t.projects.backToList}
          >
            <ReturnIcon className="w-4 h-4 text-[#009ee2]" />
            <span>{t.projects.backToList}</span>
          </button>

          {/* Action buttons (Share & Close) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyStableUrl}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                isCopied
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                  : 'bg-white text-slate-700 hover:text-[#009ee2] border border-slate-200 hover:border-sky-300'
              }`}
              title={t.projects.copyLink}
            >
              {isCopied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t.projects.linkCopied}</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-[#009ee2]" />
                  <span>{t.projects.shareProject}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={closeProjectModal}
              className="p-1.5 rounded-xl bg-white hover:bg-slate-200 text-slate-500 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
              aria-label={isAr ? 'إغلاق نافذة تفاصيل المشروع' : 'Close project details modal'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Title Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 text-start space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-md text-[11px] font-bold bg-[#eef7ff] text-[#009ee2] border border-sky-100 uppercase">
              {getLocalizedCategoryLabel(proj.category, language)}
            </span>
            <span className="text-xs text-slate-500">
              {isAr ? proj.cityAr : proj.cityEn} • {proj.year}
            </span>
          </div>
          <h2 id="project-modal-title" className="text-xl sm:text-2xl font-bold font-display-serif text-[#0f243e]">
            {isAr ? proj.titleAr : proj.titleEn}
          </h2>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 space-y-8 max-h-[70vh] overflow-y-auto text-start">
          {/* Main Gallery Display */}
          <div className="space-y-3">
            <div className="relative aspect-16/9 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={images[activeImageIndex] || proj.image}
                alt={
                  isAr
                    ? `معرض صور مشروع ${proj.titleAr} - صورة ${activeImageIndex + 1}`
                    : `${proj.titleEn} gallery photo ${activeImageIndex + 1}`
                }
                className="w-full h-full object-cover"
              />
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label={isAr ? 'معرض الصور المصغرة' : 'Image gallery thumbnails'}>
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    aria-label={
                      isAr
                        ? `عرض الصورة ${idx + 1} من ${images.length} لمشروع ${proj.titleAr}`
                        : `View image ${idx + 1} of ${images.length} for ${proj.titleEn}`
                    }
                    aria-current={activeImageIndex === idx ? 'true' : undefined}
                    className={`shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#009ee2] ${
                      activeImageIndex === idx ? 'border-[#009ee2] scale-105' : 'border-slate-200 opacity-60'
                    }`}
                  >
                    <img
                      src={img}
                      alt={
                        isAr
                          ? `معاينة مصغرة ${idx + 1} لمشروع ${proj.titleAr}`
                          : `Thumbnail ${idx + 1} for ${proj.titleEn}`
                      }
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Project Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-[10px] text-slate-500">{t.projects.buaLabel}</div>
              <div className="text-sm sm:text-base font-bold text-[#0f243e] flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#009ee2]" />
                <span>{formatAreaBUA(proj.buaM2, language)}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-[10px] text-slate-500">{t.projects.durationLabel}</div>
              <div className="text-sm sm:text-base font-bold text-[#0f243e] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-sky-600" />
                <span>{proj.durationMonths} {isAr ? 'أشهر' : 'Months'}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-[10px] text-slate-500">{t.projects.valueLabel}</div>
              <div className="text-sm sm:text-base font-bold text-emerald-600 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-emerald-600" />
                <span>{proj.valueSAR}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-[10px] text-slate-500">{isAr ? 'الموقع الجغرافي:' : 'Location:'}</div>
              <div className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#009ee2]" />
                <span className="truncate">{isAr ? proj.locationAr : proj.locationEn}</span>
              </div>
            </div>
          </div>

          {/* Detailed Narrative */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-[#0f243e] font-display-serif">
              {isAr ? 'الوصف الهندسي والمعماري' : 'Architectural & Engineering Overview'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {isAr ? proj.descriptionAr : proj.descriptionEn}
            </p>
          </div>

          {/* Technical Specifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-[#009ee2]">
                {isAr ? 'النظام الإنشائي المعتمد:' : 'Structural System:'}
              </div>
              <div className="text-xs text-slate-700 font-medium">
                {isAr ? proj.structuralSystemAr : proj.structuralSystemEn}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-[#009ee2]">
                {isAr ? 'مستوى وجودة التشطيب:' : 'Finishing Specification:'}
              </div>
              <div className="text-xs text-slate-700 font-medium">
                {isAr ? proj.finishingLevelAr : proj.finishingLevelEn}
              </div>
            </div>
          </div>

          {/* Scope of Work */}
          {scopes && scopes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-[#0f243e] font-display-serif">
                {isAr ? 'نطاق الأعمال والمخرجات المنفذة' : 'Scope of Execution & Deliverables'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {scopes.map((scope, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-[#009ee2] shrink-0 mt-0.5" />
                    <span>{scope}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Action Bar */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>{t.credentials.sbc}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={closeProjectModal}
                className="flex-1 sm:flex-initial px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors border border-slate-200"
              >
                <ReturnIcon className="w-4 h-4" />
                <span>{t.projects.backToList}</span>
              </button>

              <button
                type="button"
                onClick={handleInquire}
                className="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-[#009ee2] hover:bg-[#008bc7] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-sky-500/20"
              >
                <FileText className="w-4 h-4" />
                <span>{t.projects.inquireSimilar}</span>
                <ArrowIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
