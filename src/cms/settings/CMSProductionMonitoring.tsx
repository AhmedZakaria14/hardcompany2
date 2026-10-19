import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Database,
  FileCode,
  Filter,
  RefreshCw,
  Search,
  ShieldAlert,
  Terminal,
  UploadCloud,
  FileEdit,
  Mail,
  HelpCircle,
  X,
  Sparkles,
} from 'lucide-react';
import { Language } from '../../types';
import {
  subscribeToProductionLogs,
  logProductionEvent,
} from '../../lib/monitoring/productionLogger';
import {
  StructuredLogDoc,
  FailureSummaryMetrics,
  LogCategory,
  OperationStatusClassification,
} from '../../lib/monitoring/monitoringTypes';

interface CMSProductionMonitoringProps {
  language: Language;
}

export const CMSProductionMonitoring: React.FC<CMSProductionMonitoringProps> = ({ language }) => {
  const isAr = language === 'ar';
  const [logs, setLogs] = useState<StructuredLogDoc[]>([]);
  const [metrics, setMetrics] = useState<FailureSummaryMetrics>({
    totalLogCount: 0,
    backendFailuresCount: 0,
    rejectedSubmissionsCount: 0,
    failedNotificationsCount: 0,
    uploadErrorsCount: 0,
    publicationFailuresCount: 0,
    temporarilyUnknownCount: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Selected Log Modal
  const [selectedLog, setSelectedLog] = useState<StructuredLogDoc | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeToProductionLogs((updatedLogs, updatedMetrics) => {
      setLogs(updatedLogs);
      setMetrics(updatedMetrics);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const filteredLogs = logs.filter((l) => {
    if (categoryFilter !== 'all' && l.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && l.statusClassification !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const corrMatch = (l.correlationId || '').toLowerCase().includes(q);
      const msgMatch = (l.message || '').toLowerCase().includes(q);
      const errMatch = (l.errorCode || '').toLowerCase().includes(q);
      const compMatch = (l.component || '').toLowerCase().includes(q);
      if (!corrMatch && !msgMatch && !errMatch && !compMatch) return false;
    }
    return true;
  });

  const handleSimulateTestLog = async () => {
    await logProductionEvent({
      level: 'WARN',
      category: 'failed_notification',
      errorCode: 'ERR_NOTIF_WEBHOOK_TIMEOUT',
      component: 'NotificationDispatcher',
      message: 'Webhook endpoint timeout after 5000ms. Queued for automatic retry.',
      statusClassification: 'TEMPORARILY_UNKNOWN',
      userRole: 'system',
      userEmail: 'admin@hard.sa',
      meta: {
        endpointUrl: 'https://crm.hard.sa/api/webhooks/v1',
        attemptNumber: 1,
        idempotencyKey: 'idemp_test_sample_123',
      },
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 font-display-serif">
              {isAr ? 'مراقبة الإنتاج، الأخطاء، وحالة العمليات (Production Health & Failures)' : 'Production Failure & System Health Monitoring'}
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-mono font-bold">
              LIVE TELEMETRY
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {isAr
              ? 'تتبع الأخطاء البرمجية، فشل النشر، مرفوضات النماذج، أخطاء الرفع، والإشعارات المكسورة بمعرفات التتبع'
              : 'Real-time telemetry for backend errors, rejected forms, upload errors, failed notifications, and correlation IDs'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleSimulateTestLog}
          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Terminal className="w-3.5 h-3.5 text-sky-400" />
          <span>{isAr ? 'اختبار السجل التجريبي' : 'Simulate Diagnostic Log'}</span>
        </button>
      </div>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        {/* Backend Failures */}
        <div className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200 space-y-1">
          <div className="flex items-center justify-between">
            <Database className="w-4 h-4 text-rose-600" />
            <span className="font-mono text-sm font-black text-rose-700">{metrics.backendFailuresCount}</span>
          </div>
          <span className="font-bold text-rose-950 block text-[11px]">{isAr ? 'أخطاء الخادم والبيانات' : 'Backend Failures'}</span>
        </div>

        {/* Rejected Submissions */}
        <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-1">
          <div className="flex items-center justify-between">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span className="font-mono text-sm font-black text-amber-800">{metrics.rejectedSubmissionsCount}</span>
          </div>
          <span className="font-bold text-amber-950 block text-[11px]">{isAr ? 'مرفوضات النماذج' : 'Rejected Forms'}</span>
        </div>

        {/* Failed Notifications */}
        <div className="p-3.5 rounded-2xl bg-purple-50/80 border border-purple-200 space-y-1">
          <div className="flex items-center justify-between">
            <Mail className="w-4 h-4 text-purple-600" />
            <span className="font-mono text-sm font-black text-purple-800">{metrics.failedNotificationsCount}</span>
          </div>
          <span className="font-bold text-purple-950 block text-[11px]">{isAr ? 'فشل الإشعارات' : 'Failed Dispatches'}</span>
        </div>

        {/* Upload Errors */}
        <div className="p-3.5 rounded-2xl bg-sky-50/80 border border-sky-200 space-y-1">
          <div className="flex items-center justify-between">
            <UploadCloud className="w-4 h-4 text-sky-600" />
            <span className="font-mono text-sm font-black text-sky-800">{metrics.uploadErrorsCount}</span>
          </div>
          <span className="font-bold text-sky-950 block text-[11px]">{isAr ? 'أخطاء رفع الملفات' : 'Upload Errors'}</span>
        </div>

        {/* Publication Failures */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200 space-y-1">
          <div className="flex items-center justify-between">
            <FileEdit className="w-4 h-4 text-indigo-600" />
            <span className="font-mono text-sm font-black text-indigo-800">{metrics.publicationFailuresCount}</span>
          </div>
          <span className="font-bold text-indigo-950 block text-[11px]">{isAr ? 'فشل نشر المسودات' : 'Publish Failures'}</span>
        </div>

        {/* Temporarily Unknown Status */}
        <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-300 space-y-1">
          <div className="flex items-center justify-between">
            <Clock className="w-4 h-4 text-slate-700" />
            <span className="font-mono text-sm font-black text-slate-900">{metrics.temporarilyUnknownCount}</span>
          </div>
          <span className="font-bold text-slate-900 block text-[11px]">{isAr ? 'حالة غير مؤكدة مؤقتاً' : 'Unknown Status'}</span>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute top-3 start-3" />
          <input
            type="text"
            placeholder={isAr ? 'البحث بكود التتبع Correlation ID، كود الخطأ، أو الرسالة...' : 'Search Correlation ID, Error Code, Component, or Message...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full ps-9 pe-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="all">{isAr ? 'جميع الفئات' : 'All Categories'}</option>
            <option value="backend_failure">{isAr ? 'أخطاء الخادم Backend' : 'Backend Failure'}</option>
            <option value="rejected_submission">{isAr ? 'مرفوضات النماذج Form' : 'Rejected Submission'}</option>
            <option value="failed_notification">{isAr ? 'فشل الإشعارات Notif' : 'Failed Notification'}</option>
            <option value="upload_error">{isAr ? 'أخطاء الرفع Upload' : 'Upload Error'}</option>
            <option value="publication_failure">{isAr ? 'فشل النشر Publish' : 'Publication Failure'}</option>
          </select>

          {/* Status Classification Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="all">{isAr ? 'جميع الحالات' : 'All Classifications'}</option>
            <option value="DEFINITIVE_FAILURE">{isAr ? 'فشل مؤكد DEFINITIVE' : 'Definitive Failure'}</option>
            <option value="TEMPORARILY_UNKNOWN">{isAr ? 'غير معروف مؤقتاً UNKNOWN' : 'Temporarily Unknown'}</option>
            <option value="SUCCESS">{isAr ? 'نجاح SUCCESS' : 'Success'}</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-2">
            <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
            <p>{isAr ? 'جاري استقبال سجلات النظام الحية...' : 'Connecting to live telemetry logs...'}</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="font-bold text-slate-700">{isAr ? 'لا توجد أخطاء مسجلة مطابقة' : 'No matching diagnostic logs'}</p>
            <p className="text-[11px]">{isAr ? 'النظام يعمل بكفاءة وبدون أخطاء قائمة' : 'System is operating cleanly.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs border-collapse font-mono">
              <thead>
                <tr className="bg-slate-900 text-slate-300 border-b border-slate-800 text-[10px] uppercase font-bold">
                  <th className="py-3 px-4 text-start">{isAr ? 'معرف التتبع Correlation ID' : 'Correlation ID & Code'}</th>
                  <th className="py-3 px-3 text-start">{isAr ? 'الفئة' : 'Category'}</th>
                  <th className="py-3 px-3 text-start">{isAr ? 'المكون' : 'Component'}</th>
                  <th className="py-3 px-3 text-start">{isAr ? 'الرسالة التشخيصية' : 'Message'}</th>
                  <th className="py-3 px-3 text-center">{isAr ? 'تصنيف الحالة' : 'Status Class'}</th>
                  <th className="py-3 px-4 text-end">{isAr ? 'الوقت' : 'Timestamp'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans text-slate-700">
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-blue-600 whitespace-nowrap">
                      <div>{log.correlationId}</div>
                      <span className="text-[10px] text-slate-500 font-normal block">{log.errorCode}</span>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[10px] font-bold uppercase text-slate-700">
                        {log.category}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono text-xs text-slate-800 whitespace-nowrap">
                      {log.component}
                    </td>

                    <td className="py-3 px-3 text-slate-800 line-clamp-1 max-w-xs text-xs font-medium">
                      {log.message}
                    </td>

                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                          log.statusClassification === 'DEFINITIVE_FAILURE'
                            ? 'bg-rose-100 text-rose-800'
                            : log.statusClassification === 'TEMPORARILY_UNKNOWN'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {log.statusClassification}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-end font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Structured Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-sky-400" />
                <h4 className="text-sm font-bold font-mono text-sky-300">{selectedLog.correlationId}</h4>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className="p-3 rounded-xl bg-slate-800/80 space-y-1">
                  <span className="text-slate-400 block">{isAr ? 'كود الخطأ' : 'Error Code'}</span>
                  <span className="text-rose-400 font-bold">{selectedLog.errorCode}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/80 space-y-1">
                  <span className="text-slate-400 block">{isAr ? 'تصنيف الوضع' : 'Classification'}</span>
                  <span className="text-amber-300 font-bold">{selectedLog.statusClassification}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 space-y-1">
                <span className="text-slate-400 text-[10px] block">{isAr ? 'الرسالة التشخيصية' : 'Diagnostic Message'}</span>
                <p className="text-white font-sans text-xs leading-relaxed">{selectedLog.message}</p>
              </div>

              {selectedLog.meta && (
                <div className="space-y-1">
                  <span className="text-slate-400 text-[10px] block">{isAr ? 'بيانات الخواص المعقمة (Sanitized Metadata - No Secrets)' : 'Sanitized Event Metadata (Secrets Redacted)'}</span>
                  <pre className="p-4 rounded-xl bg-black text-emerald-400 text-[11px] overflow-x-auto border border-slate-800 font-mono">
                    {JSON.stringify(selectedLog.meta, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
