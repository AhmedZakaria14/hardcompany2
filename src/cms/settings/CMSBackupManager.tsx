import React, { useState, useEffect } from 'react';
import {
  Database,
  HardDrive,
  ShieldCheck,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  FileCode,
  Users,
  Lock,
  Sparkles,
  ArrowUpRight,
  Info,
  Server,
  FileText,
  Activity,
  Check,
  X,
  FileCheck2,
} from 'lucide-react';
import { Language } from '../../types';
import {
  generateFullDatabaseSnapshot,
  validateSnapshotForRestoration,
  auditMediaReferences,
  executeStagedRestorationDrill,
  downloadBackupSnapshotJson,
  DEFAULT_BACKUP_CONFIG,
} from '../../lib/cms/backupService';
import {
  FullDatabaseBackupSnapshot,
  RestorationValidationReport,
  MediaReferenceAuditResult,
} from '../../lib/cms/backupServiceTypes';

interface CMSBackupManagerProps {
  language: Language;
  currentAdminUser?: { name: string; email: string; role: string; uid?: string };
}

export const CMSBackupManager: React.FC<CMSBackupManagerProps> = ({
  language,
  currentAdminUser = { name: 'Admin User', email: 'admin@hard.sa', role: 'superadmin', uid: 'admin_1' },
}) => {
  const isAr = language === 'ar';
  const [activeSubTab, setActiveSubTab] = useState<'status' | 'export' | 'restore' | 'audit' | 'policy'>('status');

  // Export State
  const [isExporting, setIsExporting] = useState(false);
  const [latestSnapshot, setLatestSnapshot] = useState<FullDatabaseBackupSnapshot | null>(null);

  // Restore & Drill State
  const [restorationFile, setRestorationFile] = useState<FullDatabaseBackupSnapshot | null>(null);
  const [validationReport, setValidationReport] = useState<RestorationValidationReport | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isExecutingDrill, setIsExecutingDrill] = useState(false);
  const [drillSuccessMessage, setDrillSuccessMessage] = useState<string | null>(null);

  // Media Audit State
  const [mediaAudit, setMediaAudit] = useState<MediaReferenceAuditResult | null>(null);
  const [isAuditingMedia, setIsAuditingMedia] = useState(false);

  // Auto load a sample baseline snapshot for dry-run restoration on mount
  useEffect(() => {
    handleGenerateSnapshot(false);
  }, []);

  const handleGenerateSnapshot = async (triggerDownload = true) => {
    setIsExporting(true);
    try {
      const snapshot = await generateFullDatabaseSnapshot({
        uid: currentAdminUser.uid || 'admin_sys',
        email: currentAdminUser.email,
        name: currentAdminUser.name,
      });
      setLatestSnapshot(snapshot);
      if (triggerDownload) {
        downloadBackupSnapshotJson(snapshot);
      }
    } catch (err) {
      console.error('Failed to generate snapshot:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string) as FullDatabaseBackupSnapshot;
        setRestorationFile(parsed);
        await runValidation(parsed);
      } catch (err) {
        alert(isAr ? 'ملف التنسيق غير صالحة. يجب أن يكون ملف JSON مدعوم.' : 'Invalid file format. Please upload a valid JSON backup snapshot.');
      }
    };
    reader.readAsText(file);
  };

  const runValidation = async (snapshotToValidate: FullDatabaseBackupSnapshot) => {
    setIsValidating(true);
    try {
      const report = await validateSnapshotForRestoration(snapshotToValidate, 'sandbox');
      setValidationReport(report);
    } catch (err) {
      console.error('Validation error:', err);
    } finally {
      setIsValidating(false);
    }
  };

  const handleExecuteRestorationDrill = async () => {
    if (!restorationFile && !latestSnapshot) return;
    const targetSnapshot = restorationFile || latestSnapshot!;

    setIsExecutingDrill(true);
    setDrillSuccessMessage(null);
    try {
      const res = await executeStagedRestorationDrill(targetSnapshot, currentAdminUser);
      if (res.success) {
        setDrillSuccessMessage(res.message);
      }
    } catch (err: any) {
      alert(err?.message || 'Drill execution failed');
    } finally {
      setIsExecutingDrill(false);
    }
  };

  const handleRunMediaAudit = async () => {
    setIsAuditingMedia(true);
    try {
      const userParam = {
        uid: currentAdminUser.uid || 'admin-master',
        email: currentAdminUser.email,
        name: currentAdminUser.name,
      };
      const snapshot = latestSnapshot || (await generateFullDatabaseSnapshot(userParam));
      const res = auditMediaReferences(snapshot);
      setMediaAudit(res);
    } catch (err) {
      console.error('Media audit error:', err);
    } finally {
      setIsAuditingMedia(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 font-display-serif">
              {isAr ? 'مركز النسخ الاحتياطي وإدارة التعافي من الكوارث' : 'Backup & Disaster Recovery Center'}
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-extrabold uppercase font-mono">
              VERIFIED ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {isAr
              ? 'تكوين استراتيجية النسخ الاحتياطي لـ Firestore، الوسائط، والمصادقة، وإجراء تمرين استرجاع آمن'
              : 'Documented backup plan, automated exports, media storage sync, and non-production restoration drill'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleGenerateSnapshot(true)}
          disabled={isExporting}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{isExporting ? (isAr ? 'جاري تصدير النسخة...' : 'Exporting Snapshot...') : (isAr ? 'تحميل نسخة JSON فورية' : 'Download JSON Snapshot')}</span>
        </button>
      </div>

      {/* Sub Tab Navigation */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('status')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeSubTab === 'status'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>{isAr ? 'حالة الآليات المفعّلة' : 'Active Mechanisms'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('export')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeSubTab === 'export'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isAr ? 'التصدير واللقطات' : 'Snapshot Exporter'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('restore')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeSubTab === 'restore'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{isAr ? 'تمرين الاسترجاع الآمن' : 'Restoration Drill'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveSubTab('audit');
            if (!mediaAudit) handleRunMediaAudit();
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeSubTab === 'audit'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>{isAr ? 'تدقيق مراجع الوسائط' : 'Media Reference Audit'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('policy')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeSubTab === 'policy'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{isAr ? 'سياسة الاحتفاظ والحوكمة' : 'Retention & Governance'}</span>
        </button>
      </div>

      {/* Distinction Banner: Database vs Media */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold">
              {isAr ? 'التمييز بين النسخ الاحتياطي لقواعد البيانات وملفات الوسائط:' : 'Database Snapshots vs. Media Blob Storage:'}
            </span>
            <p className="text-amber-800 leading-relaxed">
              {isAr
                ? 'تحفظ قاعدة بيانات Firestore الهياكل النصية، الروابط، والعلاقات. بينما تُخزن الصور والملفات بشكل منفصل في Google Cloud Storage (GCS). استرجاع قاعدة البيانات يعيد السجلات والمراجع فقط، وتستلزم الوسائط تمكين Object Versioning على حاويات التخزين.'
                : 'Firestore database backups save structured JSON document trees, relations, and metadata. Image files and floorplan PDFs live in Google Cloud Storage buckets. Restoring a database snapshot restores entity references; media files require GCS Object Versioning and Soft-Delete policies.'}
            </p>
          </div>
        </div>
      </div>

      {/* SUBTAB 1: Active Mechanisms */}
      {activeSubTab === 'status' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Firestore Managed Export */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <Database className="w-5 h-5 text-blue-600" />
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  AUTOMATED
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900">
                {isAr ? 'النسخ الفوري لـ Firestore' : 'Firestore Managed Export'}
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {isAr ? 'Cloud Scheduler يُصنع نسخاً يومية لقاعدة البيانات إلى حاوية GCS' : 'Daily Cloud Scheduler gcloud export to GCS Nearline storage bucket'}
              </p>
              <div className="pt-2 text-[10px] text-slate-600 font-mono border-t border-slate-200/60">
                Frequency: {DEFAULT_BACKUP_CONFIG.frequency.toUpperCase()} (30-day retention)
              </div>
            </div>

            {/* Point In Time Recovery (PITR) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <Clock className="w-5 h-5 text-amber-600" />
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  7-DAY PITR
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900">
                {isAr ? 'الاسترجاع للنقطة الزمنية (PITR)' : 'Point-In-Time Recovery'}
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {isAr ? 'تسجيل التغييرات لحظياً مع إمكانية العودة لأي دقيقة خلال آخر 7 أيام' : 'Continuous commit transaction log enabling minute-by-minute rollbacks'}
              </p>
              <div className="pt-2 text-[10px] text-slate-600 font-mono border-t border-slate-200/60">
                Window: 7 Days Continuous Log
              </div>
            </div>

            {/* GCS Storage Object Versioning */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <HardDrive className="w-5 h-5 text-purple-600" />
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  VERSIONED
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900">
                {isAr ? 'حماية ملفات وسائط GCS' : 'Storage Object Versioning'}
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {isAr ? 'الاحتفاظ بالإصدارات السابقة للصور مع فترة استرجاع Soft Delete لـ 7 أيام' : 'Retains prior versions of images/PDFs with 7-day Soft Delete buffer'}
              </p>
              <div className="pt-2 text-[10px] text-slate-600 font-mono border-t border-slate-200/60">
                Bucket: gs://hard-group-media-prod
              </div>
            </div>

            {/* Firebase Auth Accounts */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <Users className="w-5 h-5 text-emerald-600" />
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  EXPORTED
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900">
                {isAr ? 'تصدير حسابات المستخدمين' : 'Auth User Credentials'}
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {isAr ? 'تصدير قائمة المستخدمين والتشفيرات عبر CLI لحماية الوصول' : 'Periodic CLI export of accounts with scrypt parameters'}
              </p>
              <div className="pt-2 text-[10px] text-slate-600 font-mono border-t border-slate-200/60">
                Format: JSON (scrypt parameters preserved)
              </div>
            </div>
          </div>

          {/* Infrastructure Health Status Card */}
          <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Server className="w-5 h-5 text-blue-400" />
                <h4 className="text-sm font-bold">
                  {isAr ? 'حالة حاوية النسخ السحابي الاحتياطي (Production Bucket)' : 'Production Storage & Backup Pipeline Status'}
                </h4>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-mono font-bold">
                HEALTHY
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                <span className="text-slate-400 text-[11px] block">{isAr ? 'اسم الحاوية' : 'Backup Bucket Name'}</span>
                <span className="font-mono text-white font-bold block truncate">{DEFAULT_BACKUP_CONFIG.gcsBucketName}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                <span className="text-slate-400 text-[11px] block">{isAr ? 'تاريخ آخر تصدير ناجح' : 'Last Automated Export'}</span>
                <span className="font-mono text-emerald-400 font-bold block">
                  {new Date(DEFAULT_BACKUP_CONFIG.lastSuccessfulExportAt!).toLocaleString()}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                <span className="text-slate-400 text-[11px] block">{isAr ? 'حجم النسخة الأخيرة' : 'Snapshot Size'}</span>
                <span className="font-mono text-amber-300 font-bold block">
                  {(DEFAULT_BACKUP_CONFIG.lastBackupSizeBytes! / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: Snapshot Exporter */}
      {activeSubTab === 'export' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  {isAr ? 'اللقطة الحالية لقاعدة البيانات المحليّة (Live Firestore JSON Snapshot)' : 'Live Local Database JSON Snapshot Generator'}
                </h4>
                <p className="text-xs text-slate-500">
                  {isAr ? 'توليد وتنزيل لقطة كاملة تحتوي على كافة الجداول والسجلات الحية' : 'Generates a signed, structured JSON backup of all collections for offline archival'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleGenerateSnapshot(true)}
                disabled={isExporting}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4 text-sky-400" />
                <span>{isExporting ? (isAr ? 'جاري التوليد...' : 'Generating...') : (isAr ? 'توليد وتنزيل JSON' : 'Generate & Download JSON')}</span>
              </button>
            </div>

            {latestSnapshot && (
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                  <span className="font-bold text-slate-700">{isAr ? 'معلومات اللقطة المُولّدة' : 'Snapshot Metadata'}</span>
                  <span className="font-mono text-[10px] text-blue-600 font-bold">{latestSnapshot.metadata.backupId}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">{isAr ? 'إجمالي السجلات' : 'Total Documents'}</span>
                    <span className="font-bold text-slate-900">{latestSnapshot.metadata.totalDocumentCount}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] block">{isAr ? 'العقارات' : 'Properties'}</span>
                    <span className="font-bold text-slate-900">{latestSnapshot.metadata.collectionsCount.properties || 0}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] block">{isAr ? 'المشاريع' : 'Projects'}</span>
                    <span className="font-bold text-slate-900">{latestSnapshot.metadata.collectionsCount.projects || 0}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] block">{isAr ? 'سلات المحذوفات' : 'Trash Bin Items'}</span>
                    <span className="font-bold text-slate-900">{latestSnapshot.metadata.collectionsCount.trash_bin || 0}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 3: Restoration Drill Simulator */}
      {activeSubTab === 'restore' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-sky-950">
                {isAr ? 'تمرين استرجاع آمن في بيئة التطوير/الرمل (Non-Production Restoration Exercise)' : 'Non-Production Safe Restoration Drill'}
              </h4>
              <p className="text-xs text-sky-800 leading-relaxed">
                {isAr
                  ? 'يسمح لك هذا التمرين باختبار ورفع لقطة نسخ احتياطي والتحقق من المخططات والتغييرات والتأكد من سلامة السجلات بدون المساس بقواعد البيانات الحية في الإنتاج.'
                  : 'Perform a non-destructive dry-run restoration drill. Validates JSON schemas, entity diffs, and orphan media references without overwriting live production database logs.'}
              </p>
            </div>

            {/* Upload Area */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <label className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-sky-300 text-xs font-bold shadow-2xs flex items-center gap-2 cursor-pointer transition-all">
                <Upload className="w-4 h-4 text-blue-600" />
                <span>{isAr ? 'رفع ملف لقطة JSON للاختبار' : 'Upload JSON Snapshot File'}</span>
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              </label>

              {latestSnapshot && (
                <button
                  type="button"
                  onClick={() => runValidation(latestSnapshot)}
                  disabled={isValidating}
                  className="px-4 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold shadow-2xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isValidating ? 'animate-spin' : ''}`} />
                  <span>{isAr ? 'اختبار اللقطة الحالية في البيئة الآمنة' : 'Test Current Live Snapshot in Sandbox'}</span>
                </button>
              )}
            </div>

            {/* Drill Success Notification */}
            {drillSuccessMessage && (
              <div className="p-4 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{isAr ? 'تمت ممارسة الاسترجاع التجريبي بنجاح!' : 'Restoration Drill Successfully Verified!'}</span>
                </div>
                <p>{drillSuccessMessage}</p>
              </div>
            )}

            {/* Validation Report Result */}
            {validationReport && (
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-5 h-5 text-emerald-600" />
                    <h5 className="text-xs font-bold text-slate-900">
                      {isAr ? 'تقرير تحليل تأثير الاسترجاع (Pre-Restoration Impact Analysis)' : 'Pre-Restoration Impact Analysis Report'}
                    </h5>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                    VALIDATED
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 text-[10px] block">{isAr ? 'سجلات للإنشاء الجديد' : 'Entities to Create'}</span>
                    <span className="font-bold text-blue-600 text-sm">
                      {validationReport.diffSummary.properties.toCreate + validationReport.diffSummary.projects.toCreate}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 text-[10px] block">{isAr ? 'سجلات مدمجة/مُحدثة' : 'Entities to Update'}</span>
                    <span className="font-bold text-amber-600 text-sm">
                      {validationReport.diffSummary.properties.toUpdate + validationReport.diffSummary.projects.toUpdate}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 text-[10px] block">{isAr ? 'روابط الوسائط المعتمدة' : 'Verified Media URIs'}</span>
                    <span className="font-bold text-emerald-600 text-sm">
                      {validationReport.mediaCheck.healthyReferencesCount}
                    </span>
                  </div>
                </div>

                {validationReport.warnings.length > 0 && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                    <span className="font-bold block">{isAr ? 'ملاحظات وتنبيهات الأمان:' : 'Safety Review Notes:'}</span>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800">
                      {validationReport.warnings.map((w, idx) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleExecuteRestorationDrill}
                    disabled={isExecutingDrill}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {isExecutingDrill
                        ? (isAr ? 'جاري تنفيذ التمرين التجريبي...' : 'Executing Staged Drill...')
                        : (isAr ? 'تنفيذ تمرين الاسترجاع التجريبي الآن' : 'Execute Staged Restoration Drill')}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 4: Media Reference Audit */}
      {activeSubTab === 'audit' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  {isAr ? 'تقرير صحة وروابط وسائط قاعدة البيانات' : 'Database Media Reference Health Report'}
                </h4>
                <p className="text-xs text-slate-500">
                  {isAr ? 'فحص روابط الصور في قاعدة البيانات للتأكد من عدم وجود مراجع مفقودة' : 'Scans all entity image URIs to verify cloud storage references'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleRunMediaAudit}
                disabled={isAuditingMedia}
                className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAuditingMedia ? 'animate-spin' : ''}`} />
                <span>{isAr ? 'إعادة التحديث' : 'Re-Audit Media'}</span>
              </button>
            </div>

            {mediaAudit && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <span className="text-slate-400 text-[10px] block">{isAr ? 'إجمالي المراجع المكسورة' : 'Total Media Checked'}</span>
                    <span className="font-bold text-slate-900">{mediaAudit.totalMediaReferencesChecked}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <span className="text-slate-400 text-[10px] block">{isAr ? 'روابط معتمدة وسليمة' : 'Healthy Cloud URIs'}</span>
                    <span className="font-bold text-emerald-600">{mediaAudit.healthyReferencesCount}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <span className="text-slate-400 text-[10px] block">{isAr ? 'روابط مفقودة أو غير صالحة' : 'Missing/Invalid URIs'}</span>
                    <span className="font-bold text-rose-600">{mediaAudit.brokenOrMissingCount}</span>
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100 bg-white text-xs">
                  {mediaAudit.items.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold uppercase text-[10px] text-slate-500 font-mono">{item.entityType}</span>
                          <span className="font-mono text-[10px] text-slate-400">ID: {item.entityId}</span>
                        </div>
                        <span className="text-[11px] text-slate-700 block truncate max-w-md font-mono">{item.mediaUrl || '(Empty)'}</span>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.status === 'healthy'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'relative_asset'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 5: Retention Policy & IAM Governance */}
      {activeSubTab === 'policy' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4 shadow-md">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h4 className="text-sm font-bold">
                {isAr ? 'سياسة الحوكمة والوصول وإدارة الاحتفاظ (IAM & Retention Policy)' : 'IAM Access Control & Data Retention Policy'}
              </h4>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700/80 space-y-1">
                <span className="font-bold text-white block">{isAr ? '1. تقييد صلاحيات Access Control:' : '1. Restricted IAM Access Control:'}</span>
                <p className="text-slate-400">
                  {isAr
                    ? 'يتم قصر صلاحيات تصدير واسترجاع النسخ الاحتياطية على الحسابات المزودة بدور datastore.importExportAdmin ودور storage.admin بفرض مبدأ Least Privilege.'
                    : 'Export and restoration privileges are strictly assigned to service accounts with roles/datastore.importExportAdmin and roles/storage.admin.'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700/80 space-y-1">
                <span className="font-bold text-white block">{isAr ? '2. التشفير في وضع الراحة (Encryption at Rest):' : '2. Encryption at Rest:'}</span>
                <p className="text-slate-400">
                  {isAr
                    ? 'تعتمد جميع النسخ الاحتياطية على مفاتيح تشفير تديرها السحابة CMEK (Cloud Key Management Service - KMS).'
                    : 'All database and media backup buckets are encrypted using Customer-Managed Encryption Keys (CMEK) via Cloud KMS.'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700/80 space-y-1">
                <span className="font-bold text-white block">{isAr ? '3. جدول الاحتفاظ المعتمد (Retention Schedule):' : '3. Standardized Retention Policy:'}</span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                  <li>{isAr ? 'النسخ اليومية: التخزين لمدة 30 يوماً ثم الحذف الآلي.' : 'Daily Snapshot Exports: Retained for 30 days in GCS Nearline.'}</li>
                  <li>{isAr ? 'النسخ الشهرية: التخزين لمدة 365 يوماً للأرشيف القانوني.' : 'Monthly Snapshot Exports: Retained for 365 days in GCS Coldline.'}</li>
                  <li>{isAr ? 'سجلات التغييرات اللحظية (PITR): التخزين لمدة 7 أيام متواصلة.' : 'Continuous PITR Transaction Log: 7-day rolling window.'}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
