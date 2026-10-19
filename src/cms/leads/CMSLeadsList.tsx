import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  Building,
  CheckCircle2,
  Clock,
  ExternalLink,
  Download,
  Filter,
  ShieldAlert,
  AlertCircle,
  RefreshCw,
  Plus,
  Layers,
  Wrench,
  HelpCircle,
  TrendingUp,
  Tag,
  FileText,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Language } from '../../types';
import { canManageLeads } from '../../types/firestore-schema';
import { FirestoreLead, subscribeToLeads } from '../../lib/leads/leadService';
import { exportCustomerLeadsCsvSafely } from '../../lib/cms/customerRetentionService';
import { CMSLeadDetailModal } from './CMSLeadDetailModal';
import { CMSCustomerRetentionModal } from './CMSCustomerRetentionModal';

interface CMSLeadsListProps {
  leads?: any[];
  language: Language;
  currentAdminUser?: { name: string; email: string; role: string };
}

export const CMSLeadsList: React.FC<CMSLeadsListProps> = ({
  language,
  currentAdminUser,
}) => {
  const isAr = language === 'ar';
  const userRole = currentAdminUser?.role || 'superadmin';
  const hasAccess = canManageLeads(userRole);

  // Firestore live state
  const [firestoreLeads, setFirestoreLeads] = useState<FirestoreLead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Selected lead for modal detail view
  const [selectedLead, setSelectedLead] = useState<FirestoreLead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRetentionModalOpen, setIsRetentionModalOpen] = useState(false);

  // Filter States
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [formTypeFilter, setFormTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [customDateFrom, setCustomDateFrom] = useState<string>('');
  const [customDateTo, setCustomDateTo] = useState<string>('');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [propertyFilter, setPropertyFilter] = useState<string>('');
  const [projectFilter, setProjectFilter] = useState<string>('');
  const [assignedFilter, setAssignedFilter] = useState<string>('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Subscribe to real-time Firestore leads
  useEffect(() => {
    if (!hasAccess) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToLeads(
      (data) => {
        setFirestoreLeads(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Failed to subscribe to leads:', err);
        setError(err?.message || 'Firestore connection issue');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [hasAccess]);

  // Filter Logic
  const filteredLeads = firestoreLeads.filter((item) => {
    // 1. Search Query
    if (search.trim()) {
      const q = search.toLowerCase();
      const nameMatch = (item.fullName || item.name || '').toLowerCase().includes(q);
      const emailMatch = (item.email || '').toLowerCase().includes(q);
      const phoneMatch = (item.phone || '').includes(q);
      const trackingMatch = (item.trackingCode || '').toLowerCase().includes(q);
      const entityMatch = (item.entityTitle || '').toLowerCase().includes(q);
      const msgMatch = (item.message || '').toLowerCase().includes(q);
      if (!nameMatch && !emailMatch && !phoneMatch && !trackingMatch && !entityMatch && !msgMatch) {
        return false;
      }
    }

    // 2. Sector Filter
    if (sectorFilter !== 'all' && item.sector !== sectorFilter) return false;

    // 3. Form Type Filter
    if (formTypeFilter !== 'all' && item.formType !== formTypeFilter) return false;

    // 4. Status Filter
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;

    // 5. Date Filter
    if (dateFilter !== 'all') {
      const itemDate = new Date(item.createdAt);
      const now = new Date();

      if (dateFilter === 'today') {
        const isToday =
          itemDate.getDate() === now.getDate() &&
          itemDate.getMonth() === now.getMonth() &&
          itemDate.getFullYear() === now.getFullYear();
        if (!isToday) return false;
      } else if (dateFilter === 'last_7_days') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        if (itemDate < sevenDaysAgo) return false;
      } else if (dateFilter === 'last_30_days') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        if (itemDate < thirtyDaysAgo) return false;
      } else if (dateFilter === 'custom') {
        if (customDateFrom) {
          const from = new Date(customDateFrom);
          if (itemDate < from) return false;
        }
        if (customDateTo) {
          const to = new Date(customDateTo);
          to.setHours(23, 59, 59, 999);
          if (itemDate > to) return false;
        }
      }
    }

    // 6. Service Option Filter
    if (serviceFilter !== 'all') {
      const detailsService = item.details?.service || item.details?.serviceType || '';
      if (!detailsService.toLowerCase().includes(serviceFilter.toLowerCase())) return false;
    }

    // 7. Property Filter
    if (propertyFilter.trim()) {
      const qProp = propertyFilter.toLowerCase();
      const titleMatch = (item.entityTitle || '').toLowerCase().includes(qProp);
      const idMatch = (item.entityId || '').toLowerCase().includes(qProp);
      if (!titleMatch && !idMatch) return false;
    }

    // 8. Project Filter
    if (projectFilter.trim()) {
      const qProj = projectFilter.toLowerCase();
      const titleMatch = (item.entityTitle || '').toLowerCase().includes(qProj);
      const idMatch = (item.entityId || '').toLowerCase().includes(qProj);
      if (!titleMatch && !idMatch) return false;
    }

    // 9. Assigned Staff Member Filter
    if (assignedFilter !== 'all') {
      if (assignedFilter === 'unassigned') {
        if (item.assignedTo || item.assignedToName) return false;
      } else {
        const staffMatch =
          (item.assignedTo || '').toLowerCase() === assignedFilter.toLowerCase() ||
          (item.assignedToName || '').toLowerCase().includes(assignedFilter.toLowerCase());
        if (!staffMatch) return false;
      }
    }

    return true;
  });

  // Pagination Math
  const totalItems = filteredLeads.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Summary Metrics
  const totalCount = firestoreLeads.length;
  const newCount = firestoreLeads.filter((l) => l.status === 'new').length;
  const contactedCount = firestoreLeads.filter(
    (l) => l.status === 'contacted' || l.status === 'qualified' || l.status === 'under_negotiation'
  ).length;
  const closedCount = firestoreLeads.filter((l) => l.status === 'closed').length;
  const overdueCount = firestoreLeads.filter(
    (l) =>
      l.followUpDate &&
      new Date(l.followUpDate).getTime() < new Date().setHours(0, 0, 0, 0) &&
      l.status !== 'closed' &&
      l.status !== 'archived'
  ).length;

  const handleExportCSV = async () => {
    const res = await exportCustomerLeadsCsvSafely(filteredLeads, {
      name: currentAdminUser?.name || 'Admin',
      email: currentAdminUser?.email || 'admin@hard.sa',
      role: userRole,
    });
    if (!res.success) {
      alert(res.message);
    }
  };

  const handleOpenLeadModal = (lead: FirestoreLead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  // RBAC Access Restriction View
  if (!hasAccess) {
    return (
      <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-xs text-center space-y-4 max-w-2xl mx-auto my-12 animate-in fade-in">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">
          {isAr ? 'الصلاحيات غير كافية للدخول' : 'Access Restricted: Lead Management Required'}
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
          {isAr
            ? 'عذراً، يتطلب عرض طلبات العملاء واستفساراتهم الخاصة صلاحيات مسؤول طلبات (Lead Manager) أو مدير النشر (Publisher) لحماية بيانات العملاء.'
            : 'Accessing customer inquiries and private operational leads requires Lead Manager or Super Administrator permissions to safeguard client information.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Metric Dashboard Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        {/* Total */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            {isAr ? 'إجمالي الطلبات' : 'Total Leads'}
          </span>
          <div className="flex items-center justify-between">
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
              {totalCount}
            </span>
            <Users className="w-5 h-5 text-slate-400" />
          </div>
        </div>

        {/* New Action Required */}
        <div className="bg-blue-50/70 p-4 rounded-3xl border border-blue-200/80 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block flex items-center gap-1">
            <span>{isAr ? 'طلبات جديدة' : 'New Inbound'}</span>
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
          </span>
          <div className="flex items-center justify-between">
            <span className="text-xl sm:text-2xl font-black text-blue-900 font-mono">
              {newCount}
            </span>
            <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full">
              {isAr ? 'جديد' : 'NEW'}
            </span>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-amber-50/70 p-4 rounded-3xl border border-amber-200/80 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
            {isAr ? 'قيد المتابعة والتفاوض' : 'In Progress'}
          </span>
          <div className="flex items-center justify-between">
            <span className="text-xl sm:text-2xl font-black text-amber-900 font-mono">
              {contactedCount}
            </span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
        </div>

        {/* Closed */}
        <div className="bg-emerald-50/70 p-4 rounded-3xl border border-emerald-200/80 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
            {isAr ? 'ناجحة / محولة' : 'Closed / Converted'}
          </span>
          <div className="flex items-center justify-between">
            <span className="text-xl sm:text-2xl font-black text-emerald-900 font-mono">
              {closedCount}
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
        </div>

        {/* Overdue Follow ups */}
        <div className="bg-rose-50/70 p-4 rounded-3xl border border-rose-200/80 shadow-2xs space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
            {isAr ? 'متابعة متأخرة' : 'Overdue Follow-ups'}
          </span>
          <div className="flex items-center justify-between">
            <span className="text-xl sm:text-2xl font-black text-rose-900 font-mono">
              {overdueCount}
            </span>
            <AlertCircle className="w-5 h-5 text-rose-500" />
          </div>
        </div>
      </div>

      {/* Multi-Dimensional Filter Controls */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        {/* Row 1: Search Bar & Primary Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute top-3.5 start-3.5" />
            <input
              type="text"
              placeholder={
                isAr
                  ? 'ابحث باسم العميل، الرقم، البريد، كود التتبع، أو العقار...'
                  : 'Search client name, phone, email, tracking code, or property...'
              }
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full ps-10 pe-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsRetentionModalOpen(true)}
              className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/80 text-xs font-bold rounded-2xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
            >
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>{isAr ? 'حماية البيانات وسياسة الاحتفاظ' : 'Retention & Privacy Governance'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-2xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>{isAr ? 'تصدير CSV مَحمِي' : 'Export CSV (Protected)'}</span>
            </button>
          </div>
        </div>

        {/* Row 2: Sector, Form Type, Status, Date Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 pt-2 border-t border-slate-100">
          {/* Sector */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              {isAr ? 'القطاع' : 'Sector'}
            </label>
            <select
              value={sectorFilter}
              onChange={(e) => {
                setSectorFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white cursor-pointer"
            >
              <option value="all">{isAr ? 'جميع القطاعات' : 'All Sectors'}</option>
              <option value="portal">{isAr ? 'البوابة العامة' : 'Portal'}</option>
              <option value="realestate">{isAr ? 'العقارات' : 'Real Estate'}</option>
              <option value="construction">{isAr ? 'المقاولات' : 'Construction'}</option>
              <option value="hvac">{isAr ? 'التكييف HVAC' : 'HVAC'}</option>
            </select>
          </div>

          {/* Form Type */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              {isAr ? 'نوع النموذج' : 'Form Type'}
            </label>
            <select
              value={formTypeFilter}
              onChange={(e) => {
                setFormTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white cursor-pointer"
            >
              <option value="all">{isAr ? 'جميع النماذج' : 'All Forms'}</option>
              <option value="general_contact">{isAr ? 'اتصال عام' : 'General Contact'}</option>
              <option value="property_inquiry">{isAr ? 'استفسار عقاري' : 'Property Inquiry'}</option>
              <option value="list_property">{isAr ? 'عرض عقار' : 'List Property'}</option>
              <option value="valuation_request">{isAr ? 'طلب تقييم' : 'Valuation Request'}</option>
              <option value="book_viewing">{isAr ? 'حجز معاينة' : 'Book Viewing'}</option>
              <option value="project_inquiry">{isAr ? 'استفسار مشروع' : 'Project Inquiry'}</option>
              <option value="construction_quote">{isAr ? 'تسعير بناء' : 'Construction Quote'}</option>
              <option value="hvac_service">{isAr ? 'خدمات تكييف' : 'HVAC Service'}</option>
              <option value="newsletter_signup">{isAr ? 'النشرة البريدية' : 'Newsletter'}</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              {isAr ? 'الحالة' : 'Status'}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white cursor-pointer"
            >
              <option value="all">{isAr ? 'جميع الحالات' : 'All Statuses'}</option>
              <option value="new">{isAr ? 'جديد (New)' : 'New'}</option>
              <option value="contacted">{isAr ? 'تم التواصل' : 'Contacted'}</option>
              <option value="qualified">{isAr ? 'مؤهل للشراء' : 'Qualified'}</option>
              <option value="under_negotiation">{isAr ? 'قيد التفاوض' : 'Under Negotiation'}</option>
              <option value="closed">{isAr ? 'مغلق / محول' : 'Closed'}</option>
              <option value="archived">{isAr ? 'مؤرشف' : 'Archived'}</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              {isAr ? 'الفترة الزمنية' : 'Date Range'}
            </label>
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white cursor-pointer"
            >
              <option value="all">{isAr ? 'الكل' : 'All Time'}</option>
              <option value="today">{isAr ? 'اليوم' : 'Today'}</option>
              <option value="last_7_days">{isAr ? 'آخر 7 أيام' : 'Last 7 Days'}</option>
              <option value="last_30_days">{isAr ? 'آخر 30 يوم' : 'Last 30 Days'}</option>
              <option value="custom">{isAr ? 'مخصص' : 'Custom'}</option>
            </select>
          </div>

          {/* Service Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              {isAr ? 'الخدمة' : 'Service'}
            </label>
            <select
              value={serviceFilter}
              onChange={(e) => {
                setServiceFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white cursor-pointer"
            >
              <option value="all">{isAr ? 'الكل' : 'All Services'}</option>
              <option value="chiller">{isAr ? 'مبردات Chiller' : 'Chiller Maintenance'}</option>
              <option value="duct">{isAr ? 'دكت التكييف' : 'Ducting'}</option>
              <option value="interior">{isAr ? 'التصميم الداخلي' : 'Interior'}</option>
              <option value="turnkey">{isAr ? 'تسليم مفتاح' : 'Turnkey'}</option>
              <option value="valuation">{isAr ? 'التقييم' : 'Valuation'}</option>
            </select>
          </div>

          {/* Property Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              {isAr ? 'العقار المعني' : 'Property'}
            </label>
            <input
              type="text"
              placeholder={isAr ? 'عنوان/معرف' : 'Title/ID'}
              value={propertyFilter}
              onChange={(e) => {
                setPropertyFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            />
          </div>

          {/* Project Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              {isAr ? 'المشروع' : 'Project'}
            </label>
            <input
              type="text"
              placeholder={isAr ? 'اسم المشروع' : 'Project Title'}
              value={projectFilter}
              onChange={(e) => {
                setProjectFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            />
          </div>

          {/* Assigned Staff */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              {isAr ? 'الموظف المعين' : 'Assigned Staff'}
            </label>
            <select
              value={assignedFilter}
              onChange={(e) => {
                setAssignedFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white cursor-pointer"
            >
              <option value="all">{isAr ? 'الكل' : 'All Staff'}</option>
              <option value="unassigned">{isAr ? 'غير معين' : 'Unassigned'}</option>
              <option value="faisal">{isAr ? 'فيصل العتيبي' : 'Faisal Al-Otaibi'}</option>
              <option value="sarah">{isAr ? 'سارة أحمد' : 'Sarah Ahmed'}</option>
            </select>
          </div>
        </div>

        {/* Custom Date Pickers */}
        {dateFilter === 'custom' && (
          <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-bold">{isAr ? 'من:' : 'From:'}</span>
              <input
                type="date"
                value={customDateFrom}
                onChange={(e) => setCustomDateFrom(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              />
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-bold">{isAr ? 'إلى:' : 'To:'}</span>
              <input
                type="date"
                value={customDateTo}
                onChange={(e) => setCustomDateTo(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Leads Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400 text-xs space-y-3">
            <RefreshCw className="w-8 h-8 mx-auto text-blue-600 animate-spin" />
            <p>{isAr ? 'جاري تحميل الطلبات بضمان المزامنة الحية من Firestore...' : 'Connecting live to Cloud Firestore...'}</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-rose-600 text-xs space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto text-rose-500" />
            <p>{error}</p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-16 text-center text-slate-400 text-xs space-y-2">
            <Users className="w-10 h-10 mx-auto text-slate-300" />
            <p className="font-bold text-slate-600">
              {isAr ? 'لا توجد طلبات مطابقة للمعايير المحددة' : 'No matching inquiries found'}
            </p>
            <p className="text-[11px]">
              {isAr ? 'جرب تعديل خيارات التصفية أو البحث' : 'Try adjusting your search query or filter options.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4 text-start">{isAr ? 'رمز التتبع / العميل' : 'Tracking & Client'}</th>
                  <th className="py-3.5 px-3 text-start">{isAr ? 'التواصل' : 'Contact'}</th>
                  <th className="py-3.5 px-3 text-start">{isAr ? 'القطاع والنموذج' : 'Sector & Form'}</th>
                  <th className="py-3.5 px-3 text-start">{isAr ? 'العقار / الجهة' : 'Target Entity'}</th>
                  <th className="py-3.5 px-3 text-center">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="py-3.5 px-3 text-start">{isAr ? 'المعين' : 'Assigned Staff'}</th>
                  <th className="py-3.5 px-4 text-end">{isAr ? 'التاريخ' : 'Date'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {paginatedLeads.map((item) => {
                  const isNew = item.status === 'new';
                  const isOverdue =
                    item.followUpDate &&
                    new Date(item.followUpDate).getTime() < new Date().setHours(0, 0, 0, 0) &&
                    item.status !== 'closed' &&
                    item.status !== 'archived';

                  return (
                    <tr
                      key={item.id}
                      onClick={() => handleOpenLeadModal(item)}
                      className={`hover:bg-blue-50/50 transition-colors cursor-pointer ${
                        isNew ? 'bg-blue-50/20 border-s-4 border-s-blue-600' : ''
                      }`}
                    >
                      {/* Tracking Code & Client Name */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                            {item.trackingCode}
                          </span>
                          {isNew && (
                            <span className="px-1.5 py-0.2 bg-blue-600 text-white text-[9px] font-bold rounded-full animate-pulse">
                              NEW
                            </span>
                          )}
                        </div>
                        <span className="font-bold text-slate-900 block mt-1 text-xs">
                          {item.fullName || item.name}
                        </span>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3.5 px-3 whitespace-nowrap space-y-0.5">
                        <div className="flex items-center gap-1.5 text-blue-600 font-mono text-[11px] dir-ltr text-start">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{item.phone || '-'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px] truncate max-w-[160px]">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{item.email}</span>
                        </div>
                      </td>

                      {/* Sector & Form Type */}
                      <td className="py-3.5 px-3 whitespace-nowrap space-y-1">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-bold uppercase tracking-wider block w-fit">
                          {item.sector}
                        </span>
                        <span className="text-slate-500 text-[11px] font-mono block uppercase">
                          {item.formType.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Target Entity */}
                      <td className="py-3.5 px-3 max-w-[180px]">
                        <span className="text-slate-800 font-semibold line-clamp-1 text-xs">
                          {item.entityTitle || (isAr ? 'استفسار عام' : 'General Inquiry')}
                        </span>
                        {item.message && (
                          <span className="text-slate-400 text-[11px] truncate block">
                            {item.message}
                          </span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                            item.status === 'new'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : item.status === 'contacted'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : item.status === 'qualified'
                              ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                              : item.status === 'under_negotiation'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : item.status === 'closed'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* Assigned Staff */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-xs">
                        {item.assignedToName || item.assignedTo ? (
                          <span className="font-semibold text-slate-800 text-[11px]">
                            {item.assignedToName || item.assignedTo}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">
                            {isAr ? 'غير معين' : 'Unassigned'}
                          </span>
                        )}
                        {isOverdue && (
                          <span className="block text-[9px] text-rose-600 font-bold">
                            {isAr ? 'متابعة متأخرة' : 'Overdue'}
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-end text-slate-400 text-[11px] whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && filteredLeads.length > 0 && (
          <div className="bg-slate-50 p-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
            {/* Left: Info */}
            <div className="flex items-center gap-3">
              <span>
                {isAr
                  ? `عرض ${Math.min((currentPage - 1) * pageSize + 1, totalItems)} - ${Math.min(
                      currentPage * pageSize,
                      totalItems
                    )} من أصل ${totalItems} طلب`
                  : `Showing ${Math.min((currentPage - 1) * pageSize + 1, totalItems)} to ${Math.min(
                      currentPage * pageSize,
                      totalItems
                    )} of ${totalItems} leads`}
              </span>

              {/* Items per page selector */}
              <div className="flex items-center gap-1.5 ms-2">
                <span className="text-[11px] text-slate-400">{isAr ? 'لكل صفحة:' : 'Per page:'}</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 bg-white border border-slate-200 rounded-lg font-semibold text-xs cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            {/* Right: Page Navigation Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{isAr ? 'السابق' : 'Prev'}</span>
              </button>

              <span className="px-3 py-1.5 bg-blue-50 text-blue-800 font-bold rounded-xl border border-blue-200">
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <span>{isAr ? 'التالي' : 'Next'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lead Details Modal */}
      {selectedLead && (
        <CMSLeadDetailModal
          lead={selectedLead}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedLead(null);
          }}
          language={language}
          currentAdminEmail={currentAdminUser?.email || 'admin@hard.sa'}
        />
      )}

      {/* Customer Data Retention & Governance Modal */}
      <CMSCustomerRetentionModal
        isOpen={isRetentionModalOpen}
        onClose={() => setIsRetentionModalOpen(false)}
        leads={firestoreLeads}
        language={language}
        currentAdminUser={{
          name: currentAdminUser?.name || 'Admin',
          email: currentAdminUser?.email || 'admin@hard.sa',
          role: userRole,
        }}
      />
    </div>
  );
};
