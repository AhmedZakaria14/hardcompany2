import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Language, Project } from '../../types';
import { translations } from '../../lib/translations';
import {
  CheckCircle2,
  Building2,
  Calendar,
  TrendingUp,
  Sparkles,
  ShieldAlert,
  Send,
  MapPin,
  Tag,
  Layers,
  FileCheck2,
  AlertTriangle,
} from 'lucide-react';
import { submitCustomerForm, FormValidationError } from '../../lib/forms/formSubmissionService';

interface ProjectInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  project: Project | null;
}

export function ProjectInquiryModal({
  isOpen,
  onClose,
  language,
  project,
}: ProjectInquiryModalProps) {
  const t = translations[language];

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [inquiryType, setInquiryType] = useState('investment_unit_request');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [leadRef, setLeadRef] = useState('');
  const [crmRef, setCrmRef] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [contactError, setContactError] = useState('');

  // Reset form when opening with a new project
  useEffect(() => {
    if (isOpen) {
      setSubmitted(false);
      setFullName('');
      setEmail('');
      setPhone('');
      setMessage('');
      setInquiryType('investment_unit_request');
      setContactError('');
    }
  }, [isOpen, project?.id]);

  if (!project) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactError('');

    if (!fullName.trim()) return;
    if (!email.trim() && !phone.trim()) {
      setContactError(
        language === 'en'
          ? 'Please provide at least one contact method (email or phone).'
          : 'يرجى تقديم وسيلة تواصل واحدة على الأقل (البريد الإلكتروني أو رقم الهاتف).'
      );
      return;
    }

    setIsLoading(true);
    try {
      const result = await submitCustomerForm({
        formType: 'project_inquiry',
        sector: 'realestate',
        name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        entityId: project.id,
        entityTitle: project.title[language] || project.title.en,
        language,
        message: `[Project Unit Request]\nProject: ${project.title[language]} (ID: ${project.id})\nDeveloper: ${project.developer[language]}\nInquiry Type: ${inquiryType}\nStarting Price: ${project.startingPriceSAR}\nHandover: ${project.handoverDate[language]}\nAvailable Units: ${project.unitsAvailable}/${project.unitsTotal}\n\nClient Note:\n${message || 'No additional note provided.'}`,
        details: {
          projectId: project.id,
          projectTitleEn: project.title.en,
          projectTitleAr: project.title.ar,
          developerEn: project.developer.en,
          developerAr: project.developer.ar,
          startingPriceSAR: project.startingPriceSAR,
          unitsAvailable: project.unitsAvailable,
          unitsTotal: project.unitsTotal,
          inquiryType,
        },
      });

      setLeadRef(result.trackingCode);
      setCrmRef(`CRM-${result.leadId.slice(-6).toUpperCase()}`);
      setSubmitted(true);
    } catch (err: any) {
      console.error('Failed to submit project inquiry', err);
      if (err instanceof FormValidationError) {
        setContactError(Object.values(err.fieldErrors).join(' '));
      } else {
        setContactError(err?.message || (language === 'en' ? 'Failed to submit inquiry. Input is preserved.' : 'فشل إرسال الطلب. تم الحفاظ على البيانات.'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setFullName('');
    setEmail('');
    setPhone('');
    setMessage('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      title={
        language === 'en'
          ? 'Request Investment Unit Allocation'
          : 'طلب حجز وتخصيص وحدة استثمارية'
      }
      subtitle={
        language === 'en'
          ? `Specific Project Inquiry for ${project.title[language]}`
          : `طلب تخصيص رسمي لمشروع ${project.title[language]}`
      }
      maxWidth="lg"
    >
      {submitted ? (
        <div className="space-y-5 py-2">
          {/* Success Banner */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-950 space-y-2">
            <div className="flex items-center gap-2.5 text-emerald-700 font-bold text-base">
              <CheckCircle2 className="w-6 h-6 shrink-0" />
              <span>
                {language === 'en'
                  ? 'Project Allocation Inquiry Dispatched'
                  : 'تم إرسال طلب التخصيص والاستفسار بنجاح'}
              </span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              {language === 'en'
                ? `Your unit request for ${project.title[language]} has been registered and routed to the primary project management desk.`
                : `تم تسجيل طلبك الخاص بمشروع ${project.title[language]} وتوجيهه مباشرة إلى مكتب إدارة وتطوير المشروع.`}
            </p>
          </div>

          {/* Context Details Confirmation Box */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-700">
                {language === 'en' ? 'Project Context:' : 'تفاصيل المشروع المطلوبة:'}
              </span>
              <Badge variant="primary" className="text-[10px]">
                ID: {project.id}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
              <div>
                <span className="text-slate-400 block">{language === 'en' ? 'Project Name:' : 'اسم المشروع:'}</span>
                <strong className="text-slate-900">{project.title[language]}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">{language === 'en' ? 'Developer:' : 'المطور العقاري:'}</span>
                <strong className="text-slate-900">{project.developer[language]}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">{language === 'en' ? 'Starting Price:' : 'سعر البداية:'}</span>
                <strong className="text-blue-700 font-bold">{project.startingPriceSAR}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">{language === 'en' ? 'Units Available:' : 'الوحدات المتاحة:'}</span>
                <strong className="text-slate-900">{project.unitsAvailable} / {project.unitsTotal} {language === 'en' ? 'Units' : 'وحدة'}</strong>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono">
              <div>
                <span className="text-slate-400 block font-sans">{language === 'en' ? 'Inquiry Ref ID:' : 'رقم مرجع الطلب:'}</span>
                <span className="font-bold text-slate-900">{leadRef}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-sans">{language === 'en' ? 'CRM Dispatch Status:' : 'حالة المزامنة بالسي إر إم:'}</span>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {crmRef || 'Synced to Developer CRM'}
                </span>
              </div>
            </div>
          </div>

          {/* Distinction Warning Banner */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <strong className="block font-bold">
                {language === 'en' ? 'Inquiry Status Notice (Non-Binding)' : 'تنبيه طبيعة الطلب (استفسار غير ملزم)'}
              </strong>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                {language === 'en'
                  ? 'This submission registers an inquiry and priority interest. It does not constitute a final binding purchase contract or guaranteed unit reservation. Our sales manager will contact you within 15 minutes to review unit floor plans and verify availability.'
                  : 'تم تسجيل هذا الطلب كاستفسار وحجز أولوية تخصيص، ولا يُعد عقداً ملزماً أو حجزاً نهائياً. سيقوم مستشار مبيعات المشروع بالتواصل معك خلال 15 دقيقة لاستعراض المخططات وتأكيد التوفر الفعلي.'}
              </p>
            </div>
          </div>

          <div className="pt-2">
            <Button variant="secondary" onClick={handleResetAndClose} className="w-full">
              {language === 'en' ? 'Close Window' : 'إغلاق النافذة'}
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selected Project Verification Card Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl shadow-sm space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-md">
                    {project.category[language]}
                  </span>
                  <span className="text-[11px] text-slate-300 font-mono">ID: {project.id}</span>
                </div>
                <h4 className="text-base sm:text-lg font-bold font-display-serif text-white">
                  {project.title[language]}
                </h4>
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-blue-400" />
                    {project.developer[language]}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    {project.location[language]}
                  </span>
                </div>
              </div>
              <div className="text-end shrink-0">
                <span className="text-[10px] text-slate-400 block">{t.projects.startingFrom}</span>
                <span className="text-sm sm:text-base font-extrabold text-blue-400 font-display-serif">
                  {project.startingPriceSAR}
                </span>
              </div>
            </div>

            {/* Verified Unit Information Row */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-700/80 text-center text-xs">
              <div className="p-1.5 bg-slate-800/80 rounded-lg">
                <span className="text-[10px] text-slate-400 block">{t.projects.availableUnits}</span>
                <span className="font-bold text-slate-200">
                  {project.unitsAvailable} / {project.unitsTotal}
                </span>
              </div>
              <div className="p-1.5 bg-slate-800/80 rounded-lg">
                <span className="text-[10px] text-slate-400 block">{t.projects.handover}</span>
                <span className="font-bold text-slate-200">{project.handoverDate[language]}</span>
                <span className="text-[9px] text-slate-400 block mt-0.5">
                  {t.projects.progress}: {project.progressPercentage || 65}%
                </span>
              </div>
              <div className="p-1.5 bg-slate-800/80 rounded-lg">
                <span className="text-[10px] text-slate-400 block">
                  {language === 'en' ? 'Audit Status' : 'حالة التوثيق المالي'}
                </span>
                {project.financialMetric?.isVerified ? (
                  <span className="font-bold text-emerald-400 flex items-center justify-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {project.financialMetric.value}
                  </span>
                ) : (
                  <span className="font-semibold text-amber-300 text-[11px] flex items-center justify-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="truncate">{project.financialMetric?.verificationStatus?.[language] || (language === 'en' ? 'Pending Audit' : 'قيد التدقيق')}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Overdue / Schedule Audit Notice */}
            {project.isOverdue && (
              <div className="p-2.5 bg-amber-950/60 border border-amber-500/40 rounded-lg text-[11px] text-amber-200 leading-normal flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300 block">{t.projects.overdueFlag} ({t.projects.lastUpdated}: {project.lastUpdated || '2026-10-09'})</strong>
                  <span>{project.deliveryAudit?.auditNote[language]}</span>
                </div>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            <div>
              <label htmlFor="project-inquiry-fullname" className="block text-xs font-semibold text-slate-700 mb-1">
                {t.contact.fullName} *
              </label>
              <input
                id="project-inquiry-fullname"
                type="text"
                required
                aria-required="true"
                placeholder={language === 'en' ? 'e.g. Abdullah Al-Mansoor' : 'مثال: عبد الله المنصور'}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="project-inquiry-email" className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.contact.email} <span className="text-slate-400 font-normal">({language === 'en' ? 'or Phone' : 'أو الهاتف'})</span>
                </label>
                <input
                  id="project-inquiry-email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (contactError) setContactError('');
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label htmlFor="project-inquiry-phone" className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.contact.phone} <span className="text-slate-400 font-normal">({language === 'en' ? 'or Email' : 'أو البريد'})</span>
                </label>
                <input
                  id="project-inquiry-phone"
                  type="tel"
                  placeholder="+966 50 000 0000"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (contactError) setContactError('');
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            {contactError && (
              <p className="text-xs text-rose-500 font-medium">{contactError}</p>
            )}

            {/* Preselected Inquiry Type */}
            <div>
              <label htmlFor="project-inquiry-type" className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'en' ? 'Inquiry / Allocation Type' : 'نوع الاستفسار / طلب التخصيص'}
              </label>
              <select
                id="project-inquiry-type"
                value={inquiryType}
                onChange={(e) => setInquiryType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all cursor-pointer font-medium"
              >
                <option value="investment_unit_request">
                  {language === 'en'
                    ? 'Request Investment Unit Allocation (Priority Interest)'
                    : 'طلب تخصيص وحجز وحدة استثمارية (أولوية اهتمام)'}
                </option>
                <option value="payment_plan_pricing">
                  {language === 'en'
                    ? 'Request Pricing & Installment Payment Schedule'
                    : 'طلب جدول الأسعار وخطط السداد والأقساط'}
                </option>
                <option value="masterplan_floorplan">
                  {language === 'en'
                    ? 'Request Masterplan & Detailed Unit Floorplans'
                    : 'طلب مخططات المشروع والمساقط المعمارية للوحدات'}
                </option>
                <option value="roi_financial_advisory">
                  {language === 'en'
                    ? 'Request Capital Growth & Rental Yield ROI Study'
                    : 'طلب دراسة الجدوى والعائد الاستثماري المتوقع'}
                </option>
              </select>
            </div>

            {/* Optional Specific Message */}
            <div>
              <label htmlFor="project-inquiry-message" className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'en' ? 'Specific Requirements / Preferred Unit Layout' : 'المتطلبات الخاصة / نمط الوحدة المفضلة'} <span className="text-slate-400 font-normal">({language === 'en' ? 'Optional' : 'اختياري'})</span>
              </label>
              <textarea
                id="project-inquiry-message"
                rows={3}
                placeholder={
                  language === 'en'
                    ? 'e.g., Interested in a 3-bedroom villa with private garden or asking about zero down payment terms...'
                    : 'مثال: مهتم بفيلة 3 غرف مع حديقة خاصة، أو الاستفسار عن شروط القسط بدون دفعة أولى...'
                }
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all resize-none"
              />
            </div>
          </div>

          {/* Explicit Notice: Inquiry vs Confirmed Reservation */}
          <div className="p-3 bg-blue-50/80 border border-blue-200/90 rounded-xl text-blue-900 text-xs flex items-start gap-2.5">
            <FileCheck2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              {language === 'en'
                ? 'Note: Submitting this form opens an official project inquiry. It is not a binding purchase or payment reservation. Our project sales director will contact you directly to confirm unit selection.'
                : 'ملاحظة: تقديم هذا النموذج يسجل طلب استفسار وتخصيص رسمي للمشروع، ولا يُعتبر حجزاً نقدياً أو عقداً ملزماً. سيقوم مدير مبيعات المشروع بالتواصل معك مباشرة لتأكيد اختيار الوحدة.'}
            </p>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <Button type="submit" isLoading={isLoading} className="w-full py-2.5 font-bold">
              <Send className="w-4 h-4" />
              {language === 'en' ? 'Submit Project Inquiry' : 'إرسال طلب الاستفسار عن المشروع'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
