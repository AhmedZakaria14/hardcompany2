import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  Clock,
  User,
  ArrowRight,
  ArrowLeft,
  Search,
} from 'lucide-react';
import { Language, PageId, BlogPost } from '../types';
import { translations } from '../lib/translations';
import { useData } from '../context/DataContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { getPageTitle, updateDocumentTitle } from '../lib/pageTitles';
import { getLocalizedText } from '../lib/utils';

interface BlogPageProps {
  onNavigate: (page: PageId) => void;
  language: Language;
}

export function BlogPage({ onNavigate, language }: BlogPageProps) {
  const t = translations[language];
  const { blogPosts } = useData();
  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  // Synchronize document title for articles page and active article modal
  React.useEffect(() => {
    const title = getPageTitle({
      page: 'blog',
      language,
      articleTitle: selectedPost && selectedPost.title
        ? {
            ar: typeof selectedPost.title === 'string'
              ? selectedPost.title
              : (selectedPost.title?.ar || selectedPost.title?.en || ''),
            en: typeof selectedPost.title === 'string'
              ? selectedPost.title
              : (selectedPost.title?.en || selectedPost.title?.ar || ''),
          }
        : null,
    });
    updateDocumentTitle(title);
  }, [language, selectedPost]);

  // Show published posts only on public site
  const livePosts = blogPosts.filter((p) => (p.status || 'published') === 'published');

  const filteredPosts = livePosts.filter((post) => {
    if (activeCategory === 'All' || activeCategory === 'الكل') return true;
    if (!post.category) return false;
    const catVal = post.category as any;
    if (typeof catVal === 'string') {
      return catVal.includes(activeCategory);
    }
    const catEn = catVal?.en || '';
    const catAr = catVal?.ar || '';
    return catEn.includes(activeCategory) || catAr.includes(activeCategory);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="space-y-3 max-w-3xl">
        <Badge variant="primary">{language === 'en' ? 'Market Intelligence' : 'تقارير وتحليلات السوق'}</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display-serif tracking-tight">
          {t.blog.pageTitle}
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          {t.blog.pageSubtitle}
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {t.blog.categories.map((cat, idx) => (
          <button
            key={idx}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeCategory === cat
                ? 'bg-hard-gradient text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Blog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPosts.map((post) => (
          <article
            key={post.id}
            onClick={() => setSelectedPost(post)}
            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group cursor-pointer"
          >
            <div className="space-y-4">
              <div className="relative aspect-16/10 overflow-hidden bg-slate-900">
                <img
                  src={post.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'}
                  alt={getLocalizedText(post.title, language)}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 start-3">
                  <Badge variant="gradient">{getLocalizedText(post.category, language)}</Badge>
                </div>
              </div>

              <div className="px-6 space-y-2">
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>{post.date}</span>
                  <span>•</span>
                  <span>{getLocalizedText(post.readTime, language)}</span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 font-display-serif group-hover:text-blue-600 transition-colors line-clamp-2">
                  {getLocalizedText(post.title, language)}
                </h3>

                <p className="text-xs sm:text-sm text-slate-500 line-clamp-3 leading-relaxed">
                  {getLocalizedText(post.excerpt, language)}
                </p>
              </div>
            </div>

            <div className="p-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
              <span>{getLocalizedText(post.author, language)}</span>
              <span className="flex items-center gap-1 group-hover:gap-1.5 transition-all">
                {t.blog.readArticle} <ArrowIcon className="w-3.5 h-3.5" />
              </span>
            </div>
          </article>
        ))}
      </div>

      {/* Article Detail Modal */}
      {selectedPost && (
        <Modal
          isOpen={!!selectedPost}
          onClose={() => setSelectedPost(null)}
          title={getLocalizedText(selectedPost.title, language)}
          subtitle={`${getLocalizedText(selectedPost.author, language)} • ${selectedPost.date}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="relative aspect-16/9 rounded-2xl overflow-hidden bg-slate-900">
              <img
                src={selectedPost.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'}
                alt={getLocalizedText(selectedPost.title, language)}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {getLocalizedText(selectedPost.excerpt, language)}
            </p>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {getLocalizedText(selectedPost.content, language)}
            </p>
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setSelectedPost(null)}>
                {language === 'en' ? 'Close' : 'إغلاق'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
