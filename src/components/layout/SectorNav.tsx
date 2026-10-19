import React from 'react';
import {
  Building2,
  Home,
  HardHat,
  ThermometerSnowflake,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { Language, PageId } from '../../types';
import {
  HARD_GROUP_SECTORS,
  SectorId,
  getActiveSector,
  SectorDefinition,
} from '../../lib/sectors';
import { handleSemanticClick } from '../../lib/navigation';

interface SectorNavProps {
  currentPage?: PageId;
  currentSector?: SectorId;
  language: Language;
  onNavigate: (page: PageId) => void;
  className?: string;
  variant?: 'dark' | 'light';
}

const ICONS = {
  Building2,
  Home,
  HardHat,
  ThermometerSnowflake,
};

export function SectorNav({
  currentPage,
  currentSector: explicitSector,
  language,
  onNavigate,
  className = '',
  variant = 'dark',
}: SectorNavProps) {
  const isAr = language === 'ar';
  const activeSectorId =
    explicitSector || (currentPage ? getActiveSector(currentPage) : 'portal');

  const isDark = variant === 'dark';

  return (
    <nav
      aria-label={isAr ? 'قطاعات مجموعة هارد' : 'HARD Group Sectors'}
      className={`w-full text-xs transition-colors border-b select-none ${
        isDark
          ? 'bg-slate-950 text-slate-300 border-slate-900/90'
          : 'bg-slate-900 text-slate-200 border-slate-800'
      } ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-9 sm:h-10 gap-2 sm:gap-4">
          {/* Label / Prefix */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
              <span>{isAr ? 'قطاعات مجموعة هارد' : 'HARD Group Sectors'}</span>
              <span className="text-slate-600">:</span>
            </span>
            <span className="md:hidden inline-flex items-center gap-1 text-[11px] font-bold text-sky-400">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              <span>{isAr ? 'المجموعة' : 'HARD'}</span>
            </span>
          </div>

          {/* Sector Links Strip */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-1">
            {HARD_GROUP_SECTORS.map((sector: SectorDefinition) => {
              const Icon = ICONS[sector.iconName] || Building2;
              const isCurrent = sector.id === activeSectorId;
              const sectorName = sector.name[language];
              const shortName = sector.shortName[language];

              return (
                <a
                  key={sector.id}
                  href={sector.href}
                  onClick={(e) =>
                    handleSemanticClick(e, () => {
                      if (!isCurrent) {
                        onNavigate(sector.pageId);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    })
                  }
                  aria-current={isCurrent ? 'page' : undefined}
                  title={`${sectorName}${isCurrent ? (isAr ? ' (القطاع الحالي)' : ' (Current Sector)') : ''}`}
                  className={`relative shrink-0 inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400 ${
                    isCurrent
                      ? 'bg-sky-600 text-white shadow-xs font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isCurrent ? 'text-white' : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  {/* Full name on lg+, short name on small */}
                  <span className="hidden sm:inline">{sectorName}</span>
                  <span className="sm:hidden">{shortName}</span>

                  {isCurrent && (
                    <span className="hidden xl:inline-block ms-1 text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.2 rounded bg-black/30 text-sky-200">
                      {isAr ? 'الحالي' : 'Active'}
                    </span>
                  )}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
