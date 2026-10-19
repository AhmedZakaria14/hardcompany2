import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Language } from '../../types';
import { FormAttachmentMeta } from '../../types/firestore-schema';
import { translations } from '../../lib/translations';
import { CheckCircle2, MessageSquare, Sparkles } from 'lucide-react';
import { submitCustomerForm, FormValidationError } from '../../lib/forms/formSubmissionService';
import { FileUploadZone } from '../forms/FileUploadZone';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  initialSubject?: string;
}

export function InquiryModal({
  isOpen,
  onClose,
  language,
  initialSubject = '',
}: InquiryModalProps) {
  const t = translations[language];

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('buying');
  const [subject, setSubject] = useState(initialSubject);
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<FormAttachmentMeta[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [leadRef, setLeadRef] = useState('');
  const [crmRef, setCrmRef] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [contactError, setContactError] = useState('');

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

    const categoryMap: Record<string, { en: string; ar: string }> = {
      buying: { en: 'Property Acquisition / Buying', ar: 'شراء وتملك عقار' },
      renting: { en: 'Property Leasing / Renting', ar: 'استئجار عقار' },
      listing: { en: 'Selling / Listing My Property', ar: 'بيع أو إدراج عقاري' },
      investment: { en: 'High-Yield Investment & Projects', ar: 'استثمار بعوائد مرتفعة ومشاريع' },
      commercial: { en: 'Commercial Real Estate', ar: 'عقارات تجارية واستثمارية' },
    };

    const derivedSubject = subject.trim()
      ? subject.trim()
      : categoryMap[category]?.[language] || (language === 'en' ? 'General Advisory Inquiry' : 'استفسار استشاري عام');

    const finalMessage = message.trim()
      ? message.trim()
      : language === 'en'
      ? `General advisory request for category: ${derivedSubject}`
      : `طلب استشارة عامة لقسم: ${derivedSubject}`;

    setIsLoading(true);
    try {
      const result = await submitCustomerForm({
        formType: 'general_contact',
        sector: 'realestate',
        name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        language,
        message: `Category: ${category}\nSubject: ${derivedSubject}\n\n${finalMessage}`,
        attachments,
        details: {
          category,
          subject: derivedSubject,
        },
      });
      setLeadRef(result.trackingCode);
      setCrmRef(`CRM-${result.leadId.slice(-6).toUpperCase()}`);
      setSubmitted(true);
    } catch (err: any) {
      console.error('Failed to submit advisory inquiry', err);
      if (err instanceof FormValidationError) {
        setContactError(Object.values(err.fieldErrors).join(' '));
      } else {
        setContactError(err?.message || (language === 'en' ? 'Failed to submit inquiry. Your input is preserved.' : 'فشل إرسال الطلب. تم الاحتفاظ ببياناتك.'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
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
      onClose={handleReset}
      title={language === 'en' ? 'Direct Advisory Inquiry' : 'طلب استشارة عقارية مباشرة'}
      subtitle={language === 'en' ? 'Connect with a certified brokerage advisor within 15 minutes.' : 'تواصل مع مستشار وساطة عقارية معتمد خلال 15 دقيقة.'}
      maxWidth="md"
    >
      {submitted ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h4 className="text-lg font-bold text-slate-900 font-display-serif">
            {language === 'en' ? 'Inquiry Dispatched' : 'تم إرسال الاستفسار بنجاح'}
          </h4>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {t.contact.submitSuccess}
          </p>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-start text-xs space-y-1 text-slate-600">
            <p><strong>{language === 'en' ? 'Reference Code:' : 'رقم المرجع:'}</strong> <span className="font-mono font-bold text-slate-900">{leadRef}</span></p>
            <p className="flex items-center gap-1 text-blue-600 font-semibold pt-1 border-t border-slate-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CRM Hook: {crmRef || 'Synced to CRM'}</span>
            </p>
          </div>
          <div className="pt-2">
            <Button variant="secondary" onClick={handleReset} className="w-full">
              {language === 'en' ? 'Close' : 'إغلاق'}
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label htmlFor="advisory-inquiry-fullname" className="block text-xs font-semibold text-slate-700 mb-1">
              {t.contact.fullName} *
            </label>
            <input
              id="advisory-inquiry-fullname"
              type="text"
              required
              aria-required="true"
              placeholder={language === 'en' ? 'Your Name' : 'اسمك الكريم'}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="advisory-inquiry-email" className="block text-xs font-semibold text-slate-700 mb-1">
                {t.contact.email} <span className="text-slate-400 font-normal">({language === 'en' ? 'or Phone' : 'أو الهاتف'})</span>
              </label>
              <input
                id="advisory-inquiry-email"
                type="email"
                placeholder="name@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (contactError) setContactError('');
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label htmlFor="advisory-inquiry-phone" className="block text-xs font-semibold text-slate-700 mb-1">
                {t.contact.phone} <span className="text-slate-400 font-normal">({language === 'en' ? 'or Email' : 'أو البريد'})</span>
              </label>
              <input
                id="advisory-inquiry-phone"
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

          <div>
            <label htmlFor="advisory-inquiry-category" className="block text-xs font-semibold text-slate-700 mb-1">
              {t.contact.inquiryType}
            </label>
            <select
              id="advisory-inquiry-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all cursor-pointer"
            >
              <option value="buying">{language === 'en' ? 'Property Acquisition / Buying' : 'شراء وتملك عقار'}</option>
              <option value="renting">{language === 'en' ? 'Property Leasing / Renting' : 'استئجار عقار'}</option>
              <option value="listing">{language === 'en' ? 'Selling / Listing My Property' : 'بيع أو إدراج عقاري'}</option>
              <option value="investment">{language === 'en' ? 'High-Yield Investment & Projects' : 'استثمار بعوائد مرتفعة ومشاريع'}</option>
              <option value="commercial">{language === 'en' ? 'Commercial Real Estate' : 'عقارات تجارية واستثمارية'}</option>
            </select>
          </div>

          <div>
            <label htmlFor="advisory-inquiry-message" className="block text-xs font-semibold text-slate-700 mb-1">
              {t.contact.message} <span className="text-slate-400 font-normal">({language === 'en' ? 'Optional' : 'اختياري'})</span>
            </label>
            <textarea
              id="advisory-inquiry-message"
              rows={3}
              placeholder={language === 'en' ? 'Tell us about your budget, target areas, or timeline...' : 'اكتب تفاصيل ميزانيتك، المناطق المفضلة، أو الإطار الزمني...'}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all resize-none"
            />
          </div>

          <FileUploadZone
            uploadSessionId="inquiry-modal"
            attachments={attachments}
            onChange={setAttachments}
            language={language}
          />

          <div className="pt-2">
            <Button type="submit" isLoading={isLoading} className="w-full">
              <MessageSquare className="w-4 h-4" />
              {t.cta.sendInquiry}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
