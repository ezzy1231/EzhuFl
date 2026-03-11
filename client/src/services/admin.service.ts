import api from "./api";
import type { BusinessProfile, InfluencerProfile, AdminStats } from "../types";

// ── Stats ───────────────────────────────────────

export async function getAdminStats(): Promise<AdminStats> {
  const { data } = await api.get<{ stats: AdminStats }>("/api/admin/stats");
  return data.stats;
}

// ── Businesses ──────────────────────────────────

export async function getBusinesses(
  status?: string
): Promise<BusinessProfile[]> {
  const params = status ? { status } : {};
  const { data } = await api.get<{ businesses: BusinessProfile[] }>(
    "/api/admin/businesses",
    { params }
  );
  return data.businesses;
}

export async function getPendingBusinesses(): Promise<BusinessProfile[]> {
  const { data } = await api.get<{ businesses: BusinessProfile[] }>(
    "/api/admin/businesses/pending"
  );
  return data.businesses;
}

export async function getBusinessDetail(
  id: string
): Promise<BusinessProfile> {
  const { data } = await api.get<{ business: BusinessProfile }>(
    `/api/admin/businesses/${id}`
  );
  return data.business;
}

export async function reviewBusiness(
  id: string,
  action: "approve" | "reject",
  rejectionReason?: string
): Promise<BusinessProfile> {
  const { data } = await api.post<{ business: BusinessProfile }>(
    `/api/admin/businesses/${id}/review`,
    { action, rejection_reason: rejectionReason }
  );
  return data.business;
}

export async function suspendBusiness(
  id: string,
  reason: string
): Promise<BusinessProfile> {
  const { data } = await api.post<{ business: BusinessProfile }>(
    `/api/admin/businesses/${id}/suspend`,
    { reason }
  );
  return data.business;
}

// ── Influencers ─────────────────────────────────

export async function getInfluencers(
  status?: string
): Promise<InfluencerProfile[]> {
  const params = status ? { status } : {};
  const { data } = await api.get<{ influencers: InfluencerProfile[] }>(
    "/api/admin/influencers",
    { params }
  );
  return data.influencers;
}

export async function getInfluencerDetail(
  id: string
): Promise<InfluencerProfile> {
  const { data } = await api.get<{ influencer: InfluencerProfile }>(
    `/api/admin/influencers/${id}`
  );
  return data.influencer;
}

export async function reviewInfluencer(
  id: string,
  action: "verify" | "unverify"
): Promise<InfluencerProfile> {
  const { data } = await api.post<{ influencer: InfluencerProfile }>(
    `/api/admin/influencers/${id}/review`,
    { action }
  );
  return data.influencer;
}
