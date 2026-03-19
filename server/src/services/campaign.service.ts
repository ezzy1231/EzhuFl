import { supabase } from "../config/supabase.js";
import { getLeaderboard } from "./leaderboard.service.js";
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

// ── Prize distribution percentages ──────────────────────────

function getPrizeSplit(winnersCount: number): number[] {
  switch (winnersCount) {
    case 1: return [1];
    case 2: return [0.6, 0.4];
    case 3: return [0.5, 0.3, 0.2];
    default: {
      // 4+: 40% / 25% / 15% / remaining split equally
      const splits = [0.4, 0.25, 0.15];
      const remaining = 1 - splits.reduce((a, b) => a + b, 0);
      const extraCount = winnersCount - 3;
      const perExtra = remaining / extraCount;
      return [...splits, ...Array(extraCount).fill(perExtra)];
    }
  }
}

// ── Complete a campaign and award winners ────────────────────

export async function completeCampaign(
  campaignId: string
): Promise<{ winners: Array<{ user_id: string; amount: number; rank: number }> }> {
  // 1. Fetch campaign
  const { data: campaign, error: fetchErr } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", campaignId)
    .single();

  if (fetchErr || !campaign) throw new Error("Campaign not found");
  if (campaign.status === "COMPLETED") throw new Error("Campaign already completed");

  // 2. Mark as COMPLETED
  const { error: updateErr } = await supabase
    .from("campaigns")
    .update({ status: "COMPLETED" })
    .eq("id", campaignId);

  if (updateErr) throw updateErr;

  // 3. Get leaderboard (sorted by score DESC)
  const leaderboard = await getLeaderboard(campaignId);

  if (leaderboard.length === 0) {
    return { winners: [] };
  }

  // 4. Determine winners (top N or fewer if not enough submissions)
  const winnersCount = Math.min(campaign.winners_count, leaderboard.length);
  const splits = getPrizeSplit(winnersCount);
  const budget = Number(campaign.budget);

  const winners = leaderboard.slice(0, winnersCount).map((entry, i) => ({
    user_id: entry.user_id,
    amount: Math.round(budget * splits[i] * 100) / 100,
    rank: entry.rank,
  }));

  // 5. Create payment records for winners
  if (winners.length > 0) {
    const paymentRows = winners.map((w) => ({
      campaign_id: campaignId,
      user_id: w.user_id,
      amount: w.amount,
      status: "PENDING",
    }));

    const { error: payErr } = await supabase.from("payments").insert(paymentRows);
    if (payErr) {
      console.error("Failed to create payment records:", payErr);
    }
  }

  return { winners };
}

// ── Auto-complete expired campaigns ─────────────────────────

export async function completeExpiredCampaigns(): Promise<number> {
  // Find all ACTIVE campaigns whose end_date has passed
  const { data: expired, error } = await supabase
    .from("campaigns")
    .select("id")
    .eq("status", "ACTIVE")
    .lte("end_date", new Date().toISOString());

  if (error || !expired) return 0;

  let completed = 0;
  for (const campaign of expired) {
    try {
      await completeCampaign(campaign.id);
      completed++;
    } catch (err) {
      console.error(`Failed to complete campaign ${campaign.id}:`, err);
    }
  }

  return completed;
}
