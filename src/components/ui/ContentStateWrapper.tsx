/**
 * HARD GROUP - PUBLIC CONTENT STATE WRAPPER
 * 
 * Preserves loading, unavailable, and error states across public pages.
 */

import React from 'react';
import { RefreshCw, AlertCircle, Inbox, ShieldCheck } from 'lucide-react';
import { Language } from '../../types';

interface ContentStateWrapperProps {
  isLoading: boolean;
  error?: string | null;
  isUnavailable?: boolean;
  isLiveRealtime?: boolean;
  language?: Language;
  onRetry?: () => void;
  loadingMessageAr?: string;
  loadingMessageEn?: string;
  unavailableMessageAr?: string;
  unavailableMessageEn?: string;
  children: React.ReactNode;
}

export const ContentStateWrapper: React.FC<ContentStateWrapperProps> = ({
  isLoading,
  error,
  isUnavailable,
  isLiveRealtime,
  language = 'ar',
  onRetry,
  loadingMessageAr = 'جاري تحميل المحتوى المعتمد...',
  loadingMessageEn = 'Loading published content...',
  unavailableMessageAr = 'لا يتوفر محتوى منشور حالياً لهذا القسم.',
  unavailableMessageEn = 'No published content currently available in this section.',
  children,
}) => {
  const isAr = language === 'ar';

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="py-12 px-6 flex flex-col items-center justify-center gap-3 text-slate-500 font-ui-sans">
        <RefreshCw className="w-8 h-8 text-sky-600 animate-spin" />
        <p className="text-xs font-bold font-mono">
          {isAr ? loadingMessageAr : loadingMessageEn}
        </p>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div className="my-6 p-6 rounded-3xl bg-rose-50 border border-rose-200 text-rose-950 font-ui-sans space-y-3">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
          <h4 className="text-sm font-bold">
            {isAr ? 'تعذر جلب المحتوى المباشر' : 'Failed to load published content'}
          </h4>
        </div>
        <p className="text-xs text-rose-800 leading-relaxed font-mono">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            type="button"
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isAr ? 'إعادة المحاولة' : 'Retry'}</span>
          </button>
        )}
      </div>
    );
  }

  // 3. Unavailable / Empty State
  if (isUnavailable) {
    return (
      <div className="my-6 p-8 rounded-3xl bg-slate-50 border border-slate-200 text-slate-500 text-center font-ui-sans space-y-2">
        <Inbox className="w-10 h-10 text-slate-400 mx-auto" />
        <p className="text-xs font-bold">
          {isAr ? unavailableMessageAr : unavailableMessageEn}
        </p>
      </div>
    );
  }

  // 4. Content Loaded & Available
  return <>{children}</>;
};
