import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Copy,
  Star,
  Clock,
  Calendar,
  User,
  Download,
  Sparkles,
  LayoutGrid,
  List as ListIcon,
  Tag,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { Language, BlogPost, BlogStatus } from '../../types';

interface CMSBlogListProps {
  blogPosts: BlogPost[];
  onAddPost: () => void;
  onEditPost: (post: BlogPost) => void;
  onDeletePost: (id: string) => void;
  onDuplicatePost: (post: BlogPost) => void;
  onToggleFeatured: (post: BlogPost) => void;
  onQuickStatusChange: (post: BlogPost, newStatus: BlogStatus) => void;
  onViewLive: (post: BlogPost) => void;
  language: Language;
}

export const CMSBlogList: React.FC<CMSBlogListProps> = ({
  blogPosts,
  onAddPost,
  onEditPost,
  onDeletePost,
  onDuplicatePost,
  onToggleFeatured,
  onQuickStatusChange,
  onViewLive,
  language,
}) => {
  const isAr = language === 'ar';
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const statusOptions: { value: BlogStatus; labelEn: string; labelAr: string; color: string }[] = [
    { value: 'published', labelEn: 'Published & Live', labelAr: 'منشور ومتاح للجمهور', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    { value: 'draft', labelEn: 'Draft / In Review', labelAr: 'مسودة قيد المراجعة', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    { value: 'archived', labelEn: 'Archived', labelAr: 'مؤرشف', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  ];

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    blogPosts.forEach((p) => {
      if (p.category?.en) set.add(p.category.en);
    });
    return Array.from(set);
  }, [blogPosts]);

  // Filtering
  const filteredPosts = useMemo(() => {
    return blogPosts.filter((post) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        post.title.en.toLowerCase().includes(q) ||
        post.title.ar.toLowerCase().includes(q) ||
        post.author.en.toLowerCase().includes(q) ||
        post.author.ar.toLowerCase().includes(q) ||
        post.excerpt.en.toLowerCase().includes(q) ||
        post.excerpt.ar.toLowerCase().includes(q);

      const matchesCat = categoryFilter === 'all' || post.category?.en === categoryFilter;
      const matchesStatus = statusFilter === 'all' || (post.status || 'published') === statusFilter;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [blogPosts, searchQuery, categoryFilter, statusFilter]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Title_EN', 'Title_AR', 'Category', 'Author', 'Date', 'ReadTime', 'Status'];
    const rows = filteredPosts.map((p) => [
      p.id,
      `"${p.title.en.replace(/"/g, '""')}"`,
      `"${p.title.ar.replace(/"/g, '""')}"`,
      `"${p.category.en.replace(/"/g, '""')}"`,
      `"${p.author.en.replace(/"/g, '""')}"`,
      `"${p.date}"`,
      `"${p.readTime.en}"`,
      p.status || 'published',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HARD_Blog_Articles_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display-serif">
            {isAr ? 'إدارة المدونة والتقارير العقارية' : 'Blog & Market Insights'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {isAr
              ? 'إنشاء ونشر المقالات، التحليلات الاقتصادية، وأدلة الاستثمار العقاري'
              : 'Draft, publish, and manage market intelligence reports, regulatory guides, and investor briefings'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">{isAr ? 'تصدير البيانات' : 'Export CSV'}</span>
          </button>

          <button
            onClick={onAddPost}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white text-xs sm:text-sm font-bold hover:from-blue-700 hover:to-sky-600 transition-all shadow-md shadow-blue-900/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'كتابة مقال جديد' : 'New Article'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {isAr ? 'إجمالي المقالات' : 'Total Articles'}
            </span>
            <BookOpen className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 font-display-serif">
            {blogPosts.length}
          </p>
          <p className="text-[10px] text-slate-500">
            {isAr ? 'مقالات وتقارير منشورة ومسودة' : 'Published & draft publications'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {isAr ? 'المقالات المنشورة' : 'Live Published'}
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 font-display-serif">
            {blogPosts.filter((p) => (p.status || 'published') === 'published').length}
          </p>
          <p className="text-[10px] text-emerald-600 font-semibold">
            {isAr ? 'متاحة للزوار على الموقع' : 'Visible on live website'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {isAr ? 'تصنيفات المحتوى' : 'Categories'}
            </span>
            <Tag className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 font-display-serif">
            {categories.length || 3}
          </p>
          <p className="text-[10px] text-slate-500">
            {isAr ? 'محاور تحليلية متنوعة' : 'Diverse market pillars'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {isAr ? 'مقالات بارزة (Featured)' : 'Featured Reads'}
            </span>
            <Star className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 font-display-serif">
            {blogPosts.filter((p) => p.featured).length}
          </p>
          <p className="text-[10px] text-slate-500">
            {isAr ? 'مثبتة في صدارة المدونة' : 'Pinned at top of feed'}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={isAr ? 'بحث في العناوين، الكاتب، أو المقتطفات...' : 'Search articles by title, author, or keywords...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full ps-10 pe-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        {/* Dropdown Filters & View Mode */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">{isAr ? 'كافة التصنيفات' : 'All Categories'}</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">{isAr ? 'كافة الحالات' : 'All Statuses'}</option>
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {isAr ? opt.labelAr : opt.labelEn}
              </option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid Cards"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Blog Articles Content */}
      {filteredPosts.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {isAr ? 'لا توجد مقالات مطابقة لمعايير البحث' : 'No matching blog articles found'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {isAr
              ? 'جرّب تعديل كلمات البحث أو تصفية التصنيف، أو أضف مقالاً جديداً'
              : 'Try changing your search terms or create a new market insight article'}
          </p>
          <button
            onClick={onAddPost}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAr ? 'كتابة مقال' : 'Write Article'}</span>
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4 text-start">{isAr ? 'عنوان المقال' : 'Article & Excerpt'}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? 'التصنيف' : 'Category'}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? 'الكاتب' : 'Author'}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? 'تاريخ النشر' : 'Publish Date'}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? 'مدة القراءة' : 'Read Time'}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="py-3.5 px-4 text-end">{isAr ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredPosts.map((post) => {
                  const currentStatus = post.status || 'published';
                  const statusInfo = statusOptions.find((s) => s.value === currentStatus) || statusOptions[0];

                  return (
                    <tr key={post.id} className="hover:bg-slate-50/70 transition-colors group">
                      {/* Title & Image */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={post.image}
                            alt={post.title[language]}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 text-xs truncate max-w-sm block">
                                {post.title[language]}
                              </span>
                              {post.featured && (
                                <span className="p-0.5 rounded bg-amber-100 text-amber-700" title="Featured">
                                  <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 truncate max-w-sm block">
                              {post.excerpt[language]}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold text-[10px]">
                          {post.category[language]}
                        </span>
                      </td>

                      {/* Author */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-800">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold text-xs">{post.author[language]}</span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {post.date}
                      </td>

                      {/* Read Time */}
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{post.readTime[language]}</span>
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4">
                        <select
                          value={currentStatus}
                          onChange={(e) => onQuickStatusChange(post, e.target.value as BlogStatus)}
                          className={`text-[10px] font-bold px-2 py-1 rounded-lg border focus:outline-none cursor-pointer ${statusInfo.color}`}
                        >
                          {statusOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {isAr ? opt.labelAr : opt.labelEn}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-end">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onToggleFeatured(post)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              post.featured
                                ? 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100'
                                : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700'
                            }`}
                            title={isAr ? 'تمييز المقال' : 'Toggle Featured'}
                          >
                            <Star className={`w-3.5 h-3.5 ${post.featured ? 'fill-amber-400' : ''}`} />
                          </button>

                          <button
                            onClick={() => onEditPost(post)}
                            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            title={isAr ? 'تعديل المقال' : 'Edit'}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onDuplicatePost(post)}
                            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
                            title={isAr ? 'تكرار المقال' : 'Duplicate'}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {deleteConfirmId === post.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  onDeletePost(post.id);
                                  setDeleteConfirmId(null);
                                }}
                                className="px-2 py-1 bg-red-600 text-white text-[10px] font-bold rounded-md hover:bg-red-700 cursor-pointer"
                              >
                                {isAr ? 'تأكيد' : 'Confirm'}
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2 py-1 bg-slate-200 text-slate-700 text-[10px] font-bold rounded-md hover:bg-slate-300 cursor-pointer"
                              >
                                {isAr ? 'إلغاء' : 'Cancel'}
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(post.id)}
                              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title={isAr ? 'حذف' : 'Delete'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPosts.map((post) => {
            const currentStatus = post.status || 'published';
            const statusInfo = statusOptions.find((s) => s.value === currentStatus) || statusOptions[0];

            return (
              <div
                key={post.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Cover */}
                  <div className="relative aspect-16/10 bg-slate-900 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title[language]}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 start-3">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-xs ${statusInfo.color}`}>
                        {isAr ? statusInfo.labelAr : statusInfo.labelEn}
                      </span>
                    </div>
                    {post.featured && (
                      <div className="absolute top-3 end-3 bg-amber-400 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                        <Star className="w-3 h-3 fill-slate-950" />
                        <span>{isAr ? 'بارز' : 'Featured'}</span>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-2.5">
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="text-blue-600 font-bold uppercase">{post.category[language]}</span>
                      <span>•</span>
                      <span>{post.date}</span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm font-display-serif line-clamp-2">
                      {post.title[language]}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {post.excerpt[language]}
                    </p>

                    <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-700">{post.author[language]}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{post.readTime[language]}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Bottom Controls */}
                <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                  <button
                    onClick={() => onToggleFeatured(post)}
                    className={`p-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                      post.featured
                        ? 'bg-amber-50 border-amber-200 text-amber-700'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${post.featured ? 'fill-amber-400' : ''}`} />
                  </button>

                  <div className="flex items-center gap-1.5 flex-1 justify-end">
                    <button
                      onClick={() => onEditPost(post)}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Edit className="w-3 h-3" />
                      <span>{isAr ? 'تعديل' : 'Edit'}</span>
                    </button>

                    <button
                      onClick={() => onDuplicatePost(post)}
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-colors cursor-pointer"
                      title={isAr ? 'تكرار' : 'Duplicate'}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeletePost(post.id)}
                      className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-colors cursor-pointer"
                      title={isAr ? 'حذف' : 'Delete'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
