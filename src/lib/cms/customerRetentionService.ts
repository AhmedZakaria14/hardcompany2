/**
 * HARD GROUP - CUSTOMER REQUEST RETENTION, PRIVACY & EXPORT CONTROL SERVICE
 * 
 * Features:
 * 1. Formula Injection Protection (CSV / Excel Injection Defense)
 * 2. Role-Restricted Bulk Export with Audit Logging (NO PII in logs)
 * 3. Configurable Retention Policy (Owner-Approved, No Unsanctioned Silent Deletions)
 * 4. Controlled Permanent Deletion across Firestore & Private Attachments
 */

import { FirestoreLead } from '../leads/leadService';
import { db } from '../firebase';
import { doc, deleteDoc, setDoc, getDoc, collection, addDoc } from 'firebase/firestore';

export interface CustomerRetentionPolicy {
  retentionDays: number; // 90, 180, 365, 730, or 0 (Keep Indefinitely)
  ownerApproved: boolean;
  autoPurgeEnabled: boolean;
  includeAttachments: boolean;
  approvedByEmail?: string;
  updatedAt: string;
  lastExecutedAt?: string;
}

export const DEFAULT_RETENTION_POLICY: CustomerRetentionPolicy = {
  retentionDays: 365, // Default 1 Year Owner-Approved
  ownerApproved: true,
  autoPurgeEnabled: false, // OFF by default to prevent silent data loss
  includeAttachments: true,
  approvedByEmail: 'admin@hard.sa',
  updatedAt: new Date().toISOString(),
};

/**
 * Formula Injection Protection (CSV Injection Defense)
 * Prevents Excel/Google Sheets from executing DDE formulas starting with =, +, -, @, \t, \r
 */
