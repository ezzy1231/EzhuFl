import api from "./api";
import type { Campaign, LeaderboardEntry } from "../types";

interface CampaignsResponse {
  campaigns: Campaign[];
}

interface CampaignResponse {
  campaign: Campaign;
}

interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
}

export async function getAllCampaigns(): Promise<Campaign[]> {
  const { data } = await api.get<CampaignsResponse>("/api/campaigns");
  return data.campaigns;
}

export async function getCampaignById(id: string): Promise<Campaign> {
  const { data } = await api.get<CampaignResponse>(`/api/campaigns/${id}`);
  return data.campaign;
}

export async function getMyCampaigns(): Promise<Campaign[]> {
  const { data } = await api.get<CampaignsResponse>("/api/campaigns/my");
  return data.campaigns;
}

export async function createCampaign(payload: {
  title: string;
  description?: string;
  budget: number;
  duration_days: number;
  winners_count?: number;
  cover_image_url?: string;
  platforms?: string[];
  rate_per_1k?: number;
}): Promise<Campaign> {
  const { data } = await api.post<CampaignResponse>("/api/campaigns", payload);
  return data.campaign;
}

export async function joinCampaign(campaignId: string): Promise<void> {
  await api.post(`/api/campaigns/${campaignId}/join`);
}

export async function checkJoined(campaignId: string): Promise<boolean> {
  const { data } = await api.get<{ joined: boolean }>(`/api/campaigns/${campaignId}/joined`);
  return data.joined;
}

export async function getMyJoinedCampaigns(): Promise<Campaign[]> {
  const { data } = await api.get<CampaignsResponse>("/api/campaigns/joined");
  return data.campaigns;
}

export async function getLeaderboard(
  campaignId: string
): Promise<LeaderboardEntry[]> {
  const { data } = await api.get<LeaderboardResponse>(
    `/api/campaigns/${campaignId}/leaderboard`,
    {
      params: { _t: Date.now() },
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    }
  );
  return data.leaderboard;
}

// ── Submissions ─────────────────────────────────

interface SubmissionResponse {
  submission: import("../types").Submission;
}

/** Detect platform from a video URL */
function detectPlatform(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes("tiktok.com")) return "TIKTOK";
  if (lower.includes("instagram.com")) return "INSTAGRAM";
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) return "YOUTUBE";
  if (lower.includes("twitter.com") || lower.includes("x.com")) return "TWITTER";
  return "TIKTOK"; // fallback
}

export async function submitVideo(
  campaignId: string,
  videoUrl: string
): Promise<import("../types").Submission> {
  const platform = detectPlatform(videoUrl);
  const { data } = await api.post<SubmissionResponse>("/api/submissions", {
    campaign_id: campaignId,
    video_url: videoUrl,
    platform,
  });
  return data.submission;
}

/** Refresh metrics for all submissions in a campaign */
export async function refreshCampaignMetrics(
  campaignId: string
): Promise<void> {
  await api.post(`/api/submissions/campaign/${campaignId}/refresh`);
}
