import React, { useState, useMemo } from 'react';
import {
  MailCheck,
  Plus,
  Search,
  Filter,
  Trash2,
  Download,
  Copy,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Clock,
  Send,
  UserCheck,
  MailX,
  FileSpreadsheet,
  Check,
} from 'lucide-react';
import { Language, JoinListSubscriber } from '../../types';

interface CMSJoinListProps {
  subscribers: JoinListSubscriber[];
  onAddSubscriber: () => void;
  onUpdateSubscriber: (id: string, updates: Partial<JoinListSubscriber>) => void;
  onToggleStatus: (id: string) => void;
  onDeleteSubscriber: (id: string) => void;
  onResetToDefault: () => void;
  language: Language;
}

export const CMSJoinList: React.FC<CMSJoinListProps> = ({
  subscribers,
  onAddSubscriber,
  onUpdateSubscriber,
  onToggleStatus,
  onDeleteSubscriber,
  onResetToDefault,
  language,
}) => {
  const isAr = language === 'ar';
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'unsubscribed'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState('');

  // Metrics
  const totalCount = subscribers.length;
  const activeCount = subscribers.filter((s) => s.status === 'active').length;
  const unsubscribedCount = subscribers.filter((s) => s.status === 'unsubscribed').length;

  // Filtered
  const filteredSubscribers = useMemo(() => {
    return subscribers.filter((sub) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        sub.email.toLowerCase().includes(q) ||
        (sub.notes && sub.notes.toLowerCase().includes(q)) ||
        (sub.source && sub.source.toLowerCase().includes(q));

      const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [subscribers, searchQuery, statusFilter]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Email', 'Status', 'Source', 'Date_Joined', 'Notes'];
    const rows = filteredSubscribers.map((s) => [
      s.id,
      `"${s.email}"`,
      s.status,
      `"${s.source || 'Website Footer'}"`,
      `"${new Date(s.createdAt).toLocaleString('en-US')}"`,
      `"${(s.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HARD_Join_List_Subscribers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy Single Email
  const handleCopyEmail = (id: string, email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Copy All Active Emails (comma separated)
  const handleCopyAllActive = () => {
    const activeEmails = subscribers
      .filter((s) => s.status === 'active')
      .map((s) => s.email)
      .join(', ');
    if (!activeEmails) return;
    navigator.clipboard.writeText(activeEmails);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleSaveNotes = (id: string) => {
    onUpdateSubscriber(id, { notes: notesDraft.trim() });
    setEditingNotesId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* 1. Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-semibold">{isAr ? 'إجمالي المشتركين' : 'Total Subscribers'}</p>
            <h3 className="text-2xl font-bold text-slate-900 font-display-serif mt-1">{totalCount}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">{isAr ? 'قائمة النشرات البريدية' : 'Join list database'}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <MailCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-emerald-600 font-semibold">{isAr ? 'مشتركون نشطون' : 'Active Subscribers'}</p>
            <h3 className="text-2xl font-bold text-slate-900 font-display-serif mt-1">{activeCount}</h3>
            <p className="text-[11px] text-emerald-600 mt-0.5 font-medium">
              {totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0}% {isAr ? 'معدل النشاط' : 'Active rate'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-semibold">{isAr ? 'ملغيو الاشتراك' : 'Unsubscribed'}</p>
            <h3 className="text-2xl font-bold text-slate-900 font-display-serif mt-1">{unsubscribedCount}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">{isAr ? 'مستبعدون من النشرات' : 'Excluded from blasts'}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center border border-slate-200">
            <MailX className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. Control Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900 font-display-serif">
            {isAr ? 'إدارة قائمة الانضمام (Join List)' : 'Join List & Newsletter Subscribers'}
          </h2>
          <p className="text-xs text-slate-500">
            {isAr
              ? 'المهتمون بالعروض الاستثمارية الحصرية والنشرات الدورية القادمة من تذييل الموقع'
              : 'Direct leads and investors registered via the website footer newsletter form'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={onResetToDefault}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            title={isAr ? 'استعادة المشتركين الافتراضيين' : 'Reset to defaults'}
          >
            <RefreshCw className="w-4 h-4" />
            <span>{isAr ? 'استعادة الافتراضي' : 'Reset'}</span>
          </button>

          <button
            onClick={handleCopyAllActive}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {copiedAll ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>
              {copiedAll
                ? isAr
                  ? 'تم نسخ الإيميلات!'
                  : 'Copied All!'
                : isAr
                ? 'نسخ الإيميلات النشطة'
                : 'Copy Active Emails'}
            </span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{isAr ? 'تصدير CSV' : 'Export CSV'}</span>
          </button>

          <button
            onClick={onAddSubscriber}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-sky-500 hover:brightness-110 active:scale-95 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إضافة بريد جديد' : 'Add Subscriber'}</span>
          </button>
        </div>
      </div>

      {/* 3. Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute top-3 start-3" />
          <input
            type="text"
            placeholder={isAr ? 'بحث بالبريد الإلكتروني أو الملاحظات...' : 'Search by subscriber email, notes, or source...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full ps-9 pe-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">{isAr ? 'جميع الحالات' : 'All Statuses'}</option>
              <option value="active">{isAr ? 'نشط فقط (Active)' : 'Active Only'}</option>
              <option value="unsubscribed">{isAr ? 'ملغي الاشتراك (Unsubscribed)' : 'Unsubscribed'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Table of Subscribers */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredSubscribers.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <MailCheck className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-display-serif">
                {isAr ? 'لا يوجد مشتركون مطابقون' : 'No Subscribers Found'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
                {isAr
                  ? 'لم يتم العثور على أية سجلات مطابقة لمعايير البحث الحالية.'
                  : 'No subscription records matched your current query or filter.'}
              </p>
            </div>
            <button
              onClick={onAddSubscriber}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'إضافة بريد يدوياً' : 'Add Subscriber Manually'}</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-start">{isAr ? 'البريد الإلكتروني' : 'Email Address'}</th>
                  <th className="px-4 py-4 text-start">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="px-4 py-4 text-start">{isAr ? 'المصدر' : 'Source'}</th>
                  <th className="px-4 py-4 text-start">{isAr ? 'تاريخ الانضمام' : 'Date Subscribed'}</th>
                  <th className="px-6 py-4 text-start">{isAr ? 'ملاحظات وتفضيلات' : 'Notes & Inquiries'}</th>
                  <th className="px-6 py-4 text-end">{isAr ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubscribers.map((sub) => {
                  const isActive = sub.status === 'active';
                  const formattedDate = new Date(sub.createdAt).toLocaleDateString(
                    isAr ? 'ar-SA' : 'en-US',
                    { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
                  );

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Email + Copy button */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium text-slate-900 select-all">{sub.email}</span>
                          <button
                            onClick={() => handleCopyEmail(sub.id, sub.email)}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded-md transition-colors cursor-pointer"
                            title={isAr ? 'نسخ الإيميل' : 'Copy email'}
                          >
                            {copiedId === sub.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Status + Toggle */}
                      <td className="px-4 py-4">
                        <button
                          onClick={() => onToggleStatus(sub.id)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-full border flex items-center gap-1.5 transition-all cursor-pointer ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                          }`}
                          title={isAr ? 'اضغط لتغيير الحالة' : 'Click to toggle status'}
                        >
                          {isActive ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              <span>{isAr ? 'نشط' : 'Active'}</span>
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                              <span>{isAr ? 'ملغي الاشتراك' : 'Unsubscribed'}</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Source */}
                      <td className="px-4 py-4">
                        <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-xs font-medium">
                          {sub.source || (isAr ? 'تذييل الموقع' : 'Website Footer')}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-4 text-slate-500 text-xs">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{formattedDate}</span>
                        </div>
                      </td>

                      {/* Notes / Inline Editor */}
                      <td className="px-6 py-4 text-slate-600 text-xs max-w-xs">
                        {editingNotesId === sub.id ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={notesDraft}
                              onChange={(e) => setNotesDraft(e.target.value)}
                              placeholder={isAr ? 'أدخل الملاحظة...' : 'Enter notes...'}
                              className="w-full px-2 py-1 bg-white border border-blue-400 rounded-lg text-xs focus:outline-none"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveNotes(sub.id)}
                              className="px-2 py-1 bg-blue-600 text-white rounded-lg text-[11px] font-bold hover:bg-blue-700"
                            >
                              {isAr ? 'حفظ' : 'Save'}
                            </button>
                            <button
                              onClick={() => setEditingNotesId(null)}
                              className="px-1.5 py-1 text-slate-400 hover:text-slate-600 text-[11px]"
                            >
                              {isAr ? 'إلغاء' : 'Cancel'}
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => {
                              setEditingNotesId(sub.id);
                              setNotesDraft(sub.notes || '');
                            }}
                            className="cursor-pointer hover:bg-slate-100/80 p-1 rounded-md transition-colors"
                            title={isAr ? 'اضغط لتعديل الملاحظة' : 'Click to edit note'}
                          >
                            {sub.notes ? (
                              <span className="line-clamp-2">{sub.notes}</span>
                            ) : (
                              <span className="text-slate-300 italic">{isAr ? '+ إضافة ملاحظة' : '+ Add note'}</span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-end">
                        <div className="flex items-center justify-end gap-1.5">
                          {deleteConfirmId === sub.id ? (
                            <div className="flex items-center gap-1 bg-red-50 p-1 rounded-xl border border-red-200">
                              <button
                                onClick={() => {
                                  onDeleteSubscriber(sub.id);
                                  setDeleteConfirmId(null);
                                }}
                                className="px-2.5 py-1 bg-red-600 text-white text-[11px] font-bold rounded-lg hover:bg-red-700"
                              >
                                {isAr ? 'تأكيد' : 'Confirm'}
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2 py-1 text-slate-600 text-[11px] hover:bg-white rounded-lg"
                              >
                                {isAr ? 'إلغاء' : 'Cancel'}
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(sub.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                              title={isAr ? 'حذف من القائمة' : 'Delete subscriber'}
                            >
                              <Trash2 className="w-4 h-4" />
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
        )}
      </div>
    </div>
  );
};
