import React, { useState, useEffect } from 'react';
import {
  Star,
  ChevronLeft,
  ChevronRight,
  Quote,
  ShieldCheck,
  Building2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { Language, Testimonial } from '../../types';
import { translations } from '../../lib/translations';
import { Badge } from './Badge';
import { ComplianceVerificationModal } from '../modals/ComplianceVerificationModal';

interface TestimonialSliderProps {
  testimonials: Testimonial[];
  language: Language;
}

export function TestimonialSlider({ testimonials, language }: TestimonialSliderProps) {
  const t = translations[language];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplianceModalOpen, setIsComplianceModalOpen] = useState(false);

  // Auto slide every 6 seconds if not paused
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [isPaused, testimonials.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const current = testimonials[currentIndex];

  const categoryBadgeLabel = {
    buyer: language === 'en' ? 'Property Acquisition' : 'استحواذ عقاري',
    seller: language === 'en' ? 'Exclusive Sale' : 'صفقة بيع حصرية',
    investor: language === 'en' ? 'Portfolio Advisory' : 'استشارة استثمارية',
    tenant: language === 'en' ? 'Prime Tenancy' : 'إيجار فاخر',
  };

  return (
    <div
      className="relative bg-slate-900 text-white rounded-3xl p-6 sm:p-10 lg:p-14 border border-slate-800 shadow-2xl overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Subtle Background Glow */}
      <div className="absolute -top-24 -end-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -start-24 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative Large Quote Watermark */}
      <Quote className="absolute top-6 end-8 w-24 h-24 text-white/5 pointer-events-none select-none" />

      <div className="relative z-10 space-y-8">
        {/* Header with Ratings and Tag */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(current.rating)].map((_, i) => (
                <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400" />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-300">5.0 / 5.0 Rating</span>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="primary" className="text-xs">
              <Sparkles className="w-3 h-3 me-1 inline" />
              {categoryBadgeLabel[current.category]}
            </Badge>
            <button
              type="button"
              onClick={() => setIsComplianceModalOpen(true)}
              className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800/60 px-2.5 py-0.5 rounded-full font-medium transition-colors cursor-pointer"
              title={language === 'en' ? 'Click to view client verification policy' : 'انقر لعرض سياسة توثيق التقييمات'}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Verified Client Record' : 'صفقة عميل موثقة'}</span>
            </button>
          </div>
        </div>

        {/* Testimonial Quote */}
        <div className="min-h-[140px] sm:min-h-[120px] flex items-center">
          <blockquote className="text-[16px] sm:text-[18px] lg:text-[22px] font-medium text-slate-100 leading-relaxed font-display-serif">
            "{current.quote[language]}"
          </blockquote>
        </div>

        {/* Client Bio & Deal Highlight */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={current.avatar}
              alt={current.name[language]}
              referrerPolicy="no-referrer"
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-blue-500/40 shrink-0"
            />
            <div className="space-y-1">
              <h4 className="text-base sm:text-lg font-bold text-white font-display-serif">
                {current.name[language]}
              </h4>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">
                {current.role[language]} • {current.location[language]}
              </p>
              <div className="text-xs text-blue-300 font-semibold inline-flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span>{current.dealHighlight[language]}</span>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-4 self-end sm:self-center">
            {/* Dots */}
            <div className="flex items-center gap-1.5">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    currentIndex === idx
                      ? 'w-6 bg-blue-500'
                      : 'w-2 bg-slate-700 hover:bg-slate-500'
                  }`}
                />
              ))}
            </div>

            {/* Prev / Next Arrows */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                aria-label={language === 'ar' ? 'التقييم السابق' : 'Previous testimonial'}
                className="w-10 h-10 rounded-full bg-slate-800 hover:bg-blue-600 text-white flex items-center justify-center transition-all border border-slate-700 cursor-pointer shadow-sm"
              >
                {language === 'ar' ? (
                  <ChevronRight className="w-5 h-5" />
                ) : (
                  <ChevronLeft className="w-5 h-5" />
                )}
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label={language === 'ar' ? 'التقييم التالي' : 'Next testimonial'}
                className="w-10 h-10 rounded-full bg-slate-800 hover:bg-blue-600 text-white flex items-center justify-center transition-all border border-slate-700 cursor-pointer shadow-sm"
              >
                {language === 'ar' ? (
                  <ChevronLeft className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ComplianceVerificationModal
        isOpen={isComplianceModalOpen}
        onClose={() => setIsComplianceModalOpen(false)}
        language={language}
        initialTab="reviews"
      />
    </div>
  );
}
