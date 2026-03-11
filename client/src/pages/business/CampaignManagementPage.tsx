import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft, ExternalLink, Trophy, Users, DollarSign, Clock } from "lucide-react";
import { Spinner } from "../../components/Spinner";
import { getCampaignById, getLeaderboard, refreshCampaignMetrics } from "../../services/campaign.service";
import type { Campaign, LeaderboardEntry } from "../../types";

export function CampaignManagementPage() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [brokenProfilePhotos, setBrokenProfilePhotos] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getCampaignById(id).catch(() => null),
      getLeaderboard(id).catch(() => []),
    ])
      .then(([c, lb]) => {
        setCampaign(c);
        setLeaderboard(lb);
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
        <Link to="/business/campaigns" className="mt-4 text-sm text-brand hover:underline">
          ← Back to Campaigns
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/business/campaigns"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
      >
        <ArrowLeft size={14} /> Back to Campaigns
      </Link>

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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span className={`mb-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
              campaign.status === "ACTIVE" ? "bg-emerald-500/15 text-emerald-500" :
              campaign.status === "COMPLETED" ? "bg-brand/15 text-brand" :
              campaign.status === "DRAFT" ? "bg-gray-500/15 text-gray-400" :
              "bg-rose-500/15 text-rose-500"
            }`}>
              {campaign.status}
            </span>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              {campaign.title}
            </h1>
            {campaign.description && (
              <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
                {campaign.description}
              </p>
            )}
          </div>
          <p className="text-3xl font-bold text-brand">${campaign.budget.toLocaleString()}</p>
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

      {/* Submissions Table */}
      <div className="card rounded-xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Submissions & Leaderboard
          </h2>
          {leaderboard.length > 0 && (
            <button
              onClick={async () => {
                if (!id) return;
                setRefreshing(true);
                try {
                  await refreshCampaignMetrics(id);
                  const lb = await getLeaderboard(id).catch(() => []);
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--border-primary)" }}>
                <th className="pb-3 text-left font-medium" style={{ color: "var(--text-muted)" }}>#</th>
                <th className="pb-3 text-left font-medium" style={{ color: "var(--text-muted)" }}>Creator</th>
                <th className="pb-3 text-left font-medium" style={{ color: "var(--text-muted)" }}>Views</th>
                <th className="pb-3 text-left font-medium" style={{ color: "var(--text-muted)" }}>Likes</th>
                <th className="pb-3 text-left font-medium" style={{ color: "var(--text-muted)" }}>Comments</th>
                <th className="pb-3 text-right font-medium" style={{ color: "var(--text-muted)" }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry) => {
                const fallbackProfilePhotoUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/profiles/${entry.user_id}/photo.jpg`;
                const profilePhotoUrl = entry.user_profile_photo_url || fallbackProfilePhotoUrl;
                const photoBroken = !!brokenProfilePhotos[entry.user_id];

                return (
                <tr key={entry.rank} className="border-b last:border-0" style={{ borderColor: "var(--border-primary)" }}>
                  <td className="py-3">
                    <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                      entry.rank === 1 ? "bg-brand/20 text-brand" :
                      entry.rank === 2 ? "bg-gray-400/20 text-gray-400" :
                      entry.rank === 3 ? "bg-amber-500/20 text-amber-500" : ""
                    }`} style={entry.rank > 3 ? { color: "var(--text-muted)" } : undefined}>
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
                      <span className="font-medium" style={{ color: "var(--text-primary)" }}>{entry.user_name}</span>
                      <a href={entry.video_url} target="_blank" rel="noopener noreferrer" className="text-brand">
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </td>
                  <td className="py-3" style={{ color: "var(--text-secondary)" }}>{entry.views >= 1000 ? `${(entry.views / 1000).toFixed(entry.views >= 10000 ? 0 : 1)}K` : entry.views.toLocaleString()}</td>
                  <td className="py-3" style={{ color: "var(--text-secondary)" }}>{entry.likes >= 1000 ? `${(entry.likes / 1000).toFixed(entry.likes >= 10000 ? 0 : 1)}K` : entry.likes.toLocaleString()}</td>
                  <td className="py-3" style={{ color: "var(--text-secondary)" }}>{entry.comments.toLocaleString()}</td>
                  <td className="py-3 text-right font-semibold" style={{ color: "var(--text-primary)" }}>{entry.score.toLocaleString()}</td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
