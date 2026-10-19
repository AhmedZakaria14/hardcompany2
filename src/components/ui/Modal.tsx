import React, { useEffect, useRef, useId } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerExtra?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  dir?: 'rtl' | 'ltr';
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  headerExtra,
  children,
  maxWidth = 'lg',
  initialFocusRef,
  dir,
  className,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);

  const titleId = useId();
  const subtitleId = useId();

  // Handle focus trapping, initial focus, and focus restoration
  useEffect(() => {
    if (isOpen) {
      // 1. Capture previously focused element to restore when closing
      triggerElementRef.current = document.activeElement as HTMLElement;

      // 2. Lock body scrolling
      document.body.style.overflow = 'hidden';

      // 3. Set initial focus inside dialog
      const timer = setTimeout(() => {
        if (initialFocusRef?.current) {
          initialFocusRef.current.focus();
        } else if (modalRef.current) {
          const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusableElements.length > 0) {
            focusableElements[0].focus();
          } else {
            modalRef.current.focus();
          }
        }
      }, 50);

      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
        // Restore focus to trigger element on dismiss
        if (triggerElementRef.current && typeof triggerElementRef.current.focus === 'function') {
          triggerElementRef.current.focus();
        }
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, initialFocusRef]);

  // Handle KeyDown events (Escape dismissal and Tab Focus Trap)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
      return;
    }

    if (e.key === 'Tab' && modalRef.current) {
      const elements = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      );
      const focusables: HTMLElement[] = elements.filter(
        (el): el is HTMLElement =>
          el instanceof HTMLElement &&
          !el.hasAttribute('disabled') &&
          el.getAttribute('aria-hidden') !== 'true'
      );

      if (focusables.length === 0) return;

      const firstElement = focusables[0];
      const lastElement = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement || document.activeElement === modalRef.current) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  }[maxWidth];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      dir={dir}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog container */}
      <div
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={subtitle ? subtitleId : undefined}
        onKeyDown={handleKeyDown}
        className={cn(
          'relative w-full bg-white rounded-3xl shadow-2xl border border-slate-100 z-10 overflow-hidden my-6 transform transition-all duration-200 scale-100 animate-in zoom-in-95 focus:outline-none',
          maxWidthClass,
          className
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="pe-6 space-y-1 flex-1">
            {title && (
              <h3 id={titleId} className="text-xl sm:text-2xl font-bold text-slate-900 font-display-serif tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p id={subtitleId} className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                {subtitle}
              </p>
            )}
            {headerExtra && <div className="pt-2">{headerExtra}</div>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body with internal scrolling */}
        <div className="p-5 sm:p-6 max-h-[78vh] sm:max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
