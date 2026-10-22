/**
 * HARD GROUP - PRE-DELETION REFERENCE CHECK & SOFT DELETE MODAL
 * 
 * Audits active site references (navigation, published pages, articles) before deletion,
 * confirms customer lead isolation, and performs soft deletion into `trash_bin`.
 */

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Trash2,
  ShieldCheck,
  X,
  RefreshCw,
  ExternalLink,
  Layers,
  FileText,
  Users,
} from 'lucide-react';
import { Language } from '../../types';
import { getLocalizedText } from '../../lib/utils';
import { PublisherUser } from '../../lib/cms/publicationTypes';
import { TrashEntityType, ReferenceCheckResult } from '../../lib/cms/archivalTypes';
import { checkReferencesBeforeDelete, moveToTrash } from '../../lib/cms/archivalService';

interface PreDeleteReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: TrashEntityType;
  entityId: string;
  entityTitle: { ar: string; en: string } | string;
  originalCollection: string;
  originalData: any;
  currentUser: PublisherUser;
  language: Language;
  onSoftDeleteSuccess?: () => void;
}

export const PreDeleteReferenceModal: React.FC<PreDeleteReferenceModalProps> = ({
  isOpen,
  onClose,
  entityType,
  entityId,
  entityTitle,
  originalCollection,
  originalData,
  currentUser,
  language,
  onSoftDeleteSuccess,
}) => {
  const isAr = language === 'ar';

  const [refResult, setRefResult] = useState<ReferenceCheckResult | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const titleString = typeof entityTitle === 'object' && entityTitle !== null
    ? (isAr ? (entityTitle.ar || entityTitle.en || '') : (entityTitle.en || entityTitle.ar || ''))
    : String(entityTitle || '');

  useEffect(() => {
    if (isOpen && entityType && entityId) {
      runReferenceAudit();
    } else {
      setRefResult(null);
      setErrorMsg(null);
    }
  }, [isOpen, entityType, entityId]);

  const runReferenceAudit = async () => {
    setIsAuditing(true);
    setErrorMsg(null);
    try {
      const res = await checkReferencesBeforeDelete(entityType, entityId, entityTitle);
      setRefResult(res);
    } catch (err) {
      console.error('[PreDeleteReferenceModal] Audit error:', err);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleConfirmMoveToTrash = async () => {
    setIsArchiving(true);
    setErrorMsg(null);

    try {
      await moveToTrash({
        entityType,
        entityId,
        title: entityTitle,
        originalCollection,
        originalData,
        userEmail: currentUser.email,
        userRole: currentUser.role,
        retentionDays: 30,
      });

      if (onSoftDeleteSuccess) {
        onSoftDeleteSuccess();
      }

      onClose();
    } catch (err: any) {
      console.error('[PreDeleteReferenceModal] Move to trash error:', err);
      setErrorMsg(err.message || (isAr ? 'فشل نقل العنصر إلى سلة المهملات.' : 'Failed moving item to trash.'));
    } finally {
      setIsArchiving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[115] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-opacity">
      <div
        className="relative w-full max-w-xl bg-slate-900 text-white rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {isAr ? 'فحص المراجع قبل الأرشفة ونقل لسلة المهملات' : 'Pre-Archival Reference Audit'}
              </h2>
              <p className="text-xs text-slate-400">
                {isAr ? `العنصر المستهدف: ${titleString}` : `Target Entity: ${titleString}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {isAuditing ? (
            <div className="py-10 flex flex-col items-center justify-center space-y-2 text-slate-400">
              <RefreshCw className="w-7 h-7 animate-spin text-amber-400" />
              <span className="text-xs">{isAr ? 'جاري التدقيق وفحص الروابط والمراجع...' : 'Auditing active references & navigation...'}</span>
            </div>
          ) : refResult ? (
            <>
              {/* Customer Record Safeguard Notice */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-2 text-emerald-300">
                <div className="flex items-center gap-2 font-bold text-emerald-400">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <span>{isAr ? 'ضمان حماية واستقلالية سجلات العملاء' : 'Customer Record Isolation Guarantee'}</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  {isAr
                    ? 'أرشفة هذا العنصر لن تمس أو تحذف أي من طلبات واستفسارات العملاء أو الحجوزات السابقة المرتبطة به. ستظل كافة سجلات العملاء محفوظة بشكل دائم في النظام.'
                    : 'Archiving this item will NEVER cascade-delete or alter customer inquiry lead records. All customer data remains permanently intact.'}
                </p>
              </div>

              {/* Active Site References Alert */}
              {refResult.hasActiveReferences ? (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-400">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <span>{isAr ? 'تنبيه: مراجع نشطة في صفحات القوائم والموقع' : 'Active Public References Detected'}</span>
                  </div>

                  <ul className="space-y-1.5 text-[11px] text-slate-300 pt-1">
                    {refResult.referencedLocations
                      .filter((r) => !r.isCustomerRecord)
                      .map((ref, idx) => (
                        <li key={idx} className="flex items-center gap-2 bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                          <Layers className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="truncate">
                            {getLocalizedText(ref.title, isAr ? 'ar' : 'en') || 'Reference'}
                          </span>
                        </li>
                      ))}
                  </ul>

                  <p className="text-[11px] text-amber-300/80 pt-1">
                    {isAr
                      ? 'عند أرشفة هذا العنصر، سيختفي تلقائياً من قوائم الزوار والعرض المباشر لضمان عدم ظهور محتوى غير مكتمل.'
                      : 'Upon archiving, this item will immediately disappear from visitor public pages to prevent broken display.'}
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 space-y-1">
                  <p className="font-semibold text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isAr ? 'لا توجد مراجع نشطة تمنع الأرشفة' : 'No Active References Blocking Soft Delete'}</span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {isAr
                      ? 'يمكن نقل هذا العنصر بأمان إلى سلة المهملات مع إمكانية استرجاعه خلال 30 يوماً.'
                      : 'This entity can be safely moved to trash bin with a 30-day recovery window.'}
                  </p>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold transition-colors"
          >
            {isAr ? 'تراجع وإلغاء' : 'Cancel'}
          </button>

          <button
            onClick={handleConfirmMoveToTrash}
            disabled={isArchiving || isAuditing}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white text-xs font-bold transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>
              {isArchiving
                ? isAr
                  ? 'جاري النقل لسلة المهملات...'
                  : 'Moving to Trash...'
                : isAr
                ? 'أرشفة ونقل لسلة المهملات'
                : 'Soft Delete & Move to Trash'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
