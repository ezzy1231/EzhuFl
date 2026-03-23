import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  ExternalLink,
  Trophy,
  Users,
  DollarSign,
  Clock,
} from "lucide-react";
import { Spinner } from "../../components/Spinner";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardTitle } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageHeader } from "../../components/ui/PageHeader";
import { getApiErrorMessage } from "../../services/api";
import {
  getCampaignById,
  getLeaderboard,
  refreshCampaignMetrics,
} from "../../services/campaign.service";
import type { Campaign, LeaderboardEntry } from "../../types";

export function CampaignManagementPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brokenProfilePhotos, setBrokenProfilePhotos] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!id) return;
    const campaignId = id;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const campaignData = await getCampaignById(campaignId);
        setCampaign(campaignData);
      } catch (err) {
        setCampaign(null);
        setError(getApiErrorMessage(err, "Failed to load campaign"));
      }

      try {
        const leaderboardData = await getLeaderboard(campaignId);
        setLeaderboard(leaderboardData);
      } catch (err) {
        setLeaderboard([]);
        setError((current) => current || getApiErrorMessage(err, "Failed to load leaderboard"));
      }

      setLoading(false);
    }

    void load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div>
        <PageHeader title={t("campaignManagement.campaignNotFound")} />
        <EmptyState
          description={t("campaignManagement.campaignNotFound")}
          action={
            <Link to="/business/campaigns">
              <Button variant="secondary">
                <ArrowLeft size={16} /> {t("campaignManagement.backToCampaigns")}
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={campaign.title}
        subtitle={campaign.description || undefined}
        action={
          <Link to="/business/campaigns">
            <Button variant="ghost">
              <ArrowLeft size={16} /> {t("campaignManagement.backToCampaigns")}
            </Button>
          </Link>
        }
      />

      {error && (
        <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-500">
          {error}
        </div>
      )}

      <Card className="mb-6 overflow-hidden rounded-2xl">
        {/* Cover Image */}
        {campaign.cover_image_url ? (
          <div className="h-48 w-full overflow-hidden sm:h-64">
            <img
              src={campaign.cover_image_url}
              alt={campaign.title}
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}

        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <span
                className={`mb-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  campaign.status === "ACTIVE"
                    ? "bg-emerald-500/15 text-emerald-500"
                    : campaign.status === "COMPLETED"
                      ? "bg-brand/15 text-brand"
                      : campaign.status === "DRAFT"
                        ? "bg-gray-500/15 text-gray-400"
                        : "bg-rose-500/15 text-rose-500"
                }`}
              >
                {campaign.status}
              </span>
              <div
                className="text-sm font-medium"
                style={{ color: "var(--text-tertiary)" }}
              >
                {t("campaignManagement.budget")}
              </div>
              <div className="text-3xl font-bold text-brand">
                ${campaign.budget.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div
              className="rounded-xl p-3"
              style={{ backgroundColor: "var(--bg-secondary)" }}
            >
              <DollarSign size={16} className="mb-1 text-brand" />
              <p
                className="text-lg font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                ${campaign.budget.toLocaleString()}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {t("campaignManagement.budget")}
              </p>
            </div>
            <div
              className="rounded-xl p-3"
              style={{ backgroundColor: "var(--bg-secondary)" }}
            >
              <Trophy size={16} className="mb-1 text-amber-500" />
              <p
                className="text-lg font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {campaign.winners_count}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {t("campaignManagement.winners")}
              </p>
            </div>
            <div
              className="rounded-xl p-3"
              style={{ backgroundColor: "var(--bg-secondary)" }}
            >
              <Clock size={16} className="mb-1 text-blue-400" />
              <p
                className="text-lg font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {campaign.duration_days}d
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {t("campaignManagement.duration")}
              </p>
            </div>
            <div
              className="rounded-xl p-3"
              style={{ backgroundColor: "var(--bg-secondary)" }}
            >
              <Users size={16} className="mb-1 text-emerald-500" />
              <p
                className="text-lg font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {leaderboard.length}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {t("campaignManagement.participants")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card className="rounded-2xl">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <CardTitle className="text-lg">
              {t("campaignManagement.submissionsLeaderboard")}
            </CardTitle>

            {leaderboard.length > 0 ? (
              <Button
                variant="secondary"
                disabled={refreshing}
                onClick={async () => {
                  if (!id) return;
                  setRefreshing(true);
                  try {
                    await refreshCampaignMetrics(id);
                    const lb = await getLeaderboard(id);
                    setLeaderboard(lb);
                    setError(null);
                  } catch (err) {
                    setError(
                      getApiErrorMessage(err, "Failed to refresh leaderboard")
                    );
                  }
                  setRefreshing(false);
                }}
              >
                {refreshing
                  ? t("campaignManagement.refreshing")
                  : t("campaignManagement.refreshStats")}
              </Button>
            ) : null}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  className="border-b"
                  style={{ borderColor: "var(--border-primary)" }}
                >
                  <th
                    className="pb-3 text-left font-medium"
                    style={{ color: "var(--text-muted)" }}
                  >
                    #
                  </th>
                  <th
                    className="pb-3 text-left font-medium"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Creator
                  </th>
                  <th
                    className="pb-3 text-left font-medium"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Views
                  </th>
                  <th
                    className="pb-3 text-left font-medium"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Likes
                  </th>
                  <th
                    className="pb-3 text-left font-medium"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Comments
                  </th>
                  <th
                    className="pb-3 text-right font-medium"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Score
                  </th>
                </tr>
              </thead>

              <tbody>
                {leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10">
                      <EmptyState description={t("campaignManagement.noSubmissions", "No submissions yet") } />
                    </td>
                  </tr>
                ) : (
                  leaderboard.map((entry) => {
                    const fallbackProfilePhotoUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/profiles/${entry.user_id}/photo.jpg`;
                    const profilePhotoUrl =
                      entry.user_profile_photo_url || fallbackProfilePhotoUrl;
                    const photoBroken = !!brokenProfilePhotos[entry.user_id];

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
                            style={
                              entry.rank > 3
                                ? { color: "var(--text-muted)" }
                                : undefined
                            }
                          >
                            {entry.rank}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            {profilePhotoUrl && !photoBroken ? (
                              <img
                                src={profilePhotoUrl}
                                alt={entry.user_name}
                                className="h-7 w-7 rounded-full object-cover"
                                onError={() =>
                                  setBrokenProfilePhotos((prev) => ({
                                    ...prev,
                                    [entry.user_id]: true,
                                  }))
                                }
                              />
                            ) : (
                              <span
                                className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold"
                                style={{
                                  backgroundColor: "var(--bg-secondary)",
                                  color: "var(--text-secondary)",
                                }}
                              >
                                {entry.user_name?.charAt(0).toUpperCase() || "?"}
                              </span>
                            )}
                            <span
                              className="font-medium"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {entry.user_name}
                            </span>
                            <a
                              href={entry.video_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-brand"
                            >
                              <ExternalLink size={12} />
                            </a>
                          </div>
                        </td>
                        <td className="py-3" style={{ color: "var(--text-secondary)" }}>
                          {entry.views >= 1000
                            ? `${(entry.views / 1000).toFixed(
                                entry.views >= 10000 ? 0 : 1
                              )}K`
                            : entry.views.toLocaleString()}
                        </td>
                        <td className="py-3" style={{ color: "var(--text-secondary)" }}>
                          {entry.likes >= 1000
                            ? `${(entry.likes / 1000).toFixed(
                                entry.likes >= 10000 ? 0 : 1
                              )}K`
                            : entry.likes.toLocaleString()}
                        </td>
                        <td className="py-3" style={{ color: "var(--text-secondary)" }}>
                          {entry.comments.toLocaleString()}
                        </td>
                        <td
                          className="py-3 text-right font-semibold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {entry.score.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
