import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  Save,
  Sparkles,
  User,
  Clock,
  Calendar,
  Image as ImageIcon,
  Tag,
  Star,
  FileText,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { Language, BlogPost, BlogStatus } from '../../types';
import { CMSImageUpload } from '../components/CMSImageUpload';

interface CMSBlogFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (postData: Partial<BlogPost>) => Promise<void>;
  initialData?: BlogPost | null;
  language: Language;
}

type TabType = 'details' | 'content' | 'author' | 'media';

export const CMSBlogFormModal: React.FC<CMSBlogFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  language,
}) => {
  const isAr = language === 'ar';
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewContentMode, setPreviewContentMode] = useState(false);

  // Form State
  const [titleEn, setTitleEn] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [slug, setSlug] = useState('');
  const [excerptEn, setExcerptEn] = useState('');
  const [excerptAr, setExcerptAr] = useState('');
  const [categoryEn, setCategoryEn] = useState('Market Intelligence');
  const [categoryAr, setCategoryAr] = useState('تقارير وتحليلات السوق');
  const [contentEn, setContentEn] = useState('');
  const [contentAr, setContentAr] = useState('');
  const [date, setDate] = useState('');
  const [readTimeEn, setReadTimeEn] = useState('5 min read');
  const [readTimeAr, setReadTimeAr] = useState('قراءة 5 دقائق');
  const [authorEn, setAuthorEn] = useState('Faisal Al-Otaibi');
  const [authorAr, setAuthorAr] = useState('فيصل العتيبي');
  const [authorRoleEn, setAuthorRoleEn] = useState('Senior Real Estate Strategist');
  const [authorRoleAr, setAuthorRoleAr] = useState('كبير المستشارين الاستراتيجيين');
  const [authorAvatar, setAuthorAvatar] = useState('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80');
  const [image, setImage] = useState('');
  const [status, setStatus] = useState<BlogStatus>('published');
  const [featured, setFeatured] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  // Hydrate form
  useEffect(() => {
    if (initialData) {
      setTitleEn(initialData.title?.en || '');
      setTitleAr(initialData.title?.ar || '');
      const rawSlug = typeof initialData.slug === 'string' ? initialData.slug : ((initialData.slug as any)?.en || (initialData.slug as any)?.ar);
      setSlug(rawSlug || '');
      setExcerptEn(initialData.excerpt?.en || '');
      setExcerptAr(initialData.excerpt?.ar || '');
      setCategoryEn(initialData.category?.en || 'Market Intelligence');
      setCategoryAr(initialData.category?.ar || 'تقارير وتحليلات السوق');
      setContentEn(initialData.content?.en || '');
      setContentAr(initialData.content?.ar || '');
      setDate(initialData.date || '');
      setReadTimeEn(initialData.readTime?.en || '5 min read');
      setReadTimeAr(initialData.readTime?.ar || 'قراءة 5 دقائق');
      const rawAuthorEn = typeof initialData.author === 'string' ? initialData.author : initialData.author?.en;
      const rawAuthorAr = typeof initialData.author === 'string' ? initialData.author : initialData.author?.ar;
      setAuthorEn(rawAuthorEn || 'Faisal Al-Otaibi');
      setAuthorAr(rawAuthorAr || 'فيصل العتيبي');
      setAuthorRoleEn(initialData.authorRole?.en || 'Senior Real Estate Strategist');
      setAuthorRoleAr(initialData.authorRole?.ar || 'كبير المستشارين الاستراتيجيين');
      setAuthorAvatar(initialData.authorAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80');
      setImage(initialData.image || '');
      setStatus(initialData.status || 'published');
      setFeatured(initialData.featured ?? false);
      setTags(initialData.tags || ['Vision 2030', 'Luxury Real Estate', 'Eastern Province']);
    } else {
      // Defaults
      const todayFormatted = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      setTitleEn('Eastern Province Real Estate Outlook 2026: Capital Inflows & Waterfront Demand');
      setTitleAr('آفاق السوق العقاري بالمنطقة الشرقية 2026: تدفقات رؤوس الأموال والطلب على الواجهات البحرية');
      setSlug(`article-${Date.now()}`);
      setExcerptEn('An in-depth review of institutional demand, legislative maturity under REGA & FAL, and luxury yield trajectories across Khobar and Dammam.');
      setExcerptAr('قراءة معمقة في حركة الاستثمار المؤسسي وتنامي عوائد الأصول الفاخرة بالمنطقة الشرقية وفق مستهدفات رؤية 2030.');
      setCategoryEn('Market Intelligence');
      setCategoryAr('تقارير وتحليلات السوق');
      setContentEn(`The Saudi Eastern Province continues to emerge as a powerhouse for ultra-luxury residential developments and institutional real estate capital. 

Driven by strategic infrastructure expansions and the Saudi Vision 2030 quality-of-life program, cities such as Al Khobar and Dammam are capturing unprecedented interest from regional high-net-worth investors.

### Key Catalysts Driving 2026 Growth:
1. **Accelerated Infrastructure Connectivity:** Major waterfront masterplans and expressway expansions.
2. **Regulatory Assurance:** Enhanced escrow security and transparent contracts via certified REGA platforms.
3. **Sustained Rental Yields:** Prime residential portfolios demonstrating 8.5% to 10.2% net yield stability.

Investors allocating capital towards premium coastal assets are experiencing strong capital appreciation alongside robust long-term tenant retention.`);
      setContentAr(`تواصل المنطقة الشرقية ترسيخ مكانتها كمركز ثقل اقتصادي واستثماري بارز في القطاع العقاري بالمملكة، مدفوعة بطلب متنامٍ على المشاريع السكنية الفاخرة والمجمعات الذكية متعددة الاستخدامات.

وتعكس المؤشرات نمواً متسارعاً في وتيرة المشاريع التطويرية الكبرى بالخُبر والدمام بفضل مبادرات جودة الحياة والبيئة التشريعية المحفزة الصادرة من الهيئة العامة للعقار.

### أبرز محركات السوق في عام 2026:
1. **تطوير الواجهات البحرية:** إطلاق مشروعات نوعية توفر جودة حياة راقية ونمط عيش ساحلي فريد.
2. **الضمانات الاستثمارية:** تطبيق أعلى معايير الشفافية وحماية حقوق المستثمرين عبر حسابات الضمان.
3. **عوائد الإيجار المرتفعة:** استقرار العوائد الاستثمارية الصافية في النطاقات المميزة بين 8.5% و 10.5%.`);
      setDate(todayFormatted);
      setReadTimeEn('6 min read');
      setReadTimeAr('قراءة 6 دقائق');
      setAuthorEn('Faisal Al-Otaibi');
      setAuthorAr('فيصل العتيبي');
      setAuthorRoleEn('Chief Investment Officer');
      setAuthorRoleAr('رئيس الاستثمار العقاري');
      setAuthorAvatar('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80');
      setImage('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80');
      setStatus('published');
      setFeatured(true);
      setTags(['Vision 2030', 'Al Khobar', 'Market Trends', 'Investment']);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: Partial<BlogPost> = {
        title: { en: titleEn, ar: titleAr },
        slug: slug || `article-${Date.now()}`,
        excerpt: { en: excerptEn, ar: excerptAr },
        category: { en: categoryEn, ar: categoryAr },
        content: { en: contentEn, ar: contentAr },
        date: date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        readTime: { en: readTimeEn, ar: readTimeAr },
        author: { en: authorEn, ar: authorAr },
        authorRole: { en: authorRoleEn, ar: authorRoleAr },
        authorAvatar,
        image: image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
        status,
        featured,
        tags,
      };

      await onSave(payload);
      onClose();
    } catch (err) {
      console.error('Error saving blog post:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs: { id: TabType; labelEn: string; labelAr: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'details', labelEn: '1. Article Details', labelAr: '١. تفاصيل المقال', icon: FileText },
    { id: 'content', labelEn: '2. Full Content Body', labelAr: '٢. محتوى المقال والتحليل', icon: BookOpen },
    { id: 'author', labelEn: '3. Author & Metadata', labelAr: '٣. الكاتب والوسوم', icon: User },
    { id: 'media', labelEn: '4. Featured Image', labelAr: '٤. الغلاف والوسائط', icon: ImageIcon },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div
        dir={isAr ? 'rtl' : 'ltr'}
        className="bg-white w-full max-w-4xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display-serif">
                {initialData
                  ? isAr ? 'تعديل المقال والتقرير' : 'Edit Market Insight'
                  : isAr ? 'كتابة مقال / تقرير جديد' : 'New Market Insight Article'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isAr
                  ? 'المحرر الرقمي لنشر أبحاث السوق، الرؤى العقارية، ومقالات المدونة'
                  : 'Editorial publisher for market intelligence, investor guides, and news'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 flex gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'border-blue-600 text-blue-600 bg-white shadow-2xs'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{isAr ? tab.labelAr : tab.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: DETAILS */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {isAr ? 'عنوان المقال (English)' : 'Article Title (English)'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Eastern Province Real Estate Outlook 2026"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {isAr ? 'عنوان المقال (العربية)' : 'Article Title (Arabic)'} *
                  </label>
                  <input
                    type="text"
                    required
                    dir="rtl"
                    value={titleAr}
                    onChange={(e) => setTitleAr(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                    placeholder="مثال: آفاق السوق العقاري بالمنطقة الشرقية 2026"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {isAr ? 'تصنيف المقال (EN)' : 'Category (English)'}
                  </label>
                  <select
                    value={categoryEn}
                    onChange={(e) => {
                      setCategoryEn(e.target.value);
                      if (e.target.value === 'Market Intelligence') setCategoryAr('تقارير وتحليلات السوق');
                      else if (e.target.value === 'Investment Guide') setCategoryAr('أدلة المستثمرين');
                      else if (e.target.value === 'Regulations & Compliance') setCategoryAr('اللوائح والتنظيمات');
                      else setCategoryAr(e.target.value);
                    }}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold"
                  >
                    <option value="Market Intelligence">Market Intelligence</option>
                    <option value="Investment Guide">Investment Guide</option>
                    <option value="Regulations & Compliance">Regulations & Compliance</option>
                    <option value="Luxury Living">Luxury Living</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {isAr ? 'حالة النشر' : 'Publish Status'}
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as BlogStatus)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    <option value="published">{isAr ? 'منشور للعامة (Published & Live)' : 'Published & Live'}</option>
                    <option value="draft">{isAr ? 'مسودة قيد التحرير (Draft)' : 'Draft / Internal'}</option>
                    <option value="archived">{isAr ? 'مؤرشف (Archived)' : 'Archived'}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {isAr ? 'تاريخ النشر' : 'Publish Date'}
                  </label>
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                    placeholder="e.g. October 14, 2026"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {isAr ? 'المقتطف والمقدمة (English Excerpt)' : 'Short Excerpt (English)'}
                </label>
                <textarea
                  rows={2}
                  value={excerptEn}
                  onChange={(e) => setExcerptEn(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  placeholder="Summary of the article..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {isAr ? 'المقتطف والمقدمة (العربية)' : 'Short Excerpt (Arabic)'}
                </label>
                <textarea
                  rows={2}
                  dir="rtl"
                  value={excerptAr}
                  onChange={(e) => setExcerptAr(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  placeholder="ملخص المقال ومحاوره الأساسية..."
                />
              </div>

              {/* Featured toggle */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      {isAr ? 'تثبيت كمقال رئيسي مميز (Featured Article)' : 'Feature at Top of Blog'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {isAr ? 'عرض المقال في الصدارة كقراءة موصى بها' : 'Promote this market insight at the top of the blog grid'}
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB 2: FULL CONTENT BODY */}
          {activeTab === 'content' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  {isAr
                    ? 'المحرر يدعم التنسيق النصي والعناوين وعناصر القوائم (Markdown & Rich Paragraphs)'
                    : 'Full bilingual article text. Supports Markdown headings (#, ##), bullet points, and quotes.'}
                </p>
                <button
                  type="button"
                  onClick={() => setPreviewContentMode(!previewContentMode)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{previewContentMode ? (isAr ? 'إخفاء المعاينة' : 'Hide Preview') : (isAr ? 'معاينة القراءة' : 'Live Preview')}</span>
                </button>
              </div>

              {previewContentMode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 max-h-96 overflow-y-auto">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">English Preview</span>
                    <div className="prose prose-sm text-slate-800 whitespace-pre-line text-xs font-sans">
                      {contentEn}
                    </div>
                  </div>
                  <div className="space-y-2 border-t md:border-t-0 md:border-s md:ps-4 border-slate-200" dir="rtl">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">المعاينة بالعربية</span>
                    <div className="prose prose-sm text-slate-800 whitespace-pre-line text-xs font-sans">
                      {contentAr}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      {isAr ? 'نص المقال الكامل (English)' : 'Full Article Body (English)'} *
                    </label>
                    <textarea
                      rows={8}
                      required
                      value={contentEn}
                      onChange={(e) => setContentEn(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 leading-relaxed"
                      placeholder="Write full article body in English..."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      {isAr ? 'نص المقال الكامل (العربية)' : 'Full Article Body (Arabic)'} *
                    </label>
                    <textarea
                      rows={8}
                      required
                      dir="rtl"
                      value={contentAr}
                      onChange={(e) => setContentAr(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 leading-relaxed"
                      placeholder="اكتب نص المقال والتحليل الكامل بالعربية..."
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: AUTHOR & METADATA */}
          {activeTab === 'author' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {isAr ? 'اسم الكاتب (EN)' : 'Author Name (English)'}
                  </label>
                  <input
                    type="text"
                    value={authorEn}
                    onChange={(e) => setAuthorEn(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                    placeholder="e.g. Faisal Al-Otaibi"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {isAr ? 'اسم الكاتب (عربي)' : 'Author Name (Arabic)'}
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={authorAr}
                    onChange={(e) => setAuthorAr(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                    placeholder="مثال: فيصل العتيبي"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {isAr ? 'المسمى الوظيفي للكاتب (EN)' : 'Author Role (English)'}
                  </label>
                  <input
                    type="text"
                    value={authorRoleEn}
                    onChange={(e) => setAuthorRoleEn(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                    placeholder="Chief Investment Officer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {isAr ? 'مدة القراءة المقدرة (EN)' : 'Estimated Read Time'}
                  </label>
                  <input
                    type="text"
                    value={readTimeEn}
                    onChange={(e) => {
                      setReadTimeEn(e.target.value);
                      if (!readTimeAr) setReadTimeAr(e.target.value);
                    }}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                    placeholder="5 min read"
                  />
                </div>
              </div>

              {/* Tags Manager */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700">
                  {isAr ? 'وسوم المقال والكلمات المفتاحية (SEO Tags)' : 'SEO & Topic Tags'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="e.g. Vision 2030, Waterfronts..."
                    className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3.5 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-700 cursor-pointer"
                  >
                    {isAr ? 'إضافة وسم' : 'Add Tag'}
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold"
                    >
                      <Tag className="w-3 h-3 text-blue-500" />
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-red-600 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Author Avatar Upload */}
              <div className="pt-3 border-t border-slate-100">
                <CMSImageUpload
                  value={authorAvatar}
                  onChange={(val) => setAuthorAvatar(val)}
                  language={language}
                  label={isAr ? 'صورة الكاتب الشخصية (Author Avatar)' : 'Author Avatar & Photo'}
                  aspectRatio="avatar"
                  presets={[
                    { label: 'Analyst 1', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
                    { label: 'Analyst 2', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80' },
                    { label: 'Research Lead', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80' },
                  ]}
                />
              </div>
            </div>
          )}

          {/* TAB 4: MEDIA */}
          {activeTab === 'media' && (
            <div className="space-y-4">
              <CMSImageUpload
                value={image}
                onChange={(newVal) => setImage(newVal)}
                language={language}
                label={isAr ? 'صورة الغلاف الرئيسية للمقال' : 'Featured Cover Image'}
                description={isAr ? 'تظهر في أعلى المقال وبطاقة المدونة' : 'Displayed on blog cards and hero header'}
                aspectRatio="video"
                required
              />
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shadow-blue-900/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? isAr ? 'جاري الحفظ...' : 'Saving...'
                    : isAr ? 'حفظ ونشر المقال' : 'Save & Publish Article'}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
