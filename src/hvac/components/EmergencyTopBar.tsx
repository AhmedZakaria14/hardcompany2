import React from 'react';
import { Phone, AlertCircle } from 'lucide-react';
import { useHVAC } from '../context/HVACContext';
import { T, pick } from '../translations';

export function EmergencyTopBar() {
  const { language, isAr } = useHVAC();

  return (
    <div className="bg-[#1E293B] text-slate-100 text-xs sm:text-sm py-2 px-4 sm:px-8 border-b border-slate-800/80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left Side: Pulsing Orange Dot + 24/7 Emergency + Coverage note */}
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F97316] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#F97316]"></span>
          </span>

          <span className="font-semibold text-white tracking-wide shrink-0">
            {pick(T.emergencyBar.badge, language)}
          </span>

          <span className="text-slate-400 hidden md:inline text-xs truncate">
            • {pick(T.emergencyBar.coverage, language)}
          </span>
        </div>

        {/* Right Side: Right-aligned Click-to-Call */}
        <div className="shrink-0">
          <a
            href="tel:+966550641000"
            className="inline-flex items-center gap-2 text-white hover:text-[#F97316] font-semibold transition-colors group cursor-pointer"
          >
            <div className="p-1 rounded-full bg-slate-800 text-[#F97316] group-hover:bg-[#F97316] group-hover:text-white transition-colors">
              <Phone className="w-3 h-3" />
            </div>
            <span className="hidden sm:inline text-xs text-slate-300">
              {isAr ? 'طوارئ التكييف:' : 'Emergency:'}
            </span>
            <bdi dir="ltr" className="font-bold text-xs sm:text-sm tracking-wider text-white group-hover:text-[#F97316]">
              +966 55 064 1000
            </bdi>
          </a>
        </div>
      </div>
    </div>
  );
}
