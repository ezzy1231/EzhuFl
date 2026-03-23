import { useState } from "react";
import type { Campaign, CampaignStatus } from "../types";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Users, CheckCircle, UserPlus } from "lucide-react";
import { joinCampaign } from "../services/campaign.service";
import { isApiError } from "../services/api";

interface CampaignCardProps {
  campaign: Campaign;
  linkPrefix: string;
  showJoin?: boolean;
}

const statusStyles: Record<CampaignStatus, string> = {
  DRAFT: "bg-gray-500/15 text-gray-400",
  ACTIVE: "bg-emerald-500/15 text-emerald-500",
  COMPLETED: "bg-brand/15 text-brand",
  CANCELLED: "bg-rose-500/15 text-rose-500",
};

/** Platform SVG icons (small inline) */
function PlatformIcon({ platform }: { platform: string }) {
  switch (platform.toUpperCase()) {
    case "TIKTOK":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.77a8.18 8.18 0 004.76 1.52v-3.4a4.85 4.85 0 01-1-.2z" />
        </svg>
      );
    case "INSTAGRAM":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      );
    case "YOUTUBE":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    case "TWITTER":
    case "X":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    default:
      return null;
  }
}

/** Relative time helper  e.g. "5h", "2d", "3w" */
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${Math.max(1, minutes)}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w`;
}

export function CampaignCard({ campaign, linkPrefix, showJoin }: CampaignCardProps) {
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const { t } = useTranslation();

  const handleJoin = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (joining || joined) return;
    setJoining(true);
    try {
      await joinCampaign(campaign.id);
      setJoined(true);
    } catch (err) {
      if (isApiError(err) && err.status === 409) {
        setJoined(true);
      }
    } finally {
      setJoining(false);
    }
  };

  return (
    <Link
      to={`${linkPrefix}/${campaign.id}`}
      className="card group block overflow-hidden"
    >
      {/* Cover Image */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-brand/20 to-purple-500/20">
        {campaign.cover_image_url ? (
          <img
            src={campaign.cover_image_url}
            alt={campaign.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-4xl font-black text-brand/30">
              {campaign.title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Status badge (top-right) */}
        <span
          className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold backdrop-blur-sm ${statusStyles[campaign.status]}`}
        >
          {campaign.status}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Business info row */}
        <div className="mb-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            {/* Business avatar */}
            <div className="h-7 w-7 flex-shrink-0 overflow-hidden rounded-full bg-brand/15">
              {campaign.business_profile_photo_url ? (
                <img
                  src={campaign.business_profile_photo_url}
                  alt={campaign.business_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-brand">
                  {campaign.business_name?.charAt(0)?.toUpperCase() || "?"}
                </div>
              )}
            </div>

            {/* Name + verified + time */}
            <span
              className="truncate text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              {campaign.business_name || "Business"}
            </span>
            {campaign.business_verified && <CheckCircle size={14} className="flex-shrink-0 text-blue-500" />}
            <span className="flex-shrink-0 text-xs" style={{ color: "var(--text-muted)" }}>
              · {timeAgo(campaign.created_at)}
            </span>
          </div>

          {/* Platform icons */}
          <div className="flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
            {(campaign.platforms?.length > 0
              ? campaign.platforms
              : ["TIKTOK"]
            ).map((p) => (
              <PlatformIcon key={p} platform={p} />
            ))}
          </div>
        </div>

        {/* Campaign title */}
        <h3
          className="mb-3 text-sm font-semibold leading-snug transition-colors group-hover:text-brand"
          style={{ color: "var(--text-primary)" }}
        >
          {campaign.title}
        </h3>

        {/* Bottom row: budget · participants · rate */}
        <div className="flex items-center gap-3 text-xs">
          <span className="font-semibold text-brand">
            $0
            <span style={{ color: "var(--text-muted)" }}>
              /${campaign.budget >= 1000
                ? `${(campaign.budget / 1000).toFixed(campaign.budget % 1000 === 0 ? 0 : 1)}K`
                : campaign.budget.toLocaleString()}
            </span>
          </span>

          <span className="flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
            <Users size={12} />
            {campaign.participants_count ?? 0}
          </span>

          {showJoin && campaign.status === "ACTIVE" && (
            <button
              onClick={handleJoin}
              disabled={joining || joined}
              className={`ml-auto flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                joined
                  ? "bg-emerald-500/15 text-emerald-500"
                  : "bg-brand text-white hover:bg-brand-hover"
              }`}
            >
              <UserPlus size={12} />
              {joined ? t("common.joined") : joining ? t("common.joining") : t("common.join")}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
