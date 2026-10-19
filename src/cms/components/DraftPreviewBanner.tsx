/**
 * HARD GROUP - DRAFT PREVIEW BANNER
 * 
 * Floating visual indicator that clearly distinguishes draft previews from live public content.
 */

import React from 'react';
import { Eye, Shield, Send, RefreshCw, AlertTriangle, ExternalLink, X } from 'lucide-react';
import { Language } from '../../types';

interface DraftPreviewBannerProps {
  version?: number;
  lastUpdated?: string;
  isAr?: boolean;
  onPublishClick?: () => void;
  onExitPreview?: () => void;
}

export const DraftPreviewBanner: React.FC<DraftPreviewBannerProps> = ({
  version,
  lastUpdated,
  isAr = true,
  onPublishClick,
  onExitPreview,
}) => {
  return (
    <div className="sticky top-0 z-50 bg-slate-950 text-white border-b border-amber-500/40 px-4 py-2.5 shadow-xl font-ui-sans text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
            <Eye className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>{isAr ? 'معاينة مسودة غير منشورة' : 'SECURE DRAFT PREVIEW'}</span>
          </div>

          <span className="text-slate-300 hidden sm:inline">
            {isAr
              ? 'الزوار العموميون يرون النسخة المباشرة المعتمدة فقط.'
              : 'Public visitors continue seeing the previously published live version.'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {version && (
            <span className="text-[11px] font-mono text-slate-400">
              Draft v{version}
            </span>
          )}

          {onPublishClick && (
            <button
              onClick={onPublishClick}
              type="button"
              className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <Send className="w-3 h-3" />
              <span>{isAr ? 'اعتماد والنشر' : 'Publish Live'}</span>
            </button>
          )}

          {onExitPreview && (
            <button
              onClick={onExitPreview}
              type="button"
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title={isAr ? 'إغلاق المعاينة' : 'Exit Preview'}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
