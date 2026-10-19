import React from 'react';
import {
  Building2,
  Layers,
  Sparkles,
  Wrench,
  Hammer,
  Calculator,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  FileText,
} from 'lucide-react';
import { useConstruction } from '../context/ConstructionContext';
import { INITIAL_SERVICES } from '../data/seedData';
import { constructionTranslations } from '../utils/translations';
import { ConstructionService } from '../types';

export function ServicesSection() {
  const { language, openQuoteModal } = useConstruction();
  const t = constructionTranslations[language];
  const isAr = language === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const getIcon = (name: string) => {
    switch (name) {
      case 'Building2':
        return Building2;
      case 'Layers':
        return Layers;
      case 'Sparkles':
        return Sparkles;
      case 'Wrench':
        return Wrench;
      case 'Hammer':
        return Hammer;
      case 'Calculator':
        return Calculator;
      default:
        return Building2;
    }
  };

  const handleOrderService = (service: ConstructionService) => {
    openQuoteModal({
      source: 'quote_form',
      notes: `Service Requested: ${isAr ? service.titleAr : service.titleEn}`,
    });
  };

  return (
    <section id="services" className="py-16 sm:py-24 bg-[#f8fafc] text-slate-900 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="space-y-3 max-w-3xl text-start">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#e8f4fc] border border-[#d0e9fa] text-[#009ee2] text-xs font-bold shadow-2xs">
            <Wrench className="w-3.5 h-3.5 text-[#009ee2]" />
            <span>{t.services.badge}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black font-display-serif text-[#0f243e] tracking-tight">
            {t.services.title}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
            {t.services.subtitle}
          </p>
        </div>

        {/* Services Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {INITIAL_SERVICES.map((srv) => {
            const IconComponent = getIcon(srv.iconName);
            const deliverables = isAr ? srv.deliverablesAr : srv.deliverablesEn;
            const badge = isAr ? srv.badgeAr : srv.badgeEn;

            return (
              <div
                key={srv.id}
                className="bg-white border border-sky-100 rounded-3xl p-6 sm:p-7 space-y-6 hover:border-[#009ee2] hover:shadow-lg transition-all flex flex-col justify-between group shadow-sm"
              >
                <div className="space-y-4 text-start">
                  {/* Top Bar with Icon & Badge */}
                  <div className="flex items-center justify-between">
                    <div className="p-3.5 rounded-2xl bg-[#eef7ff] border border-sky-100 text-[#009ee2] group-hover:scale-110 transition-transform">
                      <IconComponent className="w-6 h-6" />
                    </div>

                    {badge && (
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        {badge}
                      </span>
                    )}
                  </div>

                  {/* Title & Subtitle */}
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-[#0f243e] font-display-serif group-hover:text-[#009ee2] transition-colors">
                      {isAr ? srv.titleAr : srv.titleEn}
                    </h3>
                    <p className="text-xs text-[#009ee2] font-semibold">
                      {isAr ? srv.subtitleAr : srv.subtitleEn}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {isAr ? srv.descriptionAr : srv.descriptionEn}
                  </p>

                  {/* Deliverables List */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="text-[11px] font-bold text-slate-500">
                      {t.services.deliverablesTitle}
                    </div>
                    <ul className="space-y-2 text-xs text-slate-600">
                      {deliverables.slice(0, 3).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#009ee2] shrink-0 mt-0.5" />
                          <span className="leading-tight">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bottom Card Footer with Warranty & Order CTA */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                    <ShieldCheck className="w-4 h-4" />
                    <span>
                      {srv.warrantyYears} {t.services.warrantyLabel}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOrderService(srv)}
                    className="px-4 py-2 rounded-xl bg-[#009ee2] hover:bg-[#008bc7] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <span>{t.services.orderService}</span>
                    <ArrowIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
