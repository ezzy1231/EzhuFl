import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "";

export interface PublicStats {
  totalCampaigns: number;
  activeCreators: number;
  totalPaidOut: number;
  avgEngagementRate: number;
}

export async function getPublicStats(): Promise<PublicStats> {
  const { data } = await axios.get<PublicStats>(`${baseURL}/api/stats`);
  return data;
}
