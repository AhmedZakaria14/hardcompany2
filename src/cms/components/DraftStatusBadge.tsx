/**
 * HARD GROUP - CMS DRAFT AUTOSAVE STATUS BADGE & CONFLICT MODAL
 * 
 * Renders prominent visual indicators for draft states:
 * - Unsaved changes
 * - Saving draft
 * - Saved (with revision # & timestamp)
 * - Offline (cached locally)
 * - Save failed
 * - Concurrency conflict (with resolution controls)
 */

import React from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  WifiOff,
  RefreshCw,
  Save,
  AlertTriangle,
  ArrowDownLeft,
  UploadCloud,
} from 'lucide-react';
import { DraftSaveStatus, CMSDraftRecord } from '../../lib/cms/draftTypes';
import { Language } from '../../types';

interface DraftStatusBadgeProps {
  status: DraftSaveStatus;
  revision: number;
  lastSavedAt: string | null;
  errorMessage?: string | null;
  isOffline?: boolean;
  conflictRemoteRecord?: CMSDraftRecord | null;
  language?: Language;
  onForceSave?: () => void;
  onResolveUseRemote?: () => void;
  onResolveForceOverwrite?: () => void;
  compact?: boolean;
}

export const DraftStatusBadge: React.FC<DraftStatusBadgeProps> = ({
  status,
  revision,
  lastSavedAt,
  errorMessage,
  isOffline,
  conflictRemoteRecord,
  language = 'ar',
  onForceSave,
  onResolveUseRemote,
  onResolveForceOverwrite,
  compact = false,
}) => {
  const isAr = language === 'ar';

  const formatTime = (isoString: string | null) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString(isAr ? 'ar-SA' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const formattedTime = formatTime(lastSavedAt);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-xs font-semibold">
        {/* State 1: Unsaved Changes */}
        {status === 'unsaved' && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>{isAr ? 'تغييرات غير محفوظة' : 'Unsaved changes'}</span>
            {onForceSave && (
              <button
                onClick={onForceSave}
                type="button"
                className="ms-1.5 px-2 py-0.5 rounded bg-amber-200/80 hover:bg-amber-300 text-amber-900 text-[10px] font-bold cursor-pointer transition-colors"
              >
                {isAr ? 'حفظ الآن' : 'Save Now'}
              </button>
            )}
          </div>
        )}

        {/* State 2: Saving Draft */}
        {status === 'saving' && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-800 shadow-2xs">
            <RefreshCw className="w-3.5 h-3.5 text-sky-600 animate-spin" />
            <span>{isAr ? 'جاري حفظ المسودة...' : 'Saving draft...'}</span>
          </div>
        )}

        {/* State 3: Saved */}
        {status === 'saved' && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {isAr
                ? `تم حفظ المسودة (v${revision})`
                : `Draft saved (v${revision})`}
            </span>
            {formattedTime && (
              <span className="text-[10px] text-emerald-600/80 ms-1 font-mono">
                {formattedTime}
              </span>
            )}
          </div>
        )}

        {/* State 4: Offline */}
        {(status === 'offline' || isOffline) && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-800 shadow-2xs">
            <WifiOff className="w-3.5 h-3.5 text-orange-600" />
            <span>{isAr ? 'غير متصل (محفوظ محلياً)' : 'Offline (Saved locally)'}</span>
            {onForceSave && (
              <button
                onClick={onForceSave}
                type="button"
                className="ms-1.5 px-2 py-0.5 rounded bg-orange-200/80 hover:bg-orange-300 text-orange-900 text-[10px] font-bold cursor-pointer transition-colors"
              >
                {isAr ? 'إعادة المحاولة' : 'Retry'}
              </button>
            )}
          </div>
        )}

        {/* State 5: Save Failed */}
        {status === 'failed' && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 shadow-2xs">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>{isAr ? 'فشل حفظ المسودة' : 'Save failed'}</span>
            {onForceSave && (
              <button
                onClick={onForceSave}
                type="button"
                className="ms-1.5 px-2 py-0.5 rounded bg-rose-200/80 hover:bg-rose-300 text-rose-900 text-[10px] font-bold cursor-pointer transition-colors"
              >
                {isAr ? 'إعادة المحاولة' : 'Retry'}
              </button>
            )}
          </div>
        )}

        {/* State 6: Revision Concurrency Conflict */}
        {status === 'conflict' && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-900 shadow-2xs">
            <AlertTriangle className="w-3.5 h-3.5 text-purple-600" />
            <span>{isAr ? 'تعارض نسخ: توجد مسودة أحدث' : 'Conflict: Newer remote draft'}</span>
          </div>
        )}
      </div>

      {/* Conflict Dialog Box if status === 'conflict' */}
      {status === 'conflict' && conflictRemoteRecord && !compact && (
        <div className="p-4 rounded-2xl bg-purple-50/90 border border-purple-200 text-purple-950 space-y-3 shadow-md text-start">
          <div className="flex items-center gap-2 font-bold text-sm text-purple-900">
            <AlertTriangle className="w-4 h-4 text-purple-600 shrink-0" />
            <span>
              {isAr
                ? `تعارض في النسخ (نسختك v${revision} / نسخة السيرفر v${conflictRemoteRecord.revision})`
                : `Revision Conflict (Your local v${revision} / Server v${conflictRemoteRecord.revision})`}
            </span>
          </div>
          <p className="text-xs text-purple-800 leading-relaxed">
            {isAr
              ? `قام مستخدم آخر (${conflictRemoteRecord.updatedByEmail || 'أدمن آخر'}) بتحديث هذه المسودة في الساعة ${formatTime(conflictRemoteRecord.updatedAt)}. لمنع الاستبدال غير المقصود، يرجى اختيار إجراء:`
              : `Another user (${conflictRemoteRecord.updatedByEmail || 'admin'}) updated this draft at ${formatTime(conflictRemoteRecord.updatedAt)}. Choose how to proceed:`}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {onResolveUseRemote && (
              <button
                onClick={onResolveUseRemote}
                type="button"
                className="px-3.5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>{isAr ? 'تحميل نسخة السيرفر الأحدث' : 'Load Server Revision'}</span>
              </button>
            )}

            {onResolveForceOverwrite && (
              <button
                onClick={onResolveForceOverwrite}
                type="button"
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-purple-100 border border-purple-300 text-purple-900 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <UploadCloud className="w-3.5 h-3.5 text-purple-600" />
                <span>{isAr ? 'استبدال نسخة السيرفر بتغييراتي' : 'Force Overwrite Remote'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
