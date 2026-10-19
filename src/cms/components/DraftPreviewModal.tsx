/**
 * HARD GROUP - SECURE DRAFT PREVIEW MODAL & VIEWPORT SIMULATOR
 * 
 * Renders live draft content within responsive viewports (Desktop, Tablet, Mobile)
 * without making draft updates visible to public site visitors.
 */

import React, { useState } from 'react';
import {
  X,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  Send,
  Sparkles,
  Layers,
  Globe,
  Maximize2,
} from 'lucide-react';
import { Language } from '../../types';
import { DraftPreviewBanner } from './DraftPreviewBanner';
import { DynamicPageSectionRenderer } from '../../components/ui/DynamicPageSectionRenderer';
import { PageSection } from '../../lib/sectionSchemas';

interface DraftPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPublishModal?: () => void;
  title: string;
  sections?: PageSection[];
  language: Language;
}

export const DraftPreviewModal: React.FC<DraftPreviewModalProps> = ({
  isOpen,
  onClose,
  onOpenPublishModal,
  title,
  sections = [],
  language,
}) => {
  const isAr = language === 'ar';
  const [deviceViewport, setDeviceViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  if (!isOpen) return null;

  const viewportWidthClass =
    deviceViewport === 'mobile'
      ? 'max-w-[390px]'
      : deviceViewport === 'tablet'
      ? 'max-w-[768px]'
      : 'max-w-full';

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/95 backdrop-blur-md animate-fade-in font-ui-sans">
      {/* Top Banner */}
      <DraftPreviewBanner
        isAr={isAr}
        onPublishClick={onOpenPublishModal}
        onExitPreview={onClose}
      />

      {/* Toolbar Controls */}
      <div className="bg-slate-950 border-b border-slate-800 px-6 py-3 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400">
            {isAr ? 'عنوان الصفحة:' : 'Previewing:'}
          </span>
          <span className="text-sm font-bold text-white font-display-serif">
            {title}
          </span>
        </div>

        {/* Viewport Switcher */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setDeviceViewport('desktop')}
            className={`p-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              deviceViewport === 'desktop'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
            title={isAr ? 'عرض الشاشة الكبيرة (Desktop)' : 'Desktop View'}
          >
            <Monitor className="w-4 h-4" />
            <span className="hidden sm:inline">Desktop</span>
          </button>

          <button
            onClick={() => setDeviceViewport('tablet')}
            className={`p-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              deviceViewport === 'tablet'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
            title={isAr ? 'عرض اللوحية (Tablet)' : 'Tablet View'}
          >
            <Tablet className="w-4 h-4" />
            <span className="hidden sm:inline">Tablet</span>
          </button>

          <button
            onClick={() => setDeviceViewport('mobile')}
            className={`p-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              deviceViewport === 'mobile'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
            title={isAr ? 'عرض الجوال (Mobile)' : 'Mobile View'}
          >
            <Smartphone className="w-4 h-4" />
            <span className="hidden sm:inline">Mobile</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
        >
          {isAr ? 'إغلاق المعاينة' : 'Close Preview'}
        </button>
      </div>

      {/* Simulated Viewport Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-slate-900/50">
        <div
          dir={isAr ? 'rtl' : 'ltr'}
          className={`w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden transition-all duration-300 ${viewportWidthClass}`}
        >
          {sections && sections.length > 0 ? (
            <div className="divide-y divide-slate-100">
              <DynamicPageSectionRenderer
                sections={sections.filter((sec) => sec.isVisible !== false)}
                language={language}
              />
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <Layers className="w-12 h-12 mx-auto text-slate-300" />
              <p className="text-sm font-semibold">
                {isAr ? 'لا توجد أقسام في المسودة الحالية' : 'No sections available in current draft'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
