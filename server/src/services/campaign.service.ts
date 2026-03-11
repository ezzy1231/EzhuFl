import { supabase } from "../config/supabase.js";
import type {
  DbCampaign,
  CampaignWithBusiness,
  CreateCampaignDto,
  CampaignStatus,
} from "../types/index.js";

// ── Helpers ─────────────────────────────────────────────────

/**
 * Enrich an array of raw campaigns with business profile info
 * and participant counts, returning CampaignWithBusiness[].
 */
async function enrichCampaigns(
  campaigns: DbCampaign[]
): Promise<CampaignWithBusiness[]> {
  if (campaigns.length === 0) return [];

  // 1. Gather unique business IDs
  const businessIds = [...new Set(campaigns.map((c) => c.business_id))];

  // 2. Fetch business profiles for those IDs
  const { data: profiles } = await supabase
    .from("business_profiles")
    .select("user_id, business_name, profile_photo_url, verification_status")
    .in("user_id", businessIds);

  const profileMap = new Map(
    (profiles || []).map((p: any) => [p.user_id, p])
  );

  // 3. Fetch participant counts per campaign
  const campaignIds = campaigns.map((c) => c.id);
  const { data: participants } = await supabase
    .from("participants")
    .select("campaign_id")
    .in("campaign_id", campaignIds);

  const countMap: Record<string, number> = {};
  (participants || []).forEach((p: any) => {
    countMap[p.campaign_id] = (countMap[p.campaign_id] || 0) + 1;
  });

  // 4. Merge
  return campaigns.map((c) => {
    const bp = profileMap.get(c.business_id) as any;
    return {
      ...c,
      business_name: bp?.business_name || "",
      business_profile_photo_url: bp?.profile_photo_url || null,
      business_verified: bp?.verification_status === "approved",
      participants_count: countMap[c.id] || 0,
    };
  });
}

// ── Campaign CRUD ───────────────────────────────────────────

export async function createCampaign(
  businessId: string,
  dto: CreateCampaignDto
): Promise<CampaignWithBusiness> {
  const now = new Date();
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + dto.duration_days);

  const { data, error } = await supabase
    .from("campaigns")
    .insert({
      business_id: businessId,
      title: dto.title,
      description: dto.description || null,
      budget: dto.budget,
      duration_days: dto.duration_days,
      winners_count: dto.winners_count || 3,
      status: "ACTIVE" as CampaignStatus,
      start_date: now.toISOString(),
      end_date: endDate.toISOString(),
      cover_image_url: dto.cover_image_url || null,
      platforms: dto.platforms || [],
      rate_per_1k: dto.rate_per_1k || null,
    })
    .select()
    .single();

  if (error) throw error;

  const enriched = await enrichCampaigns([data as DbCampaign]);
  return enriched[0];
}

export async function getAllCampaigns(): Promise<CampaignWithBusiness[]> {
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return enrichCampaigns((data as DbCampaign[]) || []);
}

export async function getCampaignById(
  id: string
): Promise<CampaignWithBusiness | null> {
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // not found
    throw error;
  }

  const enriched = await enrichCampaigns([data as DbCampaign]);
  return enriched[0];
}

export async function getCampaignsByBusiness(
  businessId: string
): Promise<CampaignWithBusiness[]> {
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return enrichCampaigns((data as DbCampaign[]) || []);
}

export async function joinCampaign(
  campaignId: string,
  userId: string
): Promise<void> {
  // Check campaign exists and is active
  const campaign = await getCampaignById(campaignId);
  if (!campaign) throw new Error("Campaign not found");
  if (campaign.status !== "ACTIVE") throw new Error("Campaign is not active");

  // Check not already joined
  const { data: existing } = await supabase
    .from("participants")
    .select("id")
    .eq("campaign_id", campaignId)
    .eq("user_id", userId)
    .single();

  if (existing) throw new Error("Already joined this campaign");

  const { error } = await supabase.from("participants").insert({
    campaign_id: campaignId,
    user_id: userId,
  });

  if (error) throw error;
}

/**
 * Check if a user has joined a specific campaign.
 */
export async function hasJoinedCampaign(
  campaignId: string,
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("participants")
    .select("id")
    .eq("campaign_id", campaignId)
    .eq("user_id", userId)
    .single();

  return !!data;
}

/**
 * Get all campaigns an influencer has joined.
 */
export async function getJoinedCampaigns(
  userId: string
): Promise<CampaignWithBusiness[]> {
  // Get campaign IDs this user has joined
  const { data: participations, error: pError } = await supabase
    .from("participants")
    .select("campaign_id")
    .eq("user_id", userId);

  if (pError) throw pError;
  if (!participations || participations.length === 0) return [];

  const campaignIds = participations.map((p: any) => p.campaign_id);

  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .in("id", campaignIds)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return enrichCampaigns((data as DbCampaign[]) || []);
}
