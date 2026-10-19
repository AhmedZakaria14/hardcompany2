import React, { useState, useEffect } from 'react';
import { Certification, SectorScope, PublicationStatus } from '../../types/businessEntities';
import { Language } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { BilingualFormField } from '../components/BilingualFormField';
import { CMSImageUpload } from '../components/CMSImageUpload';
import { Award, ShieldCheck, Lock, Calendar } from 'lucide-react';

interface CMSCertificationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Certification>) => Promise<void>;
  initialData?: Certification | null;
  language: Language;
}

export const CMSCertificationFormModal: React.FC<CMSCertificationFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  language,
}) => {
  const isAr = language === 'ar';
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState({ en: '', ar: '' });
  const [issuer, setIssuer] = useState({ en: '', ar: '' });
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [credentialId, setCredentialId] = useState('');
  const [credentialUrl, setCredentialUrl] = useState('');
  const [image, setImage] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80');
  const [sector, setSector] = useState<SectorScope>('group');
  const [order, setOrder] = useState<number>(1);
  const [status, setStatus] = useState<PublicationStatus>('published');

  // Verification
  const [isVerified, setIsVerified] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'verified' | 'unverified' | 'pending'>('verified');
  const [verifierName, setVerifierName] = useState('');
  const [internalEvidenceNotes, setInternalEvidenceNotes] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || { en: '', ar: '' });
      setIssuer(initialData.issuer || { en: '', ar: '' });
      setIssueDate(initialData.issueDate || '');
      setExpiryDate(initialData.expiryDate || '');
      setCredentialId(initialData.credentialId || '');
      setCredentialUrl(initialData.credentialUrl || '');
      setImage(initialData.image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80');
      setSector(initialData.sector || 'group');
      setOrder(initialData.order || 1);
      setStatus(initialData.status || 'published');

      if (initialData.verification) {
        setIsVerified(initialData.verification.isVerified ?? true);
        setVerificationStatus(initialData.verification.verificationStatus || 'verified');
        setVerifierName(initialData.verification.verifierName || '');
        setInternalEvidenceNotes(initialData.verification.internalEvidenceNotes || '');
      }
    } else {
      setTitle({ en: '', ar: '' });
      setIssuer({ en: '', ar: '' });
      setIssueDate(new Date().toISOString().slice(0, 10));
      setExpiryDate('');
      setCredentialId('');
      setCredentialUrl('');
      setImage('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80');
      setSector('group');
      setOrder(1);
      setStatus('published');
      setIsVerified(true);
      setVerificationStatus('verified');
      setVerifierName('');
      setInternalEvidenceNotes('');
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({
        ...(initialData ? { id: initialData.id } : {}),
        title,
        issuer,
        issueDate,
        expiryDate,
        credentialId,
        credentialUrl,
        image,
        sector,
        order: Number(order) || 1,
        status,
        verification: {
          isVerified,
          verificationStatus,
          verifierName: verifierName.trim() || undefined,
          internalEvidenceNotes: internalEvidenceNotes.trim() || undefined,
          publishEvidenceNotes: false,
        },
      });
      onClose();
    } catch (err) {
      console.error('Failed to save certification:', err);
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
          ? isAr ? 'تعديل الاعتماد / الشهادة' : 'Edit Certification Record'
          : isAr ? 'إضافة اعتماد / شهادة جديدة' : 'Add New Certification'
      }
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <BilingualFormField
            labelEn="Certification Title"
            labelAr="عنوان الشهادة / الاعتماد"
            value={title}
            onChange={setTitle}
            required
            language={language}
          />

          <BilingualFormField
            labelEn="Issuing Authority / Organization"
            labelAr="الجهة المانحة للاعتماد"
            value={issuer}
            onChange={setIssuer}
            required
            language={language}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isAr ? 'تاريخ الإصدار' : 'Issue Date'}
            </label>
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isAr ? 'تاريخ انتهاء الصلاحية' : 'Expiry Date'}
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isAr ? 'رقم الاعتماد / الشهادة' : 'Credential / License ID'}
            </label>
            <input
              type="text"
              value={credentialId}
              onChange={(e) => setCredentialId(e.target.value)}
              placeholder="e.g. ISO-9001-KSA"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isAr ? 'رابط التحقق الإلكتروني' : 'Verification Web URL'}
            </label>
            <input
              type="url"
              value={credentialUrl}
              onChange={(e) => setCredentialUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-mono"
            />
          </div>
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

        {/* Certificate Image Badge */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            {isAr ? 'صورة / شارة الشهادة' : 'Certificate / Badge Image'}
          </label>
          <CMSImageUpload value={image} onChange={setImage} language={language} />
        </div>

        {/* Internal Evidence */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>{isAr ? 'التوثيق القانوني والتدقيق الداخلي' : 'Audit Verification & Evidence Vault'}</span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              {isAr ? 'ملاحظات وأدلة التدقيق السرية (CMS Vault)' : 'Internal Audit Notes & Evidence (Confidential)'}
            </label>
            <textarea
              rows={2}
              value={internalEvidenceNotes}
              onChange={(e) => setInternalEvidenceNotes(e.target.value)}
              placeholder={isAr ? 'تفاصيل التدقيق الداخلي ورقم سجلات الحفظ...' : 'Internal verification details kept strictly private inside admin panel.'}
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
              : (isAr ? 'حفظ الشهادة' : 'Save Certification')}
          </button>
        </div>
      </form>
    </Modal>
  );
};
