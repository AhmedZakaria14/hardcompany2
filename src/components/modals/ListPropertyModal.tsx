import React, { useState } from 'react';
import {
  MapPin,
  CheckCircle2,
  MessageSquare,
  Building2,
  Search,
  KeyRound,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { Language } from '../../types';
import { FormAttachmentMeta } from '../../types/firestore-schema';
import { submitCustomerForm, FormValidationError } from '../../lib/forms/formSubmissionService';
import { GoogleMapPickerModal } from './GoogleMapPickerModal';
import { FileUploadZone } from '../forms/FileUploadZone';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface ListPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

type UserRole = 'owner' | 'seeker'; // 'owner' = مالك, 'seeker' = مشتري أو مستأجر
type AddressMethod = 'map' | 'short'; // 'map' = الخريطة, 'short' = عنوان مختصر
type ListingOfferType = 'sale' | 'rent'; // بيع / إيجار for owner
type RequestOfferType = 'buy' | 'rent'; // شراء / إيجار for seeker

export function ListPropertyModal({
  isOpen,
  onClose,
  language,
}: ListPropertyModalProps) {
  const isAr = language === 'ar';

  // Primary Intent State
  const [userRole, setUserRole] = useState<UserRole>('owner');

  // Owner Specific Fields
  const [addressMethod, setAddressMethod] = useState<AddressMethod>('map');
  const [mapAddress, setMapAddress] = useState('');
  const [shortAddress, setShortAddress] = useState('');
  const [ownerOfferType, setOwnerOfferType] = useState<ListingOfferType>('sale');
  const [askingPriceSAR, setAskingPriceSAR] = useState('');

  // Seeker Specific Fields
  const [propertyDescription, setPropertyDescription] = useState('');
  const [seekerOfferType, setSeekerOfferType] = useState<RequestOfferType>('buy');
  const [budgetSAR, setBudgetSAR] = useState('');

  // Shared Fields (Preserved across role switching)
  const [propertyType, setPropertyType] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [attachments, setAttachments] = useState<FormAttachmentMeta[]>([]);

  // Map Modal State
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  // UI & Validation State
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState('');
  const [contactError, setContactError] = useState('');

  // Recorded Intent for Confirmation Screen
  const [submittedRole, setSubmittedRole] = useState<UserRole>('owner');
  const [submittedIntentLabel, setSubmittedIntentLabel] = useState('');
  const [submittedPropertyTypeLabel, setSubmittedPropertyTypeLabel] = useState('');

  if (!isOpen) return null;

  const propertyTypes = isAr
    ? [
        { id: 'apartment', label: 'شقة' },
        { id: 'villa', label: 'فيلا' },
        { id: 'townhouse', label: 'تاون هاوس' },
        { id: 'penthouse', label: 'بنتهاوس' },
        { id: 'mansion', label: 'قصر ومقر فاخر' },
        { id: 'land', label: 'أرض' },
        { id: 'building', label: 'عمارة سكنية / تجارية' },
        { id: 'floor', label: 'دور مستقل' },
        { id: 'office', label: 'مكتب تجاري' },
        { id: 'retail', label: 'محل / معرض تجاري' },
        { id: 'warehouse', label: 'مستودع / هنجر' },
      ]
    : [
        { id: 'apartment', label: 'Apartment' },
        { id: 'villa', label: 'Villa' },
        { id: 'townhouse', label: 'Townhouse' },
        { id: 'penthouse', label: 'Penthouse' },
        { id: 'mansion', label: 'Mansion & Palace' },
        { id: 'land', label: 'Land Plot' },
        { id: 'building', label: 'Full Building' },
        { id: 'floor', label: 'Independent Floor' },
        { id: 'office', label: 'Commercial Office' },
        { id: 'retail', label: 'Retail / Showroom' },
        { id: 'warehouse', label: 'Warehouse / Industrial' },
      ];

  const getPropTypeLabel = (id: string) => {
    const found = propertyTypes.find((p) => p.id === id);
    return found ? found.label : id || (isAr ? 'غير محدد' : 'Unspecified');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactError('');

    // Contact validation: Full name required, and either phone OR email
    if (!fullName.trim()) return;
    if (!phone.trim() && !email.trim()) {
      setContactError(
        isAr
          ? 'يرجى تقديم وسيلة تواصل واحدة على الأقل (رقم الهاتف أو البريد الإلكتروني).'
          : 'Please provide at least one contact method (phone or email).'
      );
      return;
    }

    setSubmitting(true);

    const propTypeLabel = getPropTypeLabel(propertyType);
    let intentLabel = '';
    let messagePayload = '';
    let inquiryTypeLead: 'property_listing' | 'property_inquiry' = 'property_listing';

    if (userRole === 'owner') {
      inquiryTypeLead = 'property_listing';
      const offerLabel = ownerOfferType === 'sale' ? (isAr ? 'بيع' : 'Sale') : (isAr ? 'إيجار' : 'Rent');
      intentLabel = isAr ? `مالك - عرض عقار للـ${offerLabel}` : `Owner - Listing for ${offerLabel}`;
      const addressValue = addressMethod === 'map' ? mapAddress : shortAddress;

      messagePayload = `[Property Listing Submission - Owner Intent]\nRole: Property Owner\nListing Type: ${offerLabel}\nProperty Type: ${propTypeLabel}\nAsking Price (SAR): ${askingPriceSAR || 'Unspecified'}\nAddress Method: ${addressMethod}\nAddress/Coordinates: ${addressValue || 'Not specified'}`;
    } else {
      inquiryTypeLead = 'property_inquiry';
      const requestLabel = seekerOfferType === 'buy' ? (isAr ? 'شراء' : 'Purchase') : (isAr ? 'إيجار' : 'Rent');
      intentLabel = isAr ? `مشتري/مستأجر - طلب ${requestLabel}` : `Buyer/Tenant - Search for ${requestLabel}`;

      messagePayload = `[Property Search Request - Buyer/Tenant Intent]\nRole: Buyer / Tenant\nRequest Type: ${requestLabel}\nProperty Type: ${propTypeLabel}\nBudget (SAR): ${budgetSAR || 'Unspecified'}\nRequirements & Notes: ${propertyDescription || 'None'}`;
    }

    try {
      const result = await submitCustomerForm({
        formType: userRole === 'owner' ? 'list_property' : 'property_inquiry',
        sector: 'realestate',
        name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        language,
        message: messagePayload,
        attachments,
        details: {
          userRole,
          intentLabel,
          propertyType,
          propertyTypeLabel: propTypeLabel,
          mapAddress: userRole === 'owner' && addressMethod === 'map' ? mapAddress : '',
          shortAddress: userRole === 'owner' && addressMethod === 'short' ? shortAddress : '',
          propertyDescription: userRole === 'seeker' ? propertyDescription : '',
          ownerOfferType: userRole === 'owner' ? ownerOfferType : undefined,
          seekerOfferType: userRole === 'seeker' ? seekerOfferType : undefined,
          askingPriceSAR: userRole === 'owner' ? askingPriceSAR : undefined,
          budgetSAR: userRole === 'seeker' ? budgetSAR : undefined,
        },
      });

      setReferenceId(result.trackingCode);
      setSubmittedRole(userRole);
      setSubmittedIntentLabel(intentLabel);
      setSubmittedPropertyTypeLabel(propTypeLabel);
      setSubmitted(true);
    } catch (err: any) {
      console.error('Failed to submit property listing/request', err);
      if (err instanceof FormValidationError) {
        setContactError(Object.values(err.fieldErrors).join(' '));
      } else {
        setContactError(err?.message || (isAr ? 'فشل إرسال الطلب. يرجى إعادة المحاولة.' : 'Failed to submit request. Please retry.'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setUserRole('owner');
    setMapAddress('');
    setShortAddress('');
    setPropertyDescription('');
    setPropertyType('');
    setFullName('');
    setPhone('');
    setEmail('');
    setContactError('');
    onClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleReset}
        title={isAr ? 'منصة خدمات العقار' : 'Property Services Portal'}
        subtitle={
          isAr
            ? 'اختر نوع الخدمة: عرض عقارك للمبيعات والإيجار، أو تسجيل طلب بحث بمواصفات خاصة'
            : 'Select your journey: List your property or request a custom property search.'
        }
        maxWidth="lg"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Success Confirmation State displaying recorded intent */}
        {submitted ? (
          <div className="space-y-5 py-2 animate-in fade-in duration-300">
            {/* Header Badge */}
            <div className="p-5 bg-emerald-50/90 border border-emerald-200 rounded-2xl text-emerald-950 space-y-3">
              <div className="flex items-center gap-3 text-emerald-700 font-bold text-base sm:text-lg">
                <CheckCircle2 className="w-7 h-7 shrink-0 text-emerald-600" />
                <span>
                  {submittedRole === 'owner'
                    ? isAr
                      ? 'تم تسجيل طلب إدراج وعرض العقار بنجاح!'
                      : 'Property Listing Request Dispatched!'
                    : isAr
                    ? 'تم تسجيل طلب البحث عن عقار بنجاح!'
                    : 'Property Search Request Dispatched!'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
                {isAr
                  ? 'تم حفظ طلبك وتوجيهه مباشرة لقسم الوساطة والتسويق العقاري في هارد للعقارات. سيتواصل معك مستشار متخصص خلال 15 دقيقة.'
                  : 'Your request has been registered and routed directly to the HARD Group brokerage team. A certified manager will contact you within 15 minutes.'}
              </p>
            </div>

            {/* Preserved Intent Recap Card */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-3 text-slate-700">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  {isAr ? 'تفاصيل الطلب المسجلة:' : 'Registered Payload Summary:'}
                </span>
                <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 border border-slate-200 rounded-md">
                  {referenceId}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                <div>
                  <span className="text-slate-400 block">{isAr ? 'مسار الطلب / الصفة:' : 'User Intent Role:'}</span>
                  <strong className="text-slate-900">{submittedIntentLabel}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">{isAr ? 'نوع العقار:' : 'Property Type:'}</span>
                  <strong className="text-slate-900">{submittedPropertyTypeLabel}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">{isAr ? 'صاحب الطلب:' : 'Applicant Name:'}</span>
                  <strong className="text-slate-900">{fullName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">{isAr ? 'وسيلة التواصل:' : 'Contact Method:'}</span>
                  <strong className="text-blue-700 font-mono">{phone || email}</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1 font-semibold text-blue-600">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isAr ? 'مزامنة الـ CRM: مكتملة' : 'CRM Integration: Active'}</span>
                </span>
                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isAr ? 'توثيق رسمي غير ملزم' : 'Verified Request'}</span>
                </span>
              </div>
            </div>

            {/* Post-submit Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <Button
                href={`https://wa.me/966556125711?text=${encodeURIComponent(
                  isAr
                    ? `مرحباً هارد للعقارات، أود متابعة طلبي (${submittedIntentLabel}) برقم المرجع: ${referenceId}`
                    : `Hello HARD Real Estate, following up on my request (${submittedIntentLabel}) Ref: ${referenceId}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                variant="whatsapp"
                size="lg"
                className="w-full sm:w-auto flex-1 justify-center"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{isAr ? 'متابعة مباشرة عبر واتساب' : 'Follow up via WhatsApp'}</span>
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={handleReset}
                className="w-full sm:w-auto text-slate-700 border-slate-300"
              >
                <span>{isAr ? 'إغلاق النافذة' : 'Close Window'}</span>
              </Button>
            </div>
          </div>
        ) : (
          /* Main Interactive Form with Prominent Intent Entry Choices */
          <form onSubmit={handleSubmit} className="space-y-5 pt-1">
            {/* ========================================================================= */}
            {/* PROMINENT ENTRY CHOICE CARDS (Owner vs Buyer/Tenant)                     */}
            {/* ========================================================================= */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider text-start">
                {isAr ? '١. حدد هدفك ونوع الخدمة المطلوب:' : '1. Select Your Service Objective:'}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Entry Option A: Owner (مالك العقار - عرض عقار) */}
                <button
                  type="button"
                  onClick={() => setUserRole('owner')}
                  className={`p-4 rounded-2xl border text-start transition-all duration-200 flex flex-col justify-between cursor-pointer group ${
                    userRole === 'owner'
                      ? 'bg-slate-900 border-slate-800 text-white shadow-md ring-2 ring-blue-500/50'
                      : 'bg-slate-50/80 border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        userRole === 'owner'
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-100 text-blue-700 group-hover:bg-blue-600 group-hover:text-white'
                      }`}
                    >
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                        userRole === 'owner'
                          ? 'bg-blue-500/30 text-blue-300 border border-blue-400/30'
                          : 'bg-slate-200/80 text-slate-600'
                      }`}
                    >
                      {isAr ? 'للمُلاّك' : 'For Owners'}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold font-display-serif">
                      {isAr ? 'عرض وإدراج عقاري' : 'List My Property'}
                    </h4>
                    <p
                      className={`text-xs mt-1 leading-relaxed ${
                        userRole === 'owner' ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {isAr
                        ? 'أنا مالك وأبحث عن بيع أو تأجير عقار مباشر'
                        : 'I own a property and want to sell or rent it out'}
                    </p>
                  </div>
                </button>

                {/* Entry Option B: Buyer / Tenant (مشتري أو مستأجر - طلب عقار) */}
                <button
                  type="button"
                  onClick={() => setUserRole('seeker')}
                  className={`p-4 rounded-2xl border text-start transition-all duration-200 flex flex-col justify-between cursor-pointer group ${
                    userRole === 'seeker'
                      ? 'bg-slate-900 border-slate-800 text-white shadow-md ring-2 ring-blue-500/50'
                      : 'bg-slate-50/80 border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        userRole === 'seeker'
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-100 text-blue-700 group-hover:bg-blue-600 group-hover:text-white'
                      }`}
                    >
                      <Search className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                        userRole === 'seeker'
                          ? 'bg-blue-500/30 text-blue-300 border border-blue-400/30'
                          : 'bg-slate-200/80 text-slate-600'
                      }`}
                    >
                      {isAr ? 'للباحثين' : 'For Seekers'}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold font-display-serif">
                      {isAr ? 'طلب وبحث عن عقار' : 'Request Property Search'}
                    </h4>
                    <p
                      className={`text-xs mt-1 leading-relaxed ${
                        userRole === 'seeker' ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {isAr
                        ? 'أنا مشتري أو مستأجر وأبحث عن عقار بمواصفات خاّصة'
                        : 'I am looking to buy or rent a property with custom criteria'}
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* VIEW A: RELEVANT FIELDS & INSTRUCTIONS FOR "OWNER" (مالك العقار)          */}
            {/* ========================================================================= */}
            {userRole === 'owner' && (
              <div className="space-y-4 animate-in fade-in duration-200 border-t border-slate-100 pt-4">
                {/* Context Guidance Box */}
                <div className="p-3 bg-blue-50/80 border border-blue-200/90 rounded-xl text-blue-900 text-xs flex items-start gap-2.5">
                  <Building2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    {isAr
                      ? 'خدمة عرض العقارات: أدخل تفاصيل الموقع، نوع العقار، وهل ترغب بالبيع أم الإيجار لربط عقارك بالمستثمرين والمشترين.'
                      : 'Owner Listing Service: Enter your property location, property type, and specify Sale or Rent to connect with matched clients.'}
                  </p>
                </div>

                {/* 1. Property Address Selection (Map vs Short Address) */}
                <div className="space-y-2.5">
                  <label className="block text-xs font-bold text-slate-800 text-start">
                    {isAr ? 'عنوان وموقع العقار:' : 'Property Location:'}
                  </label>

                  {/* Option Map */}
                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-2 cursor-pointer shrink-0 select-none min-w-[85px] sm:min-w-[105px]">
                      <input
                        type="radio"
                        name="addressMethod"
                        value="map"
                        checked={addressMethod === 'map'}
                        onChange={() => {
                          setAddressMethod('map');
                          setIsMapModalOpen(true);
                        }}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                      />
                      <span className="text-xs font-semibold text-slate-800">
                        {isAr ? 'الخريطة' : 'Map'}
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setAddressMethod('map');
                        setIsMapModalOpen(true);
                      }}
                      className="p-2 border border-slate-300 rounded-xl hover:border-blue-500 text-slate-700 hover:text-blue-600 bg-white transition-colors cursor-pointer shrink-0 shadow-xs"
                      title={isAr ? 'فتح الخريطة التفاعلية' : 'Open interactive map'}
                    >
                      <MapPin className="w-4 h-4 text-blue-600" />
                    </button>

                    <div className="relative flex-1">
                      <input
                        id="list-property-map-address"
                        type="text"
                        readOnly
                        placeholder={isAr ? 'إحداثيات الموقع (اضغط للتحديد)' : 'Location coordinates (Click to pick)'}
                        value={mapAddress}
                        onClick={() => {
                          setAddressMethod('map');
                          setIsMapModalOpen(true);
                        }}
                        className="w-full px-3 py-2 bg-slate-100/90 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 placeholder-slate-400 cursor-pointer select-none focus:outline-none transition-all text-start"
                      />
                    </div>
                  </div>

                  {/* Option Short Address */}
                  <div className="flex items-center gap-2">
                    <label htmlFor="list-property-short-address-radio" className="inline-flex items-center gap-2 cursor-pointer shrink-0 select-none min-w-[85px] sm:min-w-[105px]">
                      <input
                        id="list-property-short-address-radio"
                        type="radio"
                        name="addressMethod"
                        value="short"
                        checked={addressMethod === 'short'}
                        onChange={() => setAddressMethod('short')}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                      />
                      <span className="text-xs font-semibold text-slate-800">
                        {isAr ? 'عنوان مختصر' : 'Short Address'}
                      </span>
                    </label>

                    <div className="relative flex-1">
                      <input
                        id="list-property-short-address"
                        type="text"
                        placeholder={isAr ? 'أدخل العنوان الوطني المختصر (مثل: RYD-1234)' : 'Enter short national address (e.g., RYD-1234)'}
                        value={shortAddress}
                        onFocus={() => setAddressMethod('short')}
                        onChange={(e) => setShortAddress(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-start"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Property Type & Offer Type (Sale vs Rent) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="list-property-type-owner" className="block text-xs font-bold text-slate-800 mb-1 text-start">
                      {isAr ? 'نوع العقار' : 'Property Type'} *
                    </label>
                    <select
                      id="list-property-type-owner"
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer text-start"
                      required
                      aria-required="true"
                    >
                      <option value="" disabled>
                        {isAr ? 'اختر النوع' : 'Select Type'}
                      </option>
                      {propertyTypes.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1 text-start">
                      {isAr ? 'طبيعة العرض المطلوب' : 'Listing Purpose'}
                    </label>
                    <div className="flex items-center gap-4 py-1.5">
                      <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="radio"
                          name="ownerOfferType"
                          value="sale"
                          checked={ownerOfferType === 'sale'}
                          onChange={() => setOwnerOfferType('sale')}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                        />
                        <span className="text-xs font-bold text-slate-800">
                          {isAr ? 'للبيع (تمليك)' : 'For Sale'}
                        </span>
                      </label>
                      <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="radio"
                          name="ownerOfferType"
                          value="rent"
                          checked={ownerOfferType === 'rent'}
                          onChange={() => setOwnerOfferType('rent')}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                        />
                        <span className="text-xs font-bold text-slate-800">
                          {isAr ? 'للتأجير' : 'For Rent'}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Asking Price Input for Owner */}
                <div>
                  <label htmlFor="list-property-asking-price" className="block text-xs font-bold text-slate-800 mb-1 text-start">
                    {isAr ? 'السعر المستهدف أو المطلوب (بالريال السعودي SAR)' : 'Asking / Target Price (SAR)'}
                  </label>
                  <input
                    id="list-property-asking-price"
                    type="text"
                    value={askingPriceSAR}
                    onChange={(e) => setAskingPriceSAR(e.target.value)}
                    placeholder={isAr ? 'مثال: ٢,٥٠٠,٠٠٠ ريال' : 'e.g., 2,500,000 SAR'}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-start"
                  />
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW B: RELEVANT FIELDS & INSTRUCTIONS FOR "SEEKER" (مشتري أو مستأجر)    */}
            {/* ========================================================================= */}
            {userRole === 'seeker' && (
              <div className="space-y-4 animate-in fade-in duration-200 border-t border-slate-100 pt-4">
                {/* Context Guidance Box */}
                <div className="p-3 bg-blue-50/80 border border-blue-200/90 rounded-xl text-blue-900 text-xs flex items-start gap-2.5">
                  <Search className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    {isAr
                      ? 'خدمة البحث عن عقار: حدد مواصفات العقار المطلوب (الحي والمساحة والميزانية)، وسنقوم بمطابقتها مع محفظة العقارات المتاحة.'
                      : 'Custom Property Search Service: Specify your desired property criteria (district, size, budget) to match with our portfolio.'}
                  </p>
                </div>

                {/* 1. Property Description / Specifications */}
                <div>
                  <label htmlFor="list-property-desc" className="block text-xs font-bold text-slate-800 mb-1.5 text-start">
                    {isAr ? 'وصف العقار والمواصفات المطلوبة' : 'Desired Property Specifications'} *
                  </label>
                  <textarea
                    id="list-property-desc"
                    rows={3}
                    required
                    aria-required="true"
                    value={propertyDescription}
                    onChange={(e) => setPropertyDescription(e.target.value)}
                    placeholder={
                      isAr
                        ? 'مثال: أبحث عن فيلا 4 غرف في حي الشاطئ بالخبر بميزانية حتي 2.5 مليون ريال، مع حديقة وموقف سيارتين...'
                        : 'e.g. Looking for a 4-bedroom villa in Al Khobar with private garden, budget around 2.5M SAR...'
                    }
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 hover:border-slate-400 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all resize-none text-start"
                  />
                </div>

                {/* 2. Property Type, Request Type & Budget Input for Seeker */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="list-property-type-seeker" className="block text-xs font-bold text-slate-800 mb-1 text-start">
                      {isAr ? 'نوع العقار المطلوب' : 'Property Type'} *
                    </label>
                    <select
                      id="list-property-type-seeker"
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer text-start"
                      required
                      aria-required="true"
                    >
                      <option value="" disabled>
                        {isAr ? 'اختر النوع' : 'Select Type'}
                      </option>
                      {propertyTypes.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1 text-start">
                      {isAr ? 'نوع الطلب' : 'Request Purpose'}
                    </label>
                    <div className="flex items-center gap-4 py-1.5">
                      <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="radio"
                          name="seekerOfferType"
                          value="buy"
                          checked={seekerOfferType === 'buy'}
                          onChange={() => setSeekerOfferType('buy')}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                        />
                        <span className="text-xs font-bold text-slate-800">
                          {isAr ? 'رغبة بالشراء' : 'To Buy'}
                        </span>
                      </label>
                      <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="radio"
                          name="seekerOfferType"
                          value="rent"
                          checked={seekerOfferType === 'rent'}
                          onChange={() => setSeekerOfferType('rent')}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                        />
                        <span className="text-xs font-bold text-slate-800">
                          {isAr ? 'رغبة بالاستئجار' : 'To Rent'}
                        </span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="list-property-budget" className="block text-xs font-bold text-slate-800 mb-1 text-start">
                      {isAr ? 'الميزانية المستهدفة (SAR)' : 'Target Budget (SAR)'}
                    </label>
                    <input
                      id="list-property-budget"
                      type="text"
                      value={budgetSAR}
                      onChange={(e) => setBudgetSAR(e.target.value)}
                      placeholder={isAr ? 'مثال: ٢ - ٣ مليون ريال' : 'e.g., 2M - 3M SAR'}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-start"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Private Attachment Upload (Title Deeds, Photos, Building Plans) */}
            <div className="border-t border-slate-100 pt-4">
              <FileUploadZone
                uploadSessionId="list-property-modal"
                attachments={attachments}
                onChange={setAttachments}
                language={language}
                labelAr={
                  userRole === 'owner'
                    ? 'مستندات العقار والصور (اختياري: الصك، الكروكي، الصور)'
                    : 'المستندات الداعمة (اختياري)'
                }
                labelEn={
                  userRole === 'owner'
                    ? 'Property Documents & Photos (Optional: Title Deed, Site Plan, Photos)'
                    : 'Supporting Documents (Optional)'
                }
              />
            </div>

            {/* ========================================================================= */}
            {/* SHARED SECTION: NAME, PHONE, EMAIL (Preserved across role switching)     */}
            {/* ========================================================================= */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider text-start">
                {isAr ? '٢. بيانات التواصل للمتابعة:' : '2. Your Contact Information:'}
              </label>

              <div>
                <label htmlFor="list-property-fullname" className="block text-xs font-bold text-slate-800 mb-1.5 text-start">
                  {isAr ? 'الاسم الكامل' : 'Full Name'} *
                </label>
                <input
                  id="list-property-fullname"
                  type="text"
                  required
                  aria-required="true"
                  placeholder={isAr ? 'اسمك الكريم' : 'Your full name'}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 hover:border-slate-400 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-start"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="list-property-phone" className="block text-xs font-bold text-slate-800 mb-1.5 text-start">
                    {isAr ? 'رقم الهاتف' : 'Phone Number'} <span className="text-slate-600 font-normal">({isAr ? 'أو البريد' : 'or Email'})</span>
                  </label>
                  <input
                    id="list-property-phone"
                    type="tel"
                    placeholder="+966 50 000 0000"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (contactError) setContactError('');
                    }}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 hover:border-slate-400 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-start dir-ltr font-mono"
                  />
                </div>

                <div>
                  <label htmlFor="list-property-email" className="block text-xs font-bold text-slate-800 mb-1.5 text-start">
                    {isAr ? 'البريد الإلكتروني' : 'Email Address'} <span className="text-slate-600 font-normal">({isAr ? 'أو الهاتف' : 'or Phone'})</span>
                  </label>
                  <input
                    id="list-property-email"
                    type="email"
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (contactError) setContactError('');
                    }}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 hover:border-slate-400 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-start dir-ltr"
                  />
                </div>
              </div>

              {contactError && (
                <p className="text-xs text-rose-700 font-semibold">{contactError}</p>
              )}
            </div>

            {/* Submit Action Button */}
            <div className="pt-2">
              <Button
                type="submit"
                isLoading={submitting}
                className="w-full py-3 font-bold justify-center text-sm shadow-md"
              >
                <span>
                  {userRole === 'owner'
                    ? isAr
                      ? 'إرسال طلب إدراج وعرض العقار'
                      : 'Submit Property Listing'
                    : isAr
                    ? 'إرسال طلب البحث عن عقار'
                    : 'Submit Property Search Request'}
                </span>
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Google Maps Location Picker Popup Window */}
      <GoogleMapPickerModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        language={language}
        initialCoords={mapAddress}
        onSelectLocation={(coordsString) => {
          setMapAddress(coordsString);
        }}
      />
    </>
  );
}
