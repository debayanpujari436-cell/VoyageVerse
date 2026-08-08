import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User as FirebaseUser,
} from "firebase/auth";
import { useEffect, useState } from "react";

// Paste your Firebase configuration here.
// Replace the placeholder strings with your Firebase project values.
const firebaseConfig = {
  apiKey: "AIzaSyBH1FGWUDCjvdureNT5OFOKpDUete1osiY",
  authDomain: "voyageverse-2984f.firebaseapp.com",
  projectId: "voyageverse-2984f",
  storageBucket: "voyageverse-2984f.firebasestorage.app",
  messagingSenderId: "264872035615",
  appId: "1:264872035615:web:d4988bb76d674e276a9c2a",
  measurementId: "G-VG1H05DSLJ"
};

let firebaseApp: FirebaseApp | null = null;
let authInstance: ReturnType<typeof getAuth> | null = null;

function initializeFirebaseApp() {
  if (typeof window === "undefined") {
    throw new Error("Firebase must be initialized in the browser.");
  }

  if (!firebaseApp) {
    firebaseApp = initializeApp(firebaseConfig);
  }

  return firebaseApp;
}

function getAuthInstance() {
  if (!authInstance) {
    initializeFirebaseApp();
    authInstance = getAuth(firebaseApp!);
  }
  return authInstance;
}

export function signInWithGoogle() {
  return signInWithPopup(getAuthInstance(), new GoogleAuthProvider());
}

export function signOutUser() {
  return signOut(getAuthInstance());
}

export function onAuthStateChangedListener(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(getAuthInstance(), callback);
}

export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChangedListener(setUser);
    return unsubscribe;
  }, []);

  return user;
}
