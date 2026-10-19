import React from 'react';
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Building,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Camera,
  LineChart,
} from 'lucide-react';
import { Language, PageId } from '../../types';
import { translations as defaultTranslations } from '../../lib/translations';
import { useTextOverride } from '../../context/TextOverrideContext';
import { mockServices } from '../../data/mockData';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { getPageHref, handleSemanticClick } from '../../lib/navigation';

interface ServicesSectionProps {
  language: Language;
  onNavigate: (page: PageId) => void;
  onOpenListPropertyModal: () => void;
  onOpenInquiryModal: () => void;
}

export function ServicesSection({
  language,
  onNavigate,
  onOpenListPropertyModal,
  onOpenInquiryModal,
}: ServicesSectionProps) {
  const { translations } = useTextOverride();
  const t = translations[language] || defaultTranslations[language];
  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;

  const handleAction = (type: string) => {
    if (type === 'list-property') {
      onOpenListPropertyModal();
    } else if (type === 'properties') {
      onNavigate('properties');
    } else if (type === 'projects') {
      onNavigate('projects');
    } else if (type === 'contact') {
      onNavigate('contact');
    }
  };

  const getServiceIcon = (index: number) => {
    if (index === 0) return Building;
    if (index === 1) return Camera;
    return LineChart;
  };

  return (
    <section id="services-section" className="space-y-16 sm:space-y-24">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 px-4">
        <Badge variant="primary" className="mx-auto">
          <Sparkles className="w-3.5 h-3.5 me-1 inline" />
          {t.home.servicesTag}
        </Badge>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 font-display-serif tracking-tight leading-tight">
          {t.home.servicesSectionTitle}
        </h2>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          {t.home.servicesSectionSubtitle}
        </p>
      </div>

      {/* Alternating Rows */}
      <div className="space-y-16 sm:space-y-24">
        {mockServices.map((service, index) => {
          const isEven = index % 2 === 1; // Alternating layout
          const ServiceIcon = getServiceIcon(index);

          return (
            <div
              key={service.id}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center ${
                isEven ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Image Column */}
              <div
                className={`lg:col-span-6 relative ${
                  isEven ? 'lg:order-2' : 'lg:order-1'
                }`}
              >
                <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-16/11 bg-slate-950 group">
                  <img
                    src={service.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'}
                    alt={service.title[language]}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-60" />

                  {/* Corner Badge */}
                  <div className="absolute top-4 start-4">
                    <Badge variant="dark" className="backdrop-blur-md bg-slate-950/80 text-white border-white/20">
                      <ServiceIcon className="w-3.5 h-3.5 text-blue-400 me-1.5" />
                      <span>{service.tag[language]}</span>
                    </Badge>
                  </div>

                  {/* Bottom Stats Card floating over image */}
                  <div className="absolute bottom-4 start-4 end-4 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/40 text-slate-900">
                    <div className="grid grid-cols-3 gap-3 divide-x divide-slate-200 rtl:divide-x-reverse text-center">
                      {service.stats.map((stat, sIdx) => (
                        <div key={sIdx} className="px-1">
                          <div dir="ltr" className="text-base sm:text-xl font-extrabold text-blue-600 font-display-serif inline-block">
                            {stat.value}
                          </div>
                          <div className="text-[10px] sm:text-xs text-slate-500 font-medium leading-tight mt-0.5">
                            {stat.label[language]}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Column */}
              <div
                className={`lg:col-span-6 space-y-6 ${
                  isEven ? 'lg:order-1' : 'lg:order-2'
                }`}
              >
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                    {service.tag[language]}
                  </span>
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 font-display-serif leading-tight">
                    {service.title[language]}
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold text-slate-700">
                    {service.subtitle[language]}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {service.description[language]}
                  </p>
                </div>

                {/* Key Capability Bullet Points */}
                <div className="space-y-3 pt-2">
                  {service.features.map((feat, fIdx) => (
                    <div
                      key={fIdx}
                      className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-blue-200 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                          {feat.title[language]}
                        </h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {feat.desc[language]}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Call-to-action */}
                <div className="pt-2">
                  {service.actionType === 'list-property' ? (
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => handleAction(service.actionType)}
                      className="font-bold shadow-md"
                    >
                      <span>{service.actionText[language]}</span>
                      <ArrowIcon className="w-4 h-4" />
                    </Button>
                  ) : (
                    <a
                      href={getPageHref(service.actionType as PageId)}
                      onClick={(e) => handleSemanticClick(e, () => handleAction(service.actionType))}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                    >
                      <span>{service.actionText[language]}</span>
                      <ArrowIcon className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