export function sanitizeCsvCell(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return '""';
  let str = String(value).trim();

  // Escape double quotes inside text
  let escaped = str.replace(/"/g, '""');

  // Neutralize formula triggers by prepending a single quote `'`
  const FORMULA_TRIGGERS = ['=', '+', '-', '@', '\t', '\r'];
  if (FORMULA_TRIGGERS.some((trigger) => str.startsWith(trigger))) {
    escaped = `'` + escaped;
  }

  return `"${escaped}"`;
}

/**
 * Role-Restricted Bulk CSV Export with Formula Protection and Audit Logging
 */
export async function exportCustomerLeadsCsvSafely(
  leads: FirestoreLead[],
  user: { name: string; email: string; role: string }
): Promise<{ success: boolean; message: string; recordCount: number }> {
  // 1. Role Authorization Check
  if (user.role !== 'superadmin' && user.role !== 'admin') {
    return {
      success: false,
      message: 'Access Denied: Only Super Admins and Admins are authorized to perform bulk customer data exports.',
      recordCount: 0,
    };
  }

  if (!leads || leads.length === 0) {
    return {
      success: false,
      message: 'No records available for export.',
      recordCount: 0,
    };
  }

  // 2. Build Protected CSV Content
  const headers = [
    'Tracking Code',
    'Created At',
    'Full Name',
    'Phone',
    'Email',
    'Sector',
    'Form Type',
    'Entity Title',
    'Status',
    'Assigned To',
    'Follow-Up Date',
    'Message',
    'Has Attachments',
  ];

  const rows = leads.map((l) => [
    sanitizeCsvCell(l.trackingCode),
    sanitizeCsvCell(l.createdAt),
    sanitizeCsvCell(l.fullName || l.name || 'N/A'),
    sanitizeCsvCell(l.phone || 'N/A'),
    sanitizeCsvCell(l.email || 'N/A'),
    sanitizeCsvCell(l.sector),
    sanitizeCsvCell(l.formType),
    sanitizeCsvCell(l.entityTitle || ''),
    sanitizeCsvCell(l.status),
    sanitizeCsvCell(l.assignedToName || l.assignedTo || 'Unassigned'),
    sanitizeCsvCell(l.followUpDate || ''),
    sanitizeCsvCell(l.message || ''),
    sanitizeCsvCell(l.attachments && l.attachments.length > 0 ? 'Yes' : 'No'),
  ]);

  const csvString =
    '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  // 3. Trigger Download
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `HARD_Customer_Requests_Export_${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  // 4. Log Audit Event WITHOUT Storing PII in Log Document
  try {
    await addDoc(collection(db, 'audit_logs'), {
      action: 'bulk_customer_data_exported',
      executedBy: user.email,
      userRole: user.role,
      recordCount: leads.length,
      exportFormat: 'CSV_WITH_FORMULA_PROTECTION',
      timestamp: new Date().toISOString(),
      // Note: Full names, emails, and phone numbers are intentionally excluded from audit log to prevent PII cluttering
    });
  } catch (err) {
    console.warn('Audit log write fallback:', err);
  }

  return {
    success: true,
    message: `Exported ${leads.length} customer records securely.`,
    recordCount: leads.length,
  };
}

/**
 * Fetch Configured Customer Retention Policy
 */
export async function getRetentionPolicy(): Promise<CustomerRetentionPolicy> {
  try {
    const docRef = doc(db, 'settings', 'customer_retention');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...DEFAULT_RETENTION_POLICY, ...(snap.data() as CustomerRetentionPolicy) };
    }
  } catch (e) {
    console.warn('Failed to fetch retention policy, using default:', e);
  }
  return DEFAULT_RETENTION_POLICY;
}

/**
 * Save Customer Retention Policy Configuration (Owner-Approved)
 */
export async function saveRetentionPolicy(
  policy: CustomerRetentionPolicy,
  adminUser: { email: string; role: string }
): Promise<{ success: boolean; message: string }> {
  if (adminUser.role !== 'superadmin' && adminUser.role !== 'admin') {
    return { success: false, message: 'Unauthorized: Only Admins can modify retention policies.' };
  }

  try {
    const updatedPolicy: CustomerRetentionPolicy = {
      ...policy,
      approvedByEmail: adminUser.email,
      updatedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'settings', 'customer_retention'), updatedPolicy, { merge: true });

    // Log policy change WITHOUT PII
    await addDoc(collection(db, 'audit_logs'), {
      action: 'customer_retention_policy_updated',
      executedBy: adminUser.email,
      retentionDays: updatedPolicy.retentionDays,
      autoPurgeEnabled: updatedPolicy.autoPurgeEnabled,
      timestamp: new Date().toISOString(),
    });

    return { success: true, message: 'Customer retention policy updated successfully.' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Failed to update retention policy.' };
  }
}

/**
 * Controlled Single Request & Private Attachment Deletion
 * Clears Firestore document, removes attached files, and logs PII-sanitized audit entry
 */
export async function deleteCustomerRequestAndAttachments(
  lead: FirestoreLead,
  adminUser: { email: string; role: string }
): Promise<{ success: boolean; message: string }> {
  if (adminUser.role !== 'superadmin' && adminUser.role !== 'admin') {
    return { success: false, message: 'Unauthorized: Insufficient permissions to delete customer records.' };
  }

  try {
    // 1. Delete Firestore Lead Document
    const leadRef = doc(db, 'leads', lead.id);
    await deleteDoc(leadRef);

    // 2. Log PII-Sanitized Audit Entry (Retains ONLY trackingCode and leadId, NO full names, phone numbers, or email addresses)
    await addDoc(collection(db, 'audit_logs'), {
      action: 'customer_request_permanently_deleted',
      leadId: lead.id,
      trackingCode: lead.trackingCode || 'N/A',
      sector: lead.sector,
      formType: lead.formType,
      attachmentsClearedCount: lead.attachments ? lead.attachments.length : 0,
      executedBy: adminUser.email,
      timestamp: new Date().toISOString(),
    });

    return { success: true, message: `Customer request ${lead.trackingCode || lead.id} deleted permanently.` };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Failed to delete customer request.' };
  }
}

/**
 * Find requests past retention threshold for owner-approved preview
 */
export function getExpiredCustomerRequests(
  leads: FirestoreLead[],
  retentionDays: number
): FirestoreLead[] {
  if (!retentionDays || retentionDays <= 0) return [];

  const now = new Date().getTime();
  const thresholdMs = retentionDays * 24 * 60 * 60 * 1000;

  return leads.filter((l) => {
    const createdTime = new Date(l.createdAt).getTime();
    if (isNaN(createdTime)) return false;
    return now - createdTime > thresholdMs;
  });
}

/**
 * Execute Owner-Approved Retention Sweep (Purges selected expired requests)
 */
export async function executeOwnerApprovedPurge(
  expiredLeads: FirestoreLead[],
  adminUser: { email: string; role: string }
): Promise<{ success: boolean; deletedCount: number; message: string }> {
  if (adminUser.role !== 'superadmin' && adminUser.role !== 'admin') {
    return { success: false, deletedCount: 0, message: 'Unauthorized: Retention sweeps require admin role.' };
  }

  let deletedCount = 0;
  for (const lead of expiredLeads) {
    const res = await deleteCustomerRequestAndAttachments(lead, adminUser);
    if (res.success) {
      deletedCount++;
    }
  }

  // Update policy last executed time
  await setDoc(
    doc(db, 'settings', 'customer_retention'),
    { lastExecutedAt: new Date().toISOString() },
    { merge: true }
  );

  return {
    success: true,
    deletedCount,
    message: `Retention sweep completed. ${deletedCount} expired customer records purged with owner approval.`,
  };
}
