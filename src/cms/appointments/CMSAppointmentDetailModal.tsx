import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  Globe,
  User,
  Mail,
  Phone,
  Building,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  History,
  FileText,
  Send,
  RefreshCw,
  XCircle,
  ShieldAlert,
  Tag,
  Info,
  Paperclip,
  Download,
  Image as ImageIcon,
} from 'lucide-react';
import {
  FirestoreAppointment,
  AppointmentStatus,
  confirmAppointmentWithTransaction,
  rescheduleAppointmentWithTransaction,
  cancelAppointment,
  completeAppointment,
  addAppointmentInternalNote,
  AppointmentConflictError,
} from '../../lib/appointments/appointmentService';
import { Language } from '../../types';

interface CMSAppointmentDetailModalProps {
  appointment: FirestoreAppointment;
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  currentUserEmail?: string;
}

export const CMSAppointmentDetailModal: React.FC<CMSAppointmentDetailModalProps> = ({
  appointment,
  isOpen,
  onClose,
  language,
  currentUserEmail = 'admin@hard.sa',
}) => {
  const isAr = language === 'ar';

  // Modal tab states
  const [activeTab, setActiveTab] = useState<'overview' | 'actions' | 'audit'>('overview');

  // Confirmation Form State
  const [confirmedDate, setConfirmedDate] = useState(
    appointment.confirmedDate || appointment.preferredDate || new Date().toISOString().split('T')[0]
  );
  const [confirmedTimeWindow, setConfirmedTimeWindow] = useState(
    appointment.confirmedTimeWindow || appointment.preferredTimeWindow || '10:00 - 12:00'
  );
  const [confirmedTimezone, setConfirmedTimezone] = useState(
    appointment.confirmedTimezone || appointment.localTimezone || 'Asia/Riyadh (UTC+3)'
  );
  const [staffName, setStaffName] = useState(appointment.assignedStaffName || '');
  const [confirmationNotes, setConfirmationNotes] = useState('');

  // Reschedule Form State
  const [rescheduleDate, setRescheduleDate] = useState(appointment.preferredDate || '');
  const [rescheduleTimeWindow, setRescheduleTimeWindow] = useState('14:00 - 17:00');
  const [rescheduleReason, setRescheduleReason] = useState('');

  // Cancel / Complete State
  const [cancelReason, setCancelReason] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');

  // Internal Notes State
  const [newNote, setNewNote] = useState('');

  // Status & Error Feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const timeSlotOptions = [
    '08:00 - 10:00',
    '10:00 - 12:00',
    '12:00 - 14:00',
    '14:00 - 16:00',
    '16:00 - 18:00',
    '18:00 - 20:00',
  ];

  const handleConfirm = async () => {
    setConflictError(null);
    setActionSuccessMessage(null);
    setIsSubmitting(true);

    try {
      await confirmAppointmentWithTransaction(
        appointment.id,
        {
          confirmedDate,
          confirmedTimeWindow,
          confirmedTimezone,
          assignedStaffName: staffName,
          notes: confirmationNotes,
        },
        currentUserEmail
      );
      setActionSuccessMessage(
        isAr
          ? 'تم تأكيد الموعد بنجاح والتحقق من عدم وجود تعارضات جدولية!'
          : 'Appointment confirmed successfully with transactional schedule verification!'
      );
      setTimeout(() => setActionSuccessMessage(null), 4000);
    } catch (err: any) {
      if (err instanceof AppointmentConflictError) {
        setConflictError(err.message);
      } else {
        setConflictError(err?.message || 'Failed to confirm appointment due to database verification error.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleDate || !rescheduleReason) {
      setConflictError(isAr ? 'يرجى تحديد التاريخ الجديد وسبب التغيير.' : 'Please select new date and specify reschedule reason.');
      return;
    }

    setConflictError(null);
    setActionSuccessMessage(null);
    setIsSubmitting(true);

    try {
      await rescheduleAppointmentWithTransaction(
        appointment.id,
        {
          newDate: rescheduleDate,
          newTimeWindow: rescheduleTimeWindow,
          timezone: confirmedTimezone,
          reason: rescheduleReason,
        },
        currentUserEmail
      );
      setActionSuccessMessage(
        isAr ? 'تم إعادة جدولة الموعد بنجاح وتحديث السجل.' : 'Appointment rescheduled successfully!'
      );
      setRescheduleReason('');
      setTimeout(() => setActionSuccessMessage(null), 4000);
    } catch (err: any) {
      if (err instanceof AppointmentConflictError) {
        setConflictError(err.message);
      } else {
        setConflictError(err?.message || 'Failed to reschedule appointment.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelReason) {
      setConflictError(isAr ? 'يرجى كتابة سبب الإلغاء.' : 'Please enter a cancellation reason.');
      return;
    }

    setConflictError(null);
    setIsSubmitting(true);

    try {
      await cancelAppointment(appointment.id, cancelReason, currentUserEmail);
      setActionSuccessMessage(isAr ? 'تم إلغاء الموعد وتوثيق ذلك في سجل التدقيق.' : 'Appointment cancelled and logged in audit trail.');
      setCancelReason('');
      setTimeout(() => setActionSuccessMessage(null), 4000);
    } catch (err: any) {
      setConflictError(err?.message || 'Failed to cancel appointment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async () => {
    setConflictError(null);
    setIsSubmitting(true);

    try {
      await completeAppointment(appointment.id, completionNotes, currentUserEmail);
      setActionSuccessMessage(isAr ? 'تم تعليم الموعد كمكتمل بنجاح!' : 'Appointment marked as completed!');
      setCompletionNotes('');
      setTimeout(() => setActionSuccessMessage(null), 4000);
    } catch (err: any) {
      setConflictError(err?.message || 'Failed to complete appointment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setIsSubmitting(true);

    try {
      await addAppointmentInternalNote(appointment.id, newNote.trim(), currentUserEmail);
      setNewNote('');
    } catch (err: any) {
      setConflictError(err?.message || 'Failed to add internal note.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {isAr ? 'مؤكد رسمياً' : 'Confirmed'}
          </span>
        );
      case 'rescheduled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <RefreshCw className="w-3.5 h-3.5" />
            {isAr ? 'معاد جدولته' : 'Rescheduled'}
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {isAr ? 'مكتمل' : 'Completed'}
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" />
            {isAr ? 'ملغى' : 'Cancelled'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            {isAr ? 'طلب جديد - قيد المراجعة' : 'Pending Review'}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div
        dir={isAr ? 'rtl' : 'ltr'}
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              {appointment.appointmentType.includes('hvac') ? (
                <Wrench className="w-5 h-5" />
              ) : (
                <Building className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {appointment.trackingCode}
                </span>
                {getStatusBadge(appointment.status)}
              </div>
              <h3 className="text-lg font-bold text-white mt-1">
                {appointment.appointmentType === 'property_viewing'
                  ? isAr ? 'معاينة عقارية ميدانية' : 'Property Viewing Appointment'
                  : appointment.appointmentType === 'hvac_maintenance'
                  ? isAr ? 'صيانة وإصلاح التكييف' : 'HVAC Maintenance Service'
                  : appointment.appointmentType === 'hvac_installation'
                  ? isAr ? 'تركيب ومعاينة نظام HVAC' : 'HVAC Installation Survey'
                  : isAr ? 'زيارة موقع وهندسة HVAC' : 'HVAC Site Inspection'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action / Success Banner */}
        {actionSuccessMessage && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/30 px-6 py-3 flex items-center gap-3 text-emerald-400 text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{actionSuccessMessage}</span>
          </div>
        )}

        {/* Conflict / Error Banner */}
        {conflictError && (
          <div className="bg-rose-500/10 border-b border-rose-500/30 px-6 py-3 flex items-center gap-3 text-rose-300 text-sm">
            <ShieldAlert className="w-5 h-5 shrink-0 text-rose-400" />
            <div className="flex-1">
              <span className="font-semibold block">{isAr ? 'تنبيه تعارض جدولي!' : 'Schedule Conflict Alert'}</span>
              <span>{conflictError}</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="px-6 bg-slate-900/50 border-b border-slate-800 flex gap-2 pt-3">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {isAr ? 'تفاصيل الموعد والعميل' : 'Overview & Details'}
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${
              activeTab === 'actions'
                ? 'border-blue-500 text-blue-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {isAr ? 'إدارة الموعد والتأكيد' : 'Manage & Schedule'}
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${
              activeTab === 'audit'
                ? 'border-blue-500 text-blue-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {isAr ? 'سجل التدقيق والتتبع' : 'Audit Trail'} ({appointment.auditTrail?.length || 0})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Requested vs Confirmed Comparison Card */}
              <div className="md:col-span-2 bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4">
                <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  {isAr ? 'مقارنة التوقيت المطلوب مقابل المؤكد' : 'Requested vs Confirmed Time Window'}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Requested Time */}
                  <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
                    <span className="text-xs font-semibold text-amber-400 block mb-1">
                      {isAr ? 'التوقيت المطلوب من العميل' : 'Requested Customer Time'}
                    </span>
                    <div className="space-y-1 text-sm text-slate-200 font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>{appointment.preferredDate || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>{appointment.preferredTimeWindow || '10:00 - 12:00'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{appointment.localTimezone || 'Asia/Riyadh (UTC+3)'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Confirmed Time */}
                  <div
                    className={`p-4 rounded-lg border ${
                      appointment.isConfirmed
                        ? 'bg-emerald-500/5 border-emerald-500/20'
                        : 'bg-slate-800/40 border-slate-700/50'
                    }`}
                  >
                    <span
                      className={`text-xs font-semibold block mb-1 ${
                        appointment.isConfirmed ? 'text-emerald-400' : 'text-slate-400'
                      }`}
                    >
                      {appointment.isConfirmed
                        ? isAr ? 'الموعد المؤكد رسمياً' : 'Officially Confirmed Schedule'
                        : isAr ? 'لم يتم التأكيد بعد' : 'Not Yet Confirmed'}
                    </span>
                    {appointment.isConfirmed ? (
                      <div className="space-y-1 text-sm text-slate-200 font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{appointment.confirmedDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{appointment.confirmedTimeWindow}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{appointment.confirmedTimezone || appointment.localTimezone}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">
                        {isAr
                          ? 'طلب الموعد ما زال ينتظر مراجعة وتأكيد موظف المبيعات أو الصيانة.'
                          : 'Pending staff review and transactional availability confirmation.'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3 text-xs text-blue-300 flex items-start gap-2.5">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-400" />
                  <span>
                    {isAr
                      ? 'ملاحظة: طلبات المواعيد الأولية لا تضمن التوفر الفوري التلقائي دون التحقق التزامني من النظام لمنع التعارضات.'
                      : 'Notice: Requested times represent customer preferences and are not final until verified and transactionally confirmed by staff.'}
                  </span>
                </div>
              </div>

              {/* Customer Info Card */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-3">
                <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-400" />
                  {isAr ? 'بيانات التواصل للعميل' : 'Customer Details'}
                </h4>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">{isAr ? 'الاسم:' : 'Name:'}</span>
                    <span className="font-semibold text-white">{appointment.customerName}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">{isAr ? 'البريد الإلكتروني:' : 'Email:'}</span>
                    <a href={`mailto:${appointment.customerEmail}`} className="text-blue-400 hover:underline">
                      {appointment.customerEmail || 'N/A'}
                    </a>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">{isAr ? 'رقم الهاتف:' : 'Phone:'}</span>
                    <a href={`tel:${appointment.customerPhone}`} className="text-blue-400 hover:underline">
                      {appointment.customerPhone || 'N/A'}
                    </a>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-400">{isAr ? 'وسيلة التواصل المفضلة:' : 'Contact Method:'}</span>
                    <span className="font-medium text-slate-200 capitalize">
                      {appointment.preferredContactMethod || 'whatsapp'}
                    </span>
                  </div>
                </div>

                {appointment.customerNotes && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80">
                    <span className="text-xs font-semibold text-slate-400 block mb-1">
                      {isAr ? 'ملاحظات العميل:' : 'Customer Notes:'}
                    </span>
                    <p className="text-xs text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      {appointment.customerNotes}
                    </p>
                  </div>
                )}
              </div>

              {/* Private Attachments Section */}
              {(appointment as any).attachments && (appointment as any).attachments.length > 0 && (
                <div className="md:col-span-2 bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-emerald-400" />
                      <span>
                        {isAr
                          ? `المرفقات والمستندات الخاصة (${(appointment as any).attachments.length})`
                          : `Private Inspection Attachments (${(appointment as any).attachments.length})`}
                      </span>
                    </h4>
                    <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/30">
                      {isAr ? 'وصول آمن للمصرح لهم' : 'Restricted Staff Access'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {((appointment as any).attachments as any[]).map((att) => (
                      <div
                        key={att.id}
                        className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          {att.mimeType?.startsWith('image/') ? (
                            <ImageIcon className="w-5 h-5 text-emerald-400 shrink-0" />
                          ) : (
                            <FileText className="w-5 h-5 text-rose-400 shrink-0" />
                          )}
                          <div className="truncate">
                            <p className="text-xs font-bold text-slate-200 truncate dir-ltr">{att.fileName}</p>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {(att.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB • {new Date(att.uploadedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <a
                          href={att.dataBase64 || att.storagePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={att.fileName}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shrink-0"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{isAr ? 'تنزيل' : 'Download'}</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-3">
                <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Tag className="w-4 h-4 text-blue-400" />
                  {isAr ? 'المرجع والمسؤول الميداني' : 'Reference & Staff Assignment'}
                </h4>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">{isAr ? 'القطاع:' : 'Sector:'}</span>
                    <span className="font-semibold text-white capitalize">{appointment.sector}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">{isAr ? 'العقار / المرجع:' : 'Reference Title:'}</span>
                    <span className="font-semibold text-blue-400">
                      {appointment.referenceTitle || 'General Site Visit'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-400">{isAr ? 'الموظف المكلف:' : 'Assigned Staff:'}</span>
                    <span className="font-medium text-slate-200">
                      {appointment.assignedStaffName || (isAr ? 'غير محدد' : 'Unassigned')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Internal Notes Section */}
              <div className="md:col-span-2 bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4">
                <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  {isAr ? 'الملاحظات والتعليقات الداخلية' : 'Internal Operational Notes'}
                </h4>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {appointment.internalNotes && appointment.internalNotes.length > 0 ? (
                    appointment.internalNotes.map((note, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
                        {note}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic">
                      {isAr ? 'لا توجد ملاحظات داخلية بعد.' : 'No internal notes recorded yet.'}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder={isAr ? 'أضف ملاحظة داخلية للفريق...' : 'Add an internal team note...'}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={isSubmitting || !newNote.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isAr ? 'إضافة' : 'Add Note'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACTIONS & SCHEDULING */}
          {activeTab === 'actions' && (
            <div className="space-y-6">
              {/* Section 1: Confirm Appointment with Transaction */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      {isAr ? 'تأكيد الموعد وقفل التوفر' : 'Confirm Appointment & Lock Schedule'}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {isAr
                        ? 'يستخدم النظام معاملة آمنة (runTransaction) لمنع التعارض التزامني وتأكيد حجز الموعد.'
                        : 'Uses Firestore transactional check to prevent conflicting confirmations.'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {isAr ? 'تاريخ الموعد المؤكد:' : 'Confirmed Date:'}
                    </label>
                    <input
                      type="date"
                      value={confirmedDate}
                      onChange={(e) => setConfirmedDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {isAr ? 'الفترة الزمنية:' : 'Time Slot:'}
                    </label>
                    <select
                      value={confirmedTimeWindow}
                      onChange={(e) => setConfirmedTimeWindow(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      {timeSlotOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {isAr ? 'الموظف المسؤول:' : 'Assigned Staff:'}
                    </label>
                    <input
                      type="text"
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                      placeholder={isAr ? 'اسم الموظف أو المهندس' : 'Staff or Engineer Name'}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isAr ? 'ملاحظة التأكيد / التعليمات:' : 'Confirmation Notes:'}
                  </label>
                  <input
                    type="text"
                    value={confirmationNotes}
                    onChange={(e) => setConfirmationNotes(e.target.value)}
                    placeholder={isAr ? 'أضف تعليمات الوصول أو تأكيد الاتصال...' : 'Add access instructions or confirmation notes...'}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleConfirm}
                    disabled={isSubmitting}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-lg text-xs flex items-center gap-2 transition-colors shadow-lg shadow-emerald-950/40"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {isAr ? 'تأكيد وحجز الموعد تزامنياً' : 'Confirm & Lock Transactional Schedule'}
                  </button>
                </div>
              </div>

              {/* Section 2: Reschedule Appointment */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-purple-400" />
                    {isAr ? 'إعادة جدولة الموعد' : 'Reschedule Appointment'}
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {isAr ? 'التاريخ الجديد:' : 'New Proposed Date:'}
                    </label>
                    <input
                      type="date"
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {isAr ? 'الفترة الزمنية الجديدة:' : 'New Time Window:'}
                    </label>
                    <select
                      value={rescheduleTimeWindow}
                      onChange={(e) => setRescheduleTimeWindow(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      {timeSlotOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isAr ? 'سبب التغيير (موثق):' : 'Reschedule Reason (Logged):'}
                  </label>
                  <input
                    type="text"
                    value={rescheduleReason}
                    onChange={(e) => setRescheduleReason(e.target.value)}
                    placeholder={isAr ? 'مثال: بطلب من العميل أو تعديل جدول المهندسين' : 'e.g. Customer request or engineer dispatch adjustment'}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleReschedule}
                    disabled={isSubmitting}
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold rounded-lg text-xs flex items-center gap-2 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    {isAr ? 'تأكيد إعادة الجدولة' : 'Confirm Reschedule'}
                  </button>
                </div>
              </div>

              {/* Section 3: Cancel or Complete */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Complete */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    {isAr ? 'إتمام المعاينة / الخدمة' : 'Complete Appointment'}
                  </h4>
                  <textarea
                    rows={2}
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    placeholder={isAr ? 'ملاحظات الزيارة والنتيجة...' : 'Outcome notes from viewing or service...'}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleComplete}
                    disabled={isSubmitting}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition-colors"
                  >
                    {isAr ? 'إغلاق الموعد كمكتمل' : 'Mark as Completed'}
                  </button>
                </div>

                {/* Cancel */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-rose-400" />
                    {isAr ? 'إلغاء الموعد' : 'Cancel Appointment'}
                  </h4>
                  <input
                    type="text"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder={isAr ? 'سبب الإلغاء...' : 'Reason for cancellation...'}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                  <button
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="w-full py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition-colors"
                  >
                    {isAr ? 'إلغاء وتوثيق الموعد' : 'Cancel Appointment'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AUDIT TRAIL */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5">
                <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <History className="w-4 h-4 text-blue-400" />
                  {isAr ? 'سجل التغييرات الموثق للأمان' : 'Security Audit Log & Changes'}
                </h4>

                <div className="relative border-s border-slate-800 ms-3 space-y-6">
                  {appointment.auditTrail && appointment.auditTrail.length > 0 ? (
                    appointment.auditTrail.map((log) => (
                      <div key={log.id} className="ms-6 relative">
                        <span className="absolute -start-[31px] top-1 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-slate-900" />
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-blue-400 uppercase tracking-wider">
                              {log.action}
                            </span>
                            <span className="text-slate-500">
                              {new Date(log.timestamp).toLocaleString(isAr ? 'ar-SA' : 'en-US')}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 font-medium">{log.notes || 'No description provided.'}</p>
                          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-800/60">
                            <span>{isAr ? 'بواسطة:' : 'By:'} {log.performedBy}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 ms-6">{isAr ? 'لا يوجد سجل تدقيق بعد.' : 'No audit entries available.'}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
