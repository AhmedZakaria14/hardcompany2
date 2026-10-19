import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Shield, FileText, Lock, CheckCircle2, AlertCircle, Mail, Phone, ExternalLink } from 'lucide-react';
import { Language } from '../../types';
import { getStoredLegalPolicy, LegalPolicyContent, validateLegalPolicyCompleteness } from '../../lib/seo/seoManager';

interface PrivacyTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  initialTab?: 'privacy' | 'terms';
}

export function PrivacyTermsModal({
  isOpen,
  onClose,
  language,
  initialTab = 'privacy',
}: PrivacyTermsModalProps) {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(initialTab);
  const isAr = language === 'ar';
  const [policy, setPolicy] = useState<LegalPolicyContent>(getStoredLegalPolicy());

  useEffect(() => {
    if (isOpen) {
      setPolicy(getStoredLegalPolicy());
    }
  }, [isOpen]);

  const missingFlags = validateLegalPolicyCompleteness(policy);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        activeTab === 'privacy'
          ? isAr
            ? 'سياسة الخصوصية وحماية البيانات'
            : 'Privacy Policy & Data Protection'
          : isAr
          ? 'الشروط والأحكام والضوابط التشغيلية'
          : 'Terms & Operational Conditions'
      }
      maxWidth="xl"
    >
      <div className="space-y-6" dir={isAr ? 'rtl' : 'ltr'}>
        {/* Tab Navigation Controls */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-xs sm:text-sm transition-colors cursor-pointer ${
              activeTab === 'privacy'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>{isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-xs sm:text-sm transition-colors cursor-pointer ${
              activeTab === 'terms'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{isAr ? 'الشروط والأحكام' : 'Terms of Service'}</span>
          </button>
        </div>

        {/* Legal Certification / License Badges */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs leading-relaxed flex flex-wrap items-center justify-between gap-3 font-mono text-slate-800">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <span>{isAr ? 'ترخيص الهيئة العامة للعقار (REGA):' : 'REGA License:'} <strong>#{policy.complianceFlags.regaLicenseId}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span>{isAr ? 'السجل التجاري:' : 'CR:'} <strong>#{policy.complianceFlags.commercialRegNum}</strong></span>
          </div>
        </div>

        {/* Missing Policy Text Warning Banner (If Any Clauses Missing) */}
        {missingFlags.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block">
                {isAr ? 'تنبيه النقص التشغيلي للبنود:' : 'Legal Compliance Completeness Notice:'}
              </span>
              <p className="text-amber-800 text-[11px]">
                {isAr
                  ? 'يتم عرض البنود المعتمدة المكتملة فقط. خضعت الوثيقة لتدقيق النواقص لتفادي نشر أي شروط غير موثقة رسمياً.'
                  : 'Only fully approved policy text is presented below. Required missing terms are flagged in the admin console for verified legal review rather than fabricating unverified policy details.'}
              </p>
            </div>
          </div>
        )}

        {/* TAB 1: Privacy Policy Content */}
        {activeTab === 'privacy' && (
          <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed max-h-[55vh] overflow-y-auto pe-2">
            {policy.privacyPolicy.sections.map((sec) => (
              <div key={sec.id} className="space-y-2">
                <h3 className="font-bold text-slate-900 text-base font-display-serif flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span>{isAr ? sec.heading.ar : sec.heading.en}</span>
                </h3>
                <p className="whitespace-pre-line text-slate-600 leading-relaxed">
                  {isAr ? sec.body.ar : sec.body.en}
                </p>
              </div>
            ))}

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-slate-800">
              <span>✉ Data Controller: {policy.complianceFlags.dataControllerEmail}</span>
              <span>📞 Phone: +966 13 800 4273</span>
            </div>
          </div>
        )}

        {/* TAB 2: Terms of Service Content */}
        {activeTab === 'terms' && (
          <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed max-h-[55vh] overflow-y-auto pe-2">
            {policy.termsOfService.sections.map((sec) => (
              <div key={sec.id} className="space-y-2">
                <h3 className="font-bold text-slate-900 text-base font-display-serif flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>{isAr ? sec.heading.ar : sec.heading.en}</span>
                </h3>
                <p className="whitespace-pre-line text-slate-600 leading-relaxed">
                  {isAr ? sec.body.ar : sec.body.en}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            {isAr ? 'إغلاق المستند' : 'Close Document'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
