import React, { useState } from 'react';
import {
  Building2,
  HardHat,
  ThermometerSnowflake,
  ArrowLeft,
  ArrowRight,
  Globe,
  Phone,
  Mail,
  Layers,
  Search,
  Compass,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react';
import { Language, PageId } from '../types';
import { handleSemanticClick } from '../lib/navigation';

interface NotFoundPageProps {
  language: Language;
  onNavigate: (page: PageId) => void;
  attemptedPath?: string;
  onLanguageChange?: (lang: Language) => void;
}

export function NotFoundPage({
  language,
  onNavigate,
  attemptedPath = '',
  onLanguageChange,
}: NotFoundPageProps) {
  const isAr = language === 'ar';
  const BackArrowIcon = isAr ? ArrowRight : ArrowLeft;
  const ForwardArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const [searchQuery, setSearchQuery] = useState('');

  const handleGoBack = (e: React.MouseEvent) => {
    e.preventDefault();
    if (
      typeof window !== 'undefined' &&
      window.history.length > 1 &&
      document.referrer &&
      document.referrer.includes(window.location.host)
    ) {
      window.history.back();
    } else {
      onNavigate('portal');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('properties');
      window.history.pushState(
        {},
        '',
        `/realestate/properties?q=${encodeURIComponent(searchQuery.trim())}`
      );
    } else {
      onNavigate('properties');
    }
  };

  const displayPath =
    attemptedPath || (typeof window !== 'undefined' ? window.location.pathname : '');

  return (
    <div className="min-h-[82vh] bg-slate-50/50 flex flex-col justify-center px-4 py-12 sm:py-20 font-ui-sans selection:bg-[#002B49] selection:text-white">
      <div className="max-w-4xl mx-auto w-full space-y-10">
        {/* Top Header & Language Bar */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
          <a
            href="/"
            onClick={(e) => handleSemanticClick(e, () => onNavigate('portal'))}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <img
              src="/logo.svg"
              alt="HARD Group"
              className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col text-start">
              <span className="text-sm font-bold text-slate-900 tracking-tight leading-none font-display-serif">
                {isAr ? 'مجموعة هارد القابضة' : 'HARD Group Holding'}
              </span>
              <span className="text-[10px] text-slate-500 font-semibold leading-tight">
                {isAr ? 'البوابة الرسمية الموحدة' : 'Official Corporate Portal'}
              </span>
            </div>
          </a>

          {onLanguageChange && (
            <button
              type="button"
              onClick={() => onLanguageChange(isAr ? 'en' : 'ar')}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-[#009ee2]" />
              <span>{isAr ? 'English' : 'العربية'}</span>
            </button>
          )}
        </div>

        {/* Hero 404 Section */}
        <div className="text-center space-y-6 max-w-2xl mx-auto">
          {/* Visual 404 Glowing Badge */}
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute inset-0 bg-sky-400/20 rounded-3xl blur-xl transform scale-125" />
            <div className="relative bg-gradient-to-b from-white to-slate-100 border border-slate-200/90 shadow-md rounded-3xl p-5 sm:p-6 text-slate-900 flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-amber-500 shrink-0" />
              <div className="text-start">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#002B49] font-display-serif tracking-tight leading-none block">
                  404
                </span>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mt-0.5">
                  {isAr ? 'الصفحة غير متوفرة' : 'URL Not Found'}
                </span>
              </div>
            </div>
          </div>

          {/* Main Title & Concise Explanation */}
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 font-display-serif tracking-tight">
              {isAr ? 'عذراً، الرابط المطلوب غير موجود' : 'The Requested Link Is Unavailable'}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-lg mx-auto">
              {isAr
                ? 'العنوان الذي تحاول الوصول إليه غير متوفر حالياً، أو ربما تم نقل الصفحة أو كتابة الرابط بشكل غير صحيح.'
                : 'The address you are looking for does not exist, has been relocated, or contains a typo.'}
            </p>

            {displayPath && (
              <div className="pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-200/70 text-slate-700 text-xs font-mono break-all dir-ltr">
                  <span className="text-slate-400">Path:</span>
                  <span className="font-semibold text-slate-800">{displayPath}</span>
                </span>
              </div>
            )}
          </div>

          {/* Primary Action Buttons: Go Back & Portal Link */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleGoBack}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-100 text-slate-800 font-bold text-sm flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            >
              <BackArrowIcon className="w-4 h-4 text-slate-600" />
              <span>{isAr ? 'الرجوع للصفحة السابقة' : 'Go Back'}</span>
            </button>

            <a
              href="/"
              onClick={(e) => handleSemanticClick(e, () => onNavigate('portal'))}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#002B49] hover:bg-[#001D33] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              <Layers className="w-4 h-4 text-sky-400" />
              <span>{isAr ? 'بوابة مجموعة هارد' : 'HARD Group Portal'}</span>
              <ForwardArrowIcon className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>

          {/* Search Input Box */}
          <form onSubmit={handleSearchSubmit} className="pt-2 max-w-md mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isAr
                    ? 'ابحث عن عقار، مدينة، أو مشروع...'
                    : 'Search properties, cities, or projects...'
                }
                className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002B49] focus:border-transparent transition-all shadow-2xs"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-[#009ee2] hover:bg-[#008bc7] text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                {isAr ? 'بحث' : 'Search'}
              </button>
            </div>
          </form>
        </div>

        {/* HARD Group Sector Cards Grid */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="text-center space-y-1">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-display-serif">
              {isAr ? 'قطاعات مجموعة هارد المتاحة' : 'HARD Group Active Sectors'}
            </h2>
            <p className="text-xs text-slate-500">
              {isAr
                ? 'اختر القطاع الذي ترغب بزيارته للوصول المباشر للخدمات'
                : 'Select a sector below for direct access to our platforms'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Real Estate Sector Card */}
            <a
              href="/realestate"
              onClick={(e) => handleSemanticClick(e, () => onNavigate('home'))}
              className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 cursor-pointer text-start"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#009ee2] flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-[#009ee2] transition-colors flex items-center justify-between">
                    <span>{isAr ? 'هارد للعقارات' : 'HARD Real Estate'}</span>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#009ee2] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">
                    {isAr
                      ? 'الوساطة والتسويق العقاري، الفلل، الشقق الفاخرة، والمشاريع التطويرية الموثقة.'
                      : 'Verified residential listings, luxury villas, master developments & advisory.'}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#009ee2]">
                <span>{isAr ? 'استعراض العقارات' : 'Explore Real Estate'}</span>
                <ForwardArrowIcon className="w-3.5 h-3.5" />
              </div>
            </a>

            {/* Construction Sector Card */}
            <a
              href="/construction"
              onClick={(e) => handleSemanticClick(e, () => onNavigate('construction'))}
              className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 cursor-pointer text-start"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <HardHat className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-amber-600 transition-colors flex items-center justify-between">
                    <span>{isAr ? 'هارد للمقاولات العامة' : 'HARD Contracting'}</span>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">
                    {isAr
                      ? 'مقاولات عامة مصنفة فئة أولى، تنفيذ المباني التجارية والسكنية وفق كود البناء السعودي.'
                      : 'Class-A certified general contracting, commercial towers & engineering.'}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-amber-600">
                <span>{isAr ? 'زيارة قطاع المقاولات' : 'Visit Contracting'}</span>
                <ForwardArrowIcon className="w-3.5 h-3.5" />
              </div>
            </a>

            {/* HVAC Sector Card */}
            <a
              href="/hvac"
              onClick={(e) => handleSemanticClick(e, () => onNavigate('hvac'))}
              className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 cursor-pointer text-start"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
                  <ThermometerSnowflake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-cyan-600 transition-colors flex items-center justify-between">
                    <span>{isAr ? 'هارد للتكييف والصيانة' : 'HARD HVAC Maintenance'}</span>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">
                    {isAr
                      ? 'عقود الصيانة الوقائية للتكييف، التبريد المركزي، وطوارئ الصيانة على مدار 24/7.'
                      : 'Preventive HVAC contracts, VRF cooling systems & 24/7 emergency support.'}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-cyan-600">
                <span>{isAr ? 'خدمات التكييف' : 'HVAC Services'}</span>
                <ForwardArrowIcon className="w-3.5 h-3.5" />
              </div>
            </a>
          </div>
        </div>

        {/* Direct Contact & Support Footer */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2 text-slate-700 font-medium text-center sm:text-start">
            <Compass className="w-4 h-4 text-[#009ee2] shrink-0" />
            <span>
              {isAr
                ? 'هل تحتاج مساعدة سريعة للوصول لخدمة محددة؟'
                : 'Need immediate assistance locating a service or document?'}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="tel:+966550641000"
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <bdi dir="ltr">+966 55 064 1000</bdi>
            </a>

            <a
              href="/realestate/contact"
              onClick={(e) => handleSemanticClick(e, () => onNavigate('contact'))}
              className="px-3 py-1.5 rounded-lg bg-[#002B49] hover:bg-[#001D33] text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5 text-sky-400" />
              <span>{isAr ? 'تواصل معنا' : 'Contact Us'}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
