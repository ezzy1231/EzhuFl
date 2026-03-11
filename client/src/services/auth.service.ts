import { supabase } from "../lib/supabase";
import api from "./api";
import type { UserRole, User } from "../types";

interface AuthResponse {
  user: User;
  profileComplete: boolean;
  verificationStatus?: string | null;
  extendedProfile?: unknown;
}

/**
 * Sign up with email, password, name, and role.
 * Creates Supabase auth user, then creates profile via our API.
 */
export async function signUp(
  email: string,
  password: string,
  name: string,
  role: UserRole
) {
  // Store name & role in Supabase user metadata so it's available from the session
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, role } },
  });

  if (error) throw error;
  if (!data.session) {
    // Email confirmation required — return early
    return { needsConfirmation: true };
  }

  // Try to create profile on our backend (non-blocking — works even if server is down)
  try {
    await api.post("/api/auth/profile", { name, role });
  } catch {
    // Backend might be unavailable; metadata fallback in AuthContext will handle it
    console.warn("Backend profile creation failed — using metadata fallback");
  }

  return { needsConfirmation: false };
}

/**
 * Sign in with email and password.
 */
export async function signIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
}

/**
 * Sign in with Google OAuth.
 * Redirects to Google; Supabase handles the callback back to our app.
 */
export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;
}

/**
 * Sign in with TikTok OAuth.
 * Redirects the browser to the server's TikTok OAuth endpoint.
 */
export function signInWithTikTok() {
  const apiUrl = import.meta.env.VITE_API_URL || "";
  window.location.href = `${apiUrl}/api/auth/tiktok`;
}

/**
 * Sign out the current user.
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Get the current user's profile from our backend.
 */
export async function getMe(): Promise<AuthResponse> {
  const { data } = await api.get<AuthResponse>("/api/auth/me");
  return data;
}
