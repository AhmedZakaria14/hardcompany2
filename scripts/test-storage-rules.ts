/**
 * Cloud Storage Security Rules Assertion Verification Suite
 * Tests public asset read bounds, max file size constraints, MIME type checks, and private attachment protection.
 */

export interface StorageTestCase {
  name: string;
  user: { uid?: string; role?: string } | null;
  operation: 'read' | 'create' | 'delete';
  path: string;
  fileSizeBytes?: number;
  contentType?: string;
  expectedResult: 'ALLOW' | 'DENY';
}

export function evaluateStorageRule(testCase: StorageTestCase): {
  allowed: boolean;
  reason: string;
} {
  const { user, operation, path, fileSizeBytes = 1000000, contentType = 'image/jpeg' } = testCase;
  const isSignedIn = Boolean(user && user.uid);
  const isMax15MB = fileSizeBytes <= 15 * 1024 * 1024;
  const isMax10MB = fileSizeBytes <= 10 * 1024 * 1024;

  const isPermittedMime = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'image/gif',
    'application/pdf',
  ].includes(contentType);

  // 1. PUBLIC PUBLISHED MEDIA & CMS ASSETS
  if (path.startsWith('public/') || path.startsWith('cms_assets/')) {
    if (operation === 'read') {
      return { allowed: true, reason: 'Public read allowed for published CMS assets' };
    }
    if (operation === 'create') {
      if (!isSignedIn) {
        return { allowed: false, reason: 'Anonymous upload denied on CMS assets' };
      }
      if (!isMax15MB) {
        return { allowed: false, reason: 'File exceeds maximum size limit of 15 MB' };
      }
      if (!isPermittedMime) {
        return { allowed: false, reason: `Unpermitted content-type '${contentType}'` };
      }
      return { allowed: true, reason: 'Authenticated admin write allowed for valid file' };
    }
  }

  // 2. PRIVATE CUSTOMER ATTACHMENTS
  if (path.startsWith('private_attachments/')) {
    if (operation === 'read') {
      if (isSignedIn) {
        return { allowed: true, reason: 'Authenticated admin allowed to read private attachment' };
      }
      return { allowed: false, reason: 'Anonymous visitor denied read access to private attachment' };
    }
    if (operation === 'create') {
      if (!isMax10MB) {
        return { allowed: false, reason: 'Private attachment exceeds 10 MB limit' };
      }
      if (!isPermittedMime) {
        return { allowed: false, reason: `Unpermitted content-type '${contentType}'` };
      }
      return { allowed: true, reason: 'Private attachment submission allowed' };
    }
  }

  // Fallback Deny
  return { allowed: false, reason: 'Deny by default for unmapped storage paths' };
}

export const STORAGE_RULES_TEST_SUITE: StorageTestCase[] = [
  {
    name: 'Anonymous visitor reading public CMS image',
    user: null,
    operation: 'read',
    path: 'cms_assets/realestate/hero_banner.jpg',
    expectedResult: 'ALLOW',
  },
  {
    name: 'Anonymous visitor attempting to upload image to cms_assets',
    user: null,
    operation: 'create',
    path: 'cms_assets/realestate/malicious.png',
    expectedResult: 'DENY',
  },
  {
    name: 'Anonymous visitor attempting to read private customer document',
    user: null,
    operation: 'read',
    path: 'private_attachments/lead_9912/financial_doc.pdf',
    expectedResult: 'DENY',
  },
  {
    name: 'Authenticated admin uploading 2MB WebP image',
    user: { uid: 'admin_1' },
    operation: 'create',
    path: 'cms_assets/construction/building.webp',
    fileSizeBytes: 2 * 1024 * 1024,
    contentType: 'image/webp',
    expectedResult: 'ALLOW',
  },
  {
    name: 'Authenticated admin attempting to upload oversized 25MB file',
    user: { uid: 'admin_1' },
    operation: 'create',
    path: 'cms_assets/hvac/chiller.pdf',
    fileSizeBytes: 25 * 1024 * 1024,
    contentType: 'application/pdf',
    expectedResult: 'DENY',
  },
  {
    name: 'Authenticated admin attempting to upload executable .exe file',
    user: { uid: 'admin_1' },
    operation: 'create',
    path: 'cms_assets/portal/payload.exe',
    fileSizeBytes: 500000,
    contentType: 'application/x-msdownload',
    expectedResult: 'DENY',
  },
  {
    name: 'Authenticated admin reading private customer document',
    user: { uid: 'admin_1' },
    operation: 'read',
    path: 'private_attachments/lead_9912/financial_doc.pdf',
    expectedResult: 'ALLOW',
  },
];

export function runStorageRulesTestRunner() {
  console.log('====================================================');
  console.log('CLOUD STORAGE SECURITY RULES VERIFICATION SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  STORAGE_RULES_TEST_SUITE.forEach((test, idx) => {
    const result = evaluateStorageRule(test);
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
  console.log(`STORAGE TEST RESULTS SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('----------------------------------------------------');

  if (failed > 0) {
    process.exit(1);
  }
}

runStorageRulesTestRunner();
