import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDocFromServer, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, FirebaseStorage, connectStorageEmulator } from 'firebase/storage';
import fallbackConfig from '../../firebase-applet-config.json';

const metaEnv = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : (process.env as any) || {};

// Environment-specific configuration with applet config fallback
const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || fallbackConfig.apiKey,
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || fallbackConfig.authDomain,
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || fallbackConfig.projectId,
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || fallbackConfig.storageBucket,
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || fallbackConfig.messagingSenderId,
  appId: metaEnv.VITE_FIREBASE_APP_ID || fallbackConfig.appId,
  firestoreDatabaseId: metaEnv.VITE_FIREBASE_FIRESTORE_DATABASE_ID || fallbackConfig.firestoreDatabaseId,
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);
export const storage: FirebaseStorage = getStorage(app);

// Connect Local Firebase Emulator Suite if configured
const useEmulator = metaEnv.VITE_USE_FIREBASE_EMULATOR === 'true';
let emulatorsConnected = false;

if (useEmulator && !emulatorsConnected) {
  try {
    const authHost = metaEnv.VITE_FIREBASE_AUTH_EMULATOR_HOST || 'localhost:9099';
    const firestoreHost = metaEnv.VITE_FIREBASE_FIRESTORE_EMULATOR_HOST || 'localhost';
    const storageHost = metaEnv.VITE_FIREBASE_STORAGE_EMULATOR_HOST || 'localhost';

    connectAuthEmulator(auth, `http://${authHost}`, { disableWarnings: true });
    
    const [fsHost, fsPort] = firestoreHost.split(':');
    connectFirestoreEmulator(db, fsHost || 'localhost', Number(fsPort) || 8080);

    const [stHost, stPort] = storageHost.split(':');
    connectStorageEmulator(storage, stHost || 'localhost', Number(stPort) || 9199);

    emulatorsConnected = true;
    console.info('[Firebase Client] Connected to Local Firebase Emulator Suite');
  } catch (err) {
    console.warn('[Firebase Client] Emulator connection notice:', err);
  }
}

// Connection test with timeout guard to handle offline or delayed initial connection
export async function validateFirestoreConnection(): Promise<boolean> {
  try {
    const connectionPromise = getDocFromServer(doc(db, '_connection_check', 'ping'));
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Connection check timeout')), 2500)
    );
    await Promise.race([connectionPromise, timeoutPromise]);
    return true;
  } catch (error: any) {
    if (
      error?.message?.includes('offline') ||
      error?.message?.includes('timeout') ||
      error?.code === 'unavailable' ||
      error?.code === 'permission-denied'
    ) {
      console.warn('[Firebase Client] Offline mode or connection check skipped.');
      return false;
    }
    return true;
  }
}

// Auto test connection on import
validateFirestoreConnection().catch(() => {});
