import api from "./api";
import type { BusinessProfile, InfluencerProfile } from "../types";

// ── Business profile ────────────────────────────

export interface UpdateBusinessProfileDto {
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

export async function updateBusinessProfile(
  dto: UpdateBusinessProfileDto
): Promise<BusinessProfile> {
  const { data } = await api.put("/api/auth/business-profile", dto);
  return data.profile;
}

// ── Influencer profile ──────────────────────────

export interface UpdateInfluencerProfileDto {
  display_name?: string;
  bio?: string;
  phone?: string;
  city?: string;
  profile_photo_url?: string | null;
  id_document_url?: string | null;
  tiktok_handle?: string | null;
  instagram_handle?: string | null;
}

export async function updateInfluencerProfile(
  dto: UpdateInfluencerProfileDto
): Promise<InfluencerProfile> {
  const { data } = await api.put("/api/auth/influencer-profile", dto);
  return data.profile;
}

// ── File upload helper ──────────────────────────

import { supabase } from "../lib/supabase";

/**
 * Upload a file to a Supabase Storage bucket.
 * Returns the public URL for public buckets, or a storage path for private ones.
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<string> {
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    contentType: file.type,
  });

  if (error) throw error;

  // Public buckets get a public URL; private buckets store the path
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);

  return publicUrl;
}
