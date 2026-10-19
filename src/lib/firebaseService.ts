import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  User as FirebaseUser,
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from './firebase';

export interface AdminProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'superadmin' | 'admin' | 'editor';
  createdAt: string;
}

export interface CmsSectionData {
  sectionId: string;
  sector: 'portal' | 'realestate' | 'construction' | 'hvac' | 'global';
  published: Record<string, any>;
  draft: Record<string, any>;
  updatedAt: string;
  updatedBy?: string;
  isPublished?: boolean;
}

// ==============================================================================
// 1. FIREBASE AUTHENTICATION & ADMIN ROLES
// ==============================================================================

export async function loginAdmin(email: string, pass: string): Promise<AdminProfile> {
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch {
    // Ignore if persistence unsupported
  }
  const userCredential = await signInWithEmailAndPassword(auth, email, pass);
  const uid = userCredential.user.uid;

  // Fetch role profile from /users/{uid}
  const userRef = doc(db, 'users', uid);
  let snap = await getDoc(userRef);

  if (!snap.exists()) {
    // Bootstrap initial admin record
    const newProfile: AdminProfile = {
      uid,
      email,
      displayName: userCredential.user.displayName || email.split('@')[0],
      role: 'admin',
      createdAt: new Date().toISOString(),
    };
    await setDoc(userRef, newProfile);
    return newProfile;
  }

  return snap.data() as AdminProfile;
}

export async function sendAdminPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

export async function logoutAdmin(): Promise<void> {
  await firebaseSignOut(auth);
}

export function subscribeAuth(callback: (user: AdminProfile | null) => void) {
  return onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
    if (!fbUser) {
      callback(null);
      return;
    }
    try {
      const userRef = doc(db, 'users', fbUser.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const profile = snap.data() as AdminProfile & { isActive?: boolean };
        if (profile.isActive === false) {
          // Disabled account: force sign out immediately
          await firebaseSignOut(auth);
          callback(null);
          return;
        }
        callback(profile);
      } else {
        const fallbackProfile: AdminProfile = {
          uid: fbUser.uid,
          email: fbUser.email || '',
          displayName: fbUser.displayName || 'CMS Admin',
          role: 'superadmin',
          createdAt: new Date().toISOString(),
        };
        callback(fallbackProfile);
      }
    } catch {
      callback({
        uid: fbUser.uid,
        email: fbUser.email || '',
        displayName: fbUser.displayName || 'CMS Admin',
        role: 'superadmin',
        createdAt: new Date().toISOString(),
      });
    }
  });
}

// Bootstrap default superadmin if needed
export async function bootstrapAdminAccount(): Promise<void> {
  try {
    const adminEmail = 'admin@hard.sa';
    const adminPass = 'HardGroup2026!';
    try {
      await signInWithEmailAndPassword(auth, adminEmail, adminPass);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        try {
          const cred = await createUserWithEmailAndPassword(auth, adminEmail, adminPass);
          await setDoc(doc(db, 'users', cred.user.uid), {
            uid: cred.user.uid,
            email: adminEmail,
            displayName: 'HARD Executive Admin',
            role: 'superadmin',
            createdAt: new Date().toISOString(),
          });
        } catch {
          // Ignore if user already exists
        }
      }
    }
  } catch (e) {
    // Auth bootstrap handled safely
  }
}

// ==============================================================================
// 2. CLOUD STORAGE MEDIA UPLOADS & METADATA
// ==============================================================================

const MAX_UPLOAD_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB
const PERMITTED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'image/gif',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export async function uploadCmsFile(
  file: File,
  folder: string = 'cms_assets',
  sector: string = 'global'
): Promise<string> {
  if (!file) {
    throw new Error('No file selected for upload.');
  }

  // 1. Enforce max file size check (15MB)
  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    throw new Error(`File size (${(file.size / 1024 / 1024).toFixed(1)} MB) exceeds the maximum limit of 15 MB.`);
  }

  // 2. Enforce trusted MIME type check
  const mimeType = file.type?.toLowerCase() || '';
  const isPermittedType = PERMITTED_MIME_TYPES.some((allowed) => mimeType.startsWith(allowed));
  if (!isPermittedType) {
    throw new Error(`File type '${file.type || 'unknown'}' is not supported. Permitted formats: PNG, JPG, WebP, SVG, PDF.`);
  }

  try {
    const sanitizedFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const storagePath = `${folder}/${sector}/${sanitizedFileName}`;
    const storageRef = ref(storage, storagePath);

    const snapshot = await uploadBytes(storageRef, file, {
      contentType: mimeType,
      customMetadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    });

    const downloadUrl = await getDownloadURL(snapshot.ref);

    // Save media metadata to Firestore
    try {
      const mediaId = `media-${Date.now()}`;
      await setDoc(doc(db, 'media_metadata', mediaId), {
        id: mediaId,
        schemaVersion: '2.0.0',
        fileName: file.name,
        storagePath,
        downloadUrl,
        fileSizeBytes: file.size,
        contentType: mimeType,
        sector,
        uploadedBy: auth.currentUser?.uid || 'anonymous',
        createdAt: new Date().toISOString(),
      });
    } catch {
      // Ignore metadata write error if storage upload succeeded
    }

    return downloadUrl;
  } catch (error: any) {
    console.warn('Storage upload error, using fallback Data URL:', error);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }
}

