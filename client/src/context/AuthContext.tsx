import {
  createContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import * as authService from "../services/auth.service";
import api from "../services/api";
import type { User, UserRole, BusinessProfile, InfluencerProfile } from "../types";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  profileComplete: boolean;
  verificationStatus: string | null;
  extendedProfile: BusinessProfile | InfluencerProfile | null;
  signUp: (
    email: string,
    password: string,
    name: string,
    role: UserRole
  ) => Promise<{ needsConfirmation: boolean }>;
  signIn: (email: string, password: string) => Promise<{ role?: UserRole }>;
  signInWithGoogle: () => Promise<void>;
  signInWithTikTok: () => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setUserRole: (role: UserRole) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [extendedProfile, setExtendedProfile] = useState<BusinessProfile | InfluencerProfile | null>(null);

  // Fetch profile from our API, with fallback to Supabase session metadata
  const fetchProfile = useCallback(async () => {
    try {
      const data = await authService.getMe();
      setUser(data.user);
      setProfileComplete(data.profileComplete);
      setVerificationStatus(data.verificationStatus ?? null);
      setExtendedProfile((data.extendedProfile as BusinessProfile | InfluencerProfile) ?? null);
    } catch {
      // Backend unavailable — fall back to Supabase session metadata
      try {
        const { data: { session: s } } = await supabase.auth.getSession();
        if (s?.user) {
          const meta = s.user.user_metadata || {};
          setUser({
            id: s.user.id,
            email: s.user.email || "",
            name: meta.name || s.user.email?.split("@")[0] || "",
            role: meta.role || "INFLUENCER",
            created_at: s.user.created_at || "",
          });
          setProfileComplete(!!meta.name);
          setVerificationStatus(null);
          setExtendedProfile(null);
          return;
        }
      } catch {
        // ignore secondary failure
      }
      setUser(null);
      setProfileComplete(false);
      setVerificationStatus(null);
      setExtendedProfile(null);
    }
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s) {
        fetchProfile().finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Subscribe to changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s) {
        // Use setTimeout to avoid Supabase deadlock
        setTimeout(() => {
          fetchProfile();
        }, 0);
      } else {
        setUser(null);
        setProfileComplete(false);
        setVerificationStatus(null);
        setExtendedProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      name: string,
      role: UserRole
    ) => {
      const result = await authService.signUp(email, password, name, role);
      if (!result.needsConfirmation) {
        await fetchProfile();
      }
      return result;
    },
    [fetchProfile]
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      await authService.signIn(email, password);
      await fetchProfile();
      // Return current user after profile is fetched
      const { data: { session: s } } = await supabase.auth.getSession();
      const meta = s?.user?.user_metadata || {};
      return { role: meta.role as UserRole | undefined };
    },
    [fetchProfile]
  );

  const signInWithGoogle = useCallback(async () => {
    await authService.signInWithGoogle();
  }, []);

  const signInWithTikTok = useCallback(() => {
    authService.signInWithTikTok();
  }, []);

  // Set role for OAuth users who don't have one yet
  const setUserRole = useCallback(async (role: UserRole) => {
    const { data: { session: s } } = await supabase.auth.getSession();
    if (!s?.user) return;

    // Update Supabase user metadata
    await supabase.auth.updateUser({ data: { role, name: s.user.user_metadata?.full_name || s.user.email?.split("@")[0] || "" } });

    // Try to create backend profile
    const name = s.user.user_metadata?.full_name || s.user.user_metadata?.name || s.user.email?.split("@")[0] || "";
    try {
      await api.post("/api/auth/profile", { name, role });
    } catch {
      console.warn("Backend profile creation failed — using metadata fallback");
    }

    // Update local state
    setUser({
      id: s.user.id,
      email: s.user.email || "",
      name,
      role,
      created_at: s.user.created_at || "",
    });
    setProfileComplete(true);
  }, []);

  const signOut = useCallback(async () => {
    await authService.signOut();
    setSession(null);
    setUser(null);
    setProfileComplete(false);
    setVerificationStatus(null);
    setExtendedProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        profileComplete,
        verificationStatus,
        extendedProfile,
        signUp,
        signIn,
        signInWithGoogle,
        signInWithTikTok,
        signOut,
        refreshProfile,
        setUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
