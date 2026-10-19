import React from 'react';
import { Star, Quote, MessageSquare, MapPin } from 'lucide-react';
import { useHVAC } from '../context/HVACContext';
import { T, pick } from '../translations';

export function HVACTestimonials() {
  const { language, isAr, testimonials } = useHVAC();

  const activeReviews = testimonials.filter((t) => t.active);

  return (
    <section id="reviews" className="py-16 sm:py-24 bg-white border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0EA5E9]/10 text-[#0EA5E9] text-xs font-semibold">
            <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
            <span>{pick(T.reviews.eyebrow, language)}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-900 tracking-tight">
            {pick(T.reviews.title, language)}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {pick(T.reviews.subtitle, language)}
          </p>
        </div>

        {/* 4 Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {activeReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-6 sm:p-7 flex flex-col justify-between space-y-4 shadow-xs hover:shadow-md transition-all text-start"
            >
              <div className="space-y-3">
                {/* Rating & Quote Icon */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]"
                      />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-slate-300 rotate-180" />
                </div>

                {/* Quote Text */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  "{isAr ? rev.quoteAr : rev.quoteEn}"
                </p>
              </div>

              {/* Client Info & Service */}
              <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">
                    {isAr ? rev.nameAr : rev.nameEn}
                  </h4>
                  <p className="text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-[#0EA5E9]" />
                    <span>{isAr ? rev.cityAr : rev.cityEn}</span>
                  </p>
                </div>

                <div className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[#0EA5E9] font-medium text-[11px]">
                  {isAr ? rev.serviceAr : rev.serviceEn}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
