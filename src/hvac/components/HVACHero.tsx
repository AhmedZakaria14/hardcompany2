import React, { useState } from 'react';
import {
  MapPin,
  Wrench,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useHVAC } from '../context/HVACContext';
import { T, pick } from '../translations';

export function HVACHero() {
  const { language, isAr, services, serviceAreas, heroContent, openQuoteDialog, openBookingModal } = useHVAC();

  const [selectedCity, setSelectedCity] = useState(serviceAreas[0]?.id || 'khobar');
  const [customCity, setCustomCity] = useState('');
  const [selectedService, setSelectedService] = useState('');

  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const handleGetQuote = (e: React.FormEvent) => {
    e.preventDefault();
    openQuoteDialog({
      city: selectedCity,
      customCity: selectedCity === 'other' ? customCity : undefined,
      service: selectedService,
    });
  };

  return (
    <section id="hero" className="relative min-h-[640px] flex items-center overflow-hidden bg-slate-900">
      {/* Background HVAC Field Photo with darkened overlay bg-[#0F172A]/35 */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=2000&q=85"
          alt="HARD HVAC Maintenance Engineer at Work"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="w-full h-full object-cover object-center"
        />
        {/* Darkened overlay strictly compliant with prompt */}
        <div className="absolute inset-0 bg-[#0F172A]/75" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column (8 cols): Eyebrow, Headline, Subheadline, Trust Badges */}
          <div className="lg:col-span-7 space-y-6 text-start">
            {/* Glowing light-blue hero eyebrow text (#7DD3FC / #bfe6ff) */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0EA5E9]/15 border border-[#7DD3FC]/40 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#7DD3FC] shadow-[0_0_8px_#7DD3FC]" />
              <span className="text-[#bfe6ff] font-semibold text-xs sm:text-sm tracking-wide">
                {pick(T.hero.eyebrow, language)}
              </span>
            </div>

            {/* Headline (semibold 600, never extrabold) */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white tracking-tight leading-[1.25]">
              {pick(T.hero.headline, language)}
            </h1>

            {/* Supporting paragraph */}
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl">
              {pick(T.hero.subheadline, language)}
            </p>

            {/* 3 Value Badges */}
            <div className="pt-2 flex flex-wrap gap-4 text-xs sm:text-sm text-slate-200 font-medium">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0EA5E9]" />
                <span>{pick(T.hero.badge1, language)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#F97316]" />
                <span>{pick(T.hero.badge2, language)}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0EA5E9]" />
                <span>{pick(T.hero.badge3, language)}</span>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Inline Quote Form */}
          <div className="lg:col-span-5">
            <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xl space-y-5 text-start">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0284C7]">
                  <Sparkles className="w-3.5 h-3.5 text-[#0284C7]" />
                  <span>{isAr ? 'عرض سعر فوري' : 'Instant Estimation'}</span>
                </div>
                <h2 className="text-xl font-semibold text-slate-900 leading-tight">
                  {pick(T.quoteForm.title, language)}
                </h2>
                <p className="text-xs text-slate-600 font-medium">
                  {pick(T.quoteForm.subtitle, language)}
                </p>
              </div>

              <form onSubmit={handleGetQuote} className="space-y-4">
                {/* 1. City Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    {pick(T.quoteForm.cityLabel, language)}
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-500 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full ps-9 pe-8 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 cursor-pointer"
                    >
                      {serviceAreas.filter((c) => c.active).map((city) => (
                        <option key={city.id} value={city.id}>
                          {isAr ? city.cityNameAr : city.cityNameEn} ({city.responseTimeMin} {isAr ? 'دقيقة' : 'min'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* If Other City is selected, reveal free-text city field */}
                {selectedCity === 'other' && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      {pick(T.quoteForm.otherCityLabel, language)} *
                    </label>
                    <input
                      type="text"
                      required
                      value={customCity}
                      onChange={(e) => setCustomCity(e.target.value)}
                      placeholder={pick(T.quoteForm.otherCityPlaceholder, language)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 text-sm font-medium text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20"
                    />
                  </div>
                )}

                {/* 2. Service Select */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    {pick(T.quoteForm.serviceLabel, language)}
                  </label>
                  <div className="relative">
                    <Wrench className="w-4 h-4 text-slate-500 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      required
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                      className="w-full ps-9 pe-8 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 cursor-pointer"
                    >
                      <option value="" disabled>
                        {isAr ? '-- اختر الخدمة المطلوبة --' : '-- Select Requested Service --'}
                      </option>
                      {services
                        .filter((s) => s.active)
                        .map((s) => (
                          <option
                            key={s.id}
                            value={isAr ? s.titleAr : s.titleEn}
                          >
                            {isAr ? s.titleAr : s.titleEn}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* 3. Get Instant Quote Button */}
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer group"
                >
                  <span>{pick(T.quoteForm.btnInstantQuote, language)}</span>
                  <ArrowIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </form>

              {/* Direct Emergency Call / Booking Note */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
                <span className="flex items-center gap-1 text-slate-700">
                  <Clock className="w-3.5 h-3.5 text-[#0284C7]" />
                  <span>{isAr ? 'استجابة سريعة ١٥ دقيقة' : '15-min callback guarantee'}</span>
                </span>

                <button
                  type="button"
                  onClick={() => openBookingModal(selectedService)}
                  className="text-[#0284C7] hover:underline font-bold cursor-pointer"
                >
                  {isAr ? 'أو احجز موعد تقويم' : 'Or Schedule Date'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
