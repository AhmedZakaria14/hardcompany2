import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Clock,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Lock,
  FileSpreadsheet,
  RefreshCw,
  Users,
  X,
  FileCheck2,
  Info,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Language } from '../../types';
import { FirestoreLead } from '../../lib/leads/leadService';
import {
  CustomerRetentionPolicy,
  getRetentionPolicy,
  saveRetentionPolicy,
  getExpiredCustomerRequests,
  executeOwnerApprovedPurge,
} from '../../lib/cms/customerRetentionService';

interface CMSCustomerRetentionModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: FirestoreLead[];
  language: Language;
  currentAdminUser?: { name: string; email: string; role: string };
  onRefreshLeads?: () => void;
}

export const CMSCustomerRetentionModal: React.FC<CMSCustomerRetentionModalProps> = ({
  isOpen,
  onClose,
  leads,
  language,
  currentAdminUser = { name: 'Admin User', email: 'admin@hard.sa', role: 'superadmin' },
  onRefreshLeads,
}) => {
  const isAr = language === 'ar';
  const [policy, setPolicy] = useState<CustomerRetentionPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Sweep / Purge state
  const [expiredLeads, setExpiredLeads] = useState<FirestoreLead[]>([]);
  const [isPurging, setIsPurging] = useState(false);
  const [purgeSuccess, setPurgeSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadPolicy();
    }
  }, [isOpen]);

  const loadPolicy = async () => {
    setLoading(true);
    const p = await getRetentionPolicy();
    setPolicy(p);
    const expired = getExpiredCustomerRequests(leads, p.retentionDays);
    setExpiredLeads(expired);
    setLoading(false);
  };

  const handleRetentionDaysChange = (days: number) => {
    if (!policy) return;
    const updated = { ...policy, retentionDays: days };
    setPolicy(updated);
    setExpiredLeads(getExpiredCustomerRequests(leads, days));
  };

  const handleSavePolicy = async () => {
    if (!policy) return;
    setSaving(true);
    setSaveMessage(null);
    const res = await saveRetentionPolicy(policy, currentAdminUser);
    setSaveMessage(res.message);
    setSaving(false);
  };

  const handleExecuteSweep = async () => {
    if (expiredLeads.length === 0) return;
    const confirmText = isAr
      ? `هل أنت أكتأد من حذف ${expiredLeads.length} طلب عميل منتهي الصلاحية نهائياً مع المرفقات والمستندات بأسلوب معتمد؟`
      : `Are you sure you want to permanently delete ${expiredLeads.length} expired customer requests and attachments with owner approval?`;

    if (!window.confirm(confirmText)) return;

    setIsPurging(true);
    setPurgeSuccess(null);
    try {
      const res = await executeOwnerApprovedPurge(expiredLeads, currentAdminUser);
      if (res.success) {
        setPurgeSuccess(res.message);
        if (onRefreshLeads) onRefreshLeads();
        await loadPolicy();
      }
    } catch (e: any) {
      alert(e?.message || 'Purge failed');
    } finally {
      setIsPurging(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-300 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display-serif">
                {isAr ? 'سياسة احتفاظ وقواعد حماية بيانات العملاء' : 'Customer Data Retention & Privacy Governance'}
              </h3>
              <p className="text-xs text-slate-400">
                {isAr
                  ? 'ضبط فترة بقاء طلبات العملاء، حماية ملفات CSV من الثغرات، والتنظيف بطلب المالك'
                  : 'Configurable retention periods, formula injection defense, and owner-sanctioned purges'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {loading ? (
            <div className="p-8 text-center space-y-2">
              <RefreshCw className="w-6 h-6 text-amber-500 animate-spin mx-auto" />
              <p>{isAr ? 'جاري تحميل سياسة الاحتفاظ...' : 'Loading retention policy...'}</p>
            </div>
          ) : policy ? (
            <>
              {/* Formula Protection Notice */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>{isAr ? 'حماية الحسابات والجداول من ثغرات Formula Injection:' : 'Formula Injection Protection (CSV / Excel Security):'}</span>
                </div>
                <p className="text-emerald-800 leading-relaxed text-[11px]">
                  {isAr
                    ? 'يتم تعقيم كافة الخانات في ملفات التصدير تلقائياً وتغليف النصوص التي تبدأ بـ (=, +, -, @) بـ (\') لمنع تنفيذ الأوامر أو الصيغ البرمجية في Microsoft Excel أو Google Sheets عند فتح الملف. كما يتم حجب معلومات البيانات الشخصية المباشرة PII من سجلات التدقيق.'
                    : 'All CSV exports sanitize string cells starting with =, +, -, @ by prepending a single quote (\') to neutralize DDE/Formula execution in Microsoft Excel or Google Sheets. Audit logs record export counts without storing raw personal information.'}
                </p>
              </div>

              {/* Policy Configuration Card */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <h4 className="text-sm font-bold text-slate-900">
                      {isAr ? 'فترة الاحتفاظ بطلبات العملاء ومستنداتهم' : 'Retention Period Configuration'}
                    </h4>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                    OWNER-APPROVED
                  </span>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-800">
                    {isAr ? 'اختر فترة الاحتفاظ التلقائية للطلبات:' : 'Select Automated Retention Period:'}
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { days: 90, labelAr: '90 يوماً (3 أشهر)', labelEn: '90 Days (3 Mos)' },
                      { days: 180, labelAr: '180 يوماً (6 أشهر)', labelEn: '180 Days (6 Mos)' },
                      { days: 365, labelAr: '365 يوماً (سنة واحدة)', labelEn: '365 Days (1 Year)' },
                      { days: 730, labelAr: '730 يوماً (سنتان)', labelEn: '730 Days (2 Years)' },
                    ].map((opt) => (
                      <button
                        key={opt.days}
                        type="button"
                        onClick={() => handleRetentionDaysChange(opt.days)}
                        className={`p-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                          policy.retentionDays === opt.days
                            ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-xs ring-2 ring-amber-400/20'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {isAr ? opt.labelAr : opt.labelEn}
                      </button>
                    ))}
                  </div>

                  {/* Policy Toggles */}
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={policy.ownerApproved}
                        onChange={(e) => setPolicy({ ...policy, ownerApproved: e.target.checked })}
                        className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                      />
                      <span className="font-bold text-slate-800">
                        {isAr ? 'يتطلب موافقة المالك المباشرة قبل إجراء أي مسح' : 'Require Explicit Owner Approval before purging expired records'}
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={policy.includeAttachments}
                        onChange={(e) => setPolicy({ ...policy, includeAttachments: e.target.checked })}
                        className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                      />
                      <span className="text-slate-700">
                        {isAr ? 'شمل المرفقات الحساسة والملفات الخاصة عند الحذف' : 'Permanently clear private attachments and file metadata during purge'}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  {saveMessage && <span className="text-xs font-bold text-emerald-600">{saveMessage}</span>}
                  <button
                    type="button"
                    onClick={handleSavePolicy}
                    disabled={saving}
                    className="ms-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{saving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ السياسة' : 'Save Retention Policy')}</span>
                  </button>
                </div>
              </div>

              {/* Expired Sweep Preview */}
              <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-amber-950">
                      {isAr ? 'معاينة الطلبات المنتهية الصلاحية بانتظار المسح المعتمد' : 'Expired Requests Retention Preview'}
                    </h4>
                    <p className="text-xs text-amber-800">
                      {isAr
                        ? `الطلبات الأقدم من ${policy.retentionDays} يوماً وبانتظار أمر المسح:`
                        : `Customer requests older than ${policy.retentionDays} days:`}
                    </p>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-amber-200/80 text-amber-900 font-extrabold text-xs font-mono">
                    {expiredLeads.length} {isAr ? 'طلب منتهي' : 'Expired'}
                  </span>
                </div>

                {expiredLeads.length > 0 ? (
                  <div className="space-y-3">
                    <div className="max-h-48 overflow-y-auto rounded-xl border border-amber-300/80 bg-white divide-y divide-slate-100 text-xs">
                      {expiredLeads.map((l) => (
                        <div key={l.id} className="p-3 flex items-center justify-between gap-3">
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-900 font-mono">{l.trackingCode}</span>
                            <span className="text-[11px] text-slate-500 block">
                              {new Date(l.createdAt).toLocaleDateString()} • {l.formType} ({l.sector})
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                            {l.status}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={handleExecuteSweep}
                        disabled={isPurging}
                        className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>
                          {isPurging
                            ? (isAr ? 'جاري تنفيذ مسح المالك...' : 'Purging Expired Records...')
                            : (isAr ? `مسح ${expiredLeads.length} طلب بموافقة المالك` : `Purge ${expiredLeads.length} Expired Records (Owner Approved)`)}
                        </span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-amber-800 italic">
                    {isAr
                      ? 'لا توجد أي طلبات منتهية الصلاحية تتجاوز فترة الاحتفاظ المحددة حالياً.'
                      : 'No customer requests exceed the configured retention threshold.'}
                  </p>
                )}

                {purgeSuccess && (
                  <p className="text-xs font-bold text-emerald-700 bg-emerald-100/90 p-3 rounded-xl border border-emerald-300">
                    {purgeSuccess}
                  </p>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
