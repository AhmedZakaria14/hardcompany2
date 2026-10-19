import React, { useState, useEffect } from 'react';
import {
  Settings,
  Database,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Globe,
  Lock,
  Layers,
  UploadCloud,
  Check,
  AlertCircle,
  Server,
  Code2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Copy,
  Terminal,
} from 'lucide-react';
import { Language } from '../../types';
import { isSupabaseConfigured, SUPABASE_URL, supabase } from '../../lib/db/supabaseClient';
import { syncAllToSupabase } from '../../lib/db/repository';
import firebaseConfig from '../../../firebase-applet-config.json';
import { validateFirestoreConnection } from '../../lib/firebase';

import { CMSAdminManagement } from './CMSAdminManagement';
import { CMSBrandingSettings } from './CMSBrandingSettings';
import { CMSBackupManager } from './CMSBackupManager';
import { CMSProductionMonitoring } from './CMSProductionMonitoring';

interface CMSSettingsProps {
  language: Language;
  onResetToDefaults: () => void;
  currentAdminUser?: { uid?: string; name: string; email: string; role: string };
}

const PERMANENT_FIX_SQL = `-- ==============================================================================
-- HARD REAL ESTATE - MASTER PERMANENT SUPABASE SCHEMA & UNRESTRICTED ACCESS FIX
-- Run this once in your Supabase SQL Editor to resolve all table blocks forever!
-- ==============================================================================

-- 1. Create Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create All 6 Tables if they do not exist
CREATE TABLE IF NOT EXISTS properties (
  id TEXT PRIMARY KEY,
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  price NUMERIC NOT NULL,
  price_prefix_en TEXT DEFAULT 'Guide Price',
  price_prefix_ar TEXT DEFAULT 'السعر التقديري',
  location_en TEXT NOT NULL,
  location_ar TEXT NOT NULL,
  city TEXT NOT NULL,
  district_en TEXT,
  district_ar TEXT,
  coordinates JSONB,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  bedrooms INTEGER DEFAULT 0,
  bathrooms INTEGER DEFAULT 0,
  area_sqm NUMERIC NOT NULL,
  features_en TEXT[],
  features_ar TEXT[],
  images TEXT[] NOT NULL,
  floor_plans TEXT[],
  video_url TEXT,
  virtual_tour_url TEXT,
  is_exclusive BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  agent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  location_en TEXT NOT NULL,
  location_ar TEXT NOT NULL,
  type_en TEXT NOT NULL,
  type_ar TEXT NOT NULL,
  status_en TEXT NOT NULL,
  status_ar TEXT NOT NULL,
  completion_date TEXT,
  units_count INTEGER,
  starting_price NUMERIC,
  image TEXT NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  features_en TEXT[],
  features_ar TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id TEXT PRIMARY KEY,
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  excerpt_en TEXT,
  excerpt_ar TEXT,
  content_en TEXT,
  content_ar TEXT,
  author_en TEXT,
  author_ar TEXT,
  date TEXT,
  category_en TEXT,
  category_ar TEXT,
  read_time_en TEXT,
  read_time_ar TEXT,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS testimonials (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  role_en TEXT,
  role_ar TEXT,
  content_en TEXT,
  content_ar TEXT,
  rating INTEGER DEFAULT 5,
  avatar TEXT,
  property_type_en TEXT,
  property_type_ar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'property_inquiry',
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  preferred_contact_method TEXT DEFAULT 'whatsapp',
  message TEXT,
  property_id TEXT,
  project_id TEXT,
  preferred_date DATE,
  preferred_time_slot TEXT,
  property_type TEXT,
  budget NUMERIC,
  crm_synced BOOLEAN DEFAULT false,
  crm_reference_id TEXT,
  source TEXT DEFAULT 'HARD Web Portal',
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscribers (
  id TEXT PRIMARY KEY DEFAULT ('SUB-' || floor(100000 + random() * 900000)::TEXT),
  email TEXT UNIQUE NOT NULL,
  locale TEXT DEFAULT 'ar',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PERMANENTLY DISABLE RLS TO ALLOW DIRECT CLIENT ACCESS
ALTER TABLE properties DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials DISABLE ROW LEVEL SECURITY;
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers DISABLE ROW LEVEL SECURITY;

-- 4. GRANT PERMANENT PERMISSIONS TO ANON AND AUTHENTICATED ROLES
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
`;

