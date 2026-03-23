import api from "./api";

export interface PublicStats {
  totalCampaigns: number;
  activeCreators: number;
  totalPaidOut: number;
  avgEngagementRate: number;
}

export async function getPublicStats(): Promise<PublicStats> {
  const { data } = await api.get<PublicStats>("/api/stats");
  return data;
}
