import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { bootstrapAdminAccount } from '../firebaseService';
import { AdminProfileDoc, AuditEventDoc } from '../../types/firestore-schema';

export interface ProvisionSuperAdminResult {
  success: boolean;
  uid: string;
  email: string;
  status: 'created' | 'updated_existing' | 'already_superadmin';
  message: string;
}

/**
 * Server-side trusted provisioning function to assign Super Admin status to a verified UID or Email.
 * Must only be invoked via server-side CLI script or privileged server environment.
 */
export async function provisionSuperAdmin(
  targetUid: string,
  targetEmail: string,
  displayName: string = 'HARD Executive Superadmin'
): Promise<ProvisionSuperAdminResult> {
  if (!targetUid || typeof targetUid !== 'string') {
    throw new Error('Target UID is required for superadmin provisioning');
  }
  if (!targetEmail || !targetEmail.includes('@')) {
    throw new Error('Target email address is invalid');
  }

  // Ensure authenticated administrative session for server writes
  if (!auth.currentUser) {
    await bootstrapAdminAccount();
  }

  const normalizedEmail = targetEmail.trim().toLowerCase();
  const adminProfileRef = doc(db, 'admin_profiles', targetUid);
  const userProfileRef = doc(db, 'users', targetUid);

  const existingProfileSnap = await getDoc(adminProfileRef);

  let status: 'created' | 'updated_existing' | 'already_superadmin' = 'created';

  if (existingProfileSnap.exists()) {
    const data = existingProfileSnap.data() as AdminProfileDoc;
    if (data.role === 'superadmin' && data.isActive) {
      status = 'already_superadmin';
    } else {
      status = 'updated_existing';
    }
  }

  const profilePayload: AdminProfileDoc = {
    uid: targetUid,
    schemaVersion: '2.0.0',
    email: normalizedEmail,
    displayName,
    role: 'superadmin',
    department: 'Executive Board',
    allowedSectors: ['portal', 'realestate', 'construction', 'hvac'],
    isActive: true,
    createdAt: existingProfileSnap.exists() ? existingProfileSnap.data()?.createdAt || new Date().toISOString() : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Write to both /admin_profiles and /users for role authorization
  await setDoc(adminProfileRef, profilePayload);
  await setDoc(userProfileRef, profilePayload);

  // Record an immutable security audit event
  const auditEventPayload: AuditEventDoc = {
    id: `audit-provision-${Date.now()}`,
    schemaVersion: '2.0.0',
    eventType: 'auth_login', // Categorized security governance event
    actorUid: 'SERVER_PROVISIONER',
    actorEmail: 'system@hardgp.com',
    details: {
      action: 'provision_superadmin',
      targetUid,
      targetEmail: normalizedEmail,
      status,
      timestamp: new Date().toISOString(),
    },
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'audit_events', auditEventPayload.id), auditEventPayload);
  } catch (auditErr) {
    console.warn('Could not record audit log for superadmin provisioning:', auditErr);
  }

  return {
    success: true,
    uid: targetUid,
    email: normalizedEmail,
    status,
    message: status === 'already_superadmin'
      ? `User ${normalizedEmail} (${targetUid}) is already an active Superadmin.`
      : `Successfully provisioned Superadmin role for ${normalizedEmail} (${targetUid}).`,
  };
}
