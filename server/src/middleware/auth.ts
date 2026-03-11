import type { Request, Response, NextFunction } from "express";
import { supabase } from "../config/supabase.js";
import type { DbUser } from "../types/index.js";

export interface AuthenticatedRequest extends Request {
  user: DbUser;
}

/**
 * Auth middleware – verifies the Supabase access token from the
 * Authorization header and attaches the user profile to the request.
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Missing or invalid authorization header" });
      return;
    }

    const token = authHeader.replace("Bearer ", "");

    // Verify the token with Supabase Auth
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !authUser) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    // Fetch the user profile from public.users
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (profileError || !profile) {
      // User is authenticated but hasn't created a profile yet.
      // Auto-create the users row from JWT metadata so FK constraints work.
      const meta = authUser.user_metadata || {};
      const name = meta.name || meta.full_name || authUser.email?.split("@")[0] || "";
      const role = meta.role || "INFLUENCER";

      const { data: newProfile, error: insertErr } = await supabase
        .from("users")
        .upsert(
          { id: authUser.id, email: authUser.email || "", name, role },
          { onConflict: "id" }
        )
        .select()
        .single();

      if (insertErr || !newProfile) {
        console.error("Auto-create user row failed:", insertErr);
        // Fall back to minimal info so downstream endpoints can still work
        (req as AuthenticatedRequest).user = {
          id: authUser.id,
          email: authUser.email || "",
          name,
          role: role as DbUser["role"],
          created_at: "",
        };
      } else {
        (req as AuthenticatedRequest).user = newProfile as DbUser;
      }
      next();
      return;
    }

    (req as AuthenticatedRequest).user = profile as DbUser;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Guard that restricts access to BUSINESS users only.
 */
export function businessOnly(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const user = (req as AuthenticatedRequest).user;
  if (user.role !== "BUSINESS") {
    res.status(403).json({ error: "Business account required" });
    return;
  }
  next();
}

/**
 * Guard that restricts access to INFLUENCER users only.
 */
export function influencerOnly(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const user = (req as AuthenticatedRequest).user;
  if (user.role !== "INFLUENCER") {
    res.status(403).json({ error: "Influencer account required" });
    return;
  }
  next();
}

/**
 * Guard that restricts access to ADMIN users only.
 */
export function adminOnly(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const user = (req as AuthenticatedRequest).user;
  if (user.role !== "ADMIN") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
}

/**
 * Guard that ensures a BUSINESS user has been approved before proceeding.
 * Must be used after authMiddleware + businessOnly.
 */
export async function verifiedBusinessOnly(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const user = (req as AuthenticatedRequest).user;

  const { data: profile } = await supabase
    .from("business_profiles")
    .select("verification_status")
    .eq("user_id", user.id)
    .single();

  if (!profile || profile.verification_status !== "approved") {
    res.status(403).json({ error: "Business not verified. Your account must be approved before performing this action." });
    return;
  }
  next();
}
