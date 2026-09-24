"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  totpSecret?: string;
  totpEnabled: boolean;
  role: "employee" | "admin";
  createdAt: string;
  // Admin-configured Work Profile
  project?: string;
  workerType?: "virtual" | "onsite" | "hybrid" | "other";
  workingHoursStart?: string;
  workingHoursEnd?: string;
  extraHoursAuthorized?: boolean;
  extraHoursAllowed?: number;
  showWorkProfile?: boolean;
  profileVisible?: boolean;
}

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  is2FAVerified: boolean;
  needs2FASetup: boolean;
  set2FAVerified: (v: boolean) => void;
  signIn: (email: string, password: string) => Promise<{ needs2FASetup: boolean }>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  // Session-level flag — persisted in sessionStorage for duration of browser session
  const [is2FAVerified, setIs2FAVerified] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const verified = sessionStorage.getItem("2fa_verified") === "true";
      if (verified) setIs2FAVerified(true);
    }
  }, []);

  const handleSet2FAVerified = (v: boolean) => {
    setIs2FAVerified(v);
    if (typeof window !== "undefined") {
      if (v) {
        sessionStorage.setItem("2fa_verified", "true");
      } else {
        sessionStorage.removeItem("2fa_verified");
      }
    }
  };

  // Track if this session needs 2FA setup
  const needs2FASetupRef = useRef(false);
  const [needs2FASetup, setNeeds2FASetup] = useState(false);

  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const profileDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (profileDoc.exists()) {
            const data = profileDoc.data() as UserProfile;
            setProfile(data);
            if (data.totpEnabled === false) {
              setNeeds2FASetup(true);
              needs2FASetupRef.current = true;
            }
          }
        } catch (err) {
          console.warn("AuthProvider profile fetch error:", err);
        }
      } else {
        setProfile(null);
        handleSet2FAVerified(false);
        setNeeds2FASetup(false);
      }

      clearTimeout(safetyTimer);
      setLoading(false);
    });

    return () => {
      clearTimeout(safetyTimer);
      unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const profileDoc = await getDoc(doc(db, "users", credential.user.uid));

    let userProfile: UserProfile;
    if (profileDoc.exists()) {
      userProfile = profileDoc.data() as UserProfile;
    } else {
      // First login — create profile
      userProfile = {
        uid: credential.user.uid,
        email: email,
        displayName: credential.user.displayName ?? email.split("@")[0],
        totpEnabled: false,
        role: "employee",
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, "users", credential.user.uid), userProfile);
    }

    setProfile(userProfile);
    const setup = !userProfile.totpEnabled;
    setNeeds2FASetup(setup);
    needs2FASetupRef.current = setup;
    return { needs2FASetup: setup };
  };

  const signUp = async (
    email: string,
    password: string,
    displayName: string
  ) => {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    await updateProfile(credential.user, { displayName });

    const userProfile: UserProfile = {
      uid: credential.user.uid,
      email,
      displayName,
      totpEnabled: false,
      role: "employee",
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, "users", credential.user.uid), userProfile);
    setProfile(userProfile);
    setNeeds2FASetup(true);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    handleSet2FAVerified(false);
    setNeeds2FASetup(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        is2FAVerified,
        needs2FASetup,
        set2FAVerified: handleSet2FAVerified,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
