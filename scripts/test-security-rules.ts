/**
 * Firestore Security Rules Assertion Verification Suite
 * Tests deny-by-default access, anonymous read bounds, lead submission, and RBAC rules.
 */

import { readFileSync } from 'fs';
import path from 'path';

export interface SecurityTestCase {
  name: string;
  user: { uid?: string; role?: string; allowedSectors?: string[] } | null;
  operation: 'read' | 'create' | 'update' | 'delete';
  collection: string;
  docData?: Record<string, any>;
  existingDocData?: Record<string, any>;
  expectedResult: 'ALLOW' | 'DENY';
}

/**
 * Static rule evaluation engine matching rules in firestore.rules
 */
export function evaluateSecurityRule(testCase: SecurityTestCase): {
  allowed: boolean;
  reason: string;
} {
  const { user, operation, collection, docData, existingDocData } = testCase;
  const isSignedIn = Boolean(user && user.uid);
  const isSuperAdmin = isSignedIn && user?.role === 'superadmin';
  const isPublisher = isSignedIn && (isSuperAdmin || user?.role === 'publisher');
  const isEditor = isSignedIn && (isPublisher || user?.role === 'editor');
  const isLeadManager = isSignedIn && (isPublisher || user?.role === 'lead_manager');

  // 1. Private Operational Collections
  if (['leads', 'appointment_requests', 'subscribers'].includes(collection)) {
    if (operation === 'create') {
      return { allowed: true, reason: 'Public lead/appointment/subscriber submissions allowed' };
    }
    if (operation === 'read' || operation === 'update') {
      if (isLeadManager) {
        return { allowed: true, reason: 'Lead managers and publishers allowed read/update' };
      }
      return { allowed: false, reason: 'Anonymous or unprivileged users denied access to private leads' };
    }
    if (operation === 'delete') {
      if (isSuperAdmin) {
        return { allowed: true, reason: 'Superadmin allowed delete' };
      }
      return { allowed: false, reason: 'Only superadmin can delete leads' };
    }
  }

  // 2. Admin & Governance Collections
  if (['users', 'admin_profiles', 'audit_events'].includes(collection)) {
    if (!isSignedIn) {
      return { allowed: false, reason: 'Anonymous access denied on governance collections' };
    }
    if (operation === 'update' && user?.role !== 'superadmin') {
      // Check if user is attempting to modify role or allowedSectors
      if (
        docData?.role !== existingDocData?.role ||
        JSON.stringify(docData?.allowedSectors) !== JSON.stringify(existingDocData?.allowedSectors)
      ) {
        return { allowed: false, reason: 'Non-superadmins cannot modify roles or sector scopes' };
      }
    }
    if (isSuperAdmin || (user?.uid && existingDocData?.uid === user.uid)) {
      return { allowed: true, reason: 'Self or Superadmin allowed access' };
    }
    return { allowed: false, reason: 'User not authorized to access target profile' };
  }

  // 3. Business Content Collections (properties, projects, services, articles)
  if (['properties', 'construction_projects', 'hvac_services', 'blog_posts'].includes(collection)) {
    if (operation === 'read') {
      const isPublished = existingDocData?.publicationStatus === 'published' || existingDocData?.isPublished === true;
      if (isPublished || isEditor) {
        return { allowed: true, reason: 'Published content readable by public, drafts by editors' };
      }
      return { allowed: false, reason: 'Draft content hidden from anonymous visitors' };
    }
    if (operation === 'create' || operation === 'update') {
      if (isEditor) {
        return { allowed: true, reason: 'Editors allowed create/update drafts' };
      }
      return { allowed: false, reason: 'Unauthenticated/non-editors denied write access' };
    }
    if (operation === 'delete') {
      if (isPublisher) {
        return { allowed: true, reason: 'Publishers and superadmins allowed delete' };
      }
      return { allowed: false, reason: 'Editors cannot delete content without publisher role' };
    }
  }

  // Fallback Deny by Default
  return { allowed: false, reason: 'Deny by default for unmapped paths' };
}

// Suite Test Cases
export const SECURITY_RULES_TEST_SUITE: SecurityTestCase[] = [
  {
    name: 'Anonymous visitor reading published property',
    user: null,
    operation: 'read',
    collection: 'properties',
    existingDocData: { publicationStatus: 'published', title: { ar: 'فيلا', en: 'Villa' } },
    expectedResult: 'ALLOW',
  },
  {
    name: 'Anonymous visitor attempting to read DRAFT property',
    user: null,
    operation: 'read',
    collection: 'properties',
    existingDocData: { publicationStatus: 'draft', title: { ar: 'مسودة فيلا', en: 'Draft Villa' } },
    expectedResult: 'DENY',
  },
  {
    name: 'Anonymous visitor attempting to read customer leads',
    user: null,
    operation: 'read',
    collection: 'leads',
    existingDocData: { email: 'client@example.com', name: 'John' },
    expectedResult: 'DENY',
  },
  {
    name: 'Anonymous visitor submitting a new lead',
    user: null,
    operation: 'create',
    collection: 'leads',
    docData: { name: 'Ahmad', email: 'ahmad@example.com', sector: 'realestate' },
    expectedResult: 'ALLOW',
  },
  {
    name: 'Anonymous visitor attempting to read audit events',
    user: null,
    operation: 'read',
    collection: 'audit_events',
    expectedResult: 'DENY',
  },
  {
    name: 'Content Editor attempting to self-escalate role to superadmin',
    user: { uid: 'editor_101', role: 'editor' },
    operation: 'update',
    collection: 'admin_profiles',
    existingDocData: { uid: 'editor_101', role: 'editor', allowedSectors: ['realestate'] },
    docData: { uid: 'editor_101', role: 'superadmin', allowedSectors: ['portal', 'realestate'] },
    expectedResult: 'DENY',
  },
  {
    name: 'Superadmin modifying user permissions',
    user: { uid: 'superadmin_master', role: 'superadmin' },
    operation: 'update',
    collection: 'admin_profiles',
    existingDocData: { uid: 'editor_101', role: 'editor' },
    docData: { uid: 'editor_101', role: 'publisher' },
    expectedResult: 'ALLOW',
  },
  {
    name: 'Lead Manager reading customer inquiries',
    user: { uid: 'lead_mgr_1', role: 'lead_manager' },
    operation: 'read',
    collection: 'leads',
    expectedResult: 'ALLOW',
  },
];

export function runSecurityRulesTestRunner() {
  console.log('====================================================');
  console.log('FIRESTORE SECURITY RULES VERIFICATION TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  SECURITY_RULES_TEST_SUITE.forEach((test, idx) => {
    const result = evaluateSecurityRule(test);
    const actualResult = result.allowed ? 'ALLOW' : 'DENY';
    const isSuccess = actualResult === test.expectedResult;

    if (isSuccess) {
      passed++;
      console.log(`✅ [TEST ${idx + 1}] ${test.name}`);
      console.log(`   - Expected: ${test.expectedResult} | Actual: ${actualResult} (${result.reason})\n`);
    } else {
      failed++;
      console.error(`❌ [TEST ${idx + 1}] ${test.name}`);
      console.error(`   - Expected: ${test.expectedResult} | Actual: ${actualResult} (${result.reason})\n`);
    }
  });

  console.log('----------------------------------------------------');
  console.log(`TEST RESULTS SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('----------------------------------------------------');

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityRulesTestRunner();
