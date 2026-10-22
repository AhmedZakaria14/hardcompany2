import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Building2,
  Phone,
  Mail,
  User,
  MapPin,
  UploadCloud,
  CheckCircle2,
  MessageCircle,
  Copy,
  Check,
  Calendar,
  Layers,
  ArrowRight,
  ArrowLeft,
  File,
} from 'lucide-react';
import { useConstruction } from '../context/ConstructionContext';
import { constructionTranslations } from '../utils/translations';
import { ConstructionProjectType, ConstructionQuoteLead } from '../types';
import { COMPANY_CREDENTIALS } from '../data/seedData';
import { submitCustomerForm, FormValidationError } from '../../lib/forms/formSubmissionService';

export function QuoteModal() {
  const {
    language,
    isQuoteModalOpen,
    closeQuoteModal,
    quoteModalInitialData,
    addLead,
  } = useConstruction();

  const t = constructionTranslations[language];
  const isAr = language === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const [clientName, setClientName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState(isAr ? 'الرياض' : 'Riyadh');
  const [district, setDistrict] = useState('');
  const [projectType, setProjectType] = useState<ConstructionProjectType>('villa');
  const [builtUpArea, setBuiltUpArea] = useState<string>('1200');
  const [budgetRangeSAR, setBudgetRangeSAR] = useState('');
  const [timeline, setTimeline] = useState('');
  const [notes, setNotes] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const [submittedLead, setSubmittedLead] = useState<ConstructionQuoteLead | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (quoteModalInitialData) {
      if (quoteModalInitialData.projectType && quoteModalInitialData.projectType !== 'other') {
        setProjectType(quoteModalInitialData.projectType as ConstructionProjectType);
      }
      if (quoteModalInitialData.builtUpArea) {
        setBuiltUpArea(String(quoteModalInitialData.builtUpArea));
      }
      if (quoteModalInitialData.budgetRangeSAR) {
        setBudgetRangeSAR(quoteModalInitialData.budgetRangeSAR);
      }
      if (quoteModalInitialData.timeline) {
        setTimeline(quoteModalInitialData.timeline);
      }
      if (quoteModalInitialData.notes) {
        setNotes(quoteModalInitialData.notes);
      }
    }
  }, [quoteModalInitialData]);

  if (!isQuoteModalOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    setIsSubmitting(true);
    try {
      const result = await submitCustomerForm({
        formType: 'construction_quote',
        sector: 'construction',
        name: clientName.trim(),
        email: email.trim(),
        phone: phoneNumber.trim(),
        language,
        message: `Project Type: ${projectType}\nLocation: ${city} ${district}\nBuilt-Up Area: ${builtUpArea} sqm\nBudget: ${budgetRangeSAR}\nTimeline: ${timeline}\nFile: ${uploadedFileName || 'None'}\nNotes: ${notes}`,
        details: {
          city,
          district,
          projectType,
          builtUpArea: Number(builtUpArea) || 1200,
          budgetRangeSAR,
          timeline,
          uploadedFileName,
          calculatorVersion: quoteModalInitialData?.calculatorVersion,
          inputSnapshot: quoteModalInitialData?.inputSnapshot,
          calculationSnapshot: quoteModalInitialData?.calculationSnapshot,
          estimatedValueSAR: quoteModalInitialData?.estimatedValueSAR,
          inquiredProjectId: quoteModalInitialData?.inquiredProjectId,
        },
      });

      const newLead = addLead({
        clientName,
        phoneNumber,
        email,
        city,
        district: district || (isAr ? 'وسط المدينة' : 'Downtown'),
        projectType,
        builtUpArea: Number(builtUpArea) || 1200,
        budgetRangeSAR: budgetRangeSAR || (isAr ? 'حسب الدراسة الهندسية' : 'Pending BOQ Study'),
        timeline: timeline || (isAr ? 'خلال ٣ أشهر' : 'Within 3 months'),
        notes,
        hasArchitecturalPlans: Boolean(uploadedFileName),
        fileName: uploadedFileName || undefined,
        source: quoteModalInitialData?.source || 'quote_form',
        inquiredProjectId: quoteModalInitialData?.inquiredProjectId,
        estimatedValueSAR: quoteModalInitialData?.estimatedValueSAR,
        calculatorVersion: quoteModalInitialData?.calculatorVersion,
        inputSnapshot: quoteModalInitialData?.inputSnapshot,
        calculationSnapshot: quoteModalInitialData?.calculationSnapshot,
      });

      newLead.referenceNumber = result.trackingCode;
      setSubmittedLead(newLead);
    } catch (err: any) {
      console.error('Failed to submit quote request', err);
      if (err instanceof FormValidationError) {
        setValidationError(Object.values(err.fieldErrors).join(' '));
      } else {
        setValidationError(err?.message || (isAr ? 'فشل إرسال طلب التقييم. تم الحفاظ على بياناتك.' : 'Failed to submit quote request. Input is preserved.'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyRef = () => {
    if (!submittedLead) return;
    navigator.clipboard.writeText(submittedLead.referenceNumber);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleWhatsAppRedirect = () => {
    if (!submittedLead) return;
    const msg = isAr
      ? `السلام عليكم، تم تقديم طلب عرض سعر وتسعير مشروع لدى هارد للمقاولات برقم مرجع: ${submittedLead.referenceNumber} باسم: ${submittedLead.clientName}. نرجو التواصل لمناقشة تفاصيل العطاء.`
      : `Hello HARD Contracting Co., I submitted a quotation request with Ref Number: ${submittedLead.referenceNumber} for client: ${submittedLead.clientName}. Looking forward to discussing the project.`;
    window.open(
      `https://wa.me/${COMPANY_CREDENTIALS.whatsapp.replace('+', '')}?text=${encodeURIComponent(msg)}`,
      '_blank'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-8 text-slate-900">
        {/* Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3 text-start">
            <div className="p-2.5 rounded-xl bg-[#eef7ff] border border-sky-100 text-[#009ee2]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display-serif text-[#0f243e]">
                {t.quoteModal.title}
              </h2>
              <p className="text-xs text-slate-500">{t.quoteModal.subtitle}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeQuoteModal}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Form or Success */}
        <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto text-start">
          {submittedLead ? (
            /* Success State */
            <div className="space-y-6 text-center py-4 animate-in fade-in-50">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold font-display-serif text-[#0f243e]">
                  {t.quoteModal.successTitle}
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  {t.quoteModal.successDesc}
                </p>
              </div>

              {/* Reference Number Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between max-w-md mx-auto">
                <div className="text-start">
                  <div className="text-[10px] text-slate-500">{t.quoteModal.refNum}</div>
                  <div className="text-base font-black font-mono text-[#009ee2]">
                    {submittedLead.referenceNumber}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyRef}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 border border-slate-200 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedRef ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ' : 'Copy')}</span>
                </button>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button
                  type="button"
                  onClick={handleWhatsAppRedirect}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{t.quoteModal.whatsappConfirm}</span>
                </button>

                <button
                  type="button"
                  onClick={closeQuoteModal}
                  className="px-6 py-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs cursor-pointer shadow-2xs"
                >
                  {t.quoteModal.close}
                </button>
              </div>
            </div>
          ) : (
            /* Lead Capture Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {validationError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium">
                  {validationError}
                </div>
              )}

              {/* Client Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#0072b8]" />
                    <span>{t.quoteModal.fullName}</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder={isAr ? 'مثال: م. فهد السبيعي / شركة الأفق' : 'e.g., Eng. Fahad Al-Subaie'}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 hover:border-slate-400 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-500 focus:border-[#0072b8] focus:ring-2 focus:ring-[#0072b8]/20 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#0072b8]" />
                    <span>{t.quoteModal.phone}</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="05XXXXXXXX / +9665XXXXXXXX"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 hover:border-slate-400 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-500 focus:border-[#0072b8] focus:ring-2 focus:ring-[#0072b8]/20 focus:outline-none dir-ltr text-start disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
              </div>

              {/* Email & City/District */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#0072b8]" />
                    <span>{t.quoteModal.email}</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 hover:border-slate-400 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-500 focus:border-[#0072b8] focus:ring-2 focus:ring-[#0072b8]/20 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#0072b8]" />
                    <span>{t.quoteModal.cityDistrict}</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder={isAr ? 'المدينة (الرياض)' : 'City (Riyadh)'}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 hover:border-slate-400 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-500 focus:border-[#0072b8] focus:ring-2 focus:ring-[#0072b8]/20 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
                    />
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder={isAr ? 'الحي (حطين)' : 'District (Hittin)'}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 hover:border-slate-400 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-500 focus:border-[#0072b8] focus:ring-2 focus:ring-[#0072b8]/20 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
                    />
                  </div>
                </div>
              </div>

              {/* Project Type & Built-up Area */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#0072b8]" />
                    <span>{t.quoteModal.projectType}</span>
                  </label>
                  <select
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value as ConstructionProjectType)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 hover:border-slate-400 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:border-[#0072b8] focus:ring-2 focus:ring-[#0072b8]/20 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 cursor-pointer"
                  >
                    <option value="villa">{t.calculator.types.villa}</option>
                    <option value="commercial-building">{t.calculator.types.commercial}</option>
                    <option value="duplex">{t.calculator.types.duplex}</option>
                    <option value="residential-compound">{t.calculator.types.compound}</option>
                    <option value="warehouse">{t.calculator.types.warehouse}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#0072b8]" />
                    <span>{t.quoteModal.builtUpArea}</span>
                  </label>
                  <input
                    type="number"
                    value={builtUpArea}
                    onChange={(e) => setBuiltUpArea(e.target.value)}
                    placeholder="1200"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 hover:border-slate-400 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-500 focus:border-[#0072b8] focus:ring-2 focus:ring-[#0072b8]/20 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
              </div>

              {/* Budget & Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    {t.quoteModal.budgetRange}
                  </label>
                  <input
                    type="text"
                    value={budgetRangeSAR}
                    onChange={(e) => setBudgetRangeSAR(e.target.value)}
                    placeholder={isAr ? 'مثال: ٥ - ٨ مليون ريال' : 'e.g. 5M - 8M SAR'}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 hover:border-slate-400 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-500 focus:border-[#0072b8] focus:ring-2 focus:ring-[#0072b8]/20 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    {t.quoteModal.timeline}
                  </label>
                  <input
                    type="text"
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    placeholder={isAr ? 'خلال ٣ أشهر' : 'Within 3 months'}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 hover:border-slate-400 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-500 focus:border-[#0072b8] focus:ring-2 focus:ring-[#0072b8]/20 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
              </div>

              {/* File Attachment Dropzone */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-slate-700 block">
                  {t.quoteModal.plansUpload}
                </label>
                <label className="border-2 border-dashed border-slate-300 hover:border-[#009ee2] rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50">
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".pdf,.dwg,.dxf,.zip,.rar,.png,.jpg"
                  />
                  {uploadedFileName ? (
                    <div className="flex items-center gap-2 text-xs font-bold text-[#009ee2]">
                      <File className="w-4 h-4" />
                      <span>{uploadedFileName}</span>
                    </div>
                  ) : (
                    <div className="space-y-1 text-center">
                      <UploadCloud className="w-6 h-6 text-slate-400 mx-auto" />
                      <div className="text-[11px] text-slate-500">{t.quoteModal.dropPlans}</div>
                    </div>
                  )}
                </label>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  {t.quoteModal.notes}
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={isAr ? 'أي مواصفات خاصة، شروط استشارية، أو متطلبات محددة...' : 'Any special requirements or specifications...'}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:border-[#009ee2] focus:ring-1 focus:ring-[#009ee2] focus:outline-none"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-xl bg-[#009ee2] hover:bg-[#008bc7] disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-sky-500/20 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>{isSubmitting ? t.quoteModal.submitting : t.quoteModal.submitBtn}</span>
                <ArrowIcon className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
