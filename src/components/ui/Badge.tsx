import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'success' | 'warning' | 'dark' | 'gradient';
  className?: string;
  children?: React.ReactNode;
}

export function Badge({ className, variant = 'primary', children, ...props }: BadgeProps) {
  const base =
    'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide whitespace-nowrap transition-colors';

  const variants = {
    primary: 'bg-blue-50 text-blue-700 border border-blue-200/80',
    secondary: 'bg-slate-100 text-slate-700 border border-slate-200',
    outline: 'border border-slate-300 text-slate-700 bg-white/90 backdrop-blur-xs',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
    dark: 'bg-slate-900 text-white shadow-xs',
    gradient: 'bg-hard-gradient text-white shadow-xs',
  };

  return (
    <div className={cn(base, variants[variant], className)} {...props}>
      {children}
    </div>
  );
}
