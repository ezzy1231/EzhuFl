import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Trophy, ArrowLeft, ExternalLink, BarChart3 } from "lucide-react";
import { Spinner } from "../../components/Spinner";
import { useAuth } from "../../hooks/useAuth";
import { getApiErrorMessage } from "../../services/api";
import {
  getAllCampaigns,
  getLeaderboard,
  getCampaignById,
  refreshCampaignMetrics,
} from "../../services/campaign.service";
import type { Campaign, LeaderboardEntry } from "../../types";

function formatNum(n: number) {
  if (n >= 10000) return `${(n / 1000).toFixed(0)}K`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function SharedLeaderboardPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { t } = useTranslation();
  const prefix = user?.role === "BUSINESS" ? "/business" : "/influencer";

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [lbLoading, setLbLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brokenPhotos, setBrokenPhotos] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      if (id) {
        try {
          const campaign = await getCampaignById(id);
          setSelectedCampaign(campaign);
        } catch (err) {
          setSelectedCampaign(null);
          setError(getApiErrorMessage(err, "Failed to load campaign"));
        }

        try {
          const leaderboardData = await getLeaderboard(id);
          setLeaderboard(leaderboardData);
        } catch (err) {
          setLeaderboard([]);
          setError((current) => current || getApiErrorMessage(err, "Failed to load leaderboard"));
        }
      } else {
        try {
          const allCampaigns = await getAllCampaigns();
          setCampaigns(allCampaigns.filter((x) => x.status === "ACTIVE" || x.status === "COMPLETED"));
        } catch (err) {
          setCampaigns([]);
          setError(getApiErrorMessage(err, "Failed to load campaigns"));
        }
      }

      setLoading(false);
    }

    void load();
  }, [id]);

  function selectCampaign(c: Campaign) {
    setSelectedCampaign(c);
    setLbLoading(true);
    setError(null);
    getLeaderboard(c.id)
      .then(setLeaderboard)
      .catch((err) => {
        setLeaderboard([]);
        setError(getApiErrorMessage(err, "Failed to load leaderboard"));
      })
      .finally(() => setLbLoading(false));
  }

  async function handleRefresh() {
    if (!selectedCampaign) return;
    setRefreshing(true);
    try {
      await refreshCampaignMetrics(selectedCampaign.id);
      const lb = await getLeaderboard(selectedCampaign.id);
      setLeaderboard(lb);
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to refresh leaderboard"));
    }
    setRefreshing(false);
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // ── Campaign list view ──
  if (!id && !selectedCampaign) {
    return (
      <div>
        {error && (
          <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-500">
            {error}
          </div>
        )}
        <h1 className="mb-1 text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          {t("leaderboardPage.liveLeaderboard")}
        </h1>
        <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
          {t("leaderboardPage.selectCampaign")}
        </p>

        {campaigns.length === 0 ? (
          <div className="card flex flex-col items-center justify-center rounded-xl py-16 text-center">
            <BarChart3 size={48} className="mb-3 text-brand/40" />
            <p className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              {t("leaderboardPage.noActiveCampaigns")}
            </p>
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
              {t("leaderboardPage.noActiveCampaignsText")}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((c) => (
              <button
                key={c.id}
                onClick={() => selectCampaign(c)}
                className="card group rounded-xl p-5 text-left transition-all hover:ring-2 hover:ring-brand/50"
              >
                {c.cover_image_url && (
                  <img
                    src={c.cover_image_url}
                    alt=""
                    className="mb-3 h-32 w-full rounded-lg object-cover"
                  />
                )}
                <h3
                  className="text-base font-semibold group-hover:text-brand"
                  style={{ color: "var(--text-primary)" }}
                >
                  {c.title}
                </h3>
                <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                  Budget: {Number(c.budget).toLocaleString()} ETB &middot;{" "}
                  {c.status === "COMPLETED" ? "Completed" : "Active"}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand">
                  <Trophy size={14} /> {t("leaderboardPage.viewLeaderboard")}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Campaign not found ──
  if (!selectedCampaign) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
          {t("leaderboardPage.campaignNotFound")}
        </p>
        <Link to={`${prefix}/leaderboard`} className="mt-4 text-sm text-brand hover:underline">
          ← {t("leaderboardPage.backToCampaigns")}
        </Link>
      </div>
    );
  }

  if (lbLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // ── Single campaign leaderboard ──
  return (
    <div>
      {error && (
        <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-500">
          {error}
        </div>
      )}
      {!id && (
        <button
          onClick={() => {
            setSelectedCampaign(null);
            setLeaderboard([]);
            if (!campaigns.length) {
              setLoading(true);
              getAllCampaigns()
                .then((c) => setCampaigns(c.filter((x) => x.status === "ACTIVE" || x.status === "COMPLETED")))
                .catch((err) => setError(getApiErrorMessage(err, "Failed to load campaigns")))
                .finally(() => setLoading(false));
            }
          }}
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
        >
          <ArrowLeft size={14} /> {t("leaderboardPage.backToCampaigns")}
        </button>
      )}

      <div className="card rounded-xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              {t("leaderboardPage.liveLeaderboard")}
            </h2>
            <p className="mt-0.5 text-sm" style={{ color: "var(--text-secondary)" }}>
              {selectedCampaign.title}
            </p>
          </div>
          {leaderboard.length > 0 && (
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-brand/10 disabled:opacity-50"
              style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}
            >
              {refreshing ? t("leaderboardPage.refreshing") : t("leaderboardPage.refreshStats")}
            </button>
          )}
        </div>

        {leaderboard.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {t("leaderboardPage.noSubmissions")}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left" style={{ borderColor: "var(--border-primary)" }}>
                  <th className="pb-3 font-medium" style={{ color: "var(--text-muted)" }}>#</th>
                  <th className="pb-3 font-medium" style={{ color: "var(--text-muted)" }}>Creator</th>
                  <th className="pb-3 font-medium" style={{ color: "var(--text-muted)" }}>Views</th>
                  <th className="pb-3 font-medium" style={{ color: "var(--text-muted)" }}>Likes</th>
                  <th className="pb-3 font-medium" style={{ color: "var(--text-muted)" }}>Comments</th>
                  <th className="pb-3 text-right font-medium" style={{ color: "var(--text-muted)" }}>Score</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry) => {
                  const fallbackUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/profiles/${entry.user_id}/photo.jpg`;
                  const photoUrl = entry.user_profile_photo_url || fallbackUrl;
                  const photoBroken = !!brokenPhotos[entry.user_id];

                  return (
                    <tr
                      key={entry.rank}
                      className="border-b last:border-0"
                      style={{ borderColor: "var(--border-primary)" }}
                    >
                      <td className="py-3">
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                            entry.rank === 1
                              ? "bg-brand/20 text-brand"
                              : entry.rank === 2
                              ? "bg-gray-400/20 text-gray-400"
                              : entry.rank === 3
                              ? "bg-amber-500/20 text-amber-500"
                              : ""
                          }`}
                          style={entry.rank > 3 ? { color: "var(--text-muted)" } : undefined}
                        >
                          {entry.rank}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          {photoUrl && !photoBroken ? (
                            <img
                              src={photoUrl}
                              alt={entry.user_name}
                              className="h-7 w-7 rounded-full object-cover"
                              onError={() => setBrokenPhotos((prev) => ({ ...prev, [entry.user_id]: true }))}
                            />
                          ) : (
                            <span
                              className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold"
                              style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)" }}
                            >
                              {entry.user_name?.charAt(0).toUpperCase() || "?"}
                            </span>
                          )}
                          <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                            {entry.user_name}
                          </span>
                          <a
                            href={entry.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand hover:underline"
                          >
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      </td>
                      <td className="py-3" style={{ color: "var(--text-secondary)" }}>
                        {formatNum(entry.views)}
                      </td>
                      <td className="py-3" style={{ color: "var(--text-secondary)" }}>
                        {formatNum(entry.likes)}
                      </td>
                      <td className="py-3" style={{ color: "var(--text-secondary)" }}>
                        {entry.comments.toLocaleString()}
                      </td>
                      <td className="py-3 text-right font-semibold" style={{ color: "var(--text-primary)" }}>
                        {entry.score.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
