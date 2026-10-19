import React, { useState } from 'react';
import {
  MapPin,
  Mail,
  Clock,
  Phone,
  Send,
  CheckCircle2,
  AlertCircle,
  Building2,
  ExternalLink,
  Compass,
  ShieldCheck,
} from 'lucide-react';
import { useHVAC } from '../context/HVACContext';
import { T, pick } from '../translations';
import { submitCustomerForm } from '../../lib/forms/formSubmissionService';

export function HVACContactSection() {
  const { language, isAr, addLead, services } = useHVAC();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [service, setService] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successStatus, setSuccessStatus] = useState<string | null>(null);

  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!name.trim() || !phone.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await submitCustomerForm({
        formType: 'general_contact',
        sector: 'hvac',
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        language,
        message: `Service: ${service || 'General'}\n\n${message}`,
        details: {
          service: service || 'General Contact Inquiry',
          recipientEmail: 'info@hardgp.com',
        },
      });

      const newLead = addLead({
        clientName: name.trim(),
        phoneNumber: phone.trim(),
        email: email.trim() || undefined,
        city: 'Eastern Province Hub',
        service: service || 'General Contact Inquiry',
        notes: message.trim() || undefined,
      });

      setSuccessStatus(result.trackingCode || newLead.referenceNumber);
      setName('');
      setPhone('');
      setEmail('');
      setMessage('');
    } catch (err: any) {
      console.error('HVAC contact section submission failed', err);
      setFormError(
        err?.message || (isAr
          ? 'تعذر إرسال النموذج. تم الحفاظ على بياناتك، يرجى إعادة المحاولة.'
          : 'Failed to submit form. Your entered information is preserved.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-16 sm:py-24 bg-white border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0EA5E9]/10 text-[#0EA5E9] text-xs font-semibold">
            <Mail className="w-3.5 h-3.5" />
            <span>{pick(T.contact.eyebrow, language)}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-900 tracking-tight">
            {pick(T.contact.title, language)}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {pick(T.contact.subtitle, language)}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-start">
          {/* Left Column (6 cols): Lead Form sending to info@hardgp.com */}
          <div className="lg:col-span-6 bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs text-start">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {isAr ? 'نموذج طلب الخدمة والتواصل المباشر' : 'Service Request & Inquiry Form'}
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              {isAr
                ? 'يتم إرسال كافة الاستفسارات فوراً إلى info@hardgp.com لمتابعتها من قبل الإدارة الفنية.'
                : 'All submissions are immediately dispatched to info@hardgp.com and logged in our system.'}
            </p>

            {formError && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="font-semibold">{formError}</p>
              </div>
            )}

            {successStatus && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in duration-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">{pick(T.contact.formSuccess, language)}</p>
                  <p className="font-mono text-xs text-emerald-700 mt-1">
                    {isAr ? 'الرقم المرجعي:' : 'Reference:'} <bdi dir="ltr">{successStatus}</bdi>
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {pick(T.contact.formName, language)} *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isAr ? 'الاسم الكامل' : 'Full Name'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9]"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {pick(T.contact.formPhone, language)} *
                </label>
                <input
                  type="tel"
                  required
                  dir="ltr"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="05XXXXXXXX"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] font-mono text-start"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {pick(T.contact.formEmail, language)}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9]"
                />
              </div>

              {/* Service */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {pick(T.contact.formService, language)}
                </label>
                <select
                  required
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] cursor-pointer"
                >
                  <option value="" disabled>
                    {isAr ? '-- اختر الخدمة المطلوب الاستفسار عنها --' : '-- Select Requested Service --'}
                  </option>
                  <option value="AC Maintenance Contract">
                    {isAr ? 'عقد صيانة سنوي (AMC)' : 'Annual Maintenance Contract (AMC)'}
                  </option>
                  <option value="Emergency Repair">
                    {isAr ? 'صيانة طوارئ فورية' : 'Emergency Rapid Repair'}
                  </option>
                  <option value="Deep Chemical Cleaning">
                    {isAr ? 'غسيل كيميائي شامل' : 'Deep Coil Chemical Cleaning'}
                  </option>
                  <option value="VRF / Chiller Overhaul">
                    {isAr ? 'صيانة أنظمة مركزية وشيلرات' : 'VRF & Chiller Overhaul'}
                  </option>
                  <option value="Inspection & Leak Testing">
                    {isAr ? 'فحص تسريب الغاز والفريون' : 'Inspection & Gas Leak Testing'}
                  </option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {pick(T.contact.formMessage, language)}
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    isAr
                      ? 'وضح تفاصيل الموقع وعدد المكيفات والمشكلة بالتفصيل...'
                      : 'Please describe the site location, number of units, and requirements...'
                  }
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? pick(T.contact.formSending, language)
                    : pick(T.contact.formSubmit, language)}
                </span>
              </button>
            </form>
          </div>

          {/* Right Column (6 cols): Verified Physical Map Location & Office Information */}
          <div className="lg:col-span-6 space-y-6 text-start">
            {/* Map Container */}
            <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs space-y-0">
              <div className="p-4 border-b border-slate-200/80 bg-white flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#0EA5E9]" />
                  <span className="font-semibold text-xs sm:text-sm text-slate-800">
                    {pick(T.contact.mapTitle, language)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    26.373784° N, 50.103001° E
                  </span>
                  <a
                    href="https://www.google.com/maps/dir/?api=1&destination=26.373784,50.103001"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-[#0EA5E9] hover:bg-[#0284C7] rounded-lg transition-colors"
                  >
                    <span>{pick(T.contact.getDirections, language)}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Google Maps Iframe */}
              <div className="h-60 sm:h-64 w-full bg-slate-100 relative">
                <iframe
                  title="HARD HVAC Maintenance Service Hub - Al Khobar"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src="https://maps.google.com/maps?q=26.373784,50.103001&hl=en&z=15&output=embed"
                />
              </div>
            </div>

            {/* Verification Notice Banner */}
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                {pick(T.contact.verificationNotice, language)}
              </p>
            </div>

            {/* Address, Coverage, Email, and Working Hours Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Physical Office Address (Al Khobar) */}
              <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-4.5 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#0EA5E9]">
                  <Building2 className="w-4 h-4" />
                </div>
                <h4 className="font-semibold text-xs text-slate-900">
                  {pick(T.contact.addressTitle, language)}
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {pick(T.contact.addressDesc, language)}
                </p>
              </div>

              {/* Field Service Coverage Area */}
              <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-4.5 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#0EA5E9]">
                  <Compass className="w-4 h-4" />
                </div>
                <h4 className="font-semibold text-xs text-slate-900">
                  {pick(T.contact.coverageTitle, language)}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {pick(T.contact.coverageDesc, language)}
                </p>
              </div>

              {/* Direct Email */}
              <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-4.5 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#0EA5E9]">
                  <Mail className="w-4 h-4" />
                </div>
                <h4 className="font-semibold text-xs text-slate-900">
                  {pick(T.contact.emailTitle, language)}
                </h4>
                <a
                  href="mailto:info@hardgp.com"
                  className="text-xs text-[#0EA5E9] hover:underline font-semibold block"
                >
                  info@hardgp.com
                </a>
                <p className="text-[11px] text-slate-500">
                  {isAr ? 'استجابة سريعة لكافة العقود' : 'Direct inbox for contracts & RFPs'}
                </p>
              </div>

              {/* Working Hours */}
              <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-4.5 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#F97316]">
                  <Clock className="w-4 h-4" />
                </div>
                <h4 className="font-semibold text-xs text-slate-900">
                  {pick(T.contact.hoursTitle, language)}
                </h4>
                <div className="space-y-1 text-xs text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{pick(T.contact.hoursRegular, language)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-900 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F97316]" />
                    <span>{pick(T.contact.hoursFriday, language)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
