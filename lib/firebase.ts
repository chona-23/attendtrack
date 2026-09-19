import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
} from "firebase/auth";
import {
  getFirestore,
  enableIndexedDbPersistence,
  CACHE_SIZE_UNLIMITED,
  initializeFirestore,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Singleton pattern — prevents re-initialization on hot reloads
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Initialize Firestore with unlimited cache for offline-first support
export const db = getApps().length > 1
  ? getFirestore(app)
  : initializeFirestore(app, {
      cacheSizeBytes: CACHE_SIZE_UNLIMITED,
    });

// Enable offline persistence (IndexedDB) — client-side only
if (typeof window !== "undefined") {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === "failed-precondition") {
      // Multiple tabs open — persistence only works in one tab at a time
      console.warn("Firestore persistence unavailable: multiple tabs open.");
    } else if (err.code === "unimplemented") {
      // Browser doesn't support persistence
      console.warn("Firestore persistence not supported in this browser.");
    }
  });
}

export default app;
