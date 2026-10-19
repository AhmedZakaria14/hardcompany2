import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  Building,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldAlert,
  Send,
  Plus,
  Tag,
  RefreshCw,
  AlertCircle,
  FileText,
  UserCheck,
  Globe,
  Sparkles,
  Layers,
  Wrench,
  HelpCircle,
  TrendingUp,
  Paperclip,
  Download,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react';
import { Language } from '../../types';
import { deleteCustomerRequestAndAttachments } from '../../lib/cms/customerRetentionService';
import {
  FirestoreLead,
  updateLeadStatus,
  assignLeadStaff,
  setLeadFollowUpDate,
  addLeadInternalNote,
  triggerLeadCrmSync,
} from '../../lib/leads/leadService';
import {
  subscribeToNotificationLogs,
  retryLeadNotification,
} from '../../lib/notifications/notificationService';
import { NotificationLogDoc } from '../../lib/notifications/notificationTypes';

interface CMSLeadDetailModalProps {
  lead: FirestoreLead;
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  currentAdminEmail: string;
  onLeadUpdated?: () => void;
}

export const CMSLeadDetailModal: React.FC<CMSLeadDetailModalProps> = ({
  lead,
  isOpen,
  onClose,
  language,
  currentAdminEmail,
  onLeadUpdated,
}) => {
  if (!isOpen) return null;

  const isAr = language === 'ar';
  const [activeTab, setActiveTab] = useState<'details' | 'notes' | 'history'>('details');

  // Form states for updates
  const [selectedStatus, setSelectedStatus] = useState<FirestoreLead['status']>(lead.status || 'new');
  const [assignedEmail, setAssignedEmail] = useState(lead.assignedTo || '');
  const [assignedName, setAssignedName] = useState(lead.assignedToName || '');
  const [followUpDate, setFollowUpDate] = useState(lead.followUpDate || '');
  const [newNoteText, setNewNoteText] = useState('');
  const [statusNoteText, setStatusNoteText] = useState('');

  // Loading / Feedback states
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingAssign, setIsUpdatingAssign] = useState(false);
  const [isUpdatingFollowUp, setIsUpdatingFollowUp] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isSyncingCrm, setIsSyncingCrm] = useState(false);
  const [isRetryingNotification, setIsRetryingNotification] = useState(false);
  const [notificationLogs, setNotificationLogs] = useState<NotificationLogDoc[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Subscribe to private notification logs for this lead
  React.useEffect(() => {
    if (!isOpen || !lead.id) return;
    const unsub = subscribeToNotificationLogs(lead.id, (logs) => {
      setNotificationLogs(logs);
    });
    return () => unsub();
  }, [isOpen, lead.id]);

  const handleRetryNotification = async () => {
    setIsRetryingNotification(true);
    const res = await retryLeadNotification(lead.id, currentAdminEmail);
    setIsRetryingNotification(false);
    if (res.success) {
      showFeedback('success', isAr ? 'تم إعادة إرسال الإشعار بنجاح' : 'Notification re-sent successfully');
      if (onLeadUpdated) onLeadUpdated();
    } else {
      showFeedback('error', res.error || (isAr ? 'فشل إعادة الإرسال - تحقق من إعدادات مزود الخدمة' : 'Failed to re-send notification - check provider config'));
    }
  };

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleStatusChange = async (newStatus: FirestoreLead['status']) => {
    setIsUpdatingStatus(true);
    setSelectedStatus(newStatus);
    const ok = await updateLeadStatus(lead.id, lead, newStatus, currentAdminEmail, statusNoteText);
    setIsUpdatingStatus(false);
    if (ok) {
      setStatusNoteText('');
      showFeedback('success', isAr ? 'تم تحديث حالة الطلب بنجاح' : 'Status updated successfully');
      if (onLeadUpdated) onLeadUpdated();
    } else {
      showFeedback('error', isAr ? 'تعذر تحديث الحالة' : 'Failed to update status');
    }
  };

  const handleAssignSave = async () => {
    setIsUpdatingAssign(true);
    const ok = await assignLeadStaff(lead.id, lead, assignedEmail, assignedName, currentAdminEmail);
    setIsUpdatingAssign(false);
    if (ok) {
      showFeedback('success', isAr ? 'تم تعيين الموظف بنجاح' : 'Staff assigned successfully');
      if (onLeadUpdated) onLeadUpdated();
    } else {
      showFeedback('error', isAr ? 'تعذر تعيين الموظف' : 'Failed to assign staff');
    }
  };

  const handleFollowUpSave = async () => {
    setIsUpdatingFollowUp(true);
    const ok = await setLeadFollowUpDate(lead.id, followUpDate, currentAdminEmail);
    setIsUpdatingFollowUp(false);
    if (ok) {
      showFeedback('success', isAr ? 'تم حفظ تاريخ المتابعة' : 'Follow-up date saved');
      if (onLeadUpdated) onLeadUpdated();
    } else {
      showFeedback('error', isAr ? 'تعذر حفظ التاريخ' : 'Failed to save date');
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    setIsAddingNote(true);
    const ok = await addLeadInternalNote(lead.id, lead, newNoteText, currentAdminEmail);
    setIsAddingNote(false);
    if (ok) {
      setNewNoteText('');
      showFeedback('success', isAr ? 'تم إضافة الملاحظة الداخلية' : 'Note added successfully');
      if (onLeadUpdated) onLeadUpdated();
    } else {
      showFeedback('error', isAr ? 'تعذر إضافة الملاحظة' : 'Failed to add note');
    }
  };

  const handleCrmSync = async () => {
    setIsSyncingCrm(true);
    const res = await triggerLeadCrmSync(lead, currentAdminEmail);
    setIsSyncingCrm(false);
    if (res.success) {
      showFeedback('success', isAr ? `تم الربط بنظام CRM: ${res.crmRef}` : `Synced to CRM: ${res.crmRef}`);
      if (onLeadUpdated) onLeadUpdated();
    } else {
      showFeedback('error', isAr ? 'فشلت المزامنة مع CRM' : 'CRM sync failed');
    }
  };

  const isFollowUpOverdue = lead.followUpDate
    ? new Date(lead.followUpDate).getTime() < new Date().setHours(0, 0, 0, 0)
    : false;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div
        dir={isAr ? 'rtl' : 'ltr'}
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl overflow-hidden my-auto flex flex-col max-h-[90vh]"
      >
        {/* Header Bar */}
        <div className="bg-slate-950 text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950/80 px-2.5 py-0.5 rounded-full border border-blue-800">
                  {lead.trackingCode}
                </span>
                <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                  {lead.sector}
                </span>
                {lead.status === 'new' && (
                  <span className="px-2 py-0.5 bg-blue-500 text-white rounded-full text-[10px] font-bold animate-pulse">
                    NEW
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
                {lead.fullName || lead.name}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert Toast */}
        {feedbackMessage && (
          <div
            className={`px-6 py-3 text-xs font-semibold flex items-center gap-2 shrink-0 ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-b border-rose-200'
            }`}
          >
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
        )}

        {/* Modal Navigation Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2 flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'details'
                ? 'bg-white text-blue-600 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {isAr ? 'تفاصيل الطلب والبيانات' : 'Request Details'}
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'notes'
                ? 'bg-white text-blue-600 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{isAr ? 'الملاحظات الداخلية' : 'Internal Notes'}</span>
            {lead.internalNotes && lead.internalNotes.length > 0 && (
              <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded-full text-[10px]">
                {lead.internalNotes.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-white text-blue-600 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{isAr ? 'سجل التغييرات والحالة' : 'Status History'}</span>
            {lead.statusHistory && lead.statusHistory.length > 0 && (
              <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-full text-[10px]">
                {lead.statusHistory.length}
              </span>
            )}
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: DETAILS */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Status & Quick Action Controls */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Status Selector */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                    {isAr ? 'حالة الطلب الحالية' : 'Lead Processing Status'}
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedStatus}
                      onChange={(e) => handleStatusChange(e.target.value as any)}
                      disabled={isUpdatingStatus}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
                    >
                      <option value="new">{isAr ? 'جديد (New)' : 'New Inbound'}</option>
                      <option value="contacted">{isAr ? 'تم التواصل (Contacted)' : 'Contacted'}</option>
                      <option value="qualified">{isAr ? 'مؤهل لشراء/خدمة (Qualified)' : 'Qualified'}</option>
                      <option value="under_negotiation">{isAr ? 'قيد التفاوض (Under Negotiation)' : 'Under Negotiation'}</option>
                      <option value="closed">{isAr ? 'مغلق / ناجح (Closed / Converted)' : 'Closed / Converted'}</option>
                      <option value="archived">{isAr ? 'مؤرشف (Archived)' : 'Archived'}</option>
                    </select>
                  </div>
                </div>

                {/* Follow-up Date */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 flex items-center justify-between">
                    <span>{isAr ? 'موعد المتابعة القادم' : 'Follow-Up Date'}</span>
                    {isFollowUpOverdue && (
                      <span className="text-[10px] text-rose-600 font-bold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {isAr ? 'متأخر' : 'Overdue'}
                      </span>
                    )}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleFollowUpSave}
                      disabled={isUpdatingFollowUp}
                      className="px-3 py-2 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
                    >
                      {isAr ? 'حفظ' : 'Save'}
                    </button>
                  </div>
                </div>

                {/* CRM Sync State */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                    {isAr ? 'حالة الربط بـ CRM' : 'CRM Integration'}
                  </label>
                  <div className="flex items-center gap-2">
                    {lead.crmSynced ? (
                      <div className="flex-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between">
                        <span className="truncate">{lead.crmReferenceId || 'Synced'}</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      </div>
                    ) : (
                      <button
                        onClick={handleCrmSync}
                        disabled={isSyncingCrm}
                        className="w-full px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCrm ? 'animate-spin' : ''}`} />
                        <span>{isAr ? 'مزامنة مع CRM الآن' : 'Sync to CRM'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* SERVER NOTIFICATION & APPROVED RECIPIENT DISPATCH STATUS */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4 text-blue-600" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      {isAr ? 'حالة إشعارات الخادم والمتلقين المعتمدين' : 'Server Notifications & Approved Dispatch'}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    {lead.notificationStatus === 'delivered' ? (
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{isAr ? 'تم الإرسال بنجاح' : 'Delivered'}</span>
                      </span>
                    ) : lead.notificationStatus === 'unconfigured' ? (
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                        <span>{isAr ? 'مزود الخدمة غير مفعل' : 'Provider Unconfigured'}</span>
                      </span>
                    ) : lead.notificationStatus === 'failed' ? (
                      <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full text-[10px] font-bold flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3 text-rose-600" />
                        <span>{isAr ? 'فشل الإرسال' : 'Dispatch Failed'}</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-[10px] font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{isAr ? 'قيد الانتظار' : 'Pending'}</span>
                      </span>
                    )}

                    <button
                      onClick={handleRetryNotification}
                      disabled={isRetryingNotification}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRetryingNotification ? 'animate-spin' : ''}`} />
                      <span>{isAr ? 'إعادة المحاولة' : 'Retry Dispatch'}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">
                      {isAr ? 'المستلمون المعتمدون (Approved Recipients)' : 'Approved Recipients'}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {notificationLogs.length > 0 && notificationLogs[0].approvedRecipients ? (
                        notificationLogs[0].approvedRecipients.map((rec, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-mono text-[11px] border border-slate-200">
                            {rec}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">
                          {isAr ? 'يتم التوجيه حسب القطاع تلقائياً (sales@hardgroup.sa)' : 'Auto-routed by sector (sales@hardgroup.sa)'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">
                      {isAr ? 'مزود الخدمة والقناة' : 'Provider & Channel'}
                    </span>
                    <span className="font-semibold text-slate-800">
                      {lead.notificationProvider || (notificationLogs[0]?.providerUsed) || (isAr ? 'غير محدد' : 'Standard Gateway')}
                    </span>
                    {lead.notificationLastAttemptAt && (
                      <span className="block text-[10px] text-slate-400 mt-0.5">
                        {isAr ? 'آخر محاولة:' : 'Last attempt:'} {new Date(lead.notificationLastAttemptAt).toLocaleString(isAr ? 'ar-SA' : 'en-US')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Error Banner if Notification Failed or Unconfigured */}
                {(lead.notificationError || (notificationLogs[0]?.lastError)) && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-rose-900">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{isAr ? 'سبب عدم اكتمال الإشعار:' : 'Notification Issue Detail:'}</span>
                    </div>
                    <p className="text-[11px] text-rose-700 font-mono leading-relaxed">
                      {lead.notificationError || notificationLogs[0]?.lastError}
                    </p>
                  </div>
                )}

                {/* Audit Trail List */}
                {notificationLogs.length > 0 && notificationLogs[0].auditTrail && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block mb-2 uppercase tracking-wider">
                      {isAr ? 'سجل المحاولات والإرسال (Audit Trail)' : 'Notification Attempt Audit Log'}
                    </span>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto font-mono text-[11px]">
                      {notificationLogs[0].auditTrail.map((entry, idx) => (
                        <div key={idx} className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-slate-700">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${entry.action === 'delivered' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            <span className="font-bold text-slate-900">{entry.action.toUpperCase()}</span>
                            <span className="text-slate-400">({entry.provider})</span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Staff Assignment Box */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    <span>{isAr ? 'الموظف المسؤول عن المتابعة' : 'Assigned Staff Member'}</span>
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">
                      {isAr ? 'اسم الموظف' : 'Staff Name'}
                    </label>
                    <input
                      type="text"
                      placeholder={isAr ? 'مثال: فيصل العتيبي' : 'e.g. Faisal Al-Otaibi'}
                      value={assignedName}
                      onChange={(e) => setAssignedName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">
                      {isAr ? 'البريد الإلكتروني' : 'Staff Email'}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="email"
                        placeholder="faisal@hard.sa"
                        value={assignedEmail}
                        onChange={(e) => setAssignedEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={handleAssignSave}
                        disabled={isUpdatingAssign}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
                      >
                        {isAr ? 'تخصيص' : 'Assign'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Contact & Metadata Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Contact Info */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                    {isAr ? 'بيانات العميل والتواصل' : 'Customer Contact Details'}
                  </h4>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <User className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block">
                          {isAr ? 'الاسم الكامل' : 'Full Name'}
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          {lead.fullName || lead.name}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <span className="text-[10px] text-slate-400 font-bold block">
                          {isAr ? 'رقم الهاتف' : 'Phone Number'}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5 dir-ltr justify-end sm:justify-start">
                          <span className="text-xs font-mono font-bold text-blue-600">
                            {lead.phone}
                          </span>
                          {lead.phone && (
                            <a
                              href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-md text-[10px] font-bold transition-colors flex items-center gap-1"
                            >
                              <span>WhatsApp</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Mail className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block">
                          {isAr ? 'البريد الإلكتروني' : 'Email Address'}
                        </span>
                        <a
                          href={`mailto:${lead.email}`}
                          className="text-xs font-medium text-blue-600 hover:underline"
                        >
                          {lead.email}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Globe className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block">
                          {isAr ? 'اللغة وطريقة التواصل' : 'Language & Preferred Method'}
                        </span>
                        <span className="text-xs font-medium text-slate-700 capitalize">
                          {lead.language?.toUpperCase() || 'EN'} • {lead.preferredContactMethod || 'WhatsApp'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Technical & Meta Details */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                    {isAr ? 'تفاصيل النموذج والواجهة' : 'Form & System Metadata'}
                  </h4>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">{isAr ? 'نوع النموذج' : 'Form Type'}:</span>
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg uppercase text-[11px]">
                        {lead.formType}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">{isAr ? 'القطاع' : 'Sector'}:</span>
                      <span className="font-bold text-slate-800 capitalize">{lead.sector}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">{isAr ? 'إصدار المخطط (Schema)' : 'Schema Version'}:</span>
                      <span className="font-mono text-slate-600">{lead.schemaVersion || '1.0.0'}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">{isAr ? 'تاريخ التقديم' : 'Submission Timestamp'}:</span>
                      <span className="text-slate-600 font-medium">
                        {new Date(lead.createdAt).toLocaleString()}
                      </span>
                    </div>

                    {lead.entityTitle && (
                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-[10px] text-slate-400 font-bold block">
                          {isAr ? 'العقار / المشروع المعني' : 'Associated Entity / Target'}
                        </span>
                        <span className="text-xs font-bold text-slate-900 line-clamp-2 mt-0.5">
                          {lead.entityTitle}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Private Customer Form Attachments */}
              {lead.attachments && lead.attachments.length > 0 && (
                <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-emerald-600" />
                      <span>
                        {isAr
                          ? `المرفقات الخاصة والمستندات (${lead.attachments.length})`
                          : `Private Customer Attachments (${lead.attachments.length})`}
                      </span>
                    </h4>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold">
                      {isAr ? 'وصول مقيد للمصرح لهم' : 'Restricted Staff Access'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {lead.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="bg-white p-3 rounded-xl border border-emerald-200/80 shadow-2xs flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          {att.mimeType?.startsWith('image/') ? (
                            <ImageIcon className="w-5 h-5 text-emerald-600 shrink-0" />
                          ) : (
                            <FileText className="w-5 h-5 text-rose-600 shrink-0" />
                          )}
                          <div className="truncate">
                            <p className="text-xs font-bold text-slate-800 truncate dir-ltr">{att.fileName}</p>
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
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shrink-0"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{isAr ? 'تنزيل' : 'Download'}</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  {isAr ? 'نص الرسالة أو الطلب' : 'Message Payload & Inbound Payload'}
                </h4>
                <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {lead.message || (isAr ? 'لا يوجد نص رسالة مضاف' : 'No custom message body provided.')}
                </div>

                {lead.details && Object.keys(lead.details).length > 0 && (
                  <div className="pt-3">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">
                      {isAr ? 'الحقول الإضافية والمواصفات' : 'Custom Field Parameters'}
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {Object.entries(lead.details).map(([k, v]) => (
                        <div key={k} className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                          <span className="text-[10px] text-slate-400 block font-mono capitalize">{k}:</span>
                          <span className="font-bold text-slate-800 truncate block">
                            {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: INTERNAL NOTES */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <label className="block text-xs font-bold text-slate-800">
                  {isAr ? 'إضافة ملاحظة جديدة لهذا الطلب' : 'Add Internal Operational Note'}
                </label>
                <textarea
                  rows={3}
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder={
                    isAr
                      ? 'اكتب تفاصيل المتابعة الهاتفية أو الملاحظات الداخلية هنا...'
                      : 'Write follow-up notes, phone call summaries, or action items...'
                  }
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                ></textarea>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isAddingNote || !newNoteText.trim()}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isAr ? 'إضافة الملاحظة' : 'Add Note'}</span>
                  </button>
                </div>
              </form>

              {/* Notes Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  {isAr ? 'الملاحظات المعتمدة سابقاً' : 'Historical Notes'}
                </h4>

                {!lead.internalNotes || lead.internalNotes.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <MessageSquare className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                    <p>{isAr ? 'لا توجد ملاحظات داخلية مضافة بعد' : 'No internal notes recorded yet'}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {lead.internalNotes.map((note) => (
                      <div key={note.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-100 pb-2">
                          <span className="font-bold text-slate-800">{note.author}</span>
                          <span>{new Date(note.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-xs font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">
                          {note.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: STATUS HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                {isAr ? 'سجل التغييرات ومراحل معالجة الطلب' : 'Status Transition History Log'}
              </h4>

              {!lead.statusHistory || lead.statusHistory.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Clock className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                  <p>{isAr ? 'لا توجد تغييرات مسجلة على الحالة بعد' : 'No status transition logs available'}</p>
                </div>
              ) : (
                <div className="relative ps-6 space-y-4 before:absolute before:start-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {lead.statusHistory.map((item) => (
                    <div key={item.id} className="relative bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
                      <div className="absolute -start-6 top-4 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white" />
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-mono text-[10px] uppercase font-bold">
                            {item.fromStatus}
                          </span>
                          <span className="text-slate-400">→</span>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md font-mono text-[10px] uppercase font-bold">
                            {item.toStatus}
                          </span>
                        </div>
                        <span className="text-slate-400 text-[10px]">
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-slate-700">
                        {item.note || (isAr ? 'تم تعديل الحالة بواسطة المسؤول' : 'Status updated by manager')}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        By: {item.changedBy}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={async () => {
              const confirmMsg = isAr
                ? `هل أنت أكتأد من حذف الطلب (${lead.trackingCode || lead.id}) نهائياً والمرفقات الخاصة المتعلقة به؟`
                : `Are you sure you want to permanently delete customer request (${lead.trackingCode || lead.id}) and all private attachments?`;
              if (!window.confirm(confirmMsg)) return;

              const res = await deleteCustomerRequestAndAttachments(lead, {
                email: currentAdminEmail,
                role: 'superadmin',
              });
              if (res.success) {
                if (onLeadUpdated) onLeadUpdated();
                onClose();
              } else {
                alert(res.message);
              }
            }}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>{isAr ? 'حذف السجل والمرفقات نهائياً' : 'Delete Record & Attachments'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
