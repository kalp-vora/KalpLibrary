import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";
import { FirebaseConfigInput } from "@/types";

const LOCAL_STORAGE_FIREBASE_KEY = "kalp_library_firebase_config";

export function getStoredFirebaseConfig(): FirebaseConfigInput | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_FIREBASE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to parse stored firebase config", err);
    return null;
  }
}

export function saveStoredFirebaseConfig(config: FirebaseConfigInput) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_STORAGE_FIREBASE_KEY, JSON.stringify(config));
}

export function clearStoredFirebaseConfig() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LOCAL_STORAGE_FIREBASE_KEY);
}

export function getActiveFirebaseConfig(): FirebaseConfigInput | null {
  // Check stored config in localStorage first (browser only)
  const stored = getStoredFirebaseConfig();
  if (stored && stored.apiKey && stored.projectId) {
    return stored;
  }

  // Fallback to process.env
  const envConfig: FirebaseConfigInput = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
  };

  if (envConfig.apiKey && envConfig.projectId) {
    return envConfig;
  }

  return null;
}

export function isFirebaseConfigured(): boolean {
  return !!getActiveFirebaseConfig();
}

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

export function getFirebaseInstance(): { app: FirebaseApp | null; db: Firestore | null; auth: Auth | null } {
  const config = getActiveFirebaseConfig();
  if (!config) {
    return { app: null, db: null, auth: null };
  }

  try {
    if (!getApps().length) {
      app = initializeApp(config);
    } else {
      app = getApp();
    }
    db = getFirestore(app);
    auth = getAuth(app);
    return { app, db, auth };
  } catch (err) {
    console.error("Error initializing Firebase:", err);
    return { app: null, db: null, auth: null };
  }
}

