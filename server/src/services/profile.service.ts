import { supabase } from "../config/supabase.js";
import type { DbBusinessProfile, DbInfluencerProfile } from "../types/index.js";

// ── Business Profile ────────────────────────────────────────

export async function getBusinessProfile(
  userId: string
): Promise<DbBusinessProfile | null> {
  const { data, error } = await supabase
    .from("business_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as DbBusinessProfile;
}

export async function upsertBusinessProfile(
  userId: string,
  fields: {
    business_name?: string;
    owner_name?: string;
    phone?: string;
    city?: string;
    address?: string;
    license_number?: string;
    license_file_url?: string | null;
    profile_photo_url?: string | null;
    map_lat?: number | null;
    map_lng?: number | null;
  }
): Promise<DbBusinessProfile> {
  // Strip undefined values so we never send them to Supabase
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fields)) {
    if (v !== undefined) clean[k] = v;
  }

  // Check if profile exists
  const existing = await getBusinessProfile(userId);

  if (existing) {
    // Update — if editing after rejection, reset to pending
    const updateData: Record<string, unknown> = {
      ...clean,
      updated_at: new Date().toISOString(),
    };

    // If currently rejected, resubmitting resets to pending
    if (existing.verification_status === "rejected") {
      updateData.verification_status = "pending";
      updateData.rejection_reason = null;
      updateData.reviewed_by = null;
      updateData.reviewed_at = null;
    }

    const { data, error } = await supabase
      .from("business_profiles")
      .update(updateData)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return data as DbBusinessProfile;
  } else {
    // Insert new
    const { data, error } = await supabase
      .from("business_profiles")
      .insert({
        user_id: userId,
        business_name: (clean.business_name as string) || "",
        owner_name: (clean.owner_name as string) || "",
        phone: (clean.phone as string) || "",
        city: (clean.city as string) || "",
        address: (clean.address as string) || "",
        license_number: (clean.license_number as string) || "",
        license_file_url: (clean.license_file_url as string) || null,
        profile_photo_url: (clean.profile_photo_url as string) || null,
        map_lat: (clean.map_lat as number) || null,
        map_lng: (clean.map_lng as number) || null,
        verification_status: "pending",
      })
      .select()
      .single();

    if (error) throw error;
    return data as DbBusinessProfile;
  }
}

// ── Influencer Profile ──────────────────────────────────────

export async function getInfluencerProfile(
  userId: string
): Promise<DbInfluencerProfile | null> {
  const { data, error } = await supabase
    .from("influencer_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as DbInfluencerProfile;
}

export async function upsertInfluencerProfile(
  userId: string,
  fields: {
    display_name?: string;
    bio?: string;
    phone?: string;
    city?: string;
    profile_photo_url?: string | null;
    id_document_url?: string | null;
    tiktok_handle?: string | null;
    instagram_handle?: string | null;
  }
): Promise<DbInfluencerProfile> {
  // Strip undefined values so we never send them to Supabase
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fields)) {
    if (v !== undefined) clean[k] = v;
  }

  const existing = await getInfluencerProfile(userId);

  if (existing) {
    // Determine new status: if they add enough info → "basic"
    let newStatus = existing.verification_status;
    const effectiveName =
      (clean.display_name as string) || existing.display_name;
    const effectivePhone = (clean.phone as string) || existing.phone;
    if (newStatus === "unverified" && effectiveName && effectivePhone) {
      newStatus = "basic";
    }

    const { data, error } = await supabase
      .from("influencer_profiles")
      .update({
        ...clean,
        verification_status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return data as DbInfluencerProfile;
  } else {
    // Determine initial status
    const hasBasicInfo = clean.display_name && clean.phone;

    const { data, error } = await supabase
      .from("influencer_profiles")
      .insert({
        user_id: userId,
        display_name: (clean.display_name as string) || "",
        bio: (clean.bio as string) || "",
        phone: (clean.phone as string) || "",
        city: (clean.city as string) || "",
        profile_photo_url: (clean.profile_photo_url as string) || null,
        id_document_url: (clean.id_document_url as string) || null,
        tiktok_handle: (clean.tiktok_handle as string) || null,
        instagram_handle: (clean.instagram_handle as string) || null,
        verification_status: hasBasicInfo ? "basic" : "unverified",
      })
      .select()
      .single();

    if (error) throw error;
    return data as DbInfluencerProfile;
  }
}
