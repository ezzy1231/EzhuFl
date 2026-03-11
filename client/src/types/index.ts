// ──────────────────────────────────────────
// Shared TypeScript types for the client
// ──────────────────────────────────────────

export type UserRole = "BUSINESS" | "INFLUENCER" | "ADMIN";

export type CampaignStatus = "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED";

export type Platform = "TIKTOK" | "INSTAGRAM" | "YOUTUBE" | "TWITTER";

export type BusinessVerificationStatus = "pending" | "approved" | "rejected" | "suspended";

export type InfluencerVerificationStatus = "unverified" | "basic" | "verified";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Campaign {
  id: string;
  business_id: string;
  title: string;
  description: string | null;
  budget: number;
  duration_days: number;
  winners_count: number;
  status: CampaignStatus;
  start_date: string | null;
  end_date: string | null;
  cover_image_url: string | null;
  platforms: string[];
  rate_per_1k: number | null;
  business_name: string;
  business_profile_photo_url: string | null;
  business_verified: boolean;
  participants_count: number;
  created_at: string;
}

export interface Participant {
  id: string;
  campaign_id: string;
  user_id: string;
  joined_at: string;
}

export interface Submission {
  id: string;
  campaign_id: string;
  user_id: string;
  video_url: string;
  platform: Platform;
  views: number;
  likes: number;
  comments: number;
  score: number;
  submitted_at: string;
}

export interface Payment {
  id: string;
  campaign_id: string;
  user_id: string;
  amount: number;
  status: PaymentStatus;
  created_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  user_name: string;
  user_profile_photo_url?: string | null;
  video_url: string;
  views: number;
  likes: number;
  comments: number;
  score: number;
  submitted_at: string;
}

// ── Extended profiles ───────────────────────────

export interface BusinessProfile {
  id: string;
  user_id: string;
  business_name: string;
  owner_name: string;
  phone: string;
  city: string;
  address: string;
  license_number: string;
  license_file_url: string | null;
  profile_photo_url: string | null;
  map_lat: number | null;
  map_lng: number | null;
  verification_status: BusinessVerificationStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface InfluencerProfile {
  id: string;
  user_id: string;
  display_name: string;
  bio: string;
  phone: string;
  city: string;
  profile_photo_url: string | null;
  id_document_url: string | null;
  tiktok_handle: string | null;
  instagram_handle: string | null;
  verification_status: InfluencerVerificationStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminStats {
  pendingBusinesses: number;
  approvedBusinesses: number;
  totalInfluencers: number;
  totalCampaigns: number;
}
