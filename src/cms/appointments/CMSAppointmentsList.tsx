import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Building,
  Wrench,
  User,
  Phone,
  Mail,
  XCircle,
  ShieldAlert,
  Download,
  Plus,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import {
  FirestoreAppointment,
  AppointmentStatus,
  AppointmentType,
  subscribeToAppointments,
} from '../../lib/appointments/appointmentService';
import { CMSAppointmentDetailModal } from './CMSAppointmentDetailModal';
import { Language } from '../../types';
import { canManageLeads, AdminRole, SectorId } from '../../types/firestore-schema';

interface CMSAppointmentsListProps {
  language: Language;
  currentAdminUser?: { name: string; email: string; role: string };
}

export const CMSAppointmentsList: React.FC<CMSAppointmentsListProps> = ({
  language,
  currentAdminUser,
}) => {
  const isAr = language === 'ar';
  const userRole = (currentAdminUser?.role || 'superadmin') as AdminRole;

  // RBAC Permission check
  const hasAccess = canManageLeads(userRole);

  const [appointments, setAppointments] = useState<FirestoreAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<SectorId | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus | 'all'>('all');
  const [selectedType, setSelectedType] = useState<AppointmentType | 'all'>('all');

  // Selected Appointment Modal
  const [selectedAppointment, setSelectedAppointment] = useState<FirestoreAppointment | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!hasAccess) return;

    setLoading(true);
    const unsubscribe = subscribeToAppointments(
      (data) => {
        setAppointments(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Failed to load appointments:', err);
        setError('Failed to sync appointment requests from database.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [hasAccess]);

  // Keep modal object in sync with updated list item
  useEffect(() => {
    if (selectedAppointment) {
      const updated = appointments.find((a) => a.id === selectedAppointment.id);
      if (updated) setSelectedAppointment(updated);
    }
  }, [appointments]);

  if (!hasAccess) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white">
          {isAr ? 'غير مصرح للوصول' : 'Access Restricted'}
        </h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          {isAr
            ? 'تستلزم إدارة المواعيد والمعاينات الحصول على صلاحيات مدير الطلبات (Lead Manager) أو المسؤول العالي (Superadmin).'
            : 'Appointment management requires Lead Manager or Superadmin privileges.'}
        </p>
      </div>
    );
  }

  // Filter Logic
  const filteredAppointments = appointments.filter((appt) => {
    if (selectedSector !== 'all' && appt.sector !== selectedSector) return false;
    if (selectedStatus !== 'all' && appt.status !== selectedStatus) return false;
    if (selectedType !== 'all' && appt.appointmentType !== selectedType) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = appt.customerName?.toLowerCase().includes(q);
      const matchEmail = appt.customerEmail?.toLowerCase().includes(q);
      const matchPhone = appt.customerPhone?.toLowerCase().includes(q);
      const matchCode = appt.trackingCode?.toLowerCase().includes(q);
      const matchRef = appt.referenceTitle?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone && !matchCode && !matchRef) return false;
    }

    return true;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage) || 1;
  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Status Metrics
  const pendingCount = appointments.filter((a) => a.status === 'pending').length;
  const confirmedCount = appointments.filter((a) => a.status === 'confirmed').length;
  const rescheduledCount = appointments.filter((a) => a.status === 'rescheduled').length;
  const completedCount = appointments.filter((a) => a.status === 'completed').length;

  const exportToCSV = () => {
    const headers = ['Tracking Code', 'Type', 'Sector', 'Customer', 'Email', 'Phone', 'Requested Date', 'Confirmed Date', 'Status'];
    const rows = filteredAppointments.map((a) => [
      a.trackingCode,
      a.appointmentType,
      a.sector,
      `"${a.customerName}"`,
      a.customerEmail,
      a.customerPhone,
      a.preferredDate,
      a.confirmedDate || 'N/A',
      a.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HARD_Appointments_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-ui-sans">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4" />
            {isAr ? 'نظام الحجوزات والمعاينات الميدانية' : 'Field Viewing & HVAC Appointments Engine'}
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'إدارة مواعيد المعاينة والصيانة' : 'Property Viewing & HVAC Appointments'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isAr
              ? 'إدارة وحجز مواعيد معاينة العقارات وزيارات صيانة التكييف الميدانية مع التحقق التزامني ضد التعارضات.'
              : 'Manage viewing schedules and technical HVAC field visits with transactional anti-conflict logic.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-2 border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            {isAr ? 'تصدير CSV' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs font-medium text-amber-400 block mb-1">
            {isAr ? 'قيد المراجعة' : 'Pending Requests'}
          </span>
          <div className="text-2xl font-bold text-white">{pendingCount}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs font-medium text-emerald-400 block mb-1">
            {isAr ? 'مؤكدة رسمياً' : 'Confirmed'}
          </span>
          <div className="text-2xl font-bold text-white">{confirmedCount}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs font-medium text-purple-400 block mb-1">
            {isAr ? 'معاد جدولتها' : 'Rescheduled'}
          </span>
          <div className="text-2xl font-bold text-white">{rescheduledCount}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs font-medium text-blue-400 block mb-1">
            {isAr ? 'مكتملة' : 'Completed'}
          </span>
          <div className="text-2xl font-bold text-white">{completedCount}</div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute start-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'بحث بالاسم، الكود، البريد، الهاتف...' : 'Search by name, code, email...'}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl ps-9 pe-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Sector Selector */}
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">{isAr ? 'جميع القطاعات' : 'All Sectors'}</option>
            <option value="realestate">{isAr ? 'العقارات والحلول السكنية' : 'Real Estate'}</option>
            <option value="hvac">{isAr ? 'التكييف والحلول الحرارية' : 'HVAC Sector'}</option>
            <option value="construction">{isAr ? 'المقاولات والإنشاءات' : 'Construction'}</option>
          </select>

          {/* Status Selector */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">{isAr ? 'جميع الحالات' : 'All Statuses'}</option>
            <option value="pending">{isAr ? 'جديد - قيد الانتظار' : 'Pending'}</option>
            <option value="confirmed">{isAr ? 'مؤكد رسمياً' : 'Confirmed'}</option>
            <option value="rescheduled">{isAr ? 'معاد جدولته' : 'Rescheduled'}</option>
            <option value="completed">{isAr ? 'مكتمل' : 'Completed'}</option>
            <option value="cancelled">{isAr ? 'ملغى' : 'Cancelled'}</option>
          </select>

          {/* Appointment Type Selector */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">{isAr ? 'جميع أنواع المواعيد' : 'All Types'}</option>
            <option value="property_viewing">{isAr ? 'معاينة عقار ميدانية' : 'Property Viewing'}</option>
            <option value="hvac_maintenance">{isAr ? 'صيانة HVAC' : 'HVAC Maintenance'}</option>
            <option value="hvac_installation">{isAr ? 'تركيب ومعاينة HVAC' : 'HVAC Installation'}</option>
            <option value="hvac_inspection">{isAr ? 'فحص موقع هندسي' : 'HVAC Inspection'}</option>
          </select>
        </div>
      </div>

      {/* Appointments Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-500" />
            <p className="text-xs">{isAr ? 'جاري مزامنة المواعيد من قاعدة البيانات...' : 'Syncing appointment records...'}</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Calendar className="w-8 h-8 mx-auto text-slate-600" />
            <p className="text-sm font-semibold text-white">{isAr ? 'لا توجد مواعيد مطابقة' : 'No matching appointments found'}</p>
            <p className="text-xs">{isAr ? 'جرب تغيير خيارات التصفية أو البحث.' : 'Try adjusting your search query or filter tags.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3.5 text-start">{isAr ? 'الكود والنوع' : 'Code & Type'}</th>
                  <th className="px-4 py-3.5 text-start">{isAr ? 'العميل والتواصل' : 'Customer'}</th>
                  <th className="px-4 py-3.5 text-start">{isAr ? 'التاريخ المطلوب' : 'Requested Slot'}</th>
                  <th className="px-4 py-3.5 text-start">{isAr ? 'التاريخ المؤكد' : 'Confirmed Slot'}</th>
                  <th className="px-4 py-3.5 text-start">{isAr ? 'المرجع' : 'Reference'}</th>
                  <th className="px-4 py-3.5 text-start">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="px-4 py-3.5 text-end">{isAr ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {paginatedAppointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="font-mono font-semibold text-blue-400 block">{appt.trackingCode}</span>
                      <span className="text-[11px] text-slate-400 capitalize">
                        {appt.appointmentType.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-white">{appt.customerName}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{appt.customerPhone}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="text-slate-200 font-medium">{appt.preferredDate}</div>
                      <div className="text-[11px] text-amber-400">{appt.preferredTimeWindow}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      {appt.isConfirmed ? (
                        <div>
                          <div className="text-emerald-400 font-medium">{appt.confirmedDate}</div>
                          <div className="text-[11px] text-emerald-300">{appt.confirmedTimeWindow}</div>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">{isAr ? 'غير مؤكد' : 'Not Confirmed'}</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-slate-300 font-medium">
                      {appt.referenceTitle || 'General Visit'}
                    </td>

                    <td className="px-4 py-3.5">
                      {appt.status === 'confirmed' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Confirmed
                        </span>
                      )}
                      {appt.status === 'pending' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Pending
                        </span>
                      )}
                      {appt.status === 'rescheduled' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          Rescheduled
                        </span>
                      )}
                      {appt.status === 'completed' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          Completed
                        </span>
                      )}
                      {appt.status === 'cancelled' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          Cancelled
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-end">
                      <button
                        onClick={() => setSelectedAppointment(appt)}
                        className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 font-semibold rounded-lg border border-blue-500/30 text-xs transition-colors"
                      >
                        {isAr ? 'تفاصيل / إدارة' : 'Manage'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {isAr
                ? `عرض الصفحة ${currentPage} من أصل ${totalPages}`
                : `Showing page ${currentPage} of ${totalPages}`}
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 disabled:opacity-40"
              >
                {isAr ? 'السابق' : 'Previous'}
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 disabled:opacity-40"
              >
                {isAr ? 'التالي' : 'Next'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Appointment Detail & Management Modal */}
      {selectedAppointment && (
        <CMSAppointmentDetailModal
          appointment={selectedAppointment}
          isOpen={Boolean(selectedAppointment)}
          onClose={() => setSelectedAppointment(null)}
          language={language}
          currentUserEmail={currentAdminUser?.email || 'admin@hard.sa'}
        />
      )}
    </div>
  );
};