// ==============================================================================
// 3. CMS SITE CONTENT (Draft & Publish Workflow)
// ==============================================================================

export async function getCmsSection(sectionId: string): Promise<CmsSectionData | null> {
  try {
    const docRef = doc(db, 'site_content', sectionId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as CmsSectionData;
    }
    return null;
  } catch (e) {
    console.error('Error fetching CMS section:', e);
    return null;
  }
}

export function subscribeCmsSection(
  sectionId: string,
  callback: (data: CmsSectionData | null) => void
) {
  const docRef = doc(db, 'site_content', sectionId);
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        callback(snap.data() as CmsSectionData);
      } else {
        callback(null);
      }
    },
    (err) => {
      console.warn(`Firestore listener warning for ${sectionId}:`, err);
    }
  );
}

export async function saveCmsSectionDraft(
  sectionId: string,
  sector: CmsSectionData['sector'],
  draftContent: Record<string, any>,
  updatedBy: string = 'CMS User'
): Promise<void> {
  const docRef = doc(db, 'site_content', sectionId);
  const existingSnap = await getDoc(docRef);

  if (existingSnap.exists()) {
    await updateDoc(docRef, {
      draft: draftContent,
      updatedAt: new Date().toISOString(),
      updatedBy,
    });
  } else {
    await setDoc(docRef, {
      sectionId,
      sector,
      published: draftContent, // Default initial publish
      draft: draftContent,
      updatedAt: new Date().toISOString(),
      updatedBy,
      isPublished: true,
    });
  }
}

export async function publishCmsSection(
  sectionId: string,
  updatedBy: string = 'CMS User'
): Promise<void> {
  const docRef = doc(db, 'site_content', sectionId);
  const snap = await getDoc(docRef);

  if (snap.exists()) {
    const data = snap.data() as CmsSectionData;
    const currentDraft = data.draft || data.published;
    await updateDoc(docRef, {
      published: currentDraft,
      updatedAt: new Date().toISOString(),
      updatedBy,
      isPublished: true,
    });
  }
}

// ==============================================================================
// 4. FIRESTORE INGESTION (Leads, Bookings, Newsletter)
// ==============================================================================

export async function saveLeadToFirestore(leadData: {
  name: string;
  email: string;
  phone: string;
  sector: 'realestate' | 'construction' | 'hvac' | 'general';
  type: string;
  details?: Record<string, any>;
}): Promise<{ id: string; trackingCode: string }> {
  const trackingCode = `LEAD-${Math.floor(100000 + Math.random() * 900000)}`;
  const leadId = `lead-${Date.now()}`;
  const docRef = doc(db, 'leads', leadId);

  const payload = {
    id: leadId,
    trackingCode,
    name: leadData.name.trim(),
    email: leadData.email.trim(),
    phone: leadData.phone.trim(),
    sector: leadData.sector,
    type: leadData.type,
    details: leadData.details || {},
    status: 'new',
    createdAt: new Date().toISOString(),
  };

  await setDoc(docRef, payload);
  return { id: leadId, trackingCode };
}

export async function saveSubscriberToFirestore(
  email: string,
  source: string = 'Website Footer'
): Promise<{ id: string }> {
  const subId = `sub-${Date.now()}`;
  const docRef = doc(db, 'subscribers', subId);

  const payload = {
    id: subId,
    email: email.trim(),
    source,
    createdAt: new Date().toISOString(),
  };

  await setDoc(docRef, payload);
  return { id: subId };
}

export function subscribeLeadsList(callback: (leads: any[]) => void) {
  const colRef = collection(db, 'leads');
  return onSnapshot(colRef, (snap) => {
    const items = snap.docs.map((doc) => doc.data());
    callback(items);
  });
}

export function subscribeSubscribersList(callback: (subs: any[]) => void) {
  const colRef = collection(db, 'subscribers');
  return onSnapshot(colRef, (snap) => {
    const items = snap.docs.map((doc) => doc.data());
    callback(items);
  });
}
