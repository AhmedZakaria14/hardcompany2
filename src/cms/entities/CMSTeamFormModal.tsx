import React, { useState, useEffect } from 'react';
import { TeamMember, SectorScope, PublicationStatus } from '../../types/businessEntities';
import { Language } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { BilingualFormField } from '../components/BilingualFormField';
import { CMSImageUpload } from '../components/CMSImageUpload';
import { ShieldCheck, Lock, Users, Award } from 'lucide-react';

interface CMSTeamFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<TeamMember>) => Promise<void>;
  initialData?: TeamMember | null;
  language: Language;
}

export const CMSTeamFormModal: React.FC<CMSTeamFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  language,
}) => {
  const isAr = language === 'ar';
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState({ en: '', ar: '' });
  const [role, setRole] = useState({ en: '', ar: '' });
  const [bio, setBio] = useState({ en: '', ar: '' });
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80');
  const [sector, setSector] = useState<SectorScope>('realestate');
  const [order, setOrder] = useState<number>(1);
  const [status, setStatus] = useState<PublicationStatus>('published');

  // Verification
  const [isVerified, setIsVerified] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'verified' | 'unverified' | 'pending'>('verified');
  const [verifierName, setVerifierName] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [internalEvidenceNotes, setInternalEvidenceNotes] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || { en: '', ar: '' });
      setRole(initialData.role || { en: '', ar: '' });
      setBio(initialData.bio || { en: '', ar: '' });
      setEmail(initialData.email || '');
      setPhone(initialData.phone || '');
      setAvatar(initialData.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80');
      setSector(initialData.sector || 'realestate');
      setOrder(initialData.order || 1);
      setStatus(initialData.status || 'published');

      if (initialData.verification) {
        setIsVerified(initialData.verification.isVerified ?? true);
        setVerificationStatus(initialData.verification.verificationStatus || 'verified');
        setVerifierName(initialData.verification.verifierName || '');
        setVerificationId(initialData.verification.verificationId || '');
        setInternalEvidenceNotes(initialData.verification.internalEvidenceNotes || '');
      }
    } else {
      setName({ en: '', ar: '' });
      setRole({ en: '', ar: '' });
      setBio({ en: '', ar: '' });
      setEmail('');
      setPhone('');
      setAvatar('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80');
      setSector('realestate');
      setOrder(1);
      setStatus('published');
      setIsVerified(true);
      setVerificationStatus('verified');
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
        name,
        role,
        bio,
        email,
        phone,
        avatar,
        sector,
        order: Number(order) || 1,
        status,
        verification: {
          isVerified,
          verificationStatus,
          verifierName: verifierName.trim() || undefined,
          verificationId: verificationId.trim() || undefined,
          internalEvidenceNotes: internalEvidenceNotes.trim() || undefined,
          publishEvidenceNotes: false, // Keep private
        },
      });
      onClose();
    } catch (err) {
      console.error('Failed to save team member:', err);
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
          ? isAr ? 'تعديل بيانات عضو الفريق' : 'Edit Team Member Profile'
          : isAr ? 'إضافة عضو فريق جديد' : 'Add New Team Member'
      }
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name & Role */}
        <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <BilingualFormField
            labelEn="Full Name"
            labelAr="الاسم الكامل"
            value={name}
            onChange={setName}
            required
            language={language}
          />

          <BilingualFormField
            labelEn="Position / Title"
            labelAr="المسمى الوظيفي"
            value={role}
            onChange={setRole}
            required
            language={language}
          />

          <BilingualFormField
            labelEn="Executive Bio / Summary"
            labelAr="النبذة التعريفية"
            value={bio}
            onChange={setBio}
            type="textarea"
            rows={2}
            language={language}
          />
        </div>

        {/* Sector, Order & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isAr ? 'القطاع المخصص' : 'Assigned Sector'}
            </label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value as SectorScope)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold focus:ring-2 focus:ring-blue-500"
            >
              <option value="realestate">{isAr ? 'العقارات والوساطة' : 'Real Estate'}</option>
              <option value="construction">{isAr ? 'المقاولات والهندسة' : 'Construction'}</option>
              <option value="hvac">{isAr ? 'أنظمة التكييف' : 'HVAC Division'}</option>
              <option value="group">{isAr ? 'إدارة المجموعة' : 'Group Holding'}</option>
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

        {/* Contact info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isAr ? 'البريد الإلكتروني' : 'Email Address'}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. name@hardgp.com"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isAr ? 'رقم التواصل المباشر' : 'Direct Phone / Mobile'}
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+966 5x xxx xxxx"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
            />
          </div>
        </div>

        {/* Avatar Image */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            {isAr ? 'الصورة الشخصية' : 'Profile Image'}
          </label>
          <CMSImageUpload
            value={avatar}
            onChange={setAvatar}
            language={language}
          />
        </div>

        {/* VERIFICATION METADATA & PRIVATE EVIDENCE */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>{isAr ? 'توثيق المؤهلات والتسجيل المهني' : 'Professional Verification & Credentials'}</span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isVerified}
                onChange={(e) => setIsVerified(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
              />
              <span className="text-xs font-bold text-slate-800">{isAr ? 'موثق رسمياً' : 'Verified Profile'}</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                {isAr ? 'جهة التوثيق (مثال: الهيئة السعودية للمهندسين)' : 'Verifier / Authority Name'}
              </label>
              <input
                type="text"
                value={verifierName}
                onChange={(e) => setVerifierName(e.target.value)}
                placeholder="e.g. REGA / Saudi Council of Engineers"
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                {isAr ? 'رقم الترخيص / العضوية' : 'License / Registration Number'}
              </label>
              <input
                type="text"
                value={verificationId}
                onChange={(e) => setVerificationId(e.target.value)}
                placeholder="e.g. SCE-REG-2024-8831"
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>{isAr ? 'ملاحظات وأدلة التوثيق الداخلية (سرية للـ CMS فقط)' : 'Internal Private Verification Evidence (CMS Only)'}</span>
            </div>
            <textarea
              rows={2}
              value={internalEvidenceNotes}
              onChange={(e) => setInternalEvidenceNotes(e.target.value)}
              placeholder={isAr ? 'أدخل تفاصيل التوثيق الداخلي، المحاضر، أو السجلات السرية. لن تظهر هذه البيانات للزوار.' : 'Internal confidential evidence notes. Kept strictly private inside the admin vault.'}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-300 bg-white font-mono text-slate-700"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              {isAr ? '🔒 يبقى الدليل الداخلي سرياً ولا يُعرض بالواجهة العامة.' : '🔒 Private internal evidence is securely stored and never published on website.'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
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
              : (isAr ? 'حفظ البيانات' : 'Save Member')}
          </button>
        </div>
      </form>
    </Modal>
  );
};
