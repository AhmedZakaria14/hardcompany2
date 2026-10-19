import React, { useState, useEffect } from 'react';
import { ArrowUp, MessageSquare } from 'lucide-react';
import { useHVAC } from '../context/HVACContext';

export function HVACFloatingWidgets() {
  const { isAr } = useHVAC();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', checkScroll);
    return () => window.removeEventListener('scroll', checkScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openWhatsApp = () => {
    const text = isAr
      ? 'السلام عليكم، أرغب بحجز موعد صيانة أو الاستفسار عن خدمات هارد للتكييف والتبريد.'
      : 'Hello HARD HVAC Maintenance, I would like to book a service or inquire about maintenance plans.';
    const url = `https://wa.me/966550641000?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className={`fixed bottom-6 ${
        isAr ? 'left-6' : 'right-6'
      } z-40 flex flex-col items-center gap-3`}
    >
      {/* 1. Matching Blue "Back to top" Button ABOVE WhatsApp button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="w-12 h-12 rounded-2xl bg-[#0EA5E9] hover:bg-[#0284C7] text-white shadow-lg flex items-center justify-center transition-all transform hover:scale-105 cursor-pointer animate-in fade-in zoom-in-75 duration-200"
          title={isAr ? 'العودة للأعلى' : 'Back to top'}
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* 2. Modern WhatsApp Navigation Link (966550641000) */}
      <a
        href={`https://wa.me/966550641000?text=${encodeURIComponent(
          isAr
            ? 'السلام عليكم، أرغب بحجز موعد صيانة أو الاستفسار عن خدمات هارد للتكييف والتبريد.'
            : 'Hello HARD HVAC Maintenance, I would like to book a service or inquire about maintenance plans.'
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-xl flex items-center justify-center transition-all transform hover:scale-105 cursor-pointer relative group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5E9]"
        title={isAr ? 'محادثة مباشرة عبر واتساب' : 'Chat on WhatsApp'}
        aria-label="WhatsApp Support"
      >
        <span className="animate-ping absolute inline-flex h-full w-full rounded-2xl bg-[#25D366] opacity-30"></span>
        <MessageSquare className="w-7 h-7 fill-current relative z-10" />

        {/* Hover Tooltip */}
        <span
          className={`absolute ${
            isAr ? 'left-16' : 'right-16'
          } bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md hidden sm:block`}
        >
          {isAr ? 'واتساب الدعم الفني: 0550641000' : 'WhatsApp Dispatch: +966 55 064 1000'}
        </span>
      </a>
    </div>
  );
}
