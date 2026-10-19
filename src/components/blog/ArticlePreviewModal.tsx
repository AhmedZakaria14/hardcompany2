import React from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  Tag,
  Share2,
  Bookmark,
  CheckCircle2,
  ExternalLink,
  Eye,
} from 'lucide-react';
import { BlogPost, Language, BlogCategory } from '../../types';
import { SafeRichContent } from './SafeRichContent';
import { getCategoryBadgeClasses, getBlogSlug } from '../../lib/blogUtils';

interface ArticlePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: BlogPost | null;
  language: Language;
  categories?: BlogCategory[];
}

export const ArticlePreviewModal: React.FC<ArticlePreviewModalProps> = ({
  isOpen,
  onClose,
  post,
  language,
  categories = [],
}) => {
  if (!isOpen || !post) return null;
  const isAr = language === 'ar';

  const categoryMatch = categories.find(
    (c) => c.id === post.categoryId || c.name.en === post.category?.en || c.name.ar === post.category?.ar
  );
  const badgeStyle = getCategoryBadgeClasses(categoryMatch?.color || 'blue');
  const slug = getBlogSlug(post, language);

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6">
      <div
        dir={isAr ? 'rtl' : 'ltr'}
        className="bg-white w-full max-w-4xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[94vh] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Top Preview Banner */}
        <div className="px-6 py-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
              <Eye className="w-3.5 h-3.5" />
              <span>{isAr ? 'معاينة القارئ (Live Preview)' : 'Live Reader Preview'}</span>
            </span>
            <span className="text-slate-400 hidden sm:inline">•</span>
            <span className="text-slate-400 text-[11px] font-mono hidden sm:inline">
              /blog/{slug}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Reader Article View */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 bg-slate-50/30">
          {/* Header Metadata */}
          <div className="space-y-4 max-w-3xl mx-auto">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className={`px-3 py-1 rounded-full border text-xs font-bold flex items-center gap-1.5 ${badgeStyle.badge}`}>
                <span className={`w-2 h-2 rounded-full ${badgeStyle.dot}`} />
                <span>{post.category?.[language] || 'Market Intelligence'}</span>
              </span>

              <span className="text-slate-300">•</span>

              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{post.date}</span>
              </div>

              <span className="text-slate-300">•</span>

              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{post.readTime?.[language] || '5 min read'}</span>
              </div>

              {post.status && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ms-auto ${
                    post.status === 'published'
                      ? 'bg-emerald-100 text-emerald-800'
                      : post.status === 'draft'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {post.status}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 font-display-serif leading-tight tracking-tight">
              {post.title?.[language]}
            </h1>

            {/* Summary / Excerpt */}
            {post.excerpt?.[language] && (
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium border-s-2 border-blue-500 ps-4 py-1 italic">
                {post.excerpt[language]}
              </p>
            )}

            {/* Author Byline */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-200">
              <div className="flex items-center gap-3">
                <img
                  src={post.authorAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'}
                  alt={post.author?.[language]}
                  className="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-2xs"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {post.author?.[language]}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {post.authorRole?.[language] || (isAr ? 'مستشار استثماري أول' : 'Senior Market Strategist')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Cover Image */}
          {post.image && (
            <div className="max-w-3xl mx-auto rounded-3xl overflow-hidden border border-slate-200 shadow-md aspect-16/9 bg-slate-900">
              <img
                src={post.image}
                alt={post.title?.[language] || 'Article Banner'}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Sanitized Article Body */}
          <div className="max-w-3xl mx-auto bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs">
            <SafeRichContent
              content={post.content?.[language] || ''}
              dir={isAr ? 'rtl' : 'ltr'}
            />

            {/* Topic Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isAr ? 'الوسوم:' : 'Tags:'}</span>
                </span>
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-white border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {isAr
              ? 'المعاينة مطابقة تماماً لواجهة المقال على الموقع المباشر'
              : 'Rendered in full compliance with live reader viewport and sanitize rules'}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors"
          >
            {isAr ? 'إغلاق المعاينة' : 'Close Preview'}
          </button>
        </div>
      </div>
    </div>
  );
};
