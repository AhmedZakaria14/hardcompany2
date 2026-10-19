import { doc, getDoc, setDoc, collection, getDocs, onSnapshot, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { LocalizedText, SectorId } from '../types/firestore-schema';
import { sanitizePayload, withServerTimestamps } from './firebase/serializers';

export interface NavItem {
  id: string;
  label: LocalizedText;
  type: 'internal' | 'external';
  targetPath: string; // internal route or external URL
  targetSector?: SectorId;
  isVisible: boolean;
  order: number;
  openInNewTab?: boolean;
}

export interface NavigationDoc {
  id: string; // e.g. 'header_portal', 'footer_quick_links', 'header_realestate'
  sector: SectorId;
  menuType: 'header' | 'footer' | 'sector_bar';
  items: NavItem[];
  updatedAt: string;
  updatedBy?: string;
}

export interface RedirectDoc {
  id: string;
  sourceSlug: string;
  targetSlug: string;
  sector?: SectorId;
  statusCode: 301 | 302;
  createdAt: string;
  createdBy?: string;
}

// Protected Infrastructure Routes - Cannot be edited or redirected by content editors
export const INFRASTRUCTURE_ROUTES = [
  '/',
  '/admin',
  '/realestate/admin',
  '/construction/admin',
  '/hvac/admin',
  '/login',
  '/api',
  '/_next',
  '/static',
];

// Available Internal Destinations Catalog
export const KNOWN_INTERNAL_DESTINATIONS: { path: string; labelAr: string; labelEn: string; sector: SectorId }[] = [
  { path: '/', labelAr: 'البوابة الرئيسية القابضة', labelEn: 'Group Main Portal', sector: 'portal' },
  { path: '/realestate', labelAr: 'الرئيسية - العقارات', labelEn: 'Real Estate Home', sector: 'realestate' },
  { path: '/realestate/properties', labelAr: 'كتالوج العقارات والأصول', labelEn: 'Properties & Assets Catalog', sector: 'realestate' },
  { path: '/realestate/projects', labelAr: 'المشاريع التطويرية الكبرى', labelEn: 'Master Development Projects', sector: 'realestate' },
  { path: '/realestate/about', labelAr: 'عن المجموعة والقطاع', labelEn: 'About Group & Sector', sector: 'realestate' },
  { path: '/realestate/blog', labelAr: 'المدونة والتقارير العقارية', labelEn: 'Blog & Market Reports', sector: 'realestate' },
  { path: '/realestate/contact', labelAr: 'اتصل بنا والخدمة', labelEn: 'Contact Us & Care', sector: 'realestate' },
  { path: '/construction', labelAr: 'الرئيسية - المقاولات والإنشاءات', labelEn: 'Construction Home', sector: 'construction' },
  { path: '/construction/projects', labelAr: 'مشاريع المقاولات والبناء', labelEn: 'Contracting Projects', sector: 'construction' },
  { path: '/hvac', labelAr: 'الرئيسية - أنظمة التكييف HVAC', labelEn: 'HVAC Engineering Home', sector: 'hvac' },
];

/**
 * Validates external redirect URLs to prevent open redirect vulnerabilities.
 */
export function isValidExternalUrl(url: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();

  // Block executable schemes or javascript code
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.includes('<script')
  ) {
    return false;
  }

  // Allow standard http/https protocols
  if (lower.startsWith('http://') || lower.startsWith('https://')) {
    return true;
  }

  return false;
}

/**
 * Checks if a target path is a protected infrastructure route.
 */
export function isProtectedInfrastructureRoute(path: string): boolean {
  const normalized = path.toLowerCase().trim().replace(/\/+$/, '') || '/';
  return INFRASTRUCTURE_ROUTES.some(
    (infra) => normalized === infra || (infra !== '/' && normalized.startsWith(infra + '/'))
  );
}

/**
 * Validates unique page slug format.
 */
export function isValidSlug(slug: string): boolean {
  if (!slug) return false;
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug.trim().toLowerCase());
}

/**
 * Fetches navigation document for a given menu ID.
 */
export async function getNavigationDoc(id: string): Promise<NavigationDoc | null> {
  try {
    const docRef = doc(db, 'navigations', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as NavigationDoc;
    }
  } catch (e) {
    console.warn(`[getNavigationDoc] Failed to fetch ${id}:`, e);
  }
  return null;
}

/**
 * Subscribes to real-time changes of a navigation document.
 */
export function subscribeNavigationDoc(id: string, callback: (nav: NavigationDoc | null) => void) {
  const docRef = doc(db, 'navigations', id);
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        callback(snap.data() as NavigationDoc);
      } else {
        callback(null);
      }
    },
    (err) => {
      console.warn(`[subscribeNavigationDoc] Error listening to ${id}:`, err);
      callback(null);
    }
  );
}

/**
 * Saves or updates a navigation menu document.
 */
export async function saveNavigationDoc(navDoc: NavigationDoc, authorUid = 'admin'): Promise<void> {
  const docRef = doc(db, 'navigations', navDoc.id);
  const payload = {
    ...navDoc,
    updatedAt: new Date().toISOString(),
    updatedBy: authorUid,
  };
  await setDoc(docRef, withServerTimestamps(payload));
}

/**
 * Creates an automatic 301/302 URL redirect when a published slug changes.
 */
export async function createUrlRedirect(
  oldSlug: string,
  newSlug: string,
  sector: SectorId = 'realestate',
  authorUid = 'admin'
): Promise<RedirectDoc> {
  if (isProtectedInfrastructureRoute(oldSlug)) {
    throw new Error(`Cannot redirect infrastructure route '${oldSlug}'`);
  }

  const redirectId = `redir-${Date.now()}`;
  const redirectData: RedirectDoc = {
    id: redirectId,
    sourceSlug: oldSlug.startsWith('/') ? oldSlug : `/${oldSlug}`,
    targetSlug: newSlug.startsWith('/') ? newSlug : `/${newSlug}`,
    sector,
    statusCode: 301,
    createdAt: new Date().toISOString(),
    createdBy: authorUid,
  };

  const docRef = doc(db, 'redirects', redirectId);
  await setDoc(docRef, sanitizePayload(redirectData));
  return redirectData;
}

/**
 * Fetches all registered active redirects.
 */
export async function getAllRedirects(): Promise<RedirectDoc[]> {
  try {
    const colRef = collection(db, 'redirects');
    const snap = await getDocs(colRef);
    return snap.docs.map((d) => d.data() as RedirectDoc);
  } catch (e) {
    console.warn('[getAllRedirects] Error loading redirects:', e);
    return [];
  }
}

/**
 * Deletes a redirect entry.
 */
export async function deleteRedirect(redirectId: string): Promise<void> {
  const docRef = doc(db, 'redirects', redirectId);
  await deleteDoc(docRef);
}
