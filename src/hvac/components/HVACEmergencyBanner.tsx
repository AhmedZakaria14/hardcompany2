import React from 'react';
import { Phone, MessageSquare, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useHVAC } from '../context/HVACContext';
import { T, pick } from '../translations';

export function HVACEmergencyBanner() {
  const { language, isAr } = useHVAC();

  const handleWhatsAppEmergency = () => {
    const text = isAr
      ? 'السلام عليكم، لدي بلاغ طوارئ عاجل لتوقف التكييف وأطلب مباشرة فني صيانة.'
      : 'Hello, I have an urgent emergency AC breakdown and need rapid technician dispatch.';
    const url = `https://wa.me/966550641000?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="bg-[#1E293B] text-white py-12 sm:py-16 relative overflow-hidden">
      {/* Subtle background glow effect without arbitrary gradients */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-8 sm:p-12 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-start">
          <div className="space-y-3 max-w-2xl">
            {/* Urgent Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F97316]/20 border border-[#F97316]/40 text-[#F97316] text-xs font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F97316] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F97316]"></span>
              </span>
              <span>{pick(T.emergencyBanner.badge, language)}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight leading-snug">
              {pick(T.emergencyBanner.title, language)}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {pick(T.emergencyBanner.desc, language)}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full sm:w-auto">
            {/* Direct Call Button */}
            <a
              href="tel:+966550641000"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#F97316] hover:bg-[#ea580c] text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2.5 shadow-md cursor-pointer"
            >
              <Phone className="w-4 h-4 animate-bounce" />
              <span>{pick(T.emergencyBanner.callBtn, language)}</span>
            </a>

            {/* WhatsApp Navigation Link */}
            <a
              href={`https://wa.me/966550641000?text=${encodeURIComponent(
                isAr
                  ? 'السلام عليكم، لدي بلاغ طوارئ عاجل لتوقف التكييف وأطلب مباشرة فني صيانة.'
                  : 'Hello, I have an urgent emergency AC breakdown and need rapid technician dispatch.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2.5 border border-slate-600 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5E9]"
            >
              <MessageSquare className="w-4 h-4 text-[#25D366]" />
              <span>{pick(T.emergencyBanner.whatsappBtn, language)}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
