import type { Request, Response, NextFunction } from "express";
import { supabase } from "../config/supabase.js";
import type { DbUser } from "../types/index.js";
import { AppError } from "../lib/errors.js";

export interface AuthenticatedRequest extends Request {
  user: DbUser;
}

/**
 * Auth middleware – verifies the Supabase access token from the
 * Authorization header and attaches the user profile to the request.
 */
export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      next(new AppError(401, "Missing or invalid authorization header", "UNAUTHORIZED"));
      return;
    }

    const token = authHeader.replace("Bearer ", "");

    // Verify the token with Supabase Auth
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !authUser) {
      next(new AppError(401, "Invalid or expired token", "UNAUTHORIZED"));
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
    next(err);
  }
}

/**
 * Guard that restricts access to BUSINESS users only.
 */
export function businessOnly(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const user = (req as AuthenticatedRequest).user;
  if (user.role !== "BUSINESS") {
    next(new AppError(403, "Business account required", "FORBIDDEN"));
    return;
  }
  next();
}

/**
 * Guard that restricts access to INFLUENCER users only.
 */
export function influencerOnly(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const user = (req as AuthenticatedRequest).user;
  if (user.role !== "INFLUENCER") {
    next(new AppError(403, "Influencer account required", "FORBIDDEN"));
    return;
  }
  next();
}

/**
 * Guard that restricts access to ADMIN users only.
 */
export function adminOnly(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const user = (req as AuthenticatedRequest).user;
  if (user.role !== "ADMIN") {
    next(new AppError(403, "Admin access required", "FORBIDDEN"));
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
  _res: Response,
  next: NextFunction
): Promise<void> {
  const user = (req as AuthenticatedRequest).user;

  const { data: profile } = await supabase
    .from("business_profiles")
    .select("verification_status")
    .eq("user_id", user.id)
    .single();

  if (!profile || profile.verification_status !== "approved") {
    next(new AppError(403, "Business not verified. Your account must be approved before performing this action.", "FORBIDDEN"));
    return;
  }
  next();
}

/**
 * Guard that ensures an INFLUENCER user has at least basic verification
 * and is not suspended by account state stored in the profile.
 * Must be used after authMiddleware + influencerOnly.
 */
export async function verifiedInfluencerOnly(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const user = (req as AuthenticatedRequest).user;

  const { data: profile, error } = await supabase
    .from("influencer_profiles")
    .select("verification_status")
    .eq("user_id", user.id)
    .single();

  if (error || !profile) {
    next(new AppError(403, "Influencer profile incomplete. Complete your profile before joining or submitting to campaigns.", "FORBIDDEN"));
    return;
  }

  if (profile.verification_status === "unverified") {
    next(new AppError(403, "Influencer verification required. Add your basic profile details before participating in campaigns.", "FORBIDDEN"));
    return;
  }

  next();
}
