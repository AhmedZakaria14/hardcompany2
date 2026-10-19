import React from 'react';
import { useHVAC } from '../context/HVACContext';

interface HVACBrandLockupProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLogo?: boolean;
}

export function HVACBrandLockup({
  className = '',
  size = 'md',
  showLogo = true,
}: HVACBrandLockupProps) {
  const { isAr } = useHVAC();

  const logoSizes = {
    sm: 'h-8 w-auto',
    md: 'h-10 sm:h-12 w-auto',
    lg: 'h-12 sm:h-16 w-auto',
  };

  const hardSizes = {
    sm: 'text-base sm:text-lg',
    md: 'text-lg sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
  };

  const suffixSizes = {
    sm: 'text-[11px] sm:text-xs',
    md: 'text-xs sm:text-sm',
    lg: 'text-sm sm:text-base',
  };

  return (
    <div
      dir="ltr"
      className={`inline-flex items-center gap-3 select-none ${
        isAr ? 'flex-row-reverse' : 'flex-row'
      } ${className}`}
    >
      {showLogo && (
        <img
          src="/logo.svg"
          alt="HARD HVAC Maintenance"
          className={`${logoSizes[size]} object-contain shrink-0`}
        />
      )}

      <div className="flex flex-col text-start leading-tight">
        <span
          className={`font-cormorant font-bold tracking-tight text-[#1E293B] ${hardSizes[size]}`}
          style={{ letterSpacing: '0.02em' }}
        >
          HARD
        </span>
        <span
          className={`font-ui-sans font-semibold tracking-normal text-[#0EA5E9] ${suffixSizes[size]}`}
        >
          HVAC Maintenance
        </span>
      </div>
    </div>
  );
}