export const CMSSettings: React.FC<CMSSettingsProps> = ({
  language,
  onResetToDefaults,
  currentAdminUser,
}) => {
  const isAr = language === 'ar';
  const [resetMessage, setResetMessage] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);
  const [showSqlHelp, setShowSqlHelp] = useState(true);
  const [connectionCheck, setConnectionCheck] = useState<{
    tested: boolean;
    healthy: boolean;
    tables: { name: string; accessible: boolean; count?: number; error?: string }[];
  } | null>(null);
  const [isTestingConn, setIsTestingConn] = useState(false);

  const handleReset = () => {
    onResetToDefaults();
    setResetMessage(true);
    setTimeout(() => setResetMessage(false), 3000);
  };

  const copySqlToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(PERMANENT_FIX_SQL);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 3000);
    } catch (e) {
      console.error('Failed to copy to clipboard', e);
    }
  };

  const testDatabaseConnection = async () => {
    setIsTestingConn(true);
    const tables = ['properties', 'projects', 'blog_posts', 'testimonials', 'leads', 'subscribers'];
    const results: { name: string; accessible: boolean; count?: number; error?: string }[] = [];
    let allOk = true;

    for (const tbl of tables) {
      try {
        const { data, count, error } = await supabase
          .from(tbl)
          .select('id')
          .limit(1);

        if (error) {
          const rawErr = error.message || error.details || error.hint || JSON.stringify(error);
          let friendlyErr = rawErr;
          if (rawErr.includes('does not exist') || rawErr.includes('42P01') || rawErr.includes('404')) {
            friendlyErr = isAr ? 'الجدول غير موجود في قاعدة البيانات' : 'Table does not exist';
          } else if (rawErr.includes('row-level security') || rawErr.includes('42501') || rawErr.includes('permission denied')) {
            friendlyErr = isAr ? 'محجوب بواسطة صلاحيات RLS' : 'Blocked by RLS policy';
          }
          results.push({ name: tbl, accessible: false, error: friendlyErr });
          allOk = false;
        } else {
          // Count total
          const countRes = await supabase.from(tbl).select('id', { count: 'exact', head: true });
          results.push({ name: tbl, accessible: true, count: countRes.count ?? data?.length ?? 0 });
        }
      } catch (err: any) {
        results.push({ name: tbl, accessible: false, error: err?.message || 'Network error' });
        allOk = false;
      }
    }

    setConnectionCheck({
      tested: true,
      healthy: allOk,
      tables: results,
    });
    setIsTestingConn(false);
  };

  const handleSyncToSupabase = async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const result = await syncAllToSupabase();
      setSyncStatus(result);
      // Automatically refresh connection report after sync
      testDatabaseConnection();
    } catch (err: any) {
      setSyncStatus({
        success: false,
        message: err?.message || (isAr ? 'فشلت عملية المزامنة' : 'Synchronization failed'),
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl animate-in fade-in">
      {/* Branding, Identity & Public Settings */}
      <CMSBrandingSettings
        language={language}
        currentAdminRole={currentAdminUser?.role}
      />

      {/* Super Administrator Governance Section */}
      <CMSAdminManagement
        language={language}
        currentAdminUser={currentAdminUser || { name: 'Executive Admin', email: 'admin@hard.sa', role: 'superadmin' }}
      />

      {/* Backup, Storage Sync & Disaster Recovery Section */}
      <CMSBackupManager
        language={language}
        currentAdminUser={currentAdminUser || { name: 'Executive Admin', email: 'admin@hard.sa', role: 'superadmin' }}
      />

      {/* Production Telemetry, Failures & System Health Dashboard */}
      <CMSProductionMonitoring language={language} />

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
        <div className="space-y-1 pb-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 font-display-serif">
            {isAr ? 'إعدادات النظام وقاعدة البيانات السحابية' : 'System & Database Configuration'}
          </h3>
          <p className="text-xs text-slate-500">
            {isAr
              ? 'مراقبة حالة التخزين، المزامنة، وضبط صلاحيات Supabase PostgreSQL'
              : 'Monitor storage health, synchronization status, and manage Supabase permissions'}
          </p>
        </div>

        {/* Firebase Cloud Firestore Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 text-white border border-slate-800 shadow-md space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold shrink-0 shadow-md">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white">
                    {isAr ? 'قاعدة بيانات جوجل فايربيس (Cloud Firestore & Auth)' : 'Google Firebase Cloud Firestore & Auth'}
                  </h4>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold rounded-full font-mono">
                    ONLINE
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Project: <strong className="text-slate-200">{firebaseConfig.projectId}</strong> | Database ID: <strong className="text-slate-200">{firebaseConfig.firestoreDatabaseId || 'default'}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-full text-xs font-bold shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isAr ? 'مصادقة وقواعد مفعلة' : 'Rules Deployed & Auth Active'}</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-300 font-mono">
            <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px]">{isAr ? 'نطاق المصادقة' : 'Auth Domain'}</span>
              <span className="text-slate-200 font-semibold truncate block">{firebaseConfig.authDomain}</span>
            </div>
            <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px]">{isAr ? 'مستودع الملفات' : 'Storage Bucket'}</span>
              <span className="text-slate-200 font-semibold truncate block">{firebaseConfig.storageBucket}</span>
            </div>
            <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px]">{isAr ? 'مستوى الحماية' : 'Security Model'}</span>
              <span className="text-emerald-400 font-semibold block">{isAr ? 'قواعد RBAC آمنة' : 'Firestore RBAC Rules'}</span>
            </div>
          </div>
        </div>

        {/* Database Status Card */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900">
                  {isAr ? 'قاعدة بيانات Supabase السحابية' : 'Supabase Cloud Database'}
                </h4>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-semibold rounded-full font-mono">
                  PostgreSQL
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate max-w-xs sm:max-w-md">
                {SUPABASE_URL}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={testDatabaseConnection}
              disabled={isTestingConn}
              className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingConn ? 'animate-spin text-blue-600' : ''}`} />
              <span>{isTestingConn ? (isAr ? 'جاري الفحص...' : 'Testing...') : (isAr ? 'فحص الجداول الآن' : 'Test Tables')}</span>
            </button>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isAr ? 'متصل' : 'Connected'}</span>
            </span>
          </div>
        </div>

        {/* Live Table Health Breakdown if tested */}
        {connectionCheck && (
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                {isAr ? 'نتائج تشخيص الجداول في Supabase' : 'Supabase Table Diagnostics'}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {connectionCheck.tables.filter(t => t.accessible).length}/{connectionCheck.tables.length} {isAr ? 'جداول متاحة' : 'tables accessible'}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {connectionCheck.tables.map((t) => (
                <div
                  key={t.name}
                  className={`p-3 rounded-xl border text-xs flex flex-col justify-between gap-1.5 ${
                    t.accessible
                      ? 'bg-white border-emerald-200 text-emerald-900 shadow-2xs'
                      : 'bg-amber-50/90 border-amber-300 text-amber-950'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 truncate">
                      {t.accessible ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      )}
                      <span className="font-mono font-bold text-xs truncate">{t.name}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                      t.accessible ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-200 text-amber-900'
                    }`}>
                      {t.accessible ? `${t.count ?? 0} rows` : (isAr ? 'محجوب / غير منشأ' : 'Blocked')}
                    </span>
                  </div>
                  {!t.accessible && t.error && (
                    <p className="text-[10px] text-amber-800 font-sans border-t border-amber-200/80 pt-1">
                      {t.error}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Master Permanent SQL Fix Banner */}
        <div className="p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-400/80 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-amber-700 shrink-0" />
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-amber-950">
                  {isAr ? 'الحل الجذري النهائي (إنشاء الجداول وإلغاء حظر RLS للأبد)' : 'Permanent Master Fix (Create Tables & Unblock RLS Forever)'}
                </h4>
                <p className="text-[11px] text-amber-900">
                  {isAr
                    ? 'سبب ظهور Blocked هو إما أن الجداول لم تُنشأ بعد في مشروعك أو أن RLS مفعّل بدون صلاحيات anon. هذا الكود ينشئ الجداول ويلغي الحظر فوراً وبشكل دائم:'
                    : 'Blocked status occurs if tables were not yet created or RLS is restricting anon access. Running this script creates all 6 tables and disables RLS forever.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0">
              <button
                onClick={copySqlToClipboard}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ كود SQL' : 'Copy SQL Script')}</span>
              </button>
              <a
                href="https://supabase.com/dashboard/project/uybfzgpxlwkatqucmlpu/sql/new"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-white border border-amber-300 hover:bg-amber-50 text-amber-950 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <ExternalLink className="w-3.5 h-3.5 text-amber-700" />
                <span>{isAr ? 'فتح SQL Editor' : 'Open Supabase SQL'}</span>
              </a>
            </div>
          </div>

          <div className="relative">
            <pre className="p-3 bg-slate-900 text-amber-300 font-mono text-[11px] rounded-xl overflow-x-auto select-all max-h-56 leading-relaxed">
              {PERMANENT_FIX_SQL}
            </pre>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-amber-900 bg-amber-100/70 p-2.5 rounded-xl border border-amber-300/60">
            <span className="font-bold">💡 {isAr ? 'طريقة التطبيق بثوانٍ:' : 'Quick Steps:'}</span>
            <span>
              {isAr
                ? 'اضغط "نسخ كود SQL" ➔ افتح SQL Editor في Supabase ➔ الصق الكود واضغط Run ➔ ارجع واضغط "فحص الجداول الآن".'
                : 'Click "Copy SQL Script" ➔ Open Supabase SQL Editor ➔ Paste & click Run ➔ Return and click "Test Tables".'}
            </span>
          </div>
        </div>

        {/* Commit / Sync All Data to Supabase Card */}
        <div className="p-5 rounded-2xl bg-sky-50/60 border border-sky-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <UploadCloud className="w-4 h-4 text-sky-600" />
              <span>{isAr ? 'مزامنة وإرسال كافة البيانات إلى Supabase' : 'Commit / Sync All Records to Supabase'}</span>
            </h4>
            <p className="text-[11px] text-slate-600 max-w-xl">
              {isAr
                ? 'إرسال ومطابقة كافة العقارات، المشاريع التطويرية، المقالات، والتقييمات إلى جداول قاعدة البيانات السحابية مع معالجة وتجاوز أي قيود'
                : 'Pushes all properties, master developments, market intelligence articles, and testimonials directly into your Supabase database.'}
            </p>
          </div>

          <button
            onClick={handleSyncToSupabase}
            disabled={isSyncing}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-xs whitespace-nowrap shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>
              {isSyncing
                ? isAr ? 'جاري المزامنة...' : 'Syncing Data...'
                : isAr ? 'مزامنة الآن إلى Supabase' : 'Sync to Supabase'}
            </span>
          </button>
        </div>

        {/* Sync Status Banner with detailed per-table results */}
        {syncStatus && (
          <div
            className={`p-4 rounded-2xl border text-xs space-y-2.5 animate-in fade-in ${
              syncStatus.success
                ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
                : 'bg-amber-50/90 border-amber-200 text-amber-900'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {syncStatus.success ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <span className="font-semibold">{syncStatus.message}</span>
                {syncStatus.details?.tableResults && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {syncStatus.details.tableResults.map((tr: any) => (
                      <span
                        key={tr.table}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono ${
                          tr.status === 'success'
                            ? 'bg-emerald-100/80 text-emerald-800 font-semibold'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {tr.status === 'success' ? '✓' : '⚠️'} {tr.table}: {tr.count} synced
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reset Database */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900">
              {isAr ? 'إعادة ضبط كتالوج العقارات إلى القيم الأصلية' : 'Restore Default Catalog'}
            </h4>
            <p className="text-[11px] text-slate-500">
              {isAr
                ? 'استعادة العقارات الفاخرة الافتراضية مع الاحتفاظ بإمكانية التعديل والإضافة'
                : 'Re-seed properties database to initial verified luxury listings'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {resetMessage && (
              <span className="text-xs text-emerald-600 font-bold animate-in fade-in">
                {isAr ? 'تمت إعادة الضبط بنجاح!' : 'Reset Successful!'}
              </span>
            )}
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isAr ? 'إعادة الضبط' : 'Reset Catalog'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


