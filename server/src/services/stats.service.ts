import { supabase } from "../config/supabase.js";

export interface PublicStats {
  totalCampaigns: number;
  activeCreators: number;
  totalPaidOut: number;
  avgEngagementRate: number;
}

export async function getPublicStats(): Promise<PublicStats> {
  const [campaignsResult, creatorsResult, completedResult, engagementResult] =
    await Promise.all([
      // Total campaigns ever created
      supabase.from("campaigns").select("id", { count: "exact", head: true }),

      // Total influencer profiles (active creators)
      supabase
        .from("influencer_profiles")
        .select("id", { count: "exact", head: true }),

      // Sum of budgets for completed campaigns (total paid out)
      supabase.from("campaigns").select("budget").eq("status", "COMPLETED"),

      // Avg engagement rate from all submissions with views > 0
      supabase
        .from("submissions")
        .select("views, likes, comments")
        .gt("views", 0),
    ]);

  const totalCampaigns = campaignsResult.count ?? 0;
  const activeCreators = creatorsResult.count ?? 0;

  const completedCampaigns = (completedResult.data || []) as {
    budget: number;
  }[];
  const totalPaidOut = completedCampaigns.reduce(
    (sum, c) => sum + (c.budget || 0),
    0
  );

  const submissions = (engagementResult.data || []) as {
    views: number;
    likes: number;
    comments: number;
  }[];
  let avgEngagementRate = 0;
  if (submissions.length > 0) {
    const totalRate = submissions.reduce((sum, s) => {
      const engagement = ((s.likes + s.comments) / s.views) * 100;
      return sum + engagement;
    }, 0);
    avgEngagementRate = Math.round((totalRate / submissions.length) * 10) / 10;
  }

  return { totalCampaigns, activeCreators, totalPaidOut, avgEngagementRate };
}
