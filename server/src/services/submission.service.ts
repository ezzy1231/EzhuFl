import { supabase } from "../config/supabase.js";
import { AppError } from "../lib/errors.js";
import { calculateScore } from "../utils/score.js";
import { fetchVideoMetrics } from "./social-media.service.js";
import type {
  DbSubmission,
  CreateSubmissionDto,
  UserRole,
} from "../types/index.js";

async function assertCanManageCampaignSubmissions(
  campaignId: string,
  userId: string,
  role: UserRole
): Promise<void> {
  if (role === "ADMIN") {
    return;
  }

  const { data: campaign, error } = await supabase
    .from("campaigns")
    .select("id")
    .eq("id", campaignId)
    .eq("business_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!campaign) {
    throw new AppError(403, "Not authorized to manage submissions for this campaign", "FORBIDDEN");
  }
}

export async function createSubmission(
  userId: string,
  dto: CreateSubmissionDto
): Promise<DbSubmission> {
  // Verify user is a participant of this campaign
  const { data: participant } = await supabase
    .from("participants")
    .select("id")
    .eq("campaign_id", dto.campaign_id)
    .eq("user_id", userId)
    .single();

  if (!participant) {
    throw new AppError(403, "You must join the campaign before submitting", "FORBIDDEN");
  }

  // Verify campaign is active
  const { data: campaign } = await supabase
    .from("campaigns")
    .select("status")
    .eq("id", dto.campaign_id)
    .single();

  if (!campaign || campaign.status !== "ACTIVE") {
    throw new AppError(409, "Campaign is not active", "CONFLICT");
  }

  // Try to auto-fetch metrics from the platform API
  let views = dto.views || 0;
  let likes = dto.likes || 0;
  let comments = dto.comments || 0;

  const metrics = await fetchVideoMetrics(dto.video_url, dto.platform);
  if (metrics) {
    views = metrics.views;
    likes = metrics.likes;
    comments = metrics.comments;
  }

  const score = calculateScore(views, likes, comments);

  const { data, error } = await supabase
    .from("submissions")
    .insert({
      campaign_id: dto.campaign_id,
      user_id: userId,
      video_url: dto.video_url,
      platform: dto.platform,
      views,
      likes,
      comments,
      score,
    })
    .select()
    .single();

  if (error) throw error;
  return data as DbSubmission;
}

export async function getSubmissionsByCampaign(
  campaignId: string
): Promise<DbSubmission[]> {
  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("campaign_id", campaignId)
    .order("score", { ascending: false });

  if (error) throw error;
  return (data as DbSubmission[]) || [];
}

/**
 * Refresh the metrics for a single submission by re-fetching from the API.
 */
export async function refreshSubmissionMetrics(
  submissionId: string,
  userId: string,
  role: UserRole
): Promise<DbSubmission> {
  const { data: sub, error: fetchError } = await supabase
    .from("submissions")
    .select("*")
    .eq("id", submissionId)
    .single();

  if (fetchError || !sub) {
    throw new AppError(404, "Submission not found", "NOT_FOUND");
  }

  if (role !== "ADMIN" && sub.user_id !== userId) {
    await assertCanManageCampaignSubmissions(sub.campaign_id, userId, role);
  }

  const metrics = await fetchVideoMetrics(sub.video_url, sub.platform);
  if (!metrics) {
    return sub as DbSubmission; // No API configured or fetch failed
  }

  const score = calculateScore(metrics.views, metrics.likes, metrics.comments);

  const { data, error } = await supabase
    .from("submissions")
    .update({
      views: metrics.views,
      likes: metrics.likes,
      comments: metrics.comments,
      score,
    })
    .eq("id", submissionId)
    .select()
    .single();

  if (error) throw error;
  return data as DbSubmission;
}

/**
 * Refresh metrics for ALL submissions in a campaign.
 */
export async function refreshCampaignMetrics(
  campaignId: string,
  userId: string,
  role: UserRole
): Promise<DbSubmission[]> {
  await assertCanManageCampaignSubmissions(campaignId, userId, role);

  const submissions = await getSubmissionsByCampaign(campaignId);

  const updated: DbSubmission[] = [];
  for (const sub of submissions) {
    try {
      const refreshed = await refreshSubmissionMetrics(sub.id, userId, role);
      updated.push(refreshed);
    } catch {
      updated.push(sub);
    }
  }

  return updated;
}
