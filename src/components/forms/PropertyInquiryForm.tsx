import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Send,
  Sparkles,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { Language, Property } from '../../types';
import { FormAttachmentMeta } from '../../types/firestore-schema';
import { translations } from '../../lib/translations';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { submitCustomerForm, FormValidationError } from '../../lib/forms/formSubmissionService';
import { FileUploadZone } from './FileUploadZone';

interface PropertyInquiryFormProps {
  property: Property;
  language: Language;
  onSuccess?: () => void;
}

export function PropertyInquiryForm({
  property,
  language,
  onSuccess,
}: PropertyInquiryFormProps) {
  const t = translations[language];
  const isAr = language === 'ar';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [inquiryTopic, setInquiryTopic] = useState('scheduleTour');
  const [message, setMessage] = useState(
    isAr
      ? `مرحباً، أود الاستفسار عن العقار "${property?.title?.ar || ''}" (المعرف: ${property?.id || ''}). يرجى تزويدي بمزيد من المعلومات حول التوفر وخيارات الدفع.`
      : `Hello, I am interested in inquiring about "${property?.title?.en || ''}" (ID: ${property?.id || ''}). Please send me full floorplans and available viewing windows.`
  );
  const [attachments, setAttachments] = useState<FormAttachmentMeta[]>([]);

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [crmRefNumber, setCrmRefNumber] = useState('');
  const [submittedTime, setSubmittedTime] = useState('');

  // Validate form fields
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Full name
    if (!fullName.trim()) {
      newErrors.fullName = t.propertyDetails.validation.nameRequired;
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = t.propertyDetails.validation.nameMinLength;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const hasEmail = Boolean(email.trim());
    const hasPhone = Boolean(phone.trim());

    if (!hasEmail && !hasPhone) {
      const msg = isAr
        ? 'يرجى تقديم وسيلة تواصل واحدة على الأقل (البريد أو الهاتف)'
        : 'Please provide at least one contact method (email or phone).';
      newErrors.email = msg;
      newErrors.phone = msg;
    } else {
      if (hasEmail && !emailRegex.test(email.trim())) {
        newErrors.email = t.propertyDetails.validation.emailInvalid;
      }
      if (hasPhone) {
        const phoneDigits = phone.replace(/\D/g, '');
        if (phoneDigits.length < 7) {
          newErrors.phone = t.propertyDetails.validation.phoneInvalid;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validate();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ fullName: true, email: true, phone: true, message: true });

    if (!validate()) {
      return;
    }

    const finalMessage = message.trim()
      ? message.trim()
      : isAr
      ? `مرحباً، أود الاستفسار عن العقار "${property?.title?.ar || ''}" (المعرف: ${property?.id || ''}).`
      : `Hello, I am interested in inquiring about "${property?.title?.en || ''}" (ID: ${property?.id || ''}).`;

    setIsSubmitting(true);
    setSubmitError('');
    try {
      const result = await submitCustomerForm({
        formType: 'property_inquiry',
        sector: 'realestate',
        name: fullName,
        email: email.trim(),
        phone: phone.trim(),
        entityId: property.id,
        entityTitle: property?.title?.[language] || property?.title?.en || '',
        language,
        message: `Topic: ${inquiryTopic}\n\n${finalMessage}`,
        attachments,
        details: {
          inquiryTopic,
          propertyPriceSAR: property.price.sar,
          propertyCity: property.location?.city?.[language] || 'Saudi Arabia',
        },
      });

      const now = new Date().toLocaleTimeString(isAr ? 'ar-SA' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
      setReferenceNumber(result.trackingCode);
      setCrmRefNumber(`CRM-${result.leadId.slice(-6).toUpperCase()}`);
      setSubmittedTime(now);
      setIsSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Lead submission failed', err);
      if (err instanceof FormValidationError) {
        setErrors(err.fieldErrors);
      }
      setSubmitError(
        err?.message || (isAr
          ? 'تعذر إرسال الطلب حالياً. تم حفظ بياناتك المدخلة، يرجى الضغط على إعادة المحاولة.'
          : 'Failed to submit inquiry. Your entered information is preserved. Please click retry.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setTouched({});
    setErrors({});
    setFullName('');
    setEmail('');
    setPhone('');
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Badge variant="primary">
            {isAr ? 'طلب استفسار مباشر' : 'Direct Property Inquiry'}
          </Badge>
          <span className="text-xs text-slate-400">ID: {property.id}</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-display-serif">
          {t.propertyDetails.inquiryFormTitle}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600">
          {t.propertyDetails.inquiryFormSubtitle}
        </p>
      </div>

      {/* Animated Success Alert Banner */}
      {isSuccess ? (
        <div className="p-6 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-5 animate-in fade-in zoom-in duration-300">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  {t.propertyDetails.inquirySuccess.title}
                </span>
                <span className="text-xs text-emerald-700 font-mono bg-emerald-100/80 px-2 py-0.5 rounded-md font-semibold">
                  {referenceNumber}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
                {t.propertyDetails.inquirySuccess.message}
              </p>
            </div>
          </div>

          {/* Submission Details & CRM Sync Recap Box */}
          <div className="bg-white p-4 rounded-xl border border-emerald-200/80 text-xs space-y-2 text-slate-700">
            <div className="flex justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-500">{isAr ? 'المرسل:' : 'Inquirer:'}</span>
              <span className="font-semibold text-slate-900">{fullName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-500">{isAr ? 'مزامنة الـ CRM:' : 'CRM Sync Hook:'}</span>
              <span className="font-mono font-bold text-blue-600 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {crmRefNumber || 'Synced to CRM'}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-500">{isAr ? 'وقت الإرسال:' : 'Submitted At:'}</span>
              <span className="font-medium text-slate-700">{submittedTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{isAr ? 'متوسط وقت الرد:' : 'Expected Callback:'}</span>
              <span className="font-bold text-emerald-700">
                {isAr ? 'أقل من 15 دقيقة' : '< 15 minutes'}
              </span>
            </div>
          </div>

          {/* Post-submit Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <Button
              href={`https://wa.me/966556125711?text=${encodeURIComponent(
                isAr
                  ? `مرحباً هارد للعقارات، لقد أرسلت استفساراً بخصوص "${property?.title?.ar || ''}" (رقم المرجع: ${referenceNumber}).`
                  : `Hello HARD Real Estate, I just submitted an inquiry for "${property?.title?.en || ''}" (Ref: ${referenceNumber}).`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              variant="whatsapp"
              size="md"
              className="w-full sm:w-auto flex-1 justify-center"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{t.cta.chatOnWhatsApp}</span>
            </Button>

            <Button
              variant="outline"
              size="md"
              onClick={handleReset}
              className="text-slate-700 border-slate-300"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.propertyDetails.inquirySuccess.sendAnother}</span>
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {submitError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs space-y-2 text-rose-900 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{isAr ? 'فشل إرسال الاستفسار' : 'Inquiry Submission Failed'}</span>
              </div>
              <p className="leading-relaxed">{submitError}</p>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
                className="mt-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs py-1.5 px-3"
              >
                <RotateCcw className="w-3.5 h-3.5 me-1" />
                <span>{isAr ? 'إعادة المحاولة الان' : 'Retry Submission Now'}</span>
              </Button>
            </div>
          )}

          {/* Inquiry Topic Dropdown */}
          <div>
            <label htmlFor="prop-inquiry-topic" className="block text-xs font-bold text-slate-700 mb-1.5">
              {t.propertyDetails.inquiryTopic}
            </label>
            <select
              id="prop-inquiry-topic"
              value={inquiryTopic}
              onChange={(e) => setInquiryTopic(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="scheduleTour">{t.propertyDetails.inquiryTopics.scheduleTour}</option>
              <option value="requestFloorplan">{t.propertyDetails.inquiryTopics.requestFloorplan}</option>
              <option value="pricingTerms">{t.propertyDetails.inquiryTopics.pricingTerms}</option>
              <option value="investmentAdvisory">{t.propertyDetails.inquiryTopics.investmentAdvisory}</option>
              <option value="general">{t.propertyDetails.inquiryTopics.general}</option>
            </select>
          </div>

          {/* Full Name Field */}
          <div>
            <label htmlFor="prop-inquiry-fullname" className="block text-xs font-bold text-slate-700 mb-1">
              {t.propertyDetails.fullName} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute top-3.5 start-3.5" />
              <input
                id="prop-inquiry-fullname"
                type="text"
                required
                aria-required="true"
                aria-invalid={Boolean(touched.fullName && errors.fullName)}
                aria-describedby={touched.fullName && errors.fullName ? "prop-inquiry-fullname-error" : undefined}
                placeholder={t.propertyDetails.fullNamePlaceholder}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                onBlur={() => handleBlur('fullName')}
                className={`w-full ps-10 pe-3 py-2.5 bg-slate-50 border rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  touched.fullName && errors.fullName
                    ? 'border-rose-500 focus:ring-rose-500 bg-rose-50/30'
                    : 'border-slate-300 hover:border-slate-400 focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
            </div>
            {touched.fullName && errors.fullName && (
              <p id="prop-inquiry-fullname-error" className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.fullName}</span>
              </p>
            )}
          </div>

          {/* Email & Phone Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email Field */}
            <div>
              <label htmlFor="prop-inquiry-email" className="block text-xs font-bold text-slate-700 mb-1">
                {t.propertyDetails.email} <span className="text-slate-400 font-normal">({isAr ? 'أو الهاتف' : 'or Phone'})</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute top-3.5 start-3.5" />
                <input
                  id="prop-inquiry-email"
                  type="email"
                  aria-invalid={Boolean(touched.email && errors.email)}
                  aria-describedby={touched.email && errors.email ? "prop-inquiry-email-error" : undefined}
                  placeholder={t.propertyDetails.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className={`w-full ps-10 pe-3 py-2.5 bg-slate-50 border rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    touched.email && errors.email
                      ? 'border-rose-500 focus:ring-rose-500 bg-rose-50/30'
                      : 'border-slate-300 hover:border-slate-400 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                />
              </div>
              {touched.email && errors.email && (
                <p id="prop-inquiry-email-error" className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="prop-inquiry-phone" className="block text-xs font-bold text-slate-700 mb-1">
                {t.propertyDetails.phone} <span className="text-slate-400 font-normal">({isAr ? 'أو البريد' : 'or Email'})</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute top-3.5 start-3.5" />
                <input
                  id="prop-inquiry-phone"
                  type="tel"
                  aria-invalid={Boolean(touched.phone && errors.phone)}
                  aria-describedby={touched.phone && errors.phone ? "prop-inquiry-phone-error" : undefined}
                  placeholder={t.propertyDetails.phonePlaceholder}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onBlur={() => handleBlur('phone')}
                  className={`w-full ps-10 pe-3 py-2.5 bg-slate-50 border rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    touched.phone && errors.phone
                      ? 'border-rose-500 focus:ring-rose-500 bg-rose-50/30'
                      : 'border-slate-300 hover:border-slate-400 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                />
              </div>
              {touched.phone && errors.phone && (
                <p id="prop-inquiry-phone-error" className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.phone}</span>
                </p>
              )}
            </div>
          </div>

          {/* Message Textarea */}
          <div>
            <label htmlFor="prop-inquiry-message" className="block text-xs font-bold text-slate-700 mb-1">
              {t.propertyDetails.message} <span className="text-slate-400 font-normal">({isAr ? 'اختياري' : 'Optional'})</span>
            </label>
            <textarea
              id="prop-inquiry-message"
              rows={3}
              aria-invalid={Boolean(touched.message && errors.message)}
              aria-describedby={touched.message && errors.message ? "prop-inquiry-message-error" : undefined}
              placeholder={t.propertyDetails.messagePlaceholder}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onBlur={() => handleBlur('message')}
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 transition-all resize-none ${
                touched.message && errors.message
                  ? 'border-rose-500 focus:ring-rose-500 bg-rose-50/30'
                  : 'border-slate-300 hover:border-slate-400 focus:border-blue-500 focus:ring-blue-500'
              }`}
            ></textarea>
            {touched.message && errors.message && (
              <p id="prop-inquiry-message-error" className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.message}</span>
              </p>
            )}
          </div>

          {/* File Upload Zone for Property Photos / Documents */}
          <FileUploadZone
            uploadSessionId={`prop-inq-${property.id}`}
            attachments={attachments}
            onChange={setAttachments}
            language={language}
          />

          {/* Trust Guarantee Note */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {isAr
                ? 'استفسارك مباشر وخاص. نضمن عدم إرسال أي رسائل غير مرغوب فيها.'
                : 'Direct broker dispatch. Zero spam guarantee under strict NDA guidelines.'}
            </span>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSubmitting}
              className="w-full justify-center font-bold shadow-md"
            >
              {isSubmitting ? (
                <span>{t.propertyDetails.submitting}</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{t.propertyDetails.submitInquiry}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
