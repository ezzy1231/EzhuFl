import { supabase } from "../config/supabase.js";
import type { LeaderboardEntry } from "../types/index.js";

export async function getLeaderboard(
  campaignId: string
): Promise<LeaderboardEntry[]> {
  // Fetch submissions joined with user names, ordered by score descending
  const { data, error } = await supabase
    .from("submissions")
    .select(
      `
      id,
      user_id,
      video_url,
      views,
      likes,
      comments,
      score,
      submitted_at,
      users!submissions_user_id_fkey ( name )
    `
    )
    .eq("campaign_id", campaignId)
    .order("score", { ascending: false });

  if (error) throw error;

  const rows = (data || []) as any[];
  const userIds = [...new Set(rows.map((row) => row.user_id).filter(Boolean))];

  let photoMap = new Map<string, string | null>();
  if (userIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from("influencer_profiles")
      .select("user_id, profile_photo_url")
      .in("user_id", userIds);

    if (profilesError) throw profilesError;

    photoMap = new Map(
      (profiles || []).map((profile: any) => [
        profile.user_id,
        profile.profile_photo_url || null,
      ])
    );
  }

  return rows.map((row: any, index: number) => ({
    rank: index + 1,
    user_id: row.user_id,
    user_name: row.users?.name || "Unknown",
    user_profile_photo_url: photoMap.get(row.user_id) || null,
    video_url: row.video_url,
    views: row.views,
    likes: row.likes,
    comments: row.comments,
    score: row.score,
    submitted_at: row.submitted_at,
  }));
}
