import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'whatsapp' | 'white' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  href?: string;
  target?: string;
  rel?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, href, target, rel, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none rounded-xl active:scale-[0.99]';

    const variants = {
      primary:
        'bg-hard-gradient text-white shadow-sm hover:shadow-md hover:brightness-105 border border-transparent font-semibold',
      secondary:
        'bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-200/80',
      outline:
        'border-2 border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300 shadow-xs',
      ghost:
        'bg-transparent text-slate-700 hover:bg-slate-100/80 hover:text-slate-900',
      whatsapp:
        'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow font-medium border border-emerald-700/20',
      white:
        'bg-white text-slate-900 hover:bg-slate-50 shadow-md hover:shadow-lg font-semibold border border-slate-100',
      destructive:
        'bg-red-600 text-white hover:bg-red-700 shadow-sm',
    };

    const sizes = {
      sm: 'h-9 px-3.5 text-xs tracking-wide gap-1.5',
      md: 'h-11 px-5 text-sm gap-2',
      lg: 'h-13 px-7 text-base font-semibold gap-2.5',
      icon: 'h-10 w-10 p-0',
    };

    if (href) {
      return (
        <a
          href={href}
          target={target}
          rel={rel}
          className={cn(baseStyles, variants[variant], sizes[size], className)}
          {...(props as unknown as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {children}
        </a>
      );
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
            <span>Loading...</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
