"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  setPersistence,
  browserLocalPersistence,
  User,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase";
import { api } from "@/lib/api";

type AuthMeResponse = {
  uid: string;
  email: string;
  emailVerified: boolean;
  onboarded: boolean;
  userId: string | null;
};

type AuthState = {
  user: User | null;
  loading: boolean;
  onboarded: boolean;
  userId: string | null;
  signOut: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured && !!auth);
  const [onboarded, setOnboarded] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  async function fetchMe() {
    try {
      const me = await api.get<AuthMeResponse>("/auth/me");
      setOnboarded(me.onboarded);
      setUserId(me.userId ?? null);
    } catch {
      setOnboarded(false);
      setUserId(null);
    }
  }

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      return;
    }
    setPersistence(auth, browserLocalPersistence).catch(() => {});
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchMe();
      } else {
        setOnboarded(false);
        setUserId(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  async function signOut() {
    if (auth) await firebaseSignOut(auth);
  }

  return (
    <AuthContext.Provider value={{ user, loading, onboarded, userId, signOut, refreshMe: fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
