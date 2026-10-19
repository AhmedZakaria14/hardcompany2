import React, { useState, useMemo } from 'react';
import {
  Award,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Star,
  Quote,
  Sparkles,
  Download,
  CheckCircle2,
  RefreshCw,
  MapPin,
  Tag,
  Building,
  User,
  Eye,
} from 'lucide-react';
import { Language, Testimonial } from '../../types';
import { getLocalizedText } from '../../lib/utils';

interface CMSTestimonialsListProps {
  testimonials: Testimonial[];
  onAddStory: () => void;
  onEditStory: (story: Testimonial) => void;
  onDeleteStory: (id: string) => void;
  onResetToDefault: () => void;
  language: Language;
}

export const CMSTestimonialsList: React.FC<CMSTestimonialsListProps> = ({
  testimonials,
  onAddStory,
  onEditStory,
  onDeleteStory,
  onResetToDefault,
  language,
}) => {
  const isAr = language === 'ar';
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const categories: { value: string; labelEn: string; labelAr: string; color: string }[] = [
    { value: 'buyer', labelEn: 'Buyer', labelAr: 'مشتري عقار', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { value: 'seller', labelEn: 'Seller', labelAr: 'بائع / مالك', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    { value: 'investor', labelEn: 'Investor', labelAr: 'مستثمر ومحفظة', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    { value: 'tenant', labelEn: 'Executive Tenant', labelAr: 'مستأجر تنفيذي', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  ];

  // Filtering
  const filteredStories = useMemo(() => {
    return testimonials.filter((story) => {
      const q = searchQuery.toLowerCase().trim();
      const nameEn = getLocalizedText(story.name, 'en').toLowerCase();
      const nameAr = getLocalizedText(story.name, 'ar').toLowerCase();
      const roleEn = getLocalizedText(story.role, 'en').toLowerCase();
      const roleAr = getLocalizedText(story.role, 'ar').toLowerCase();
      const highlightEn = getLocalizedText(story.dealHighlight, 'en').toLowerCase();
      const highlightAr = getLocalizedText(story.dealHighlight, 'ar').toLowerCase();
      const quoteEn = getLocalizedText(story.quote, 'en').toLowerCase();
      const quoteAr = getLocalizedText(story.quote, 'ar').toLowerCase();
      const locationEn = getLocalizedText(story.location, 'en').toLowerCase();
      const locationAr = getLocalizedText(story.location, 'ar').toLowerCase();

      const matchSearch =
        !q ||
        nameEn.includes(q) ||
        nameAr.includes(q) ||
        roleEn.includes(q) ||
        roleAr.includes(q) ||
        highlightEn.includes(q) ||
        highlightAr.includes(q) ||
        quoteEn.includes(q) ||
        quoteAr.includes(q) ||
        locationEn.includes(q) ||
        locationAr.includes(q);

      const matchCategory = categoryFilter === 'all' || story.category === categoryFilter;
      const matchRating = ratingFilter === 'all' || story.rating.toString() === ratingFilter;

      return matchSearch && matchCategory && matchRating;
    });
  }, [testimonials, searchQuery, categoryFilter, ratingFilter]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Client_Name_EN', 'Client_Name_AR', 'Role_EN', 'Role_AR', 'Location', 'Category', 'Rating', 'Deal_Highlight', 'Quote'];
    const rows = filteredStories.map((t) => [
      t.id,
      `"${getLocalizedText(t.name, 'en').replace(/"/g, '""')}"`,
      `"${getLocalizedText(t.name, 'ar').replace(/"/g, '""')}"`,
      `"${getLocalizedText(t.role, 'en').replace(/"/g, '""')}"`,
      `"${getLocalizedText(t.role, 'ar').replace(/"/g, '""')}"`,
      `"${getLocalizedText(t.location, 'en').replace(/"/g, '""')}"`,
      t.category,
      t.rating,
      `"${getLocalizedText(t.dealHighlight, 'en').replace(/"/g, '""')}"`,
      `"${getLocalizedText(t.quote, 'en').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HARD_Success_Stories_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategoryBadge = (categoryKey: string) => {
    const found = categories.find((c) => c.value === categoryKey);
    if (!found) return null;
    return (
      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${found.color}`}>
        {isAr ? found.labelAr : found.labelEn}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* 1. Header Metrics Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
              <Award className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display-serif">
                {isAr ? 'قصص نجاح العملاء والتقييمات' : 'Client Success Stories & Testimonials'}
              </h1>
              <p className="text-xs text-slate-500">
                {isAr
                  ? `إجمالي ${testimonials.length} قصة نجاح موثقة تظهر في الصفحة الرئيسية وكافة المنصات`
                  : `Managing ${testimonials.length} verified client stories displayed across the public website`}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={onResetToDefault}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            title={isAr ? 'استعادة البيانات الافتراضية' : 'Reset to defaults'}
          >
            <RefreshCw className="w-4 h-4" />
            <span>{isAr ? 'استعادة الافتراضي' : 'Reset Defaults'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isAr ? 'تصدير CSV' : 'Export CSV'}</span>
          </button>

          <button
            onClick={onAddStory}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-sky-500 hover:brightness-110 active:scale-95 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إضافة قصة نجاح جديدة' : 'Add Success Story'}</span>
          </button>
        </div>
      </div>

      {/* 2. Filters & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute top-3 start-3" />
          <input
            type="text"
            placeholder={isAr ? 'بحث باسم العميل، المسمى، نوع الصفقة، أو النص...' : 'Search by client name, role, deal highlight, or quote...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full ps-9 pe-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">{isAr ? 'جميع الفئات' : 'All Categories'}</option>
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {isAr ? c.labelAr : c.labelEn}
                </option>
              ))}
            </select>
          </div>

          {/* Rating Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">{isAr ? 'كل التقييمات' : 'All Ratings'}</option>
              <option value="5">5 {isAr ? 'نجوم' : 'Stars'}</option>
              <option value="4">4 {isAr ? 'نجوم' : 'Stars'}</option>
              <option value="3">3 {isAr ? 'نجوم' : 'Stars'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Cards Grid View */}
      {filteredStories.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Quote className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-display-serif">
              {isAr ? 'لا توجد نتائج مطابقة' : 'No Success Stories Found'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
              {isAr
                ? 'جرب تغيير عبارة البحث أو الفلتر للعثور على قصص النجاح المطلوبة.'
                : 'Try adjusting your search query or filters to find the stories you are looking for.'}
            </p>
          </div>
          <button
            onClick={onAddStory}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إضافة قصة الآن' : 'Add Story Now'}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStories.map((story) => (
            <div
              key={story.id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-6 space-y-4 flex-1 flex flex-col">
                {/* Header: Avatar, Name, Category */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={story.avatar}
                      alt={getLocalizedText(story.name, language)}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-100 shadow-xs shrink-0"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80';
                      }}
                    />
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                        {getLocalizedText(story.name, language)}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-1">
                        {getLocalizedText(story.role, language)}
                      </p>
                    </div>
                  </div>
                  {getCategoryBadge(story.category)}
                </div>

                {/* Rating Stars & Location */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        className={`w-3.5 h-3.5 ${
                          idx < story.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                    <span className="text-[11px] font-bold text-slate-700 ms-1">({story.rating}.0)</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                    <MapPin className="w-3 h-3" />
                    <span>{getLocalizedText(story.location, language)}</span>
                  </div>
                </div>

                {/* Deal Highlight Badge */}
                <div className="bg-blue-50/80 border border-blue-100 rounded-xl px-3 py-2 flex items-center gap-2 text-xs font-semibold text-blue-900">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="line-clamp-1">{getLocalizedText(story.dealHighlight, language)}</span>
                </div>

                {/* Quote */}
                <div className="relative text-xs text-slate-600 italic bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100 flex-1">
                  <Quote className="w-4 h-4 text-slate-300 absolute top-2 end-2 opacity-50" />
                  <p className="line-clamp-4 leading-relaxed">
                    "{getLocalizedText(story.quote, language)}"
                  </p>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="px-6 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-slate-400">ID: {story.id}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onEditStory(story)}
                    className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                    title={isAr ? 'تعديل' : 'Edit'}
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  {deleteConfirmId === story.id ? (
                    <div className="flex items-center gap-1 bg-red-50 p-1 rounded-xl border border-red-200 animate-in fade-in">
                      <button
                        onClick={() => {
                          onDeleteStory(story.id);
                          setDeleteConfirmId(null);
                        }}
                        className="px-2.5 py-1 bg-red-600 text-white text-[11px] font-bold rounded-lg hover:bg-red-700 transition-colors"
                      >
                        {isAr ? 'تأكيد الحذف' : 'Confirm'}
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2 py-1 text-slate-600 text-[11px] font-semibold hover:bg-white rounded-lg"
                      >
                        {isAr ? 'إلغاء' : 'Cancel'}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(story.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                      title={isAr ? 'حذف' : 'Delete'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
