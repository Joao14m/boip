import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = !!firebaseConfig.apiKey;

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _storage: FirebaseStorage | null = null;

if (isFirebaseConfigured) {
  try {
    _app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    _auth = getAuth(_app);
    _storage = getStorage(_app);
  } catch (e) {
    if (typeof window !== "undefined") {
      console.error("Firebase initialization failed:", e);
    }
  }
} else if (typeof window !== "undefined") {
  console.warn(
    "Firebase not configured. Create frontend/boi-web/.env.local with NEXT_PUBLIC_FIREBASE_* values."
  );
}

export const auth = _auth as Auth;
export const storage = _storage as FirebaseStorage;
