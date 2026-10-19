import React from 'react';
import {
  HardHat,
  Calculator,
  FileText,
  ShieldCheck,
  Award,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  Building,
  Sparkles,
  Maximize2,
  Wrench,
  Clock,
} from 'lucide-react';
import { useConstruction } from '../context/ConstructionContext';
import { constructionTranslations } from '../utils/translations';
import { COMPANY_CREDENTIALS } from '../data/seedData';

export function Hero() {
  const { language, openCostEstimator, openQuoteModal, heroContent } = useConstruction();
  const t = constructionTranslations[language];
  const isAr = language === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const badgeText = isAr ? heroContent.badgeAr : heroContent.badgeEn;
  const headlineText = isAr ? heroContent.headlineAr : heroContent.headlineEn;
  const subtitleText = isAr ? heroContent.subtitleAr : heroContent.subtitleEn;
  const ctaPrimaryText = isAr ? heroContent.ctaPrimaryAr : heroContent.ctaPrimaryEn;
  const ctaSecondaryText = isAr ? heroContent.ctaSecondaryAr : heroContent.ctaSecondaryEn;

  const handleScrollTo = (id: string) => {
    const el = document.querySelector(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section
      id="home"
      className="relative bg-gradient-to-b from-[#f0f7fd] via-[#f8fafc] to-white text-slate-900 overflow-hidden pt-8 pb-16 sm:pt-12 sm:pb-20 border-b border-slate-200/80"
    >
      {/* Background Subtle Geometric Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 bg-[radial-gradient(#009ee2_0.75px,transparent_0.75px)] [background-size:24px_24px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Main Hero 2-Column Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Main Display Headline & CTAs (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-start">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#e8f4fc] border border-[#cbe4f7] text-[#009ee2] text-xs font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#009ee2]" />
              <span>{badgeText}</span>
            </div>

            {/* Main Display Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-[52px] font-black font-display-serif text-[#0f243e] tracking-tight leading-[1.2]">
              {headlineText}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl font-medium">
              {subtitleText}
            </p>

            {/* Interactive CTAs */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1">
              {/* Explore Projects Button */}
              <button
                type="button"
                onClick={() => handleScrollTo('#projects')}
                className="px-6 py-3.5 rounded-xl bg-[#009ee2] hover:bg-[#008bc7] text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-md shadow-[#009ee2]/25 hover:scale-[1.02] cursor-pointer"
              >
                <span>{ctaPrimaryText}</span>
                <ArrowIcon className="w-4 h-4" />
              </button>

              {/* Cost Calculator CTA */}
              <button
                type="button"
                onClick={openCostEstimator}
                className="px-5 py-3.5 rounded-xl bg-white hover:bg-sky-50/80 border border-sky-200 text-[#009ee2] text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-2xs hover:scale-[1.02] cursor-pointer"
              >
                <Calculator className="w-4 h-4" />
                <span>{ctaSecondaryText}</span>
              </button>

              {/* Services Link */}
              <button
                type="button"
                onClick={() => handleScrollTo('#services')}
                className="px-3 py-3.5 text-slate-700 hover:text-[#009ee2] text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Building className="w-4 h-4 text-[#009ee2]" />
                <span>{isAr ? 'خدماتنا الإنشائية' : 'Our Services'}</span>
              </button>
            </div>

            {/* Trust Guarantees Row */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-3 text-xs font-semibold text-[#009ee2]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#009ee2]" />
                <span className="text-slate-700">{isAr ? 'ضمان شامل حتى 10 سنوات' : 'Up to 10-Year Warranty'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#009ee2]" />
                <span className="text-slate-700">{isAr ? 'الالتزام صارم بالجداول الزمنية' : 'Strict Schedule Compliance'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#009ee2]" />
                <span className="text-slate-700">{isAr ? 'مهندسون مقيمون معتمدون' : 'Certified Resident Engineers'}</span>
              </div>
            </div>
          </div>

          {/* Featured Skyscraper Showcase Card (5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-3.5 sm:p-4 shadow-xl border border-sky-100 space-y-3">
              {/* Image with Tag */}
              <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-900 shadow-inner group">
                <img
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80"
                  alt="HARD Business Center Towers"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f243e]/90 via-[#0f243e]/30 to-transparent" />

                {/* Featured Badge */}
                <div className="absolute top-3 end-3 px-3 py-1 rounded-full text-[10px] font-extrabold bg-[#0f243e] text-white shadow-md">
                  {isAr ? 'مشروع مميز' : 'Featured Landmark'}
                </div>

                {/* Bottom Overlay Info */}
                <div className="absolute bottom-3 start-3 end-3 text-start text-white">
                  <div className="font-bold text-base sm:text-lg font-display-serif">
                    {isAr ? 'أبراج هارد بزنس سنتر' : 'HARD Business Center Towers'}
                  </div>
                  <div className="text-[11px] text-sky-200">
                    {isAr ? 'أبراج تجارية وإدارية' : 'Commercial & Corporate Towers'}
                  </div>
                </div>
              </div>

              {/* SBC Compliance Badge Box */}
              <div className="bg-[#e8f4fc] border border-[#d0e9fa] rounded-2xl p-3 flex items-center justify-between text-start gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-[#0f243e]">
                    {isAr ? 'مطابقة لأعلى معايير الجودة' : 'Highest Quality Compliance'}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {isAr ? 'كود البناء السعودي SBC المعتمد' : 'Saudi Building Code (SBC) Certified'}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-white text-[#009ee2] text-[10px] font-extrabold border border-[#cbe4f7]">
                    100% {isAr ? 'معتمد' : 'Certified'}
                  </span>
                  <div className="p-1.5 rounded-xl bg-[#009ee2] text-white">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Free Consultation Callout Bar */}
              <div className="bg-[#009ee2] text-white rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 shadow-md shadow-[#009ee2]/20">
                <div className="text-start space-y-0.5">
                  <div className="text-[10px] text-sky-100">
                    {isAr ? 'هل تخطط لمشروع جديد؟' : 'Planning a New Project?'}
                  </div>
                  <div className="text-xs sm:text-sm font-black">
                    {isAr ? 'احصل على استشارة هندسية مجانية' : 'Get a Free Engineering Consultation'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openQuoteModal()}
                  className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-sky-50 text-[#009ee2] text-xs font-extrabold transition-colors cursor-pointer shrink-0 shadow-2xs"
                >
                  {isAr ? 'تواصل معنا' : 'Contact Us'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Statistics Counter Bento Strip matching image */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-4">
          {/* Stat 1: 18+ Years */}
          <div className="p-5 rounded-2xl bg-white border border-sky-100 shadow-sm text-start space-y-1 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-2xl sm:text-4xl font-black font-display-serif text-[#0f243e] tracking-tight">
                {t.hero.stats.yearsCount}
              </span>
              <div className="p-2.5 rounded-xl bg-[#eef7ff] text-[#009ee2] border border-sky-100">
                <Award className="w-5 h-5" />
              </div>
            </div>
            <div className="text-xs font-semibold text-slate-500">{t.hero.stats.yearsLabel}</div>
          </div>

          {/* Stat 2: 140+ Projects */}
          <div className="p-5 rounded-2xl bg-white border border-sky-100 shadow-sm text-start space-y-1 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-2xl sm:text-4xl font-black font-display-serif text-[#0f243e] tracking-tight">
                {t.hero.stats.projectsCount}
              </span>
              <div className="p-2.5 rounded-xl bg-[#eef7ff] text-[#009ee2] border border-sky-100">
                <Building className="w-5 h-5" />
              </div>
            </div>
            <div className="text-xs font-semibold text-slate-500">{t.hero.stats.projectsLabel}</div>
          </div>

          {/* Stat 3: 100% SBC Satisfaction */}
          <div className="p-5 rounded-2xl bg-white border border-sky-100 shadow-sm text-start space-y-1 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-2xl sm:text-4xl font-black font-display-serif text-[#0f243e] tracking-tight">
                {t.hero.stats.satisfactionCount}
              </span>
              <div className="p-2.5 rounded-xl bg-[#eef7ff] text-[#009ee2] border border-sky-100">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="text-xs font-semibold text-slate-500">{t.hero.stats.satisfactionLabel}</div>
          </div>

          {/* Stat 4: 350,000+ m2 */}
          <div className="p-5 rounded-2xl bg-white border border-sky-100 shadow-sm text-start space-y-1 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-2xl sm:text-4xl font-black font-display-serif text-[#0f243e] tracking-tight">
                350,000+
              </span>
              <div className="p-2.5 rounded-xl bg-[#eef7ff] text-[#009ee2] border border-sky-100">
                <Maximize2 className="w-5 h-5" />
              </div>
            </div>
            <div className="text-xs font-semibold text-slate-500">
              {isAr ? 'م² مسطحات بناء مشيدة' : 'm² Constructed BUA Area'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
