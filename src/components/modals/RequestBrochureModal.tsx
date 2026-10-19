import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Language, Project } from '../../types';
import { translations } from '../../lib/translations';
import { CheckCircle2, FileText, Send, Sparkles } from 'lucide-react';
import { submitCustomerForm, FormValidationError } from '../../lib/forms/formSubmissionService';

interface RequestBrochureModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  project: Project | null;
}

export function RequestBrochureModal({
  isOpen,
  onClose,
  language,
  project,
}: RequestBrochureModalProps) {
  const t = translations[language];
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [confirmedEmail, setConfirmedEmail] = useState('');
  const [leadRef, setLeadRef] = useState('');
  const [crmRef, setCrmRef] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');

  if (!project) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!email || !email.includes('@')) return;

    setIsLoading(true);
    try {
      const result = await submitCustomerForm({
        formType: 'project_inquiry',
        sector: 'realestate',
        name: fullName.trim() || email.split('@')[0],
        email: email.trim(),
        phone: phone.trim(),
        entityId: project.id,
        entityTitle: project.title[language] || project.title.en,
        language,
        message: `Project Brochure Request for: ${project.title[language]} (${project.id})`,
        details: {
          requestType: 'brochure',
          projectId: project.id,
          recipientEmail: email.trim(),
        },
      });

      setConfirmedEmail(email.trim());
      setLeadRef(result.trackingCode);
      setCrmRef(`CRM-${result.leadId.slice(-6).toUpperCase()}`);
      setSubmitted(true);
    } catch (err: any) {
      console.error('Failed to submit brochure request', err);
      if (err instanceof FormValidationError) {
        setFormError(Object.values(err.fieldErrors).join(' '));
      } else {
        setFormError(
          err?.message || (language === 'en'
            ? 'Failed to request brochure. Input is preserved. Please retry.'
            : 'تعذر تقديم طلب الكتيب. تم الحفاظ على بياناتك، يرجى إعادة المحاولة.')
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setConfirmedEmail('');
    setFullName('');
    setEmail('');
    setPhone('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title={language === 'en' ? 'Request Project Brochure' : 'طلب الكتيب التعريفي للمشروع'}
      subtitle={
        language === 'en'
          ? `Receive complete layout plans, pricing sheets, and ROI breakdown for ${project.title[language]}`
          : `احصل على الكتيب التفصيلي ومخططات الوحدات وجداول الأسعار لمشروع ${project.title[language]}`
      }
      maxWidth="md"
    >
      {submitted ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <h4 className="text-lg font-bold text-slate-900 font-display-serif">
            {language === 'en' ? 'Brochure Dispatched!' : 'تم طلب الكتيب بنجاح!'}
          </h4>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            {language === 'en' ? (
              <>
                We have registered your request and sent the full investment brochure for{' '}
                <strong className="text-slate-900">{project.title[language]}</strong> to{' '}
                <strong className="text-blue-700 font-mono">{confirmedEmail}</strong>.
              </>
            ) : (
              <>
                تم تسجيل طلبك وإرسال الكتيب التعريفي الشامل لمشروع{' '}
                <strong className="text-slate-900">{project.title[language]}</strong> إلى البريد الإلكتروني{' '}
                <strong className="text-blue-700 font-mono">{confirmedEmail}</strong>.
              </>
            )}
          </p>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-start text-xs space-y-1 text-slate-600">
            <p>
              <strong>{language === 'en' ? 'Reference Code:' : 'رقم المرجع:'}</strong>{' '}
              <span className="font-mono font-bold text-slate-900">{leadRef}</span>
            </p>
            <p className="flex items-center gap-1 text-blue-600 font-semibold pt-1 border-t border-slate-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'en' ? `Dispatched via CRM (${crmRef || 'Synced'})` : `تم التوثيق بالنظام (${crmRef || 'مكتمل'})`}</span>
            </p>
          </div>

          <div className="pt-2">
            <Button variant="secondary" onClick={handleReset} className="w-full">
              {language === 'en' ? 'Close' : 'إغلاق'}
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0 text-start">
              <h5 className="text-xs font-bold text-slate-900 truncate">{project.title[language]}</h5>
              <p className="text-[11px] text-slate-500">{project.developer[language]}</p>
            </div>
          </div>

          <div>
            <label htmlFor="brochure-email" className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'en' ? 'Delivery Email Destination *' : 'البريد الإلكتروني لاستلام الكتيب *'}
            </label>
            <input
              id="brochure-email"
              type="email"
              required
              aria-required="true"
              placeholder={language === 'en' ? 'your.name@company.com' : 'name@domain.com'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label htmlFor="brochure-fullname" className="block text-xs font-semibold text-slate-700 mb-1">
              {t.contact.fullName} *
            </label>
            <input
              id="brochure-fullname"
              type="text"
              required
              aria-required="true"
              placeholder={language === 'en' ? 'Your Full Name' : 'اسمك الكامل'}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label htmlFor="brochure-phone" className="block text-xs font-semibold text-slate-700 mb-1">
              {t.contact.phone} ({language === 'en' ? 'Optional' : 'اختياري'})
            </label>
            <input
              id="brochure-phone"
              type="tel"
              placeholder="+966 50 000 0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" isLoading={isLoading} className="w-full">
              <Send className="w-4 h-4" />
              <span>{language === 'en' ? 'Send Brochure to Email' : 'إرسال الكتيب إلى البريد الإلكتروني'}</span>
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
