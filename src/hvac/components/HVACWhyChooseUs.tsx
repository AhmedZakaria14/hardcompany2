import React from 'react';
import {
  ShieldCheck,
  Award,
  DollarSign,
  Clock,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useHVAC } from '../context/HVACContext';
import { T, pick } from '../translations';

export function HVACWhyChooseUs() {
  const { language, isAr } = useHVAC();

  const iconMap: Record<string, React.ElementType> = {
    licensed: ShieldCheck,
    certified: Award,
    pricing: DollarSign,
    dispatch: Clock,
    warranty: CheckCircle2,
  };

  return (
    <section id="why-us" className="py-16 sm:py-24 bg-white border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0EA5E9]/10 text-[#0EA5E9] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{pick(T.whyUs.eyebrow, language)}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-900 tracking-tight">
            {pick(T.whyUs.title, language)}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {pick(T.whyUs.subtitle, language)}
          </p>
        </div>

        {/* 5 Trust Badges in modern clean grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {T.whyUs.badges.map((badge, idx) => {
            const Icon = iconMap[badge.id] || ShieldCheck;
            return (
              <div
                key={badge.id}
                className={`bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-6 sm:p-7 text-start space-y-3.5 shadow-xs hover:border-[#0EA5E9]/40 hover:bg-sky-50/20 transition-all ${
                  idx === 4 ? 'md:col-span-2 lg:col-span-1' : ''
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#0EA5E9] shadow-xs">
                  <Icon className="w-6 h-6" />
                </div>

                <h3 className="text-lg font-semibold text-slate-900">
                  {pick(badge.title, language)}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {pick(badge.desc, language)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
