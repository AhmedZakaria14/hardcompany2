import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  UserPlus,
  UserX,
  UserCheck,
  Key,
  Lock,
  Mail,
  Building,
  Layers,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Search,
  Sliders,
  History,
  Trash2,
  X,
  Plus,
} from 'lucide-react';
import { Language } from '../../types';
import { AdminRole, SectorId, canManageSettings, AdminProfileDoc, AuditEventDoc } from '../../types/firestore-schema';
import { collection, doc, getDocs, setDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { sendAdminPasswordReset } from '../../lib/firebaseService';
import { AdminDataWriter } from '../../lib/firebase/dataAccess';

interface CMSAdminManagementProps {
  language: Language;
  currentAdminUser: { uid?: string; name: string; email: string; role: string };
}

export const CMSAdminManagement: React.FC<CMSAdminManagementProps> = ({
  language,
  currentAdminUser,
}) => {
  const isAr = language === 'ar';
  const isSuperAdmin = canManageSettings(currentAdminUser.role);

  const [admins, setAdmins] = useState<AdminProfileDoc[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEventDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Invite Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<AdminRole>('editor');
  const [inviteSectors, setInviteSectors] = useState<SectorId[]>(['realestate']);
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);

  // Edit Admin Modal
  const [editingAdmin, setEditingAdmin] = useState<AdminProfileDoc | null>(null);
  const [editRole, setEditRole] = useState<AdminRole>('editor');
  const [editSectors, setEditSectors] = useState<SectorId[]>([]);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const loadAdminProfilesAndAuditLogs = async () => {
    setIsLoading(true);
    try {
      // Fetch all admin profiles
      const colRef = collection(db, 'admin_profiles');
      const snap = await getDocs(colRef);
      const items: AdminProfileDoc[] = [];

      if (!snap.empty) {
        snap.docs.forEach((d) => {
          items.push(d.data() as AdminProfileDoc);
        });
      } else {
        // Fallback default superadmin profile if database empty
        items.push({
          uid: currentAdminUser.uid || 'admin_master_1',
          schemaVersion: '2.0.0',
          email: currentAdminUser.email || 'admin@hard.sa',
          displayName: currentAdminUser.name || 'Executive Superadmin',
          role: 'superadmin',
          department: 'Executive Board',
          allowedSectors: ['portal', 'realestate', 'construction', 'hvac'],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      setAdmins(items);

      // Fetch audit logs
      const auditRef = collection(db, 'audit_events');
      const auditSnap = await getDocs(auditRef);
      if (!auditSnap.empty) {
        const logs = auditSnap.docs.map((d) => d.data() as AuditEventDoc);
        logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setAuditLogs(logs.slice(0, 15));
      }
    } catch (err: any) {
      console.warn('Error loading admin profiles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminProfilesAndAuditLogs();
  }, []);

  // Helper to count active superadmins
  const getActiveSuperAdminCount = (): number => {
    return admins.filter((a) => a.role === 'superadmin' && a.isActive).length;
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsSubmittingInvite(true);

    try {
      if (!inviteEmail || !inviteEmail.includes('@')) {
        throw new Error(isAr ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email address');
      }

      const uid = `uid_${inviteEmail.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      const newAdmin: AdminProfileDoc = {
        uid,
        schemaVersion: '2.0.0',
        email: inviteEmail.trim().toLowerCase(),
        displayName: inviteName.trim() || inviteEmail.split('@')[0],
        role: inviteRole,
        department: 'Operations',
        allowedSectors: inviteSectors,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to Firestore collections
      await setDoc(doc(db, 'admin_profiles', uid), newAdmin);
      await setDoc(doc(db, 'users', uid), newAdmin);

      // Send Firebase Auth password setup email
      try {
        await sendAdminPasswordReset(inviteEmail.trim());
      } catch {
        // Invite doc saved safely
      }

      // Record audit event
      await AdminDataWriter.recordAuditEvent(
        'auth_login',
        currentAdminUser.uid || 'SERVER',
        currentAdminUser.email,
        {
          action: 'invite_admin_user',
          targetEmail: inviteEmail,
          role: inviteRole,
          allowedSectors: inviteSectors,
        }
      );

      setFeedback({
        type: 'success',
        message: isAr
          ? `تم اعتماد الحساب وإرسال رابط إعداد كلمة المرور إلى ${inviteEmail}`
          : `Admin profile approved and password setup link sent to ${inviteEmail}`,
      });

      setIsInviteModalOpen(false);
      setInviteEmail('');
      setInviteName('');
      loadAdminProfilesAndAuditLogs();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || (isAr ? 'تعذر دعوة الحساب' : 'Failed to invite admin profile'),
      });
    } finally {
      setIsSubmittingInvite(false);
    }
  };

  const handleToggleActive = async (admin: AdminProfileDoc) => {
    setFeedback(null);

    // Protection rule: Prevent disabling the last active superadmin
    if (admin.role === 'superadmin' && admin.isActive && getActiveSuperAdminCount() <= 1) {
      setFeedback({
        type: 'error',
        message: isAr
          ? '⚠️ حظر أمان: لا يمكن تعطيل آخر مشرف فائق نشط في النظام لمنع فقدان الصلاحيات'
          : '⚠️ Security Lock: Cannot disable the last active Super Administrator',
      });
      return;
    }

    try {
      const nextStatus = !admin.isActive;
      await updateDoc(doc(db, 'admin_profiles', admin.uid), {
        isActive: nextStatus,
        updatedAt: new Date().toISOString(),
      });
      await updateDoc(doc(db, 'users', admin.uid), {
        isActive: nextStatus,
        updatedAt: new Date().toISOString(),
      });

      await AdminDataWriter.recordAuditEvent(
        'auth_login',
        currentAdminUser.uid || 'SERVER',
        currentAdminUser.email,
        {
          action: nextStatus ? 'enable_admin_access' : 'disable_admin_access',
          targetUid: admin.uid,
          targetEmail: admin.email,
        }
      );

      setFeedback({
        type: 'success',
        message: isAr
          ? `تم ${nextStatus ? 'تفعيل' : 'تعطيل'} حساب ${admin.email} بنجاح`
          : `Account ${admin.email} ${nextStatus ? 'enabled' : 'disabled'} successfully`,
      });

      loadAdminProfilesAndAuditLogs();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: isAr ? 'تعذر تغيير حالة الحساب' : 'Failed to update account status',
      });
    }
  };

  const handleSaveAdminEdit = async () => {
    if (!editingAdmin) return;
    setFeedback(null);
    setIsSavingEdit(true);

    try {
      // Protection check: Cannot downgrade role if it's the last superadmin
      if (editingAdmin.role === 'superadmin' && editRole !== 'superadmin' && getActiveSuperAdminCount() <= 1) {
        throw new Error(
          isAr
            ? '⚠️ حظر أمان: لا يمكن تعديل دور آخر مشرف فائق في النظام'
            : '⚠️ Security Lock: Cannot change role of the last active Super Administrator'
        );
      }

      await updateDoc(doc(db, 'admin_profiles', editingAdmin.uid), {
        role: editRole,
        allowedSectors: editSectors,
        updatedAt: new Date().toISOString(),
      });
      await updateDoc(doc(db, 'users', editingAdmin.uid), {
        role: editRole,
        allowedSectors: editSectors,
        updatedAt: new Date().toISOString(),
      });

      await AdminDataWriter.recordAuditEvent(
        'auth_login',
        currentAdminUser.uid || 'SERVER',
        currentAdminUser.email,
        {
          action: 'update_admin_role_sectors',
          targetUid: editingAdmin.uid,
          newRole: editRole,
          newSectors: editSectors,
        }
      );

      setFeedback({
        type: 'success',
        message: isAr ? 'تم تحديث صلاحيات الحساب بنجاح' : 'Admin roles & sector permissions updated',
      });

      setEditingAdmin(null);
      loadAdminProfilesAndAuditLogs();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || (isAr ? 'تعذر تعديل الصلاحيات' : 'Failed to update admin permissions'),
      });
    } finally {
      setIsSavingEdit(false);
    }
  };

  const filteredAdmins = admins.filter(
    (a) =>
      a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isSuperAdmin) {
    return (
      <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-4 max-w-xl mx-auto my-12 text-white">
        <div className="w-14 h-14 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto text-red-400">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold font-display-serif">
          {isAr ? 'وصول محدود للمشرف الفائق' : 'Super Administrator Restricted Area'}
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          {isAr
            ? 'شاشة إدارة حسابات المدراء والصلحيات مقتصرة على المشرفين الفائقين (Super Administrators) فقط لحماية أمان النظام.'
            : 'Admin management and access governance controls are strictly reserved for Super Administrators.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isAr ? 'حكام وإدارة صلاحيات النظام' : 'System Access Governance'}</span>
          </div>
          <h2 className="text-xl font-extrabold text-white font-display-serif">
            {isAr ? 'إدارة المسؤولين والأدوار (Admin Users Management)' : 'Admin Users & Role Control'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isAr
              ? 'إدارة حسابات المدراء، تخصيص القطاعات (عقارات/إنشاءات/تكييف)، وإدارة الوصول الآمن'
              : 'Provision admin accounts, assign sector boundaries, and govern active sessions'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAdminProfilesAndAuditLogs}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title={isAr ? 'تحديث البيانات' : 'Refresh List'}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-blue-900/30 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isAr ? 'اعتماد مسؤول جديد' : 'Invite New Admin'}</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-3 animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
              : 'bg-red-500/20 border-red-500/40 text-red-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span className="flex-1">{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute top-3.5 start-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? 'البحث بالاسم، البريد أو الدور...' : 'Search by name, email or role...'}
            className="w-full ps-10 pe-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Admin Users Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] font-bold border-b border-slate-800">
              <tr>
                <th className="p-4 text-start">{isAr ? 'المسؤول' : 'Admin User'}</th>
                <th className="p-4 text-start">{isAr ? 'الدور (Role)' : 'Role'}</th>
                <th className="p-4 text-start">{isAr ? 'القطاعات المتاحة' : 'Allowed Sectors'}</th>
                <th className="p-4 text-start">{isAr ? 'الحالة' : 'Status'}</th>
                <th className="p-4 text-center">{isAr ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                        <span>{isAr ? 'جاري تحميل سجلات المسؤولين...' : 'Loading admin profiles...'}</span>
                      </div>
                    ) : (
                      <span>{isAr ? 'لا يوجد مسؤولين مطابقين للبحث' : 'No admin accounts match your search'}</span>
                    )}
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin) => {
                  const isCurrent = admin.uid === currentAdminUser.uid || admin.email === currentAdminUser.email;
                  return (
                    <tr key={admin.uid} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center border border-blue-500/30">
                            {admin.displayName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-2">
                              <span>{admin.displayName}</span>
                              {isCurrent && (
                                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold">
                                  {isAr ? 'أنت' : 'You'}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">{admin.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border capitalize ${
                            admin.role === 'superadmin'
                              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                              : admin.role === 'publisher'
                              ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                              : admin.role === 'lead_manager'
                              ? 'bg-sky-500/10 text-sky-300 border-sky-500/30'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {admin.role}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {(admin.allowedSectors || []).map((sec) => (
                            <span key={sec} className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-medium text-slate-300 border border-slate-700">
                              {sec}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            admin.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${admin.isActive ? 'bg-emerald-400' : 'bg-red-400'}`} />
                          <span>{admin.isActive ? (isAr ? 'نشط' : 'Active') : (isAr ? 'معطل' : 'Disabled')}</span>
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setEditingAdmin(admin);
                              setEditRole(admin.role);
                              setEditSectors(admin.allowedSectors || ['realestate']);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                            title={isAr ? 'تعديل الصلاحيات والقطاعات' : 'Edit Roles & Sectors'}
                          >
                            <Sliders className="w-4 h-4 text-blue-400" />
                          </button>

                          <button
                            onClick={() => handleToggleActive(admin)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              admin.isActive ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400' : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'
                            }`}
                            title={admin.isActive ? (isAr ? 'تعطيل الحساب' : 'Disable Account') : (isAr ? 'تفعيل الحساب' : 'Enable Account')}
                          >
                            {admin.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Audit Log Preview */}
      <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-4">
        <div className="flex items-center gap-2 font-bold text-sm text-white">
          <History className="w-4 h-4 text-blue-400" />
          <span>{isAr ? 'سجل أحداث الأمان ومراجعة الصلاحيات (Security Audit Logs)' : 'Recent Security Governance Audit Logs'}</span>
        </div>

        <div className="space-y-2">
          {auditLogs.length === 0 ? (
            <p className="text-xs text-slate-500">{isAr ? 'لا توجد أحداث أمان مسجلة مؤخراً' : 'No recent audit events recorded'}</p>
          ) : (
            auditLogs.map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="font-mono text-blue-400 font-bold">{log.eventType}</div>
                  <div className="text-slate-400 text-[11px]">{JSON.stringify(log.details)}</div>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">{log.createdAt ? new Date(log.createdAt).toLocaleString() : ''}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 text-start shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 font-bold text-lg text-white">
                <UserPlus className="w-5 h-5 text-blue-400" />
                <span>{isAr ? 'اعتماد مسؤول جديد' : 'Invite Approved Admin'}</span>
              </div>
              <button onClick={() => setIsInviteModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">{isAr ? 'البريد الإلكتروني للمسؤول' : 'Admin Email'} *</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="e.g. manager@hard.sa"
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">{isAr ? 'الاسم الكامل' : 'Full Name'}</label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Khalid Al-Mansoor"
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">{isAr ? 'الدور (Role)' : 'Assigned Role'} *</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as AdminRole)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="editor">{isAr ? 'محرر محتوى (Content Editor)' : 'Content Editor'}</option>
                  <option value="publisher">{isAr ? 'ناشر معتمد (Publisher)' : 'Publisher'}</option>
                  <option value="lead_manager">{isAr ? 'مدير الطلبات والعملاء (Lead Manager)' : 'Lead Manager'}</option>
                  <option value="superadmin">{isAr ? 'مشرف فائق (Super Administrator)' : 'Super Administrator'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">{isAr ? 'القطاعات المصرح بها' : 'Allowed Sectors'} *</label>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                  {(['portal', 'realestate', 'construction', 'hvac'] as SectorId[]).map((sec) => (
                    <label key={sec} className="flex items-center gap-2 p-2 rounded-lg bg-slate-800 border border-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inviteSectors.includes(sec)}
                        onChange={(e) => {
                          if (e.target.checked) setInviteSectors([...inviteSectors, sec]);
                          else setInviteSectors(inviteSectors.filter((s) => s !== sec));
                        }}
                        className="rounded border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="capitalize">{sec}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-800/40 text-[11px] text-slate-300 space-y-1">
                <p>🔒 {isAr ? 'سيتم إرسال رابط إعداد كلمة المرور آلياً عبر Firebase Auth.' : 'Password setup link will be sent automatically via Firebase Auth.'}</p>
                <p className="text-[10px] text-slate-400">{isAr ? 'لا يتم عرض أو نقل كلمات المرور بداخل النظام.' : 'Passwords are never stored or transmitted through the CMS.'}</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingInvite}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmittingInvite && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isAr ? 'اعتماد وإرسال الدعوة' : 'Approve & Send Invite'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {editingAdmin && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 text-start shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 font-bold text-lg text-white">
                <Sliders className="w-5 h-5 text-blue-400" />
                <span>{isAr ? 'تعديل أدوار وقطاعات المسؤول' : 'Edit Admin Permissions'}</span>
              </div>
              <button onClick={() => setEditingAdmin(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="font-bold text-white text-xs">{editingAdmin.displayName}</div>
                <div className="text-[11px] text-slate-400 font-mono">{editingAdmin.email}</div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">{isAr ? 'الدور الجديد (Role)' : 'New Role'} *</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as AdminRole)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="editor">{isAr ? 'محرر محتوى (Content Editor)' : 'Content Editor'}</option>
                  <option value="publisher">{isAr ? 'ناشر معتمد (Publisher)' : 'Publisher'}</option>
                  <option value="lead_manager">{isAr ? 'مدير الطلبات والعملاء (Lead Manager)' : 'Lead Manager'}</option>
                  <option value="superadmin">{isAr ? 'مشرف فائق (Super Administrator)' : 'Super Administrator'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">{isAr ? 'القطاعات المصرح بها' : 'Allowed Sectors'}</label>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                  {(['portal', 'realestate', 'construction', 'hvac'] as SectorId[]).map((sec) => (
                    <label key={sec} className="flex items-center gap-2 p-2 rounded-lg bg-slate-800 border border-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editSectors.includes(sec)}
                        onChange={(e) => {
                          if (e.target.checked) setEditSectors([...editSectors, sec]);
                          else setEditSectors(editSectors.filter((s) => s !== sec));
                        }}
                        className="rounded border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="capitalize">{sec}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingAdmin(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleSaveAdminEdit}
                  disabled={isSavingEdit}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSavingEdit && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isAr ? 'حفظ الصلاحيات' : 'Save Permissions'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
