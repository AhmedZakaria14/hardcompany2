import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Language } from '../../types';
import { translations } from '../../lib/translations';
import {
  ShieldCheck,
  Building2,
  FileCheck2,
  ExternalLink,
  Award,
  CheckCircle2,
  Sparkles,
  Info,
  Scale,
  Calendar,
} from 'lucide-react';

interface ComplianceVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  initialTab?: 'licensing' | 'reviews' | 'financials' | 'stats';
}

export function ComplianceVerificationModal({
  isOpen,
  onClose,
  language,
  initialTab = 'licensing',
}: ComplianceVerificationModalProps) {
  const isAr = language === 'ar';
  const [activeTab, setActiveTab] = useState<'licensing' | 'reviews' | 'financials' | 'stats'>(
    initialTab
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isAr
          ? 'سجل التوثيق والاعتماد والامتثال الحوكمي'
          : 'Corporate Governance, Licensing & Verification Audit'
      }
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Header summary banner */}
        <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-800 shadow-md">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="primary" className="bg-blue-600 text-white border-none">
                <ShieldCheck className="w-3.5 h-3.5 me-1 inline" />
                {isAr ? 'اعتماد موثق 2026' : 'Verified Entity 2026'}
              </Badge>
              <span className="text-xs text-blue-300 font-medium">
                {isAr ? 'الهيئة العامة للعقار (REGA)' : 'Saudi Real Estate General Authority'}
              </span>
            </div>
            <h3 className="text-base font-bold font-display-serif text-slate-100">
              {isAr
                ? 'مؤسسة وساطة عقارية وتسويق ترخيص رسمي معتمد'
                : 'HARD Real Estate Brokerage & Asset Management'}
            </h3>
          </div>

          <a
            href="https://ega.gov.sa"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 text-xs font-semibold transition-colors shrink-0"
          >
            <span>{isAr ? 'التحقق عبر بوابه العقار' : 'Verify on REGA Portal'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Tab switcher */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('licensing')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'licensing'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{isAr ? 'التراخيص والسجل التجاري' : 'Licensing & CR'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stats')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'stats'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>{isAr ? 'الأرقام والإحصائيات' : 'Audited Statistics'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'reviews'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isAr ? 'توثيق التقييمات' : 'Review Verification'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('financials')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'financials'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>{isAr ? 'المؤشرات المالية والعوائد' : 'Financials & Yield Policy'}</span>
          </button>
        </div>

        {/* Tab 1: Licensing & CR */}
        {activeTab === 'licensing' && (
          <div className="space-y-4 animate-in fade-in text-xs sm:text-sm">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>{isAr ? 'الكيان القانوني والتراخيص التنظيمية' : 'Corporate Entity & Regulatory Licensing'}</span>
              </h4>
              <p className="text-slate-600 leading-relaxed text-xs">
                {isAr
                  ? 'تعمل هارد للعقارات كقطاع متخصص تحت مجموعة هارد التجارية، ومرخصة رسمياً من الهيئة العامة للعقار بالمملكة العربية السعودية لممارسة أعمال الوساطة والتسويق والتطوير العقاري.'
                  : 'HARD Real Estate operates as a specialized division of HARD Group, officially licensed by the Saudi Real Estate General Authority (REGA) for property brokerage, advisory, and marketing services.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/80 text-xs">
                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-400 block font-semibold">
                    {isAr ? 'ترخيص الوساطة والتسويق' : 'REGA Brokerage License'}
                  </span>
                  <strong className="text-slate-900 font-semibold block mt-0.5">
                    {isAr ? 'مؤسسة وساطة عقارية معتمدة' : 'Active Verified Brokerage Entity'}
                  </strong>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {isAr ? 'ساري وسجل موثق' : 'Verified Active Status'}
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-400 block font-semibold">
                    {isAr ? 'السجل التجاري والفرع الرئيسي' : 'Commercial Registration & HQ'}
                  </span>
                  <strong className="text-slate-900 font-semibold block mt-0.5">
                    {isAr ? 'مجموعة هارد - الدمام، المنطقة الشرقية' : 'HARD Group - Dammam HQ, Eastern Province'}
                  </strong>
                  <span className="text-[10px] text-slate-500 font-medium block mt-1">
                    {isAr ? 'طريق الأمير متعب، حي هجر' : 'Prince Mutaib Rd, Hajr Dist.'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                {isAr
                  ? 'يتم توثيق العقود والوساطة والتأجير عبر منصة إيجار وحسابات الضمان الرسمية المعتمدة لحماية حقوق كافة الأطراف.'
                  : 'All rental agreements and transaction escrows are facilitated through verified REGA Ejar and official escrow channels.'}
              </span>
            </div>
          </div>
        )}

        {/* Tab 2: Audited Statistics */}
        {activeTab === 'stats' && (
          <div className="space-y-4 animate-in fade-in text-xs sm:text-sm">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-600" />
                <span>{isAr ? 'أدلة وبيانات الإحصائيات المعروضة' : 'Evidence Basis for Displayed Statistics'}</span>
              </h4>

              <div className="space-y-3 pt-1 text-xs text-slate-700">
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <strong className="text-blue-700 text-sm font-bold block">15+ {isAr ? 'سنة إرث للمجموعة' : 'Years Group Heritage'}</strong>
                    <span className="text-slate-600">{isAr ? 'تاريخ التأسيس والخبرة التشغيلية لمجموعة هارد متعددة القطاعات.' : 'Established multi-sector operational track record across Eastern Province.'}</span>
                  </div>
                  <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md shrink-0">
                    {isAr ? 'تحديث: أكتوبر 2026' : 'Updated: Oct 2026'}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <strong className="text-blue-700 text-sm font-bold block">1,200+ {isAr ? 'صفقة وسجل عقاري' : 'Transacted & Active Listings'}</strong>
                    <span className="text-slate-600">{isAr ? 'إجمالي العقارات الموثقة وقوائم العرض النشطة في منصة البيانات.' : 'Sum of active listings and documented transactional history in platform ledger.'}</span>
                  </div>
                  <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md shrink-0">
                    {isAr ? 'سجلات النظام Q3 2026' : 'Q3 2026 Ledger'}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <strong className="text-blue-700 text-sm font-bold block">4.9 / 5.0 {isAr ? 'تقييم رضا العملاء' : 'Verified Client Rating'}</strong>
                    <span className="text-slate-600">{isAr ? 'مستند إلى تقييمات المشترين والمستأجرين الموثقة بعد إتمام الصفقات.' : 'Based on verified post-transaction client feedback across residential & commercial deals.'}</span>
                  </div>
                  <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-md shrink-0">
                    {isAr ? 'مستند لمراجعات جودة' : 'Survey Verified'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Review Verification */}
        {activeTab === 'reviews' && (
          <div className="space-y-4 animate-in fade-in text-xs sm:text-sm">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{isAr ? 'معايير إشارة "عميل موثق"' : 'Verified Client Badge Accreditation Policy'}</span>
              </h4>
              <p className="text-slate-600 leading-relaxed text-xs">
                {isAr
                  ? 'لا يتم إعطاء شارة "عميل موثق" إلا بعد مطابقة هوية العميل مع عقد وساطة أو تأجير رسمي مسجل في نظام الهيئة العامة للعقار أو إيصال حساب الضمان.'
                  : 'The "Verified Client" badge is awarded exclusively to client submissions linked to a verified REGA contract record or verified escrow deposit.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <strong className="text-slate-900 font-bold block">1. {isAr ? 'مطابقة العقد' : 'Contract Audit'}</strong>
                  <p className="text-slate-500 text-[11px]">{isAr ? 'التحقق من رقم عقد الإيجار أو البيع الموثق.' : 'Verified against Ejar / REGA filing IDs.'}</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <strong className="text-slate-900 font-bold block">2. {isAr ? 'توثيق الدفعة' : 'Escrow Deposit'}</strong>
                  <p className="text-slate-500 text-[11px]">{isAr ? 'تأكيد إيداع الدفعة الأولى بطلب رسمي.' : 'Confirmed deposit via certified channels.'}</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <strong className="text-slate-900 font-bold block">3. {isAr ? 'استبيان الجودة' : 'Post-Deal Survey'}</strong>
                  <p className="text-slate-500 text-[11px]">{isAr ? 'تقييم مباشر بعد استلام المفاتيح.' : 'Direct verified survey post-handover.'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Financials & Yield Policy */}
        {activeTab === 'financials' && (
          <div className="space-y-4 animate-in fade-in text-xs sm:text-sm">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-600" />
                <span>{isAr ? 'سياسة حجب وإعلان المؤشرات المالية' : 'Policy on Financial Projections & ROI Claims'}</span>
              </h4>
              <p className="text-slate-600 leading-relaxed text-xs">
                {isAr
                  ? 'التزاماً بالحوكمة والشفافية، يتم حجب أي نسب عائد استثماري (ROI) أو نمو رأسمالي ما لم تكن مستندة إلى تقرير تقييم مالي موثق من جهة تدقيق مستقلة ونموذج احتساب مالي معتمد.'
                  : 'To protect investor interest and adhere to strict regulatory standards, financial ROI and yield metrics are withheld as "Pending Independent Audit Verification" unless backed by formal third-party audit models.'}
              </p>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <Button variant="outline" onClick={onClose} className="text-xs font-bold">
            {isAr ? 'إغلاق نافذة التوثيق' : 'Close Verification Panel'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
