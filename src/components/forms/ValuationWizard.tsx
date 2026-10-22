import React, { useState } from 'react';
import {
  Building2,
  Home,
  Sparkles,
  Crown,
  KeyRound,
  MapPin,
  Bed,
  Bath,
  Maximize,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  User,
  ShieldCheck,
  FileText,
  MessageSquare,
  TrendingUp,
  Award,
} from 'lucide-react';
import { Language, PropertyType } from '../../types';
import { FormAttachmentMeta } from '../../types/firestore-schema';
import { translations } from '../../lib/translations';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { submitCustomerForm, FormValidationError } from '../../lib/forms/formSubmissionService';
import { FileUploadZone } from './FileUploadZone';
import { SAUDI_CITIES } from '../../data/cities';
import { CitySearchDropdown } from '../ui/CitySearchDropdown';

interface ValuationWizardProps {
  language: Language;
  onSuccess?: () => void;
  isModal?: boolean;
}

export function ValuationWizard({ language, onSuccess, isModal = false }: ValuationWizardProps) {
  const t = translations[language];
  const isAr = language === 'ar';
  const ArrowNext = isAr ? ArrowLeft : ArrowRight;
  const ArrowPrev = isAr ? ArrowRight : ArrowLeft;

  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 4;

  // Step 1: Property Location & Architecture
  const [propertyType, setPropertyType] = useState<PropertyType>('villa');
  const [cityArea, setCityArea] = useState('Al Khobar Corniche');
  const [customAddress, setCustomAddress] = useState('');
  const [bedrooms, setBedrooms] = useState('4');
  const [bathrooms, setBathrooms] = useState('5');
  const [areaSqFt, setAreaSqFt] = useState('5500');

  // Step 2: Property Condition & Features
  const [condition, setCondition] = useState<'new' | 'luxury' | 'good' | 'renovation'>('luxury');
  const [furnishing, setFurnishing] = useState<'furnished' | 'semi' | 'unfurnished'>('furnished');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'pool',
    'seaView',
    'smartHome',
  ]);

  // Step 3: Owner Goals & Timeline
  const [ownerRole, setOwnerRole] = useState<'owner' | 'investor' | 'developer' | 'broker'>('owner');
  const [goal, setGoal] = useState<'sell' | 'rent' | 'valuation'>('sell');
  const [timeline, setTimeline] = useState<'immediate' | '1-3months' | '3-6months' | 'exploring'>('immediate');
  const [expectedPrice, setExpectedPrice] = useState('');

  // Step 4: Contact & Marketing Deliverable
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredContact, setPreferredContact] = useState<'whatsapp' | 'call' | 'email'>('whatsapp');
  const [notes, setNotes] = useState('');
  const [attachments, setAttachments] = useState<FormAttachmentMeta[]>([]);

  // State & Validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [referenceId, setReferenceId] = useState('');

  // Dynamic Valuation Estimation Formula based on input parameters (Calculated directly in SAR)
  const calculatedEstimate = React.useMemo(() => {
    let baseRatePerSqFt = 3500; // SAR
    if (cityArea.includes('Khobar') || cityArea.includes('الخُبر')) baseRatePerSqFt = 4200;
    else if (cityArea.includes('Dhahran') || cityArea.includes('الظهران')) baseRatePerSqFt = 4500;
    else if (cityArea.includes('Dammam') || cityArea.includes('الدمام')) baseRatePerSqFt = 3600;
    else if (cityArea.includes('Half Moon') || cityArea.includes('نصف القمر')) baseRatePerSqFt = 4800;

    let conditionMultiplier = 1.0;
    if (condition === 'new') conditionMultiplier = 1.25;
    if (condition === 'luxury') conditionMultiplier = 1.35;
    if (condition === 'good') conditionMultiplier = 1.05;
    if (condition === 'renovation') conditionMultiplier = 0.85;

    const areaNum = Number(areaSqFt) || 3000;
    const estValSar = Math.round(areaNum * baseRatePerSqFt * conditionMultiplier);

    const minSar = Math.round(estValSar * 0.95);
    const maxSar = Math.round(estValSar * 1.08);

    return { minSar, maxSar };
  }, [cityArea, areaSqFt, condition, propertyType]);

  const toggleFeature = (featureKey: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(featureKey) ? prev.filter((f) => f !== featureKey) : [...prev, featureKey]
    );
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!cityArea.trim() && !customAddress.trim()) {
        newErrors.location = isAr
          ? 'يرجى إدخال اسم المنطقة أو العنوان'
          : 'Please provide location or neighborhood';
      }
      if (!areaSqFt || Number(areaSqFt) <= 0) {
        newErrors.area = isAr ? 'يرجى إدخال المساحة التقريبية' : 'Please enter built-up area';
      }
    }

    if (step === 4) {
      if (!fullName.trim() || fullName.trim().length < 3) {
        newErrors.fullName = isAr
          ? 'الاسم الكامل مطلوب (3 أحرف على الأقل)'
          : 'Full Name is required (min 3 characters)';
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.trim() || !emailRegex.test(email.trim())) {
        newErrors.email = isAr
          ? 'يرجى إدخال بريد إلكتروني صالح'
          : 'Please enter a valid email address';
      }
      const phoneDigits = phone.replace(/\D/g, '');
      if (!phone.trim() || phoneDigits.length < 8) {
        newErrors.phone = isAr
          ? 'يرجى إدخال رقم هاتف صحيح (8 أرقام على الأقل)'
          : 'Please enter a valid phone number (min 8 digits)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    try {
      const result = await submitCustomerForm({
        formType: 'valuation_request',
        sector: 'realestate',
        name: fullName,
        email,
        phone,
        preferredContactMethod: preferredContact === 'call' ? 'phone' : preferredContact,
        language,
        message: `Property Type: ${propertyType}\nLocation: ${cityArea} ${customAddress}\nArea: ${areaSqFt} sq ft (${bedrooms} beds, ${bathrooms} baths)\nCondition: ${condition}\nTimeline: ${timeline}\nOwner Role: ${ownerRole}\nContact Method: ${preferredContact}\nNotes: ${notes}`,
        attachments,
        details: {
          propertyType,
          cityArea,
          customAddress,
          bedrooms,
          bathrooms,
          areaSqFt: Number(areaSqFt) || 0,
          condition,
          selectedFeatures,
          ownerRole,
          timeline,
          preferredContact,
          estimatedValueSAR: calculatedEstimate.minSar,
          estimatedValueMaxSAR: calculatedEstimate.maxSar,
          expectedPrice: expectedPrice || undefined,
        },
      });

      setReferenceId(result.trackingCode);
      setIsSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Failed to submit valuation lead', err);
      if (err instanceof FormValidationError) {
        setErrors(err.fieldErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setIsSuccess(false);
    setErrors({});
    setFullName('');
    setEmail('');
    setPhone('');
    setNotes('');
  };

  const featuresList = [
    { id: 'pool', label: isAr ? 'مسبح خاص' : 'Private Swimming Pool' },
    { id: 'seaView', label: isAr ? 'إطلالة بحرية / مارينا' : 'Sea / Marina View' },
    { id: 'highFloor', label: isAr ? 'طابق مرتفع / بانورامي' : 'High Floor / Skyline View' },
    { id: 'garden', label: isAr ? 'حديقة خاصة منسقة' : 'Landscaped Garden' },
    { id: 'maidRoom', label: isAr ? 'غرفة خادمة / سائق' : "Maid's / Driver Room" },
    { id: 'smartHome', label: isAr ? 'أنظمة المنزل الذكي' : 'Smart Home Automation' },
    { id: 'cornerPlot', label: isAr ? 'موقع مميز / زاوية' : 'Prime Corner Plot' },
    { id: 'upgradedKitchen', label: isAr ? 'مطبخ إيطالي مجهز' : 'Custom Chef Kitchen' },
  ];

  return (
    <div className={`bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden ${isModal ? 'p-0' : 'p-6 sm:p-10'}`}>
      {/* Wizard Header */}
      <div className="space-y-4 border-b border-slate-100 pb-6">
        <div className="flex items-center justify-between">
          <Badge variant="primary">
            {isAr ? 'حاسبة التقييم والتسويق المعتمدة' : 'Instant CMA Valuation Engine'}
          </Badge>
          <span className="text-xs font-semibold text-slate-500">
            {isAr ? `الخطوة ${currentStep} من ${totalSteps}` : `Step ${currentStep} of ${totalSteps}`}
          </span>
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display-serif">
            {isAr ? 'تقييم عقاري فوري وخطة تسويق شاملة' : 'Complimentary Property Valuation & CMA'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {isAr
              ? 'أدخل مواصفات عقارك لحساب القيمة السوقية التقديرية بناءً على الصفقات المعتمدة وطلب خطة التسويق.'
              : 'Provide your property specifications for an instant algorithmic benchmark and a tailored brokerage listing proposal.'}
          </p>
        </div>

        {/* Step Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-300 rounded-full"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
          <div className="grid grid-cols-4 text-[11px] font-medium text-slate-500">
            <span className={currentStep >= 1 ? 'text-blue-600 font-bold' : ''}>
              {isAr ? '1. المواصفات' : '1. Architecture'}
            </span>
            <span className={`text-center ${currentStep >= 2 ? 'text-blue-600 font-bold' : ''}`}>
              {isAr ? '2. الحالة والمزايا' : '2. Features'}
            </span>
            <span className={`text-center ${currentStep >= 3 ? 'text-blue-600 font-bold' : ''}`}>
              {isAr ? '3. الأهداف' : '3. Goals'}
            </span>
            <span className={`text-end ${currentStep >= 4 ? 'text-blue-600 font-bold' : ''}`}>
              {isAr ? '4. التقرير والتواصل' : '4. Lead Report'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Wizard Form Body */}
      <div className="py-6">
        {isSuccess ? (
          /* Animated Success Banner & Summary */
          <div className="text-center py-6 space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50/60 shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                {referenceId}
              </Badge>
              <h3 className="text-2xl font-extrabold text-slate-900 font-display-serif">
                {isAr ? 'تم استلام طلب التقييم بنجاح!' : 'Valuation Request Received!'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {isAr
                  ? `شكراً لك ${fullName}! قام فريق الاستشارات بإعداد تقرير التقييم المقارن (CMA) المكون من 12 صفحة، وسيتم إرساله إليك عبر ${preferredContact === 'whatsapp' ? 'واتساب' : preferredContact === 'call' ? 'اتصال هاتفي' : 'البريد الإلكتروني'}.`
                  : `Thank you, ${fullName}! A dedicated Senior Brokerage Director has been assigned to prepare your custom 12-page Comparative Market Analysis (CMA) report via ${preferredContact}.`}
              </p>
            </div>

            {/* Preliminary Benchmark Highlight Card */}
            <div className="p-6 bg-slate-900 text-white rounded-3xl max-w-xl mx-auto text-start space-y-4 border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                    {isAr ? 'المؤشر التقديري الأولي' : 'Preliminary Valuation Benchmark'}
                  </span>
                </div>
                <span className="text-xs text-blue-400 font-medium">{cityArea}</span>
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-1">{isAr ? 'النطاق التقديري بالريال السعودي' : 'SAR Benchmark Valuation Range'}:</span>
                <p className="text-2xl sm:text-3xl font-extrabold text-blue-400 font-display-serif">
                  {isAr
                    ? `${(calculatedEstimate.minSar / 1000000).toFixed(2)} - ${(calculatedEstimate.maxSar / 1000000).toFixed(2)} مليون ر.س`
                    : `${(calculatedEstimate.minSar / 1000000).toFixed(2)}M - ${(calculatedEstimate.maxSar / 1000000).toFixed(2)}M SAR`}
                </p>
              </div>

              <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  {isAr
                    ? 'تقدير أولي مستند لبيانات الصفقات العقارية المعتمدة بالمنطقة الشرقية لعام 2026.'
                    : 'Algorithmic benchmark derived from 2026 Eastern Province registered transactional comps.'}
                </span>
              </div>
            </div>

            {/* Quick Action CTA Suite */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                href={`https://wa.me/966556125711?text=${encodeURIComponent(
                  isAr
                    ? `مرحباً، أود متابعة تقرير تقييم عقاري في ${cityArea} (رقم المرجع: ${referenceId}).`
                    : `Hello HARD Real Estate, I would like to discuss my valuation for ${cityArea} (Ref: ${referenceId}).`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                variant="whatsapp"
                size="lg"
                className="w-full sm:w-auto justify-center"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{isAr ? 'محادثة المدير عبر واتساب' : 'Connect on WhatsApp'}</span>
              </Button>

              <Button variant="outline" size="lg" onClick={handleReset} className="w-full sm:w-auto">
                <span>{isAr ? 'تقييم عقار آخر' : 'Evaluate Another Property'}</span>
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* STEP 1: Property Location & Architecture */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">
                    {isAr ? 'الخطوة 1: الموقع ونوع العقار' : 'Step 1: Property Location & Type'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isAr
                      ? 'حدد موقع العقار ونوعه لتقدير السعر العادل للمتر المربع.'
                      : 'Specify the physical classification and prime community location.'}
                  </p>
                </div>

                {/* Property Type Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                  {[
                    { id: 'villa', label: isAr ? 'فيلا' : 'Villa', icon: Home },
                    { id: 'apartment', label: isAr ? 'شقة' : 'Apartment', icon: Building2 },
                    { id: 'penthouse', label: isAr ? 'بنتهاوس' : 'Penthouse', icon: Sparkles },
                    { id: 'mansion', label: isAr ? 'قصر' : 'Mansion', icon: Crown },
                    { id: 'townhouse', label: isAr ? 'تاون هاوس' : 'Townhouse', icon: Building2 },
                    { id: 'commercial', label: isAr ? 'تجاري' : 'Commercial', icon: Building2 },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = propertyType === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setPropertyType(item.id as PropertyType)}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/60 text-blue-800 ring-2 ring-blue-500/20 font-bold shadow-xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span className="text-xs">{item.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Location Selection & Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="valuation-city-search" className="block text-xs font-bold text-slate-700 mb-1">
                      {isAr ? 'المدينة' : 'City'} *
                    </label>
                    <CitySearchDropdown
                      value={cityArea}
                      onChange={(city) => setCityArea(city === 'all' ? (isAr ? 'الرياض' : 'Riyadh') : city)}
                      language={language}
                      placeholder={isAr ? 'اختر أو ابحث عن المدينة' : 'Select or search city'}
                      showAllOption={false}
                      id="valuation-city-search"
                    />
                  </div>

                  <div>
                    <label htmlFor="val-custom-address" className="block text-xs font-bold text-slate-700 mb-1">
                      {isAr ? 'اسم المبنى أو المجمع (اختياري)' : 'Building / Project / Sub-community'}
                    </label>
                    <input
                      id="val-custom-address"
                      type="text"
                      placeholder={isAr ? 'مثال: برج أرماني، فيلا رقم 14' : 'e.g. Armani Residences, Villa 24'}
                      value={customAddress}
                      onChange={(e) => setCustomAddress(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Specs: Bedrooms, Bathrooms, Area */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="val-bedrooms" className="block text-xs font-bold text-slate-700 mb-1">
                      {isAr ? 'عدد غرف النوم' : 'Bedrooms'}
                    </label>
                    <select
                      id="val-bedrooms"
                      value={bedrooms}
                      onChange={(e) => setBedrooms(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
                    >
                      <option value="1">1 {isAr ? 'غرفة' : 'Bed'}</option>
                      <option value="2">2 {isAr ? 'غرف' : 'Beds'}</option>
                      <option value="3">3 {isAr ? 'غرف' : 'Beds'}</option>
                      <option value="4">4 {isAr ? 'غرف' : 'Beds'}</option>
                      <option value="5">5 {isAr ? 'غرف' : 'Beds'}</option>
                      <option value="6+">6+ {isAr ? 'غرف فاخرة' : 'Beds Mansion'}</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="val-bathrooms" className="block text-xs font-bold text-slate-700 mb-1">
                      {isAr ? 'دورات المياه' : 'Bathrooms'}
                    </label>
                    <select
                      id="val-bathrooms"
                      value={bathrooms}
                      onChange={(e) => setBathrooms(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                      <option value="6+">6+</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="val-area-sqft" className="block text-xs font-bold text-slate-700 mb-1">
                      {isAr ? 'المساحة المبنية (قدم²)' : 'Built Area (Sq Ft)'} *
                    </label>
                    <input
                      id="val-area-sqft"
                      type="number"
                      required
                      aria-required="true"
                      aria-invalid={Boolean(errors.area)}
                      aria-describedby={errors.area ? "val-area-sqft-error" : undefined}
                      placeholder="e.g. 5500"
                      value={areaSqFt}
                      onChange={(e) => setAreaSqFt(e.target.value)}
                      className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                        errors.area ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 hover:border-slate-400 focus:border-blue-500 focus:ring-blue-500'
                      }`}
                    />
                    {errors.area && <p id="val-area-sqft-error" className="text-[11px] text-rose-500 mt-1">{errors.area}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Condition & Key Features */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">
                    {isAr ? 'الخطوة 2: حالة العقار والمزايا التنافسية' : 'Step 2: Property Condition & Features'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isAr
                      ? 'التشطيبات الراقية والإطلالات تزيد من القيمة السوقية بنسبة تصل إلى 35%.'
                      : 'Premium upgrades, designer furnishings, and panoramic views significantly enhance pricing power.'}
                  </p>
                </div>

                {/* Condition Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    {isAr ? 'الحالة الإنشائية والمعمارية' : 'Architectural & Interior Condition'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      {
                        id: 'luxury',
                        label: isAr ? 'مجدد ومطور بتشطيبات فاخرة' : 'Fully Upgraded & Renovated',
                        desc: isAr ? 'رخام، أجهزة أوروبية، وتصميم داخلي فاخر' : 'Italian marble, custom cabinetry, bespoke lighting',
                      },
                      {
                        id: 'new',
                        label: isAr ? 'جديد كلياً / تسليم حديث' : 'Brand New / Turnkey Handover',
                        desc: isAr ? 'جاهز للاستلام الفوري من المطور' : 'Recently handed over from master developer',
                      },
                      {
                        id: 'good',
                        label: isAr ? 'بحالة ممتازة / قياسي' : 'Well Maintained / Standard',
                        desc: isAr ? 'حالة أصلية نظيفة مع صيانة دورية' : 'Clean original condition with regular maintenance',
                      },
                      {
                        id: 'renovation',
                        label: isAr ? 'يحتاج إلى تحديث' : 'Requires Modernization',
                        desc: isAr ? 'فرصة للمستثمرين لإعادة التجديد' : 'Value-add investment opportunity',
                      },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setCondition(item.id as any)}
                        className={`p-3.5 rounded-2xl border text-start transition-all cursor-pointer ${
                          condition === item.id
                            ? 'border-blue-600 bg-blue-50/60 text-blue-900 ring-2 ring-blue-500/20 shadow-xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{item.label}</span>
                          {condition === item.id && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">{item.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Furnishing Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    {isAr ? 'حالة الأثاث والفرش' : 'Furnishing Status'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'furnished', label: isAr ? 'مفروش بالكامل (فاخر)' : 'Fully Furnished' },
                      { id: 'semi', label: isAr ? 'نصف مفروش (أجهزة مطبخ)' : 'Semi-Furnished' },
                      { id: 'unfurnished', label: isAr ? 'غير مفروش' : 'Unfurnished' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setFurnishing(item.id as any)}
                        className={`py-2 px-3 rounded-2xl border text-xs font-medium transition-all cursor-pointer text-center ${
                          furnishing === item.id
                            ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold ring-1 ring-blue-500'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Key Features Checkboxes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    {isAr ? 'المزايا الإضافية الفريدة (اختر ما ينطبق)' : 'Unique Property Assets (Select all that apply)'}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {featuresList.map((feat) => {
                      const isChecked = selectedFeatures.includes(feat.id);
                      return (
                        <button
                          key={feat.id}
                          type="button"
                          onClick={() => toggleFeature(feat.id)}
                          className={`p-2.5 rounded-xl border text-xs font-medium text-start transition-all cursor-pointer flex items-center justify-between ${
                            isChecked
                              ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-semibold'
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span>{feat.label}</span>
                          <span
                            className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                              isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Owner Goals & Timeline */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">
                    {isAr ? 'الخطوة 3: أهداف العرض والجدول الزمني' : 'Step 3: Owner Goals & Timeline'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isAr
                      ? 'حدد هدفك لمطابقة استراتيجيتنا التسويقية مع متطلباتك الاستثمارية.'
                      : 'Help us tailor the brokerage marketing launch to your financial goals.'}
                  </p>
                </div>

                {/* Owner Role */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    {isAr ? 'صفتك بالنسبة للعقار' : 'Your Relationship to the Asset'}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'owner', label: isAr ? 'مالك العقار' : 'Property Owner' },
                      { id: 'investor', label: isAr ? 'مستثمر / محفظة' : 'Investor' },
                      { id: 'developer', label: isAr ? 'مطور عقاري' : 'Developer' },
                      { id: 'broker', label: isAr ? 'وسيط شريك' : 'Co-Broker' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setOwnerRole(item.id as any)}
                        className={`p-2.5 rounded-2xl border text-xs font-medium text-center transition-all cursor-pointer ${
                          ownerRole === item.id
                            ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold ring-1 ring-blue-500'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primary Objective */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'sell',
                      label: isAr ? 'البيع بأعلى سعر سوقي' : 'Sell at Peak Valuation',
                      desc: isAr ? 'تسويق دولي وشبكة مشترين نقديين' : 'International campaigns & cash buyers',
                    },
                    {
                      id: 'rent',
                      label: isAr ? 'تأجير لعميل مميز' : 'Lease to Prime Tenant',
                      desc: isAr ? 'تدقيق ائتماني وعائد إيجاري مستقر' : 'Vetted corporate tenants & high yield',
                    },
                    {
                      id: 'valuation',
                      label: isAr ? 'تقييم رسمي فقط' : 'Market CMA Appraisal Only',
                      desc: isAr ? 'دراسة سوقية لتقييم المحفظة' : 'Portfolio equity benchmarking',
                    },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setGoal(item.id as any)}
                      className={`p-3.5 rounded-2xl border text-start transition-all cursor-pointer ${
                        goal === item.id
                          ? 'border-blue-600 bg-blue-50/60 text-blue-900 ring-2 ring-blue-500/20 shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{item.label}</span>
                        {goal === item.id && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">{item.desc}</p>
                    </button>
                  ))}
                </div>

                {/* Timeline */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    {isAr ? 'الجدول الزمني المستهدف للإتمام' : 'Desired Transaction Timeline'}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'immediate', label: isAr ? 'فوري (خلال 30 يوماً)' : 'Within 30 Days' },
                      { id: '1-3months', label: isAr ? '1 - 3 أشهر' : '1 - 3 Months' },
                      { id: '3-6months', label: isAr ? '3 - 6 أشهر' : '3 - 6 Months' },
                      { id: 'exploring', label: isAr ? 'استكشاف السوق فقط' : 'Just Exploring' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setTimeline(item.id as any)}
                        className={`p-2.5 rounded-2xl border text-xs font-medium text-center transition-all cursor-pointer ${
                          timeline === item.id
                            ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold ring-1 ring-blue-500'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Algorithm Estimate Preview */}
                <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">{isAr ? 'القيمة التقديرية الحالية' : 'Live Benchmark Calculation'}</span>
                      <p className="text-base sm:text-lg font-bold font-display-serif text-blue-400">
                        {isAr
                          ? `${(calculatedEstimate.minSar / 1000000).toFixed(2)} - ${(calculatedEstimate.maxSar / 1000000).toFixed(2)} مليون ر.س`
                          : `${(calculatedEstimate.minSar / 1000000).toFixed(2)}M - ${(calculatedEstimate.maxSar / 1000000).toFixed(2)}M SAR`}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 text-end">
                    {isAr ? 'التقرير النهائي يتضمن دراسة 12 صفحة' : '12-page comprehensive CMA dossier'}
                  </span>
                </div>
              </div>
            )}

            {/* STEP 4: Contact & Marketing Deliverable */}
            {currentStep === 4 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">
                    {isAr ? 'الخطوة 4: بيانات التواصل واستلام التقرير' : 'Step 4: Contact & Report Delivery'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isAr
                      ? 'أين ترغب باستلام دراسة التقييم الشاملة وتقرير الصفقات المقارنة؟'
                      : 'Where should our senior marketing director deliver your full valuation package?'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="val-fullname" className="block text-xs font-bold text-slate-700 mb-1">
                      {isAr ? 'الاسم الكامل' : 'Full Name'} *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute top-3.5 start-3.5" />
                      <input
                        id="val-fullname"
                        type="text"
                        required
                        aria-required="true"
                        aria-invalid={Boolean(errors.fullName)}
                        aria-describedby={errors.fullName ? "val-fullname-error" : undefined}
                        placeholder={isAr ? 'مثال: محمد السعيد' : 'e.g. Jonathan Sterling'}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className={`w-full ps-10 pe-3 py-2.5 bg-slate-50 border rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                          errors.fullName ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 hover:border-slate-400 focus:border-blue-500 focus:ring-blue-500'
                        }`}
                      />
                    </div>
                    {errors.fullName && <p id="val-fullname-error" className="text-[11px] text-rose-500 mt-1">{errors.fullName}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="val-email" className="block text-xs font-bold text-slate-700 mb-1">
                      {isAr ? 'البريد الإلكتروني' : 'Email Address'} *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute top-3.5 start-3.5" />
                      <input
                        id="val-email"
                        type="email"
                        required
                        aria-required="true"
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={errors.email ? "val-email-error" : undefined}
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full ps-10 pe-3 py-2.5 bg-slate-50 border rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                          errors.email ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 hover:border-slate-400 focus:border-blue-500 focus:ring-blue-500'
                        }`}
                      />
                    </div>
                    {errors.email && <p id="val-email-error" className="text-[11px] text-rose-500 mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div>
                    <label htmlFor="val-phone" className="block text-xs font-bold text-slate-700 mb-1">
                      {isAr ? 'رقم الهاتف / واتساب' : 'Phone / WhatsApp Number'} *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute top-3.5 start-3.5" />
                      <input
                        id="val-phone"
                        type="tel"
                        required
                        aria-required="true"
                        aria-invalid={Boolean(errors.phone)}
                        aria-describedby={errors.phone ? "val-phone-error" : undefined}
                        placeholder="+966 50 123 4567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={`w-full ps-10 pe-3 py-2.5 bg-slate-50 border rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                          errors.phone ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 hover:border-slate-400 focus:border-blue-500 focus:ring-blue-500'
                        }`}
                      />
                    </div>
                    {errors.phone && <p id="val-phone-error" className="text-[11px] text-rose-500 mt-1">{errors.phone}</p>}
                  </div>

                  {/* Preferred Delivery Channel */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isAr ? 'طريقة التواصل المفضلة' : 'Preferred Delivery Method'}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'whatsapp', label: isAr ? 'واتساب' : 'WhatsApp' },
                        { id: 'call', label: isAr ? 'اتصال' : 'Phone Call' },
                        { id: 'email', label: isAr ? 'إيميل' : 'Email' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setPreferredContact(item.id as any)}
                          className={`py-2.5 px-2 rounded-2xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                            preferredContact === item.id
                              ? 'border-blue-600 bg-blue-50 text-blue-800 ring-1 ring-blue-500'
                              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Private Attachment Upload (Photos, Deeds, Floor Plans) */}
                <FileUploadZone
                  uploadSessionId="valuation-wizard"
                  attachments={attachments}
                  onChange={setAttachments}
                  language={language}
                  labelEn="Attach Property Photos, Deeds or Floor Plans"
                  labelAr="إرفاق صور العقار، الصكوك أو المخططات المعمارية"
                  helpTextEn="Optional. Upload property images, floor plans, or deed copies for a more accurate CMA appraisal."
                  helpTextAr="اختياري. يمكنك رفع صور العقار، المخططات أو صورة الصك للحصول على تقييم أكثر دقة."
                />

                {/* Additional Notes */}
                <div>
                  <label htmlFor="val-notes" className="block text-xs font-bold text-slate-700 mb-1">
                    {isAr ? 'ملاحظات إضافية (أوقات المعاينة، تفاصيل المستأجر، إلخ)' : 'Additional Notes / Special Instructions'}
                  </label>
                  <textarea
                    id="val-notes"
                    rows={3}
                    placeholder={
                      isAr
                        ? 'يرجى كتابة أي معلومات إضافية تساعدنا في إعداد التقرير بأعلى دقة...'
                        : 'Provide details such as tenanted status, service charges, view angle...'
                    }
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                  ></textarea>
                </div>

                <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100 flex items-center gap-2 text-xs text-blue-800">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    {isAr
                      ? 'بياناتك محمية بالكامل ومعتمدة وفق اشتراطات الهيئة العامة للعقار (REGA).'
                      : 'Your property data is strictly confidential and protected under REGA brokerage escrow standards.'}
                  </span>
                </div>
              </div>
            )}

            {/* Navigation & Action Buttons Suite */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={handlePrev}
                  className="font-semibold"
                >
                  <ArrowPrev className="w-4 h-4" />
                  <span>{isAr ? 'الخطوة السابقة' : 'Previous Step'}</span>
                </Button>
              ) : (
                <div></div>
              )}

              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleNext}
                  className="font-bold shadow-md"
                >
                  <span>{isAr ? 'الخطوة التالية' : 'Continue to Next Step'}</span>
                  <ArrowNext className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isSubmitting}
                  className="font-bold shadow-lg"
                >
                  {isSubmitting ? (
                    <span>{isAr ? 'جاري إصدار التقرير...' : 'Generating Valuation Dossier...'}</span>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      <span>{isAr ? 'إصدار تقرير التقييم المعتمد' : 'Generate Full CMA Dossier'}</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
