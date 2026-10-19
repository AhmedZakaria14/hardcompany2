import React, { useState, useRef, useEffect } from 'react';
import {
  Heading2,
  Heading3,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Eye,
  Edit3,
  Sparkles,
  Clock,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { Language } from '../../types';
import { calculateReadingTime, sanitizeHtml } from '../../lib/blogFirestore';

interface SafeRichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  language: Language;
  placeholder?: string;
  minHeight?: string;
  label?: string;
}

export const SafeRichTextEditor: React.FC<SafeRichTextEditorProps> = ({
  value,
  onChange,
  language,
  placeholder,
  minHeight = 'min-h-[260px]',
  label,
}) => {
  const isAr = language === 'ar';
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  // Calculate live stats
  const wordCount = (value || '').trim().split(/\s+/).filter(Boolean).length;
  const readingTime = calculateReadingTime(isAr ? '' : value, isAr ? value : '');
  const activeReadTime = isAr ? readingTime.ar : readingTime.en;

  // Insert formatting at cursor
  const applyFormatting = (prefix: string, suffix: string = '', defaultPlaceholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end) || defaultPlaceholder;
    const replacement = `${prefix}${selected}${suffix}`;

    const updated = value.substring(0, start) + replacement + value.substring(end);
    onChange(updated);

    // Reposition cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 10);
  };

  const handleHeading = (level: number) => {
    const prefix = level === 2 ? '## ' : '### ';
    applyFormatting(`\n${prefix}`, '\n', isAr ? 'عنوان فرعي جديد' : 'Section Heading');
  };

  const handleBold = () => applyFormatting('**', '**', isAr ? 'نص عريض' : 'bold text');
  const handleItalic = () => applyFormatting('*', '*', isAr ? 'نص مائل' : 'italic text');
  const handleBulletList = () => applyFormatting('\n- ', '\n', isAr ? 'عنصر في القائمة' : 'List item');
  const handleNumberedList = () => applyFormatting('\n1. ', '\n', isAr ? 'عنصر مرقم' : 'Numbered item');
  const handleQuote = () => applyFormatting('\n> ', '\n', isAr ? 'اقتباس أو نص مميز هنا...' : 'Key quote or highlight here...');
  const handleDivider = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const updated = value.substring(0, start) + '\n\n---\n\n' + value.substring(start);
    onChange(updated);
  };
  const handleTable = () => {
    const tableTemplate = isAr
      ? `\n\n| المؤشر | القيمة | الحالة |\n| :--- | :--- | :--- |\n| العائد السنوي | 9.2% | معتمد |\n| نسبة الإشغال | 95% | مستقر |\n\n`
      : `\n\n| Metric | Benchmark | Status |\n| :--- | :--- | :--- |\n| Annual Yield | 9.2% | Verified |\n| Occupancy | 95% | Stable |\n\n`;
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const updated = value.substring(0, start) + tableTemplate + value.substring(start);
    onChange(updated);
  };

  const handleInsertLink = () => {
    if (!linkUrl) return;
    const cleanUrl = linkUrl.replace(/^javascript:/i, '#');
    const label = linkText || cleanUrl;
    applyFormatting(`[${label}](`, ')', cleanUrl);
    setLinkModalOpen(false);
    setLinkText('');
    setLinkUrl('');
  };

  return (
    <div className="space-y-2" dir={isAr ? 'rtl' : 'ltr'}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>{label}</span>
          </label>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{activeReadTime}</span>
            </span>
            <span>•</span>
            <span>
              {wordCount} {isAr ? 'كلمة' : 'words'}
            </span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-2xs focus-within:ring-2 focus-within:ring-blue-500/50 transition-all">
        {/* Formatting Toolbar */}
        <div className="bg-slate-50/90 border-b border-slate-200 px-3 py-2 flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => handleHeading(2)}
              title={isAr ? 'عنوان رئيسي (H2)' : 'Heading 2'}
              className="p-1.5 rounded-lg text-slate-700 hover:text-blue-600 hover:bg-white transition-colors cursor-pointer"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleHeading(3)}
              title={isAr ? 'عنوان فرعي (H3)' : 'Heading 3'}
              className="p-1.5 rounded-lg text-slate-700 hover:text-blue-600 hover:bg-white transition-colors cursor-pointer"
            >
              <Heading3 className="w-4 h-4" />
            </button>

            <span className="w-px h-4 bg-slate-300 mx-1" />

            <button
              type="button"
              onClick={handleBold}
              title={isAr ? 'غامق (Bold)' : 'Bold'}
              className="p-1.5 rounded-lg text-slate-700 hover:text-blue-600 hover:bg-white transition-colors cursor-pointer"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleItalic}
              title={isAr ? 'مائل (Italic)' : 'Italic'}
              className="p-1.5 rounded-lg text-slate-700 hover:text-blue-600 hover:bg-white transition-colors cursor-pointer"
            >
              <Italic className="w-4 h-4" />
            </button>

            <span className="w-px h-4 bg-slate-300 mx-1" />

            <button
              type="button"
              onClick={handleBulletList}
              title={isAr ? 'قائمة نقطية' : 'Bullet List'}
              className="p-1.5 rounded-lg text-slate-700 hover:text-blue-600 hover:bg-white transition-colors cursor-pointer"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNumberedList}
              title={isAr ? 'قائمة رقمية' : 'Numbered List'}
              className="p-1.5 rounded-lg text-slate-700 hover:text-blue-600 hover:bg-white transition-colors cursor-pointer"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleQuote}
              title={isAr ? 'اقتباس' : 'Blockquote'}
              className="p-1.5 rounded-lg text-slate-700 hover:text-blue-600 hover:bg-white transition-colors cursor-pointer"
            >
              <Quote className="w-4 h-4" />
            </button>

            <span className="w-px h-4 bg-slate-300 mx-1" />

            <button
              type="button"
              onClick={() => setLinkModalOpen(true)}
              title={isAr ? 'إدراج رابط' : 'Insert Link'}
              className="p-1.5 rounded-lg text-slate-700 hover:text-blue-600 hover:bg-white transition-colors cursor-pointer"
            >
              <LinkIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleTable}
              title={isAr ? 'إدراج جدول مقارنة' : 'Insert Data Table'}
              className="p-1.5 rounded-lg text-slate-700 hover:text-blue-600 hover:bg-white transition-colors cursor-pointer"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleDivider}
              title={isAr ? 'فاصل أفقي' : 'Horizontal Rule'}
              className="px-2 py-1 text-xs font-mono font-bold rounded-lg text-slate-700 hover:text-blue-600 hover:bg-white transition-colors cursor-pointer"
            >
              ---
            </button>
          </div>

          {/* Edit / Preview Toggle */}
          <div className="flex items-center gap-1 bg-slate-200/70 p-0.5 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('edit')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === 'edit'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isAr ? 'المحرر' : 'Editor'}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === 'preview'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isAr ? 'معاينة آمنة' : 'Preview'}</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        {viewMode === 'edit' ? (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || (isAr ? 'اكتب نص المقال الكامل هنا...' : 'Write complete article content here...')}
            className={`w-full p-4 text-xs sm:text-sm font-sans text-slate-900 bg-white focus:outline-none resize-y leading-relaxed font-normal ${minHeight}`}
          />
        ) : (
          <div className={`p-4 overflow-y-auto bg-slate-50/50 ${minHeight}`}>
            <SafeParsedContent content={value} language={language} />
          </div>
        )}

        {/* Bottom Status bar */}
        <div className="bg-slate-50 border-t border-slate-100 px-4 py-1.5 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              {isAr ? 'دعم التنسيق الآمن والعناوين' : 'Markdown & Rich Formatting Enabled'}
            </span>
            <span>•</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              ✓ {isAr ? 'حماية ضد الثغرات وتطهير المحتوى' : 'Sanitized & XSS-Protected'}
            </span>
          </div>

          <div className="font-semibold text-slate-700">
            {activeReadTime}
          </div>
        </div>
      </div>

      {/* Insert Link Mini Modal */}
      {linkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm space-y-4 shadow-xl border border-slate-200" dir={isAr ? 'rtl' : 'ltr'}>
            <h4 className="text-sm font-bold text-slate-900">{isAr ? 'إدراج رابط تشعبي' : 'Insert Hyperlink'}</h4>
            <div className="space-y-2">
              <input
                type="text"
                placeholder={isAr ? 'نص الرابط' : 'Link Text (optional)'}
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
              <input
                type="url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setLinkModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleInsertLink}
                className="px-4 py-1.5 text-xs bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700"
              >
                {isAr ? 'إدراج' : 'Insert'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Safe article parser component that safely renders headings, lists, quotes, tables, and paragraphs.
 */
export const SafeParsedContent: React.FC<{ content: string; language: Language }> = ({ content, language }) => {
  const isAr = language === 'ar';
  const sanitized = sanitizeHtml(content || '');

  // Parse markdown into blocks
  const lines = sanitized.split('\n');
  const blocks: React.ReactNode[] = [];

  let inList = false;
  let listItems: string[] = [];
  let inNumberedList = false;
  let numberedListItems: string[] = [];
  let inTable = false;
  let tableRows: string[][] = [];

  const flushList = () => {
    if (inList && listItems.length > 0) {
      blocks.push(
        <ul key={`ul-${blocks.length}`} className="list-disc list-inside space-y-1 my-3 text-slate-700 leading-relaxed ps-2">
          {listItems.map((item, i) => (
            <li key={i}>{formatInline(item)}</li>
          ))}
        </ul>
      );
      listItems = [];
      inList = false;
    }
    if (inNumberedList && numberedListItems.length > 0) {
      blocks.push(
        <ol key={`ol-${blocks.length}`} className="list-decimal list-inside space-y-1 my-3 text-slate-700 leading-relaxed ps-2">
          {numberedListItems.map((item, i) => (
            <li key={i}>{formatInline(item)}</li>
          ))}
        </ol>
      );
      numberedListItems = [];
      inNumberedList = false;
    }
  };

  const flushTable = () => {
    if (inTable && tableRows.length > 0) {
      const [headerRow, ...bodyRows] = tableRows;
      blocks.push(
        <div key={`table-${blocks.length}`} className="overflow-x-auto my-4 border border-slate-200 rounded-xl shadow-2xs">
          <table className="w-full text-xs text-start">
            {headerRow && (
              <thead className="bg-slate-100/80 border-b border-slate-200">
                <tr>
                  {headerRow.map((h, i) => (
                    <th key={i} className="p-2.5 font-bold text-slate-800 text-start">
                      {formatInline(h)}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody className="divide-y divide-slate-100">
              {bodyRows.map((r, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50/50">
                  {r.map((c, cIdx) => (
                    <td key={cIdx} className="p-2.5 text-slate-700 text-start">
                      {formatInline(c)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    }
  };

  for (let idx = 0; idx < lines.length; idx++) {
    const rawLine = lines[idx];
    const line = rawLine.trim();

    if (!line) {
      flushList();
      flushTable();
      continue;
    }

    // Table row detection (| a | b |)
    if (line.startsWith('|') && line.endsWith('|')) {
      flushList();
      // Skip markdown table divider line (| --- | --- |)
      if (/^\|[\s-:]+\|/.test(line)) {
        continue;
      }
      const cells = line.split('|').slice(1, -1).map((c) => c.trim());
      inTable = true;
      tableRows.push(cells);
      continue;
    } else {
      flushTable();
    }

    // Headings
    if (line.startsWith('### ')) {
      flushList();
      blocks.push(
        <h4 key={`h4-${idx}`} className="text-base sm:text-lg font-bold text-slate-900 font-display-serif mt-5 mb-2">
          {formatInline(line.replace('### ', ''))}
        </h4>
      );
      continue;
    }

    if (line.startsWith('## ')) {
      flushList();
      blocks.push(
        <h3 key={`h3-${idx}`} className="text-lg sm:text-xl font-extrabold text-slate-900 font-display-serif mt-6 mb-3 border-b border-slate-100 pb-2">
          {formatInline(line.replace('## ', ''))}
        </h3>
      );
      continue;
    }

    if (line.startsWith('# ')) {
      flushList();
      blocks.push(
        <h2 key={`h2-${idx}`} className="text-xl sm:text-2xl font-black text-slate-900 font-display-serif mt-7 mb-4">
          {formatInline(line.replace('# ', ''))}
        </h2>
      );
      continue;
    }

    // Horizontal Rule
    if (line === '---' || line === '***') {
      flushList();
      blocks.push(<hr key={`hr-${idx}`} className="my-6 border-slate-200" />);
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      flushList();
      blocks.push(
        <blockquote
          key={`quote-${idx}`}
          className="my-4 ps-4 pe-2 py-2 border-s-4 border-blue-600 bg-blue-50/50 rounded-e-xl text-slate-800 text-xs sm:text-sm italic font-medium"
        >
          {formatInline(line.replace('> ', ''))}
        </blockquote>
      );
      continue;
    }

    // Bullet lists
    if (line.startsWith('- ') || line.startsWith('* ')) {
      inList = true;
      listItems.push(line.replace(/^[-*]\s+/, ''));
      continue;
    }

    // Numbered lists
    if (/^\d+\.\s+/.test(line)) {
      inNumberedList = true;
      numberedListItems.push(line.replace(/^\d+\.\s+/, ''));
      continue;
    }

    // Paragraph
    flushList();
    blocks.push(
      <p key={`p-${idx}`} className="my-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
        {formatInline(line)}
      </p>
    );
  }

  flushList();
  flushTable();

  return <div className="space-y-1 font-sans text-slate-800">{blocks}</div>;
};

/**
 * Format inline elements like **bold**, *italic*, [link](url)
 */
function formatInline(text: string): React.ReactNode {
  if (!text) return null;

  // Split links [label](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(renderBoldItalic(text.substring(lastIndex, match.index)));
    }
    const label = match[1];
    const url = match[2];
    const safeUrl = url.replace(/^javascript:/i, '#');
    parts.push(
      <a
        key={match.index}
        href={safeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline font-semibold hover:text-blue-700"
      >
        {label}
      </a>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(renderBoldItalic(text.substring(lastIndex)));
  }

  return <>{parts}</>;
}

function renderBoldItalic(text: string): React.ReactNode {
  // Bold **text**
  const boldParts = text.split(/\*\*([^*]+)\*\*/g);
  return (
    <>
      {boldParts.map((part, i) => {
        if (i % 2 === 1) {
          return <strong key={i} className="font-bold text-slate-900">{part}</strong>;
        }
        // Italic *text*
        const italicParts = part.split(/\*([^*]+)\*/g);
        return italicParts.map((it, j) => {
          if (j % 2 === 1) {
            return <em key={j} className="italic">{it}</em>;
          }
          return it;
        });
      })}
    </>
  );
}
