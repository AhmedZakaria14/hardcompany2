import React, { useState, useRef } from 'react';
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Minus,
  Code,
  Eye,
  PenTool,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';
import { SafeRichContent } from './SafeRichContent';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: 'en' | 'ar';
  label: string;
  placeholder?: string;
  minHeight?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  language,
  label,
  placeholder,
  minHeight = '300px',
}) => {
  const isAr = language === 'ar';
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [activeView, setActiveView] = useState<'editor' | 'preview' | 'split'>('editor');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  // Quick stats
  const wordCount = (value || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  const readingMinutes = Math.max(1, Math.ceil(wordCount / (isAr ? 160 : 200)));

  // Helper to wrap or insert text at current cursor selection
  const insertFormatting = (prefix: string, suffix: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = value || '';
    const selectedText = currentVal.substring(start, end) || defaultText;

    const newText =
      currentVal.substring(0, start) +
      prefix +
      selectedText +
      suffix +
      currentVal.substring(end);

    onChange(newText);

    // Reposition cursor
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  };

  const insertLinePrefix = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const currentVal = value || '';
    
    // Find beginning of current line
    const lastNewline = currentVal.lastIndexOf('\n', start - 1);
    const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;

    const newText =
      currentVal.substring(0, lineStart) +
      prefix +
      currentVal.substring(lineStart);

    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      const newPos = start + prefix.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 10);
  };

  const handleApplyLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl) return;
    const textToUse = linkText || linkUrl;
    insertFormatting(`[${textToUse}](`, ')', linkUrl);
    setLinkUrl('');
    setLinkText('');
    setShowLinkModal(false);
  };

  return (
    <div className="space-y-1.5" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Label and Toolbar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <span>{label}</span>
          <span className="text-[10px] font-normal text-slate-400">
            ({isAr ? 'يدعم التنسيق الغني والعناوين والقوائم' : 'Rich text & Markdown supported'})
          </span>
        </label>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveView('editor')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              activeView === 'editor'
                ? 'bg-white text-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PenTool className="w-3 h-3" />
            <span>{isAr ? 'المحرر' : 'Editor'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveView('split')}
            className={`hidden md:flex px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer items-center gap-1 ${
              activeView === 'split'
                ? 'bg-white text-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>{isAr ? 'عرض مزدوج' : 'Side-by-Side'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveView('preview')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              activeView === 'preview'
                ? 'bg-white text-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>{isAr ? 'معاينة القراءة' : 'Preview'}</span>
          </button>
        </div>
      </div>

      {/* Editor Container with Toolbar */}
      <div className="border border-slate-200 rounded-2xl bg-white shadow-2xs overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 transition-all">
        {/* Action Toolbar */}
        {activeView !== 'preview' && (
          <div className="flex items-center gap-1 p-1.5 bg-slate-50 border-b border-slate-200 flex-wrap overflow-x-auto">
            {/* Bold */}
            <button
              type="button"
              onClick={() => insertFormatting('**', '**', isAr ? 'نص عريض' : 'bold text')}
              className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
              title={isAr ? 'غامق' : 'Bold (**text**)'}
            >
              <Bold className="w-4 h-4" />
            </button>

            {/* Italic */}
            <button
              type="button"
              onClick={() => insertFormatting('*', '*', isAr ? 'نص مائل' : 'italic text')}
              className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
              title={isAr ? 'مائل' : 'Italic (*text*)'}
            >
              <Italic className="w-4 h-4" />
            </button>

            <span className="w-px h-4 bg-slate-300 mx-1" />

            {/* H2 */}
            <button
              type="button"
              onClick={() => insertLinePrefix('## ')}
              className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-0.5"
              title={isAr ? 'عنوان رئيسي (H2)' : 'Heading 2 (## Heading)'}
            >
              <Heading2 className="w-4 h-4" />
            </button>

            {/* H3 */}
            <button
              type="button"
              onClick={() => insertLinePrefix('### ')}
              className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-0.5"
              title={isAr ? 'عنوان فرعي (H3)' : 'Heading 3 (### Subheading)'}
            >
              <Heading3 className="w-4 h-4" />
            </button>

            <span className="w-px h-4 bg-slate-300 mx-1" />

            {/* Bullet List */}
            <button
              type="button"
              onClick={() => insertLinePrefix('- ')}
              className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
              title={isAr ? 'قائمة نقطية' : 'Bullet List (- item)'}
            >
              <List className="w-4 h-4" />
            </button>

            {/* Numbered List */}
            <button
              type="button"
              onClick={() => insertLinePrefix('1. ')}
              className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
              title={isAr ? 'قائمة رقمية' : 'Numbered List (1. item)'}
            >
              <ListOrdered className="w-4 h-4" />
            </button>

            {/* Quote */}
            <button
              type="button"
              onClick={() => insertLinePrefix('> ')}
              className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
              title={isAr ? 'اقتباس' : 'Blockquote (> quote)'}
            >
              <Quote className="w-4 h-4" />
            </button>

            <span className="w-px h-4 bg-slate-300 mx-1" />

            {/* Link Modal trigger */}
            <button
              type="button"
              onClick={() => setShowLinkModal(true)}
              className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
              title={isAr ? 'إدراج رابط' : 'Insert Link'}
            >
              <LinkIcon className="w-4 h-4" />
            </button>

            {/* Insert Divider */}
            <button
              type="button"
              onClick={() => insertLinePrefix('\n---\n')}
              className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
              title={isAr ? 'فاصل خطي' : 'Horizontal Divider (---)'}
            >
              <Minus className="w-4 h-4" />
            </button>

            {/* Code */}
            <button
              type="button"
              onClick={() => insertFormatting('`', '`', 'code')}
              className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
              title={isAr ? 'كود برمجي' : 'Inline Code (`code`)'}
            >
              <Code className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Editor Body */}
        <div className="relative">
          {activeView === 'editor' && (
            <textarea
              ref={textareaRef}
              dir={isAr ? 'rtl' : 'ltr'}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder || (isAr ? 'اكتب نص المقال الكامل هنا...' : 'Write the full article body here...')}
              className="w-full p-4 bg-white text-slate-900 text-xs sm:text-sm font-sans leading-relaxed focus:outline-none resize-y"
              style={{ minHeight }}
            />
          )}

          {activeView === 'preview' && (
            <div
              className="p-6 bg-slate-50/50 overflow-y-auto"
              style={{ minHeight }}
            >
              {value ? (
                <SafeRichContent content={value} dir={isAr ? 'rtl' : 'ltr'} />
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs italic">
                  {isAr ? 'لا يوجد محتوى للمعاينة حتى الآن' : 'No content to preview yet'}
                </div>
              )}
            </div>
          )}

          {activeView === 'split' && (
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x rtl:md:divide-x-reverse divide-slate-200">
              <textarea
                ref={textareaRef}
                dir={isAr ? 'rtl' : 'ltr'}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full p-4 bg-white text-slate-900 text-xs sm:text-sm font-sans leading-relaxed focus:outline-none resize-none"
                style={{ minHeight }}
              />
              <div
                className="p-5 bg-slate-50/70 overflow-y-auto"
                style={{ minHeight }}
              >
                {value ? (
                  <SafeRichContent content={value} dir={isAr ? 'rtl' : 'ltr'} />
                ) : (
                  <div className="text-center py-12 text-slate-400 text-xs italic">
                    {isAr ? 'ستظهر المعاينة المباشرة هنا' : 'Live sanitized preview will appear here'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Metrics */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <div className="flex items-center gap-3">
            <span>
              {isAr ? `${wordCount} كلمة` : `${wordCount} words`}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-blue-600 font-bold">
              <Clock className="w-3 h-3" />
              {isAr
                ? `قراءة مقدرة: ${readingMinutes} ${readingMinutes <= 10 ? 'دقائق' : 'دقيقة'}`
                : `Est. reading time: ${readingMinutes} min read`}
            </span>
          </div>

          <div className="flex items-center gap-1 text-emerald-600 font-semibold">
            <Sparkles className="w-3 h-3" />
            <span>{isAr ? 'عرض آمن ومعقم (Sanitized XSS-Safe)' : 'Safe Rich-Text Rendering'}</span>
          </div>
        </div>
      </div>

      {/* Link Insertion Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <form
            onSubmit={handleApplyLink}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xl max-w-sm w-full space-y-4"
          >
            <h4 className="text-sm font-bold text-slate-900 font-display-serif">
              {isAr ? 'إدراج رابط خارجي أو داخلي' : 'Insert Link'}
            </h4>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">
                {isAr ? 'عنوان الرابط (النص الظاهر)' : 'Link Text'}
              </label>
              <input
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="e.g. Saudi Vision 2030 Report"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">
                {isAr ? 'عنوان URL' : 'Target URL'} *
              </label>
              <input
                type="url"
                required
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-lg cursor-pointer"
              >
                {isAr ? 'إدراج' : 'Insert'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
