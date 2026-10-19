import React, { useMemo } from 'react';
import { renderRichContentToHtml } from '../../lib/blogUtils';

interface SafeRichContentProps {
  content: string;
  dir?: 'rtl' | 'ltr';
  className?: string;
}

/**
 * Renders sanitized HTML content securely with typography hierarchy.
 * Protects against XSS injection while maintaining rich readability.
 */
export const SafeRichContent: React.FC<SafeRichContentProps> = ({
  content,
  dir,
  className = '',
}) => {
  const safeHtml = useMemo(() => {
    return renderRichContentToHtml(content || '');
  }, [content]);

  return (
    <div
      dir={dir}
      className={`prose prose-slate max-w-none text-sm sm:text-base leading-relaxed text-slate-700 
        prose-headings:font-display-serif prose-headings:font-bold prose-headings:text-slate-900 prose-headings:tracking-tight
        prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:mt-6 prose-h2:mb-3 prose-h2:border-b prose-h2:border-slate-100 prose-h2:pb-2
        prose-h3:text-lg sm:prose-h3:text-xl prose-h3:mt-5 prose-h3:mb-2
        prose-p:my-3 prose-p:leading-relaxed
        prose-ul:my-3 prose-ul:ps-5 prose-ul:list-disc
        prose-ol:my-3 prose-ol:ps-5 prose-ol:list-decimal
        prose-li:my-1
        prose-blockquote:border-s-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50/50 prose-blockquote:py-2.5 prose-blockquote:px-4 prose-blockquote:rounded-e-xl prose-blockquote:italic prose-blockquote:text-slate-800
        prose-strong:text-slate-900 prose-strong:font-bold
        prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-700
        prose-img:rounded-2xl prose-img:border prose-img:border-slate-200 prose-img:shadow-sm prose-img:my-4
        prose-hr:my-6 prose-hr:border-slate-200
        prose-code:bg-slate-100 prose-code:text-blue-700 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono
        ${className}`}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
};
