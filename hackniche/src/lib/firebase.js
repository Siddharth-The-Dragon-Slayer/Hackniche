import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

/**
 * Firestore with persistent offline cache (IndexedDB).
 *
 * Firebase 10+ API: `persistentLocalCache` replaces the deprecated
 * `enableIndexedDbPersistence()`.  This gives the app a second layer of
 * offline support: Firestore itself buffers reads/writes server-side
 * while the Android Room DB (via OfflinePlugin) handles structured local
 * queries.
 *
 * Falls back to memory cache on SSR / environments where IndexedDB is
 * unavailable (e.g. Next.js server-side rendering).
 */
let db;
if (typeof window !== 'undefined') {
  try {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
  } catch {
    // Already initialised (hot-reload) — just grab the existing instance
    db = getFirestore(app);
  }
} else {
  db = getFirestore(app);
}

export { app, auth, db };
