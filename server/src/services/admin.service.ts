import { supabase } from "../config/supabase.js";
import type {
  DbBusinessProfile,
  DbInfluencerProfile,
  BusinessVerificationStatus,
  InfluencerVerificationStatus,
} from "../types/index.js";

// ── Business profiles ───────────────────────────────────────

export async function getPendingBusinesses(): Promise<DbBusinessProfile[]> {
  const { data, error } = await supabase
    .from("business_profiles")
    .select("*")
    .eq("verification_status", "pending")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data as DbBusinessProfile[]) || [];
}

export async function getAllBusinessProfiles(
  status?: BusinessVerificationStatus
): Promise<DbBusinessProfile[]> {
  let query = supabase
    .from("business_profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("verification_status", status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data as DbBusinessProfile[]) || [];
}

export async function getBusinessProfileById(
  profileId: string
): Promise<DbBusinessProfile | null> {
  const { data, error } = await supabase
    .from("business_profiles")
    .select("*")
    .eq("id", profileId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as DbBusinessProfile;
}

export async function getBusinessProfileByUserId(
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

export async function reviewBusiness(
  profileId: string,
  adminId: string,
  action: "approve" | "reject",
  rejectionReason?: string
): Promise<DbBusinessProfile> {
  const newStatus: BusinessVerificationStatus =
    action === "approve" ? "approved" : "rejected";

  const { data, error } = await supabase
    .from("business_profiles")
    .update({
      verification_status: newStatus,
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
      rejection_reason: action === "reject" ? (rejectionReason || "Documents insufficient") : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profileId)
    .select()
    .single();

  if (error) throw error;
  return data as DbBusinessProfile;
}

export async function suspendBusiness(
  profileId: string,
  adminId: string,
  reason: string
): Promise<DbBusinessProfile> {
  const { data, error } = await supabase
    .from("business_profiles")
    .update({
      verification_status: "suspended" as BusinessVerificationStatus,
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
      rejection_reason: reason,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profileId)
    .select()
    .single();

  if (error) throw error;
  return data as DbBusinessProfile;
}

// ── Influencer profiles ─────────────────────────────────────

export async function getAllInfluencerProfiles(
  status?: InfluencerVerificationStatus
): Promise<DbInfluencerProfile[]> {
  let query = supabase
    .from("influencer_profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("verification_status", status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data as DbInfluencerProfile[]) || [];
}

export async function getInfluencerProfileById(
  profileId: string
): Promise<DbInfluencerProfile | null> {
  const { data, error } = await supabase
    .from("influencer_profiles")
    .select("*")
    .eq("id", profileId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as DbInfluencerProfile;
}

export async function getInfluencerProfileByUserId(
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

export async function reviewInfluencer(
  profileId: string,
  adminId: string,
  action: "verify" | "unverify"
): Promise<DbInfluencerProfile> {
  const newStatus: InfluencerVerificationStatus =
    action === "verify" ? "verified" : "basic";

  const { data, error } = await supabase
    .from("influencer_profiles")
    .update({
      verification_status: newStatus,
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", profileId)
    .select()
    .single();

  if (error) throw error;
  return data as DbInfluencerProfile;
}

// ── Dashboard stats ─────────────────────────────────────────

export async function getAdminStats() {
  const [
    { count: pendingBusinesses },
    { count: approvedBusinesses },
    { count: totalInfluencers },
    { count: totalCampaigns },
  ] = await Promise.all([
    supabase.from("business_profiles").select("*", { count: "exact", head: true }).eq("verification_status", "pending"),
    supabase.from("business_profiles").select("*", { count: "exact", head: true }).eq("verification_status", "approved"),
    supabase.from("influencer_profiles").select("*", { count: "exact", head: true }),
    supabase.from("campaigns").select("*", { count: "exact", head: true }),
  ]);

  return {
    pendingBusinesses: pendingBusinesses || 0,
    approvedBusinesses: approvedBusinesses || 0,
    totalInfluencers: totalInfluencers || 0,
    totalCampaigns: totalCampaigns || 0,
  };
}
