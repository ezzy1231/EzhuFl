import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import {
  Trophy,
  Clock,
  DollarSign,
  Users,
  ExternalLink,
  Send,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { Spinner } from "../../components/Spinner";
import { getCampaignById, getLeaderboard, joinCampaign, checkJoined, submitVideo, refreshCampaignMetrics } from "../../services/campaign.service";
import { supabase } from "../../lib/supabase";
import type { Campaign, LeaderboardEntry } from "../../types";

export function CampaignDetailsPage() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [videoUrl, setVideoUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [hasJoined, setHasJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [brokenProfilePhotos, setBrokenProfilePhotos] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getCampaignById(id).catch(() => null),
      getLeaderboard(id).catch(() => []),
      checkJoined(id).catch(() => false),
    ])
      .then(([c, lb, joined]) => {
        setCampaign(c);
        setLeaderboard(lb);
        setHasJoined(joined);
      })
      .finally(() => setLoading(false));
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
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
          Campaign not found
        </p>
        <Link to="/influencer/campaigns" className="mt-4 text-sm text-brand hover:underline">
          ← Back to Campaigns
        </Link>
      </div>
    );
  }

  const daysLeft = campaign.end_date
    ? Math.max(
        0,
        Math.ceil(
          (new Date(campaign.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
      )
    : campaign.duration_days;

  // Prize distribution (50/30/20 for 3 winners, etc.)
  const prizeDistribution = (() => {
    const n = campaign.winners_count;
    if (n === 1) return [100];
    if (n === 2) return [60, 40];
    if (n === 3) return [50, 30, 20];
    // For 4+: 40% first, 25% second, 15% third, rest split equally
    const rest = Array(n - 3).fill(Math.round(20 / (n - 3)));
    return [40, 25, 15, ...rest];
  })();

  const handleJoin = async () => {
    setJoining(true);
    try {
      await joinCampaign(campaign.id);
      setHasJoined(true);
    } catch (err: any) {
      if (err?.response?.status === 409) {
        setHasJoined(true);
      }
    } finally {
      setJoining(false);
    }
  };

  const handleSubmit = async () => {
    if (!videoUrl || !campaign) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      await submitVideo(campaign.id, videoUrl);
      setSubmitted(true);
      setVideoUrl("");
      // Refresh leaderboard
      const lb = await getLeaderboard(campaign.id).catch(() => []);
      setLeaderboard(lb);
    } catch (err: any) {
      setSubmitError(err?.response?.data?.error || err.message || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Link
        to="/influencer/campaigns"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
      >
        <ArrowLeft size={14} /> Back to Campaigns
      </Link>

      {/* Campaign Header */}
      <div className="card mb-6 overflow-hidden rounded-xl">
        {/* Cover Image */}
        {campaign.cover_image_url && (
          <div className="h-48 w-full overflow-hidden sm:h-64">
            <img
              src={campaign.cover_image_url}
              alt={campaign.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="p-6">
          {/* Business info row */}
          <div className="mb-3 flex items-center gap-2">
            <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-brand/15">
              {campaign.business_profile_photo_url ? (
                <img
                  src={campaign.business_profile_photo_url}
                  alt={campaign.business_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-bold text-brand">
                  {campaign.business_name?.charAt(0)?.toUpperCase() || "?"}
                </div>
              )}
            </div>
            <span className="font-medium" style={{ color: "var(--text-primary)" }}>
              {campaign.business_name || "Business"}
            </span>
            {campaign.business_verified && <CheckCircle size={14} className="text-blue-500" />}
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-500">
                  {campaign.status}
                </span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  <Clock size={12} className="mr-1 inline" />
                  {daysLeft}d left
                </span>

              </div>
              <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                {campaign.title}
              </h1>
              {campaign.description && (
                <p className="mt-2 max-w-2xl" style={{ color: "var(--text-secondary)" }}>
                  {campaign.description}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-brand">
                ${campaign.budget.toLocaleString()}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Prize Pool</p>
            </div>
          </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg p-3" style={{ backgroundColor: "var(--bg-secondary)" }}>
            <DollarSign size={16} className="mb-1 text-brand" />
            <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              ${campaign.budget.toLocaleString()}
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Budget</p>
          </div>
          <div className="rounded-lg p-3" style={{ backgroundColor: "var(--bg-secondary)" }}>
            <Trophy size={16} className="mb-1 text-amber-500" />
            <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              {campaign.winners_count}
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Winners</p>
          </div>
          <div className="rounded-lg p-3" style={{ backgroundColor: "var(--bg-secondary)" }}>
            <Clock size={16} className="mb-1 text-blue-400" />
            <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              {campaign.duration_days}d
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Duration</p>
          </div>
          <div className="rounded-lg p-3" style={{ backgroundColor: "var(--bg-secondary)" }}>
            <Users size={16} className="mb-1 text-emerald-500" />
            <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              {leaderboard.length}
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Participants</p>
          </div>
        </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Submission + Prize Distribution */}
        <div className="space-y-6 lg:col-span-1">
          {/* Submit Video */}
          <div className="card rounded-xl p-6">
            <h2 className="mb-4 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              {hasJoined ? "Submit Your Video" : "Join this Campaign"}
            </h2>

            {!hasJoined ? (
              /* ── Not joined yet ── */
              <div className="space-y-3">
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Join this campaign to start submitting your content and compete for the prize pool.
                </p>
                <button
                  onClick={handleJoin}
                  disabled={joining || campaign.status !== "ACTIVE"}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
                >
                  <Send size={14} />
                  {joining ? "Joining..." : campaign.status !== "ACTIVE" ? "Campaign Not Active" : "Join Campaign"}
                </button>
              </div>
            ) : submitted ? (
              /* ── Submitted ── */
              <div className="space-y-3">
                <div className="rounded-lg bg-emerald-500/10 p-4 text-center">
                  <p className="text-sm font-medium text-emerald-500">
                    Video submitted successfully!
                  </p>
                  <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                    Your performance will be tracked automatically.
                  </p>
                </div>
                <button
                  onClick={() => setSubmitted(false)}
                  className="w-full rounded-lg border py-2 text-sm font-medium transition-colors hover:bg-brand/10"
                  style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}
                >
                  Submit Another Video
                </button>
              </div>
            ) : (
              /* ── Joined — show submit form ── */
              <div className="space-y-3">
                <div className="rounded-lg bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-500">
                  ✓ Already joined
                </div>
                {submitError && (
                  <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-500">
                    {submitError}
                  </div>
                )}
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Paste your TikTok/Instagram/YouTube URL"
                  className="input-field w-full"
                />
                <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                  Stats (views, likes, comments) will be fetched automatically from the platform.
                </p>
                <button
                  onClick={handleSubmit}
                  disabled={!videoUrl || submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
                >
                  <Send size={14} />
                  {submitting ? "Submitting..." : "Submit Video"}
                </button>
              </div>
            )}
          </div>

          {/* Prize Distribution */}
          <div className="card rounded-xl p-6">
            <h2 className="mb-4 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              Prize Distribution
            </h2>
            <div className="space-y-2">
              {prizeDistribution.map((pct, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg p-2.5"
                  style={{ backgroundColor: "var(--bg-secondary)" }}
                >
                  <span className="flex items-center gap-2 text-sm">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        i === 0
                          ? "bg-brand/20 text-brand"
                          : i === 1
                          ? "bg-gray-400/20 text-gray-400"
                          : i === 2
                          ? "bg-amber-500/20 text-amber-500"
                          : ""
                      }`}
                      style={i > 2 ? { color: "var(--text-muted)" } : undefined}
                    >
                      {i + 1}
                    </span>
                    <span style={{ color: "var(--text-secondary)" }}>
                      {i === 0 ? "1st" : i === 1 ? "2nd" : i === 2 ? "3rd" : `${i + 1}th`} Place
                    </span>
                  </span>
                  <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                    ${Math.round((campaign.budget * pct) / 100).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Leaderboard */}
        <div className="lg:col-span-2">
          <div className="card rounded-xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                Live Leaderboard
              </h2>
              {leaderboard.length > 0 && (
                <button
                  onClick={async () => {
                    if (!campaign) return;
                    setRefreshing(true);
                    try {
                      await refreshCampaignMetrics(campaign.id);
                      const lb = await getLeaderboard(campaign.id).catch(() => []);
                      setLeaderboard(lb);
                    } catch {}
                    setRefreshing(false);
                  }}
                  disabled={refreshing}
                  className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-brand/10 disabled:opacity-50"
                  style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}
                >
                  {refreshing ? "Refreshing..." : "↻ Refresh Stats"}
                </button>
              )}
            </div>
            {leaderboard.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>No submissions yet. Be the first to join!</p>
              </div>
            ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr
                    className="border-b text-left"
                    style={{ borderColor: "var(--border-primary)" }}
                  >
                    <th className="pb-3 font-medium" style={{ color: "var(--text-muted)" }}>#</th>
                    <th className="pb-3 font-medium" style={{ color: "var(--text-muted)" }}>Creator</th>
                    <th className="pb-3 font-medium" style={{ color: "var(--text-muted)" }}>Views</th>
                    <th className="pb-3 font-medium" style={{ color: "var(--text-muted)" }}>Likes</th>
                    <th className="pb-3 font-medium" style={{ color: "var(--text-muted)" }}>Comments</th>
                    <th className="pb-3 text-right font-medium" style={{ color: "var(--text-muted)" }}>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry) => (
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
                          {(() => {
                            const photoUrl = entry.user_profile_photo_url ||
                              supabase.storage.from('profiles').getPublicUrl(`${entry.user_id}/photo.jpg`).data.publicUrl;
                            const isBroken = brokenProfilePhotos.has(entry.user_id);
                            return isBroken ? (
                              <div
                                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium"
                                style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)" }}
                              >
                                {entry.user_name.charAt(0).toUpperCase()}
                              </div>
                            ) : (
                              <img
                                src={photoUrl}
                                alt={entry.user_name}
                                className="h-8 w-8 rounded-full object-cover"
                                onError={() => setBrokenProfilePhotos((prev) => new Set(prev).add(entry.user_id))}
                              />
                            );
                          })()}
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
                        {entry.views >= 1000 ? `${(entry.views / 1000).toFixed(entry.views >= 10000 ? 0 : 1)}K` : entry.views.toLocaleString()}
                      </td>
                      <td className="py-3" style={{ color: "var(--text-secondary)" }}>
                        {entry.likes >= 1000 ? `${(entry.likes / 1000).toFixed(entry.likes >= 10000 ? 0 : 1)}K` : entry.likes.toLocaleString()}
                      </td>
                      <td className="py-3" style={{ color: "var(--text-secondary)" }}>
                        {entry.comments.toLocaleString()}
                      </td>
                      <td className="py-3 text-right font-semibold" style={{ color: "var(--text-primary)" }}>
                        {entry.score.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
