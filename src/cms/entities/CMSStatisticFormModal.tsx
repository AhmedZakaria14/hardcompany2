import React, { useState, useEffect } from 'react';
import { BusinessStatistic, SectorScope, PublicationStatus } from '../../types/businessEntities';
import { Language } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { BilingualFormField } from '../components/BilingualFormField';
import { TrendingUp, ShieldCheck, Lock } from 'lucide-react';

interface CMSStatisticFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<BusinessStatistic>) => Promise<void>;
  initialData?: BusinessStatistic | null;
  language: Language;
}

export const CMSStatisticFormModal: React.FC<CMSStatisticFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  language,
}) => {
  const isAr = language === 'ar';
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [value, setValue] = useState('');
  const [label, setLabel] = useState({ en: '', ar: '' });
  const [description, setDescription] = useState({ en: '', ar: '' });
  const [iconName, setIconName] = useState('TrendingUp');
  const [sector, setSector] = useState<SectorScope>('group');
  const [order, setOrder] = useState<number>(1);
  const [status, setStatus] = useState<PublicationStatus>('published');

  // Verification
  const [isVerified, setIsVerified] = useState(true);
  const [verifierName, setVerifierName] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [internalEvidenceNotes, setInternalEvidenceNotes] = useState('');

  useEffect(() => {
    if (initialData) {
      setValue(initialData.value || '');
      setLabel(initialData.label || { en: '', ar: '' });
      setDescription(initialData.description || { en: '', ar: '' });
      setIconName(initialData.iconName || 'TrendingUp');
      setSector(initialData.sector || 'group');
      setOrder(initialData.order || 1);
      setStatus(initialData.status || 'published');

      if (initialData.verification) {
        setIsVerified(initialData.verification.isVerified ?? true);
        setVerifierName(initialData.verification.verifierName || '');
        setVerificationId(initialData.verification.verificationId || '');
        setInternalEvidenceNotes(initialData.verification.internalEvidenceNotes || '');
      }
    } else {
      setValue('+100');
      setLabel({ en: '', ar: '' });
      setDescription({ en: '', ar: '' });
      setIconName('TrendingUp');
      setSector('group');
      setOrder(1);
      setStatus('published');
      setIsVerified(true);
      setVerifierName('');
      setVerificationId('');
      setInternalEvidenceNotes('');
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({
        ...(initialData ? { id: initialData.id } : {}),
        value,
        label,
        description,
        iconName,
        sector,
        order: Number(order) || 1,
        status,
        verification: {
          isVerified,
          verificationStatus: isVerified ? 'verified' : 'unverified',
          verifierName: verifierName.trim() || undefined,
          verificationId: verificationId.trim() || undefined,
          internalEvidenceNotes: internalEvidenceNotes.trim() || undefined,
          publishEvidenceNotes: false,
        },
      });
      onClose();
    } catch (err) {
      console.error('Failed to save statistic:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        initialData
          ? isAr ? 'تعديل المؤشر الإحصائي' : 'Edit Business Metric / Claim'
          : isAr ? 'إضافة مؤشر إحصائي جديد' : 'Add New Business Metric'
      }
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isAr ? 'القيمة الإحصائية (مثال: +1.5B SAR أو 100%)' : 'Display Value (e.g. +1.5B SAR or 100%)'}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="+1.5B SAR"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white font-mono font-bold"
              required
            />
          </div>

          <BilingualFormField
            labelEn="Metric Title / Label"
            labelAr="عنوان المؤشر الإحصائي"
            value={label}
            onChange={setLabel}
            required
            language={language}
          />

          <BilingualFormField
            labelEn="Subtext / Calculation Description"
            labelAr="التفاصيل والتوضيح الإحصائي"
            value={description}
            onChange={setDescription}
            type="textarea"
            rows={2}
            language={language}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isAr ? 'القطاع المخصص' : 'Sector Scope'}
            </label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value as SectorScope)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold focus:ring-2 focus:ring-blue-500"
            >
              <option value="group">{isAr ? 'إدارة المجموعة' : 'Group Holding'}</option>
              <option value="realestate">{isAr ? 'العقارات والوساطة' : 'Real Estate'}</option>
              <option value="construction">{isAr ? 'المقاولات والهندسة' : 'Construction'}</option>
              <option value="hvac">{isAr ? 'أنظمة التكييف' : 'HVAC Division'}</option>
              <option value="all">{isAr ? 'كافة القطاعات' : 'All Sectors'}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isAr ? 'ترتيب العرض' : 'Display Order'}
            </label>
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold focus:ring-2 focus:ring-blue-500"
              min={1}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isAr ? 'حالة النشر' : 'Publication Status'}
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as PublicationStatus)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold focus:ring-2 focus:ring-blue-500"
            >
              <option value="published">{isAr ? 'منشور (Published)' : 'Published'}</option>
              <option value="draft">{isAr ? 'مسودة (Draft)' : 'Draft'}</option>
              <option value="archived">{isAr ? 'مؤرشف (Archived)' : 'Archived'}</option>
            </select>
          </div>
        </div>

        {/* Audit Verification for Claims */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>{isAr ? 'التدقيق المالي والمحاسبي للادعاء الإحصائي' : 'Financial Audit & Claim Verification'}</span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isVerified}
                onChange={(e) => setIsVerified(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
              />
              <span className="text-xs font-bold text-slate-800">{isAr ? 'مؤشر مدقق المالي' : 'Verified Claim'}</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                {isAr ? 'المراجع المالي / جهة التدقيق' : 'Auditing Firm / Verifier Name'}
              </label>
              <input
                type="text"
                value={verifierName}
                onChange={(e) => setVerifierName(e.target.value)}
                placeholder="e.g. Chartered Audit Firm"
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                {isAr ? 'رقم التقرير المالي / المرجع' : 'Audit Report Reference ID'}
              </label>
              <input
                type="text"
                value={verificationId}
                onChange={(e) => setVerificationId(e.target.value)}
                placeholder="e.g. AUD-2025-FIN-091"
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              {isAr ? 'أدلة الحساب والبيانات المالية الداخلية (سرية للـ CMS فقط)' : 'Internal Calculation Methodology & Evidence (Confidential)'}
            </label>
            <textarea
              rows={2}
              value={internalEvidenceNotes}
              onChange={(e) => setInternalEvidenceNotes(e.target.value)}
              placeholder={isAr ? 'بيانات وأسس حساب الرقم الإحصائي والتقارير المالية السرية...' : 'Confidential evidence calculations kept inside admin vault.'}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-300 bg-white font-mono text-slate-700"
            />
          </div>
        </div>

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl bg-slate-100 hover:bg-slate-200"
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md disabled:opacity-50"
          >
            {isSubmitting
              ? (isAr ? 'جاري الحفظ...' : 'Saving...')
              : (isAr ? 'حفظ الرقم الإحصائي' : 'Save Metric')}
          </button>
        </div>
      </form>
    </Modal>
  );
};
