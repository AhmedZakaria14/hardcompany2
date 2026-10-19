import React from 'react';
import { Language } from '../../types';
import { useSiteSettings } from '../../context/SiteSettingsContext';

interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  language?: Language;
  variant?: 'light' | 'dark';
  className?: string;
  isIconOnly?: boolean;
  sector?: 'portal' | 'realestate' | 'construction' | 'hvac';
}

export function BrandLogo({
  size = 'md',
  showText = true,
  language = 'en',
  variant = 'dark',
  className = '',
  isIconOnly = false,
  sector = 'realestate',
}: BrandLogoProps) {
  let settings;
  try {
    const { getEffectiveSettings } = useSiteSettings();
    settings = getEffectiveSettings(sector);
  } catch (e) {
    settings = null;
  }

  // Dimension and typography presets
  const sizeMap = {
    xs: { h: 'h-8 sm:h-9', textClass: 'text-sm', subTextClass: 'text-[9px]' },
    sm: { h: 'h-10 sm:h-11', textClass: 'text-base', subTextClass: 'text-[10px]' },
    md: { h: 'h-12 sm:h-14', textClass: 'text-lg sm:text-xl', subTextClass: 'text-[10px] sm:text-[11px]' },
    lg: { h: 'h-16 sm:h-20', textClass: 'text-2xl sm:text-3xl', subTextClass: 'text-xs' },
    xl: { h: 'h-24 sm:h-28', textClass: 'text-3xl sm:text-4xl', subTextClass: 'text-sm' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const isAr = language === 'ar';

  const logoSrc = settings
    ? variant === 'light'
      ? settings.logoUrlLight || '/logo.svg'
      : settings.logoUrlDark || '/logo.svg'
    : '/logo.svg';

  const brandName = settings
    ? isAr
      ? settings.siteName?.ar || 'هارد للعقارات'
      : settings.siteName?.en || 'HARD REAL ESTATE'
    : isAr
    ? 'هارد للعقارات'
    : 'HARD REAL ESTATE';

  const tagline = settings
    ? isAr
      ? settings.tagline?.ar || 'تسويق ووساطة عقارية فاخرة'
      : settings.tagline?.en || 'Marketing & Luxury Brokerage'
    : isAr
    ? 'تسويق ووساطة عقارية فاخرة'
    : 'Marketing & Luxury Brokerage';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Official Emblem */}
      <div className={`relative shrink-0 ${currentSize.h} flex items-center justify-center transition-transform duration-200 group-hover:scale-105`}>
        <img
          src={logoSrc}
          alt={brandName}
          className={`${currentSize.h} w-auto object-contain shrink-0 drop-shadow-xs`}
          loading="eager"
          decoding="async"
          onError={(e: any) => { e.target.src = '/logo.svg'; }}
        />
      </div>

      {/* Accompanying Brand Wordmark Typography */}
      {showText && !isIconOnly && (
        <div className="flex flex-col justify-center leading-tight">
          <div className="flex items-baseline gap-1.5">
            <span
              className={`font-bold tracking-tight font-display-serif ${currentSize.textClass} ${
                variant === 'light' ? 'text-white' : 'text-slate-900'
              }`}
            >
              {brandName}
            </span>
          </div>
          <span
            className={`tracking-wider uppercase font-semibold font-ui-sans ${currentSize.subTextClass} ${
              variant === 'light' ? 'text-sky-300/80' : 'text-slate-500'
            }`}
          >
            {tagline}
          </span>
        </div>
      )}
    </div>
  );
}
