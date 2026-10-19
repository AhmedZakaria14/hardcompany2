/**
 * HARD GROUP - REVISION HISTORY & VERSION RESTORATION MODAL
 * 
 * Enables authorized users to view past version snapshots, inspect integrity
 * (missing media, outdated references), and restore a past version as a new draft.
 */

import React, { useState, useEffect } from 'react';
import {
  History,
  RotateCcw,
  Clock,
  User,
  ShieldCheck,
  AlertTriangle,
  X,
  Eye,
  CheckCircle2,
  FileText,
  Trash2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { Language } from '../../types';
import {
  ContentRevisionDoc,
  RevisionAnalysisResult,
  fetchRevisionHistory,
  analyzeRevisionIntegrity,
  restoreRevisionToDraft,
} from '../../lib/cms/revisionService';

interface RevisionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: string;
  entityId: string;
  language: Language;
  userEmail?: string;
  onRestoreSuccess?: (restoredDraftContent: any, newVersionNumber: number) => void;
}

export const RevisionHistoryModal: React.FC<RevisionHistoryModalProps> = ({
  isOpen,
  onClose,
  entityType,
  entityId,
  language,
  userEmail = 'admin@hard.sa',
  onRestoreSuccess,
}) => {
  const isAr = language === 'ar';

  const [revisions, setRevisions] = useState<ContentRevisionDoc[]>([]);
  const [selectedRevision, setSelectedRevision] = useState<ContentRevisionDoc | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<RevisionAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [previewJson, setPreviewJson] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && entityType && entityId) {
      loadHistory();
    } else {
      setSelectedRevision(null);
      setAnalysisResult(null);
      setRestoreMessage(null);
      setPreviewJson(false);
    }
  }, [isOpen, entityType, entityId]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const history = await fetchRevisionHistory(entityType, entityId);
      setRevisions(history);
      if (history.length > 0) {
        setSelectedRevision(history[0]);
        runAnalysis(history[0].snapshotData);
      }
    } catch (err) {
      console.error('[RevisionHistoryModal] Failed to load history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRevision = (rev: ContentRevisionDoc) => {
    setSelectedRevision(rev);
    setRestoreMessage(null);
    runAnalysis(rev.snapshotData);
  };

  const runAnalysis = async (snapshotData: any) => {
    setIsAnalyzing(true);
    try {
      const res = await analyzeRevisionIntegrity(snapshotData);
      setAnalysisResult(res);
    } catch (err) {
      console.warn('[RevisionHistoryModal] Integrity analysis warning:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRestore = async () => {
    if (!selectedRevision) return;

    const confirmMsg = isAr
      ? `هل أنت أصلح لاسترجاع النسخة الاصدار v${selectedRevision.version}؟ سيتم إنشاء مسودة جديدة تماماً دون مسح أو تعديل النسخ السابقة.`
      : `Are you sure you want to restore version v${selectedRevision.version}? This will create a brand-new draft revision without deleting or overwriting past releases.`;

    if (!window.confirm(confirmMsg)) return;

    setIsRestoring(true);
    setRestoreMessage(null);

    try {
      const { newDraft, newRevision } = await restoreRevisionToDraft(
        entityType,
        entityId,
        selectedRevision,
        userEmail
      );

      const msg = isAr
        ? `تم استرجاع الإصدار v${selectedRevision.version} بنجاح كمسودة جديدة رقم v${newRevision.version}!`
        : `Version v${selectedRevision.version} restored successfully as new draft version v${newRevision.version}!`;

      setRestoreMessage({ type: 'success', text: msg });

      if (onRestoreSuccess) {
        onRestoreSuccess(newDraft.content, newRevision.version);
      }

      // Reload history to reflect the new restoration revision
      await loadHistory();
    } catch (err: any) {
      console.error('[RevisionHistoryModal] Restore error:', err);
      setRestoreMessage({
        type: 'error',
        text: isAr ? 'فشل استرجاع النسخة. يرجى المحاولة لاحقاً.' : 'Failed to restore revision. Please try again.',
      });
    } finally {
      setIsRestoring(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-opacity">
      <div
        className="relative w-full max-w-5xl max-h-[90vh] bg-slate-900 text-white rounded-3xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-wide">
                {isAr ? 'سجل التعديلات والإصدارات التاريخية' : 'Revision History & Version Control'}
              </h2>
              <p className="text-xs text-slate-400">
                {isAr ? `المعرف: ${entityType} / ${entityId}` : `Entity: ${entityType} / ${entityId}`}
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

        {/* Modal Content - Split View */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Left / Top: Revisions Timeline List (5 cols) */}
          <div className="md:col-span-5 border-r md:border-b-0 border-b border-slate-800 overflow-y-auto p-4 space-y-3 max-h-[40vh] md:max-h-full">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {isAr ? `النسخ المتاحة (${revisions.length})` : `Available Revisions (${revisions.length})`}
              </span>
              <button
                onClick={loadHistory}
                disabled={isLoading}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                {isAr ? 'تحديث' : 'Refresh'}
              </button>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500 space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
                <span className="text-sm">{isAr ? 'جاري تحميل سجل الإصدارات...' : 'Loading revision history...'}</span>
              </div>
            ) : revisions.length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-slate-800/40 border border-slate-700/50">
                <Clock className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-sm text-slate-400">
                  {isAr ? 'لا توجد إصدارات سابقة مسجلة بعد لهذا العنصر.' : 'No revision history recorded for this entity yet.'}
                </p>
              </div>
            ) : (
              revisions.map((rev) => {
                const isSelected = selectedRevision?.id === rev.id;
                return (
                  <button
                    key={rev.id}
                    onClick={() => handleSelectRevision(rev)}
                    className={`w-full text-right ltr:text-left p-3.5 rounded-2xl border transition-all flex flex-col gap-2 ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/50 text-white shadow-lg shadow-amber-500/5'
                        : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800/80 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 text-xs font-bold rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          v{rev.version}
                        </span>
                        {rev.changeType === 'published_release' && (
                          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            {isAr ? 'إصدار منشور' : 'Published Release'}
                          </span>
                        )}
                        {rev.changeType === 'restored_draft' && (
                          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {isAr ? 'مُسترجع' : 'Restored'}
                          </span>
                        )}
                        {rev.changeType === 'autosave_draft' && (
                          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            {isAr ? 'حفظ تلقائي' : 'Autosave'}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(rev.changedAt).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate">{rev.changedBy}</span>
                    </div>

                    {rev.notes && (
                      <p className="text-[11px] text-slate-400 line-clamp-1 italic bg-slate-900/50 px-2 py-1 rounded-lg">
                        {rev.notes}
                      </p>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Right / Bottom: Selected Revision Inspection & Restoration Panel (7 cols) */}
          <div className="md:col-span-7 p-6 overflow-y-auto space-y-5 bg-slate-900/50">
            {selectedRevision ? (
              <>
                {/* Status Message */}
                {restoreMessage && (
                  <div
                    className={`p-4 rounded-2xl border text-sm flex items-start gap-3 ${
                      restoreMessage.type === 'success'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    {restoreMessage.type === 'success' ? (
                      <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    )}
                    <span>{restoreMessage.text}</span>
                  </div>
                )}

                {/* Revision Metadata Card */}
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span>{isAr ? `تفاصيل الاصدار v${selectedRevision.version}` : `Revision Details v${selectedRevision.version}`}</span>
                        {selectedRevision.restoredFromVersion && (
                          <span className="text-xs font-normal text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                            {isAr ? `مسترجع من v${selectedRevision.restoredFromVersion}` : `Restored from v${selectedRevision.restoredFromVersion}`}
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        {isAr ? 'تم الإنشاء بتاريخ: ' : 'Created at: '}
                        {new Date(selectedRevision.changedAt).toLocaleString()}
                      </p>
                    </div>

                    <button
                      onClick={() => setPreviewJson(!previewJson)}
                      className="px-3 py-1.5 text-xs rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {previewJson
                        ? isAr
                          ? 'إخفاء البيانات'
                          : 'Hide Raw Data'
                        : isAr
                        ? 'معاينة البيانات الخام'
                        : 'Inspect Raw Data'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block">{isAr ? 'المحرر / المستخدم:' : 'Editor / User:'}</span>
                      <span className="font-medium text-slate-200">{selectedRevision.changedBy}</span>
                    </div>
                    <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block">{isAr ? 'نوع التعديل:' : 'Change Type:'}</span>
                      <span className="font-medium text-amber-400 capitalize">{selectedRevision.changeType}</span>
                    </div>
                  </div>
                </div>

                {/* Integrity Analysis Safeguards */}
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-sky-400" />
                      <h4 className="text-sm font-semibold text-slate-200">
                        {isAr ? 'فحص سلامة الوسائط والمراجع' : 'Media & Reference Integrity Audit'}
                      </h4>
                    </div>
                    {isAnalyzing && <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />}
                  </div>

                  {analysisResult?.mediaCheck.hasMissingMedia && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-1">
                      <div className="font-semibold flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        <span>{isAr ? 'تنبيه: وسائط قد تكون غير متمكنة' : 'Warning: Potential Unverified Media Assets'}</span>
                      </div>
                      {analysisResult.mediaCheck.warnings.map((w, i) => (
                        <p key={i} className="text-slate-300 text-[11px]">
                          • {isAr ? w.ar : w.en}
                        </p>
                      ))}
                    </div>
                  )}

                  {analysisResult?.referenceCheck.hasOutdatedReferences && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 space-y-1">
                      <div className="font-semibold flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        <span>{isAr ? 'تحذير: مراجع مفقودة أو محذوفة' : 'Warning: Outdated/Missing Entity References'}</span>
                      </div>
                      {analysisResult.referenceCheck.warnings.map((w, i) => (
                        <p key={i} className="text-slate-300 text-[11px]">
                          • {isAr ? w.ar : w.en}
                        </p>
                      ))}
                    </div>
                  )}

                  {!analysisResult?.mediaCheck.hasMissingMedia && !analysisResult?.referenceCheck.hasOutdatedReferences && (
                    <p className="text-xs text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isAr ? 'جميع وسائط ومراجع هذه النسخة سليمة ومتاحة.' : 'All media and references in this revision are intact.'}</span>
                    </p>
                  )}
                </div>

                {/* Raw Data Preview (if toggled) */}
                {previewJson && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 max-h-60 overflow-y-auto">
                    <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap">
                      {JSON.stringify(selectedRevision.snapshotData, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Restoration Action Footer */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
                  <div className="text-xs text-slate-400 text-center sm:text-right ltr:sm:text-left">
                    <p>{isAr ? 'سياسة الاحتفاظ: أحدث 30 إصدار محفوظ تلقائياً.' : 'Retention policy: Retains latest 30 versions per entity.'}</p>
                  </div>

                  <button
                    onClick={handleRestore}
                    disabled={isRestoring}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
                  >
                    <RotateCcw className={`w-4 h-4 ${isRestoring ? 'animate-spin' : ''}`} />
                    <span>
                      {isRestoring
                        ? isAr
                          ? 'جاري الاسترجاع...'
                          : 'Restoring...'
                        : isAr
                        ? `استرجاع النسخة كمسودة جديدة (v${selectedRevision.version})`
                        : `Restore as New Draft (v${selectedRevision.version})`}
                    </span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <FileText className="w-12 h-12 mb-2 stroke-1" />
                <p className="text-sm">{isAr ? 'اختر إصداراً من القائمة لمعاينته واسترجاعه.' : 'Select a revision from the list to inspect and restore.'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
