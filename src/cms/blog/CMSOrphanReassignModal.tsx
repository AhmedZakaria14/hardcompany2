import React, { useState } from 'react';
import { AlertTriangle, ArrowRight, ArrowLeft, CheckCircle2, X, RefreshCw } from 'lucide-react';
import { Language, BlogCategory, BlogAuthor } from '../../types';

interface CMSOrphanReassignModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: 'category' | 'author';
  entityName: string;
  affectedCount: number;
  affectedPosts: { id: string; titleEn: string; titleAr: string }[];
  categories?: BlogCategory[];
  authors?: BlogAuthor[];
  currentEntityId: string;
  onConfirmReassign: (targetId: string) => Promise<void>;
  language: Language;
}

export const CMSOrphanReassignModal: React.FC<CMSOrphanReassignModalProps> = ({
  isOpen,
  onClose,
  entityType,
  entityName,
  affectedCount,
  affectedPosts,
  categories = [],
  authors = [],
  currentEntityId,
  onConfirmReassign,
  language,
}) => {
  const isAr = language === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;
  const [selectedTargetId, setSelectedTargetId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  // Filter out the entity being deleted from the available replacement list
  const availableCategories = categories.filter((c) => c.id !== currentEntityId);
  const availableAuthors = authors.filter((a) => a.id !== currentEntityId);

  const handleExecute = async () => {
    if (!selectedTargetId) return;
    setIsProcessing(true);
    try {
      await onConfirmReassign(selectedTargetId);
      onClose();
    } catch (err) {
      console.error('Reassignment error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        dir={isAr ? 'rtl' : 'ltr'}
        className="bg-white w-full max-w-lg rounded-3xl border border-red-200 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-red-50 border-b border-red-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-red-950 font-display-serif">
                {entityType === 'category'
                  ? isAr ? 'منع تيتيم المقالات (حماية التصنيف)' : 'Prevent Orphaned Articles (Category In Use)'
                  : isAr ? 'منع تيتيم المقالات (حماية الكاتب)' : 'Prevent Orphaned Articles (Author In Use)'}
              </h3>
              <p className="text-[11px] text-red-700">
                {isAr
                  ? `يوجد ${affectedCount} مقال مرتبط بهذا السجل حالياً`
                  : `${affectedCount} active article(s) are currently referencing "${entityName}"`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-red-100/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {entityType === 'category'
              ? isAr
                ? `لا يمكن حذف التصنيف «${entityName}» مباشرة لأنه مستخدم في ${affectedCount} مقال. لحماية المقالات من فقدان تصنيفها، يرجى اختيار تصنيف بديل لنقل المقالات إليه أولاً:`
                : `The category "${entityName}" cannot be deleted directly because it is assigned to ${affectedCount} article(s). To protect content integrity, please select a replacement category to reassign these articles:`
              : isAr
                ? `لا يمكن حذف الكاتب «${entityName}» مباشرة لأنه منسوب إليه ${affectedCount} مقال. لحماية حقوق المحتوى، يرجى اختيار كاتب بديل لإعادة إسناد المقالات إليه أولاً:`
                : `The author "${entityName}" cannot be deleted directly because they are credited on ${affectedCount} article(s). Please select a replacement author to transfer attribution before deletion:`}
          </p>

          {/* List of affected articles */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl max-h-36 overflow-y-auto space-y-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {isAr ? 'المقالات المتأثرة:' : 'Affected Articles:'}
            </span>
            {affectedPosts.slice(0, 6).map((post) => (
              <div key={post.id} className="text-xs text-slate-700 font-medium truncate flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                <span className="truncate">{isAr ? post.titleAr : post.titleEn}</span>
              </div>
            ))}
            {affectedPosts.length > 6 && (
              <p className="text-[10px] text-slate-400 pt-1">
                {isAr ? `+ ${affectedPosts.length - 6} مقال آخر...` : `+ ${affectedPosts.length - 6} more articles...`}
              </p>
            )}
          </div>

          {/* Target Selector */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-bold text-slate-800 block">
              {entityType === 'category'
                ? isAr ? 'اختر التصنيف البديل لنقل المقالات إليه:' : 'Select Replacement Category:'
                : isAr ? 'اختر الكاتب البديل لنقل المقالات إليه:' : 'Select Replacement Author:'} *
            </label>

            {entityType === 'category' ? (
              <select
                value={selectedTargetId}
                onChange={(e) => setSelectedTargetId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{isAr ? '-- اختر تصنيفاً بديلاً --' : '-- Choose replacement category --'}</option>
                {availableCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {isAr ? c.name.ar : c.name.en}
                  </option>
                ))}
              </select>
            ) : (
              <select
                value={selectedTargetId}
                onChange={(e) => setSelectedTargetId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{isAr ? '-- اختر كاتباً بديلاً --' : '-- Choose replacement author --'}</option>
                {availableAuthors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {isAr ? a.name.ar : a.name.en} ({isAr ? a.role.ar : a.role.en})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="button"
              disabled={!selectedTargetId || isProcessing}
              onClick={handleExecute}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>
                {isProcessing
                  ? isAr ? 'جاري النقل والحذف...' : 'Reassigning & Deleting...'
                  : isAr ? 'نقل المقالات وحذف السجل بأمان' : 'Reassign Articles & Delete'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
