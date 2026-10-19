/**
 * HARD GROUP - INTERACTIVE PUBLICATION VALIDATION & AUDIT MODAL
 * 
 * Verifies publisher authorization, executes pre-publication policy checks,
 * displays categorized error reports, and performs atomic publication.
 */

import React, { useState } from 'react';
import {
  X,
  Shield,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Sparkles,
  RefreshCw,
  Send,
  Globe,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Language } from '../../types';
import { canPublish, AdminRole } from '../../types/firestore-schema';
import { validateEntityForPublish } from '../../lib/cms/publicationValidation';
import { publishEntityWithAtomicBatch } from '../../lib/cms/publicationService';
import { PublisherUser } from '../../lib/cms/publicationTypes';

interface PublishValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (version: number) => void;
  entityType: 'page_document' | 'property' | 'project' | 'form_schema' | 'site_section';
  entityId: string;
  sector?: string;
  draftData: any;
  publisherUser: PublisherUser;
  language: Language;
}

export const PublishValidationModal: React.FC<PublishValidationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  entityType,
  entityId,
  sector = 'portal',
  draftData,
  publisherUser,
  language,
}) => {
  const isAr = language === 'ar';
  const isAuthorizedPublisher = canPublish(publisherUser.role);

  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResultMsg, setPublishResultMsg] = useState<{ success: boolean; text: string } | null>(null);

  if (!isOpen) return null;

  // Run validation policy
  const validation = validateEntityForPublish(entityType, draftData);

  const handleConfirmPublish = async () => {
    if (!isAuthorizedPublisher || !validation.isValid) return;

    setIsPublishing(true);
    setPublishResultMsg(null);

    try {
      const res = await publishEntityWithAtomicBatch({
        entityType,
        entityId,
        sector,
        draftData,
        publisherUser,
      });

      setPublishResultMsg({
        success: true,
        text: isAr ? res.messageAr : res.messageEn,
      });

      if (onSuccess) {
        setTimeout(() => {
          onSuccess(res.publishedVersion);
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      setPublishResultMsg({
        success: false,
        text: err?.message || (isAr ? 'فشل إجراء النشر.' : 'Publish operation failed.'),
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in font-ui-sans">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden text-start flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/20 border border-blue-500/30 text-blue-400">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display-serif">
                {isAr ? 'فحص واعتماد التغييرات للنشر المباشر' : 'Pre-Publication Validation Audit'}
              </h3>
              <p className="text-xs text-slate-400">
                {isAr ? 'مراجعة صلاحية الناشر والتحقق من اكتمال السياسات والترجمة' : 'Verify publisher role, bilingual policies, references, and media before live release'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* 1. Publisher Authorization Banner */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
              isAuthorizedPublisher
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                : 'bg-rose-50/80 border-rose-200 text-rose-950'
            }`}
          >
            <div className="flex items-center gap-3">
              {isAuthorizedPublisher ? (
                <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
              ) : (
                <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0" />
              )}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider">
                  {isAr ? 'صلاحية النشر' : 'Publisher Authorization'}
                </div>
                <div className="text-sm font-black">
                  {isAuthorizedPublisher
                    ? isAr
                      ? `مخول بالنشر (${publisherUser.role})`
                      : `Authorized Publisher (${publisherUser.role})`
                    : isAr
                    ? `غير مخول بالنشر (${publisherUser.role})`
                    : `Unauthorized Role (${publisherUser.role})`}
                </div>
              </div>
            </div>

            <div className="text-end text-xs">
              <span className="text-slate-500 block">{isAr ? 'البريد الإلكتروني:' : 'Account:'}</span>
              <span className="font-mono font-bold">{publisherUser.email}</span>
            </div>
          </div>

          {!isAuthorizedPublisher && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed">
              <strong>{isAr ? 'تنبيه الصلاحيات:' : 'Role Policy Warning:'}</strong>{' '}
              {isAr
                ? 'حسابك يحمل دور محرر فقط (Editor). النشر المباشر على الموقع مقتصر على مدير النظام (Super Admin) أو الناشر المعتمد (Publisher).'
                : 'Your account is an Editor. Publishing live content requires a Super Admin or Publisher role.'}
            </div>
          )}

          {/* 2. Policy Check Matrix */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isAr ? 'نتائج فحص المعايير والسياسات' : 'Policy Check Results'}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Policy 1: Required Fields */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  {isAr ? 'الحقول وهيكل البيانات المطلوب' : 'Required Fields & Structure'}
                </span>
                {validation.summary.requiredFieldsCount === 0 ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-100/80 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isAr ? 'مكتمل' : 'Passed'}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-rose-700 font-bold bg-rose-100/80 px-2.5 py-1 rounded-full">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{isAr ? 'نقص حقول' : 'Failed'}</span>
                  </span>
                )}
              </div>

              {/* Policy 2: Bilingual Translations */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  {isAr ? 'الترجمة الثنائية (عربي/إنجليزي)' : 'Bilingual Translations Policy'}
                </span>
                {validation.summary.translationsPassed ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-100/80 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isAr ? 'مكتمل' : 'Passed'}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-rose-700 font-bold bg-rose-100/80 px-2.5 py-1 rounded-full">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{isAr ? 'مفقودة' : 'Failed'}</span>
                  </span>
                )}
              </div>

              {/* Policy 3: References Integrity */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  {isAr ? 'سلامة المراجع والقطاع' : 'References & Sector Scope'}
                </span>
                {validation.summary.referencesPassed ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-100/80 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isAr ? 'سليمة' : 'Passed'}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-rose-700 font-bold bg-rose-100/80 px-2.5 py-1 rounded-full">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{isAr ? 'مرجع خطأ' : 'Failed'}</span>
                  </span>
                )}
              </div>

              {/* Policy 4: Media Assets */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  {isAr ? 'صلاحية الوسائط والروابط' : 'Media & Asset Validation'}
                </span>
                {validation.summary.mediaPassed ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-100/80 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isAr ? 'سليمة' : 'Passed'}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-rose-700 font-bold bg-rose-100/80 px-2.5 py-1 rounded-full">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{isAr ? 'روابط غير صالحة' : 'Failed'}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 3. Detailed Validation Errors List if any */}
          {validation.errors.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-3">
              <div className="flex items-center gap-2 font-bold text-xs text-rose-900 uppercase">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>
                  {isAr
                    ? `أخطاء التحقق القاطعة (${validation.errors.length}):`
                    : `Validation Blocking Errors (${validation.errors.length}):`}
                </span>
              </div>

              <ul className="space-y-1.5 text-xs text-rose-800">
                {validation.errors.map((err, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-mono text-[10px] bg-rose-200/80 px-1.5 py-0.5 rounded text-rose-900 shrink-0">
                      {err.field}
                    </span>
                    <span>{isAr ? err.messageAr : err.messageEn}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Publication Result Message */}
          {publishResultMsg && (
            <div
              className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
                publishResultMsg.success
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : 'bg-rose-50 text-rose-900 border-rose-200'
              }`}
            >
              {publishResultMsg.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span>{publishResultMsg.text}</span>
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            type="button"
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>

          <button
            onClick={handleConfirmPublish}
            disabled={!isAuthorizedPublisher || !validation.isValid || isPublishing}
            type="button"
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-900/30 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isPublishing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>{isAr ? 'تأكيد والنشر المباشر' : 'Confirm & Publish Live'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
