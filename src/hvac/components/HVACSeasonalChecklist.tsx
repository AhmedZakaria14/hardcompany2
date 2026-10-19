import React, { useState } from 'react';
import {
  Sun,
  Snowflake,
  Sparkles,
  Gauge,
  Droplets,
  Zap,
  Flame,
  Wind,
  Shield,
  Cpu,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { useHVAC } from '../context/HVACContext';
import { T, pick } from '../translations';
import { summerChecklist, winterChecklist } from '../data/initialData';

export function HVACSeasonalChecklist() {
  const { language, isAr, openBookingModal } = useHVAC();
  const [activeSeason, setActiveSeason] = useState<'summer' | 'winter'>('summer');

  const iconComponents: Record<string, React.ElementType> = {
    Sparkles,
    Gauge,
    Droplets,
    Zap,
    Flame,
    Wind,
    Shield,
    Cpu,
  };

  const currentList = activeSeason === 'summer' ? summerChecklist : winterChecklist;

  return (
    <section id="checklist" className="py-16 sm:py-24 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0EA5E9]/10 text-[#0EA5E9] text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5" />
            <span>{pick(T.checklist.eyebrow, language)}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-900 tracking-tight">
            {pick(T.checklist.title, language)}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {pick(T.checklist.subtitle, language)}
          </p>

          {/* Season Toggle Tabs */}
          <div className="inline-flex p-1.5 rounded-2xl bg-white border border-slate-200 shadow-xs mt-4">
            <button
              type="button"
              onClick={() => setActiveSeason('summer')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                activeSeason === 'summer'
                  ? 'bg-[#F97316] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sun className="w-4 h-4" />
              <span>{pick(T.checklist.summerTab, language)}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSeason('winter')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                activeSeason === 'winter'
                  ? 'bg-[#0EA5E9] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Snowflake className="w-4 h-4" />
              <span>{pick(T.checklist.winterTab, language)}</span>
            </button>
          </div>
        </div>

        {/* 4 Checklist Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {currentList.map((item, idx) => {
            const Icon = iconComponents[item.iconName] || CheckCircle2;
            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200/80 rounded-2xl p-6 text-start flex items-start gap-4 shadow-xs hover:border-[#0EA5E9]/40 hover:shadow-md transition-all"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    activeSeason === 'summer'
                      ? 'bg-amber-50 text-[#F97316]'
                      : 'bg-sky-50 text-[#0EA5E9]'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>

                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-semibold text-slate-900">
                      {isAr ? item.titleAr : item.titleEn}
                    </h3>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                        activeSeason === 'summer'
                          ? 'bg-amber-100/70 text-amber-800'
                          : 'bg-sky-100/70 text-sky-800'
                      }`}
                    >
                      {isAr ? item.importanceAr : item.importanceEn}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {isAr ? item.descAr : item.descEn}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Callout action */}
        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={() =>
              openBookingModal(
                activeSeason === 'summer'
                  ? 'Pre-Summer Comprehensive Deep Cleaning'
                  : 'Winter Seasonal HVAC Tune-Up'
              )
            }
            className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm transition-colors inline-flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-[#0EA5E9]" />
            <span>
              {isAr
                ? 'احجز خدمة الفحص الموسمي الكامل الآن'
                : 'Schedule Seasonal Maintenance Inspection'}
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
