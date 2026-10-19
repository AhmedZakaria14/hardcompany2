import React, { useState, useEffect } from 'react';
import {
  Building,
  Layers,
  BookOpen,
  Users,
  Plus,
  ArrowUpRight,
  Star,
  CheckCircle2,
  Calendar,
  Sparkles,
  MapPin,
  Clock,
  Award,
  MailCheck,
  FileEdit,
  Filter,
  History,
  Info,
  ChevronRight,
  AlertCircle,
  PieChart,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { Property, Project, BlogPost, Testimonial, JoinListSubscriber, Language } from '../types';
import { LeadRecord } from '../lib/integrations/crmSync';
import { FirestoreAppointment } from '../lib/appointments/appointmentService';
import {
  MetricDateRange,
  computeDashboardMetrics,
  fetchCmsDraftsCount,
  fetchRevisionsCount,
  subscribeAppointmentsMetrics,
} from '../lib/cms/dashboardMetricsService';

interface CMSDashboardProps {
  properties: Property[];
  projects: Project[];
  blogPosts: BlogPost[];
  testimonials: Testimonial[];
  subscribers: JoinListSubscriber[];
  leads: LeadRecord[];
  onNavigateToProperties: () => void;
  onNavigateToProjects: () => void;
  onNavigateToBlog: () => void;
  onNavigateToTestimonials: () => void;
  onNavigateToSubscribers: () => void;
  onNavigateToLeads: () => void;
  onNavigateToAppointments?: () => void;
  onNavigateToContent?: () => void;
  onAddProperty: () => void;
  onAddProject: () => void;
  onAddBlogPost: () => void;
  onAddTestimonial: () => void;
  onAddSubscriber: () => void;
  onSelectProperty: (property: Property) => void;
  language: Language;
}

export const CMSDashboard: React.FC<CMSDashboardProps> = ({
  properties,
  projects,
  blogPosts,
  testimonials,
  subscribers,
  leads,
  onNavigateToProperties,
  onNavigateToProjects,
  onNavigateToBlog,
  onNavigateToTestimonials,
  onNavigateToSubscribers,
  onNavigateToLeads,
  onNavigateToAppointments,
  onNavigateToContent,
  onAddProperty,
  onAddProject,
  onAddBlogPost,
  onAddTestimonial,
  onAddSubscriber,
  onSelectProperty,
  language,
}) => {
  const isAr = language === 'ar';

  const [dateRange, setDateRange] = useState<MetricDateRange>('all');
  const [draftsCount, setDraftsCount] = useState<number>(0);
  const [revisionsCount, setRevisionsCount] = useState<number>(0);
  const [appointments, setAppointments] = useState<FirestoreAppointment[]>([]);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState<boolean>(true);

  // Fetch real-time DB counts for drafts, revisions, and appointments
  useEffect(() => {
    let unsubscribeAppointments: (() => void) | null = null;

    async function loadDbMetrics() {
      setIsLoadingMetrics(true);
      try {
        const [dCount, rCount] = await Promise.all([
          fetchCmsDraftsCount(),
          fetchRevisionsCount(),
        ]);
        setDraftsCount(dCount);
        setRevisionsCount(rCount);
      } catch (err) {
        console.warn('Failed to load DB metric counts:', err);
      } finally {
        setIsLoadingMetrics(false);
      }
    }

    loadDbMetrics();

    // Subscribe to live appointment status updates
    unsubscribeAppointments = subscribeAppointmentsMetrics((appts) => {
      setAppointments(appts);
    });

    return () => {
      if (unsubscribeAppointments) unsubscribeAppointments();
    };
  }, []);

  // Compute aggregated database metrics
  const metrics = computeDashboardMetrics({
    properties,
    projects,
    blogPosts,
    testimonials,
    subscribers,
    leads,
    appointments,
    draftsCount,
    revisionsCount,
    dateRange,
  });

  const recentProperties = properties.slice(0, 4);
  const recentLeads = leads.slice(0, 4);

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* 1. EXECUTIVE WELCOME BANNER */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="absolute top-0 end-0 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAr ? 'مؤشرات الإدارة والعمليات الفيلية المباشرة' : 'Live Database Operations & Metrics'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display-serif">
              {isAr ? 'مرحباً بك في لوحة تحكم هارد العقارية' : 'HARD Group Executive CMS Dashboard'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {isAr
                ? 'متابعة مباشرة للطلبات، المواعيد، الأرشيف، المسودات، وإحصائيات القطاعات المستخرجة مباشرة من قاعدة البيانات.'
                : 'Real-time monitoring of customer inquiries, scheduled viewings, active drafts, and sector breakdown derived from live database records.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onAddProperty}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-sky-400 hover:brightness-110 active:scale-95 text-white text-xs font-bold rounded-2xl shadow-lg shadow-blue-900/40 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'إدراج عقار' : 'New Property'}</span>
            </button>

            <button
              onClick={onAddProject}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:brightness-110 active:scale-95 text-white text-xs font-bold rounded-2xl shadow-lg shadow-purple-900/40 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'مشروع جديد' : 'New Project'}</span>
            </button>

            <button
              onClick={onAddSubscriber}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-bold rounded-2xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'مشترك جديد' : 'New Subscriber'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. METRIC DATE RANGE FILTER & DISCIPLINE DEFINITION */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold text-slate-800">
            {isAr ? 'نطاق تصفية البيانات والمؤشرات:' : 'Metric Time Horizon:'}
          </span>
          <div className="inline-flex p-1 bg-slate-100 rounded-xl gap-1">
            {(
              [
                { id: 'all', labelEn: 'All Time', labelAr: 'الكل' },
                { id: '30d', labelEn: 'Last 30 Days', labelAr: 'آخر 30 يوماً' },
                { id: '90d', labelEn: 'Last 90 Days', labelAr: 'الربع الحالي' },
                { id: 'ytd', labelEn: 'Year to Date', labelAr: 'منذ بداية العام' },
              ] as { id: MetricDateRange; labelEn: string; labelAr: string }[]
            ).map((opt) => (
              <button
                key={opt.id}
                onClick={() => setDateRange(opt.id)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  dateRange === opt.id
                    ? 'bg-white text-blue-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isAr ? opt.labelAr : opt.labelEn}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span>
            {isAr
              ? 'تعتمد جميع الأرقام على السجلات المباشرة في قاعدة البيانات دون افتراضات مبيعات غير معتمدة.'
              : 'All stats are derived from direct Firestore collection counts and verified events.'}
          </span>
        </div>
      </div>

      {/* 3. CORE OPERATIONAL METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Pending Inquiries & Requests */}
        <div
          onClick={onNavigateToLeads}
          className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-3 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-indigo-600 transition-colors">
              {isAr ? 'طلبات العملاء والاستفسارات' : 'Inquiries & Leads'}
            </span>
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-black text-slate-900 font-display-serif">
              {metrics.totalLeads}
            </div>
            {metrics.pendingLeads > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-extrabold animate-pulse">
                {metrics.pendingLeads} {isAr ? 'قيد المتابعة' : 'Pending'}
              </span>
            )}
          </div>

          <div className="space-y-1 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <div className="flex justify-between">
              <span>{isAr ? 'جديدة وقيد المتابعة:' : 'New & In Progress:'}</span>
              <span className="font-bold text-indigo-700">{metrics.pendingLeads}</span>
            </div>
            <div className="flex justify-between">
              <span>{isAr ? 'تم التواصل والتأهيل:' : 'Contacted / Qualified:'}</span>
              <span className="font-bold text-emerald-700">{metrics.contactedLeads}</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Scheduled Appointments */}
        <div
          onClick={onNavigateToAppointments || onNavigateToLeads}
          className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-3 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-sky-600 transition-colors">
              {isAr ? 'مواعيد المعاينة المجدولة' : 'Viewing Appointments'}
            </span>
            <div className="w-9 h-9 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-black text-slate-900 font-display-serif">
              {metrics.totalAppointments}
            </div>
            {metrics.pendingAppointments > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-xs font-extrabold">
                {metrics.pendingAppointments} {isAr ? 'بانتظار التأكيد' : 'Unconfirmed'}
              </span>
            )}
          </div>

          <div className="space-y-1 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <div className="flex justify-between">
              <span>{isAr ? 'مواعيد مؤكدة:' : 'Confirmed:'}</span>
              <span className="font-bold text-emerald-600">{metrics.confirmedAppointments}</span>
            </div>
            <div className="flex justify-between">
              <span>{isAr ? 'مكتملة المزارة:' : 'Completed Visits:'}</span>
              <span className="font-bold text-blue-600">{metrics.completedAppointments}</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Published Entities vs Active CMS Drafts */}
        <div
          onClick={onNavigateToContent || onNavigateToProperties}
          className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-3 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-emerald-600 transition-colors">
              {isAr ? 'المحتوى المنشور والمسودات' : 'Published & Drafts'}
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileEdit className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-black text-slate-900 font-display-serif">
              {metrics.publishedProperties + metrics.publishedProjects + metrics.publishedBlogPosts}
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-extrabold">
              {metrics.totalCmsDrafts} {isAr ? 'مسودة نشطة' : 'Drafts'}
            </span>
          </div>

          <div className="space-y-1 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <div className="flex justify-between">
              <span>{isAr ? 'عقارات ومشاريع حية:' : 'Live Catalog Assets:'}</span>
              <span className="font-bold text-slate-800">
                {metrics.publishedProperties + metrics.publishedProjects}
              </span>
            </div>
            <div className="flex justify-between">
              <span>{isAr ? 'نسخ تاريخية مؤرشفة:' : 'Revision Snapshots:'}</span>
              <span className="font-bold text-amber-600">{metrics.totalRevisionSnapshots}</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Portfolio Catalog Value */}
        <div
          onClick={onNavigateToProperties}
          className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-3 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-blue-600 transition-colors">
              {isAr ? 'تقييم الكتالوج المدرج' : 'Listed Asset Portfolio'}
            </span>
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
          </div>

          <div className="text-2xl font-black text-slate-900 font-display-serif">
            {(metrics.totalListedSarValuation / 1000000).toFixed(1)}M SAR
          </div>

          <div className="space-y-1 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <div className="flex justify-between">
              <span>{isAr ? 'إجمالي الأصول المدرجة:' : 'Total Listed Assets:'}</span>
              <span className="font-bold text-blue-700">{metrics.publishedProperties}</span>
            </div>
            <div className="flex justify-between">
              <span>{isAr ? 'المشتركون بالخدمة:' : 'Subscribers:'}</span>
              <span className="font-bold text-sky-600">{metrics.activeSubscribers}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. SECTOR-SPECIFIC INVENTORY & ASSET BREAKDOWN */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 font-display-serif flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-600" />
              <span>{isAr ? 'توزيع مخزون الأصول حسب القطاع' : 'Sector Inventory & Portfolio Breakdown'}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {isAr
                ? 'تفصيل المخزون المتاح، الوحدات، وقيمة الأصول المدرجة لكل قطاع استثماري'
                : 'Inventory counts, unit availability, and catalog valuation per sector category'}
            </p>
          </div>

          <button
            onClick={onNavigateToProperties}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>{isAr ? 'استعراض كل القطاعات' : 'View Full Catalog'}</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {metrics.sectors.map((sec) => (
            <div
              key={sec.sectorId}
              className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2 hover:bg-white hover:shadow-xs transition-all"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>{isAr ? sec.labelAr : sec.labelEn}</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px]">
                  {sec.count} {isAr ? 'أصل' : 'Assets'}
                </span>
              </div>

              <div className="text-base font-extrabold text-slate-900">
                {(sec.listedSarValue / 1000000).toFixed(1)}M SAR
              </div>

              <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200/60">
                <span>{isAr ? 'قيمة الكتالوج' : 'Listed Sar Value'}</span>
                {sec.unitsCount ? (
                  <span className="font-semibold text-purple-700">{sec.unitsCount} {isAr ? 'وحدة' : 'Units'}</span>
                ) : (
                  <span className="font-semibold text-emerald-700">{isAr ? 'جاهز' : 'Ready'}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. RECENT ACTIVITY FEEDS & CMS SHORTCUTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Property Inventory & Recent Inquiries */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Properties */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-slate-900 font-display-serif">
                  {isAr ? 'أحدث العقارات المدرجة في الكتالوج' : 'Latest Property Catalog Additions'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isAr ? 'آخر العقارات التي تم اعتمادها ونشرها' : 'Most recently published verified assets'}
                </p>
              </div>
              <button
                onClick={onNavigateToProperties}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                <span>{isAr ? 'إدارة العقارات' : 'Manage All'}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {recentProperties.map((prop) => (
                <div
                  key={prop.id}
                  onClick={() => onSelectProperty(prop)}
                  className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/80 px-2 rounded-2xl transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                      <img
                        src={prop.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&q=80'}
                        alt={prop.title?.en || 'Property'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {isAr ? (prop.title?.ar || prop.title?.en) : (prop.title?.en || prop.title?.ar)}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-blue-500" />
                          {isAr ? (prop.location?.city?.ar || prop.location?.city?.en || 'الخبر') : (prop.location?.city?.en || prop.location?.city?.ar || 'Khobar')}
                        </span>
                        <span>•</span>
                        <span className="capitalize">{prop.type}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-end shrink-0">
                    <div className="text-xs font-extrabold text-blue-700">
                      {prop.price.sar.toLocaleString()} SAR
                    </div>
                    <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      prop.status === 'for-sale' ? 'bg-emerald-50 text-emerald-700' : 'bg-sky-50 text-sky-700'
                    }`}>
                      {prop.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Customer Inquiries */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-slate-900 font-display-serif">
                  {isAr ? 'أحدث استفسارات العملاء قيد المعالجة' : 'Recent Inquiries & Requests'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isAr ? 'طلبات التواصل الواردة عبر النماذج' : 'Inquiries submitted through public forms'}
                </p>
              </div>
              <button
                onClick={onNavigateToLeads}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <span>{isAr ? 'مركز الطلبات' : 'All Leads'}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentLeads.length > 0 ? (
              <div className="space-y-2.5">
                {recentLeads.map((lead) => (
                  <div
                    key={lead.id}
                    onClick={onNavigateToLeads}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-colors flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{lead.name}</span>
                        <span className="text-[10px] font-medium text-slate-500">({lead.phone})</span>
                      </div>
                      <p className="text-[11px] text-slate-600 truncate">{(lead as any).interestNote || lead.message || lead.email}</p>
                    </div>

                    <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      lead.status === 'new'
                        ? 'bg-amber-100 text-amber-800'
                        : lead.status === 'contacted'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {lead.status || 'new'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                {isAr ? 'لا توجد طلبات جديدة حالياً' : 'No recent inquiries submitted yet.'}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Quick CMS Operational Shortcuts & Guidance */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-display-serif">
              {isAr ? 'اختصارات العمليات والتحرير' : 'Quick CMS Modules'}
            </h3>

            <div className="space-y-2.5">
              <button
                onClick={onNavigateToProperties}
                className="w-full p-3.5 rounded-2xl bg-blue-50/80 hover:bg-blue-100 border border-blue-200 text-blue-900 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <Building className="w-4 h-4 text-blue-600" />
                  {isAr ? 'كتالوج العقارات والأصول' : 'Properties Catalog'}
                </span>
                <span className="px-2.5 py-0.5 bg-blue-200 text-blue-900 rounded-full text-[10px] font-extrabold">
                  {properties.length}
                </span>
              </button>

              <button
                onClick={onNavigateToProjects}
                className="w-full p-3.5 rounded-2xl bg-purple-50/80 hover:bg-purple-100 border border-purple-200 text-purple-900 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-purple-600" />
                  {isAr ? 'المشاريع والتطوير المخطط' : 'Development Projects'}
                </span>
                <span className="px-2.5 py-0.5 bg-purple-200 text-purple-900 rounded-full text-[10px] font-extrabold">
                  {projects.length}
                </span>
              </button>

              <button
                onClick={onNavigateToBlog}
                className="w-full p-3.5 rounded-2xl bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  {isAr ? 'المدونة والتقارير العقارية' : 'Blog & Market Reports'}
                </span>
                <span className="px-2.5 py-0.5 bg-emerald-200 text-emerald-900 rounded-full text-[10px] font-extrabold">
                  {blogPosts.length}
                </span>
              </button>

              <button
                onClick={onNavigateToLeads}
                className="w-full p-3.5 rounded-2xl bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-indigo-600" />
                  {isAr ? 'مركز طلبات واستفسارات العملاء' : 'Leads & Form Inquiries'}
                </span>
                <span className="px-2.5 py-0.5 bg-indigo-200 text-indigo-900 rounded-full text-[10px] font-extrabold">
                  {leads.length}
                </span>
              </button>
            </div>
          </div>

          {/* Operational Policy & Integrity Reminder */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{isAr ? 'سياسات التحرير والنشر' : 'Editorial & Safety Discipline'}</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {isAr
                ? 'يتم حظر حذف العناصر ذات الإشارات النشطة، مع خيار الأرشفة واستعادة المسودات عبر سلة المهملات.'
                : 'Direct hard deletions are safeguarded with reference checks. Content can be safely archived to the Trash Bin.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
