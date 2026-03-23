import type { NextFunction, Request, Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import type { CreateProfileDto } from "../types/index.js";
import { supabase } from "../config/supabase.js";
import * as profileService from "../services/profile.service.js";
import { AppError, toAppError } from "../lib/errors.js";

/**
 * POST /api/auth/profile — Create or update user profile after signup
 * Also initialises the extended profile (business_profiles / influencer_profiles).
 */
export async function createProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { user } = req as AuthenticatedRequest;
    const { name, role } = req.body as CreateProfileDto;

    const { data, error } = await supabase
      .from("users")
      .upsert(
        {
          id: user.id,
          email: user.email,
          name,
          role,
        },
        { onConflict: "id" }
      )
      .select()
      .single();

    if (error) {
      next(new AppError(500, "Failed to create profile", "INTERNAL_SERVER_ERROR", undefined, false));
      return;
    }

    // Initialise extended profile row (if not exists)
    try {
      if (role === "BUSINESS") {
        await profileService.upsertBusinessProfile(user.id, {
          owner_name: name,
        });
      } else {
        // For influencers, check if user has TikTok metadata and auto-fill
        const profileFields: Record<string, string | null> = {
          display_name: name,
        };

        try {
          const { data: { user: authUser } } =
            await supabase.auth.admin.getUserById(user.id);
          const meta = authUser?.user_metadata || {};

          if (meta.tiktok_open_id) {
            if (meta.tiktok_username) {
              profileFields.tiktok_handle = `@${meta.tiktok_username}`;
            }
            if (meta.tiktok_avatar_url) {
              profileFields.profile_photo_url = meta.tiktok_avatar_url;
            }
            if (meta.tiktok_bio) {
              profileFields.bio = meta.tiktok_bio;
            }
            if (meta.tiktok_display_name && !name) {
              profileFields.display_name = meta.tiktok_display_name;
            }
          }
        } catch {
          // Non-blocking — TikTok metadata is optional
        }

        await profileService.upsertInfluencerProfile(user.id, profileFields);
      }
    } catch (extErr) {
      // Non-blocking — the user table entry is the important one
      console.warn("Extended profile init failed:", extErr);
    }

    res.status(200).json({ user: data });
  } catch (err) {
    next(toAppError(err));
  }
}

/**
 * GET /api/auth/me — Get the current user's profile + verification status + extended profile
 */
export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user } = req as AuthenticatedRequest;

    // If the user has no profile yet (name is empty), return minimal info
    if (!user.name) {
      res.status(200).json({ user, profileComplete: false });
      return;
    }

    // Fetch extended profile based on role
    let verificationStatus: string | null = null;
    let extendedProfile: unknown = null;

    if (user.role === "BUSINESS") {
      const bp = await profileService.getBusinessProfile(user.id);
      verificationStatus = bp?.verification_status || null;
      extendedProfile = bp;
    } else if (user.role === "INFLUENCER") {
      const ip = await profileService.getInfluencerProfile(user.id);
      verificationStatus = ip?.verification_status || null;
      extendedProfile = ip;
    }

    res.status(200).json({
      user,
      profileComplete: true,
      verificationStatus,
      extendedProfile,
    });
  } catch (err) {
    next(toAppError(err));
  }
}

/**
 * PUT /api/auth/business-profile — Update the business extended profile
 */
export async function updateBusinessProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { user } = req as AuthenticatedRequest;

    if (user.role !== "BUSINESS") {
      next(new AppError(403, "Business account required", "FORBIDDEN"));
      return;
    }

    const {
      business_name,
      owner_name,
      phone,
      city,
      address,
      license_number,
      license_file_url,
      map_lat,
      map_lng,
    } = req.body;

    const profile = await profileService.upsertBusinessProfile(user.id, {
      business_name,
      owner_name,
      phone,
      city,
      address,
      license_number,
      license_file_url,
      map_lat,
      map_lng,
    });

    res.status(200).json({ profile });
  } catch (err) {
    next(toAppError(err));
  }
}

/**
 * PUT /api/auth/influencer-profile — Update the influencer extended profile
 */
export async function updateInfluencerProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { user } = req as AuthenticatedRequest;

    if (user.role !== "INFLUENCER") {
      next(new AppError(403, "Influencer account required", "FORBIDDEN"));
      return;
    }

    const {
      display_name,
      bio,
      phone,
      city,
      profile_photo_url,
      id_document_url,
      tiktok_handle,
      instagram_handle,
    } = req.body;

    const profile = await profileService.upsertInfluencerProfile(user.id, {
      display_name,
      bio,
      phone,
      city,
      profile_photo_url,
      id_document_url,
      tiktok_handle,
      instagram_handle,
    });

    res.status(200).json({ profile });
  } catch (err: unknown) {
    next(toAppError(err));
  }
}
