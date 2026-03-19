import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Trophy, ArrowLeft, ExternalLink } from "lucide-react";
import { Spinner } from "../../components/Spinner";
import { getCampaignById, getLeaderboard } from "../../services/campaign.service";
import type { Campaign, LeaderboardEntry } from "../../types";

export function LeaderboardPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

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
          {t("leaderboardPage.campaignNotFound")}
        </p>
        <Link to="/" className="mt-4 text-sm text-brand hover:underline">
          ← {t("common.back")}
        </Link>
      </div>
    );
  }

  const topThree = leaderboard.slice(0, 3);

  return (
    <div>
      <Link
        to={`/influencer/campaigns/${campaign.id}`}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
      >
        <ArrowLeft size={14} /> {t("leaderboardPage.backToCampaign")}
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          {t("leaderboardPage.liveLeaderboard")}
        </h1>
        <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
          {campaign.title}
        </p>
      </div>

      {/* Podium */}
      <div className="card mb-8 rounded-xl p-8">
        <div className="flex items-end justify-center gap-4 sm:gap-8">
          {/* 2nd place */}
          {topThree[1] && (
            <div className="flex flex-col items-center">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold"
                style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)" }}
              >
                {topThree[1].user_name.charAt(0)}
              </div>
              <p
                className="mt-2 text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {topThree[1].user_name}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {topThree[1].score.toLocaleString()} pts
              </p>
              <div className="mt-3 flex h-28 w-24 flex-col items-center justify-end rounded-t-xl bg-gray-400/15 pb-3">
                <span className="text-2xl font-bold text-gray-400">2</span>
              </div>
            </div>
          )}

          {/* 1st place */}
          {topThree[0] && (
            <div className="flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/20 text-xl font-bold text-brand">
                {topThree[0].user_name.charAt(0)}
              </div>
              <p
                className="mt-2 text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {topThree[0].user_name}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {topThree[0].score.toLocaleString()} pts
              </p>
              <div className="mt-3 flex h-36 w-28 flex-col items-center justify-end rounded-t-xl bg-brand/15 pb-3">
                <Trophy size={28} className="mb-1 text-brand" />
                <span className="text-2xl font-bold text-brand">1</span>
              </div>
            </div>
          )}

          {/* 3rd place */}
          {topThree[2] && (
            <div className="flex flex-col items-center">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold"
                style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)" }}
              >
                {topThree[2].user_name.charAt(0)}
              </div>
              <p
                className="mt-2 text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {topThree[2].user_name}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {topThree[2].score.toLocaleString()} pts
              </p>
              <div className="mt-3 flex h-20 w-24 flex-col items-center justify-end rounded-t-xl bg-amber-500/15 pb-3">
                <span className="text-2xl font-bold text-amber-500">3</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full Rankings Table */}
      <div className="card rounded-xl p-6">
        <h2 className="mb-4 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
          {t("leaderboardPage.fullRankings")}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--border-primary)" }}>
                <th className="pb-3 text-left font-medium" style={{ color: "var(--text-muted)" }}>Rank</th>
                <th className="pb-3 text-left font-medium" style={{ color: "var(--text-muted)" }}>Creator</th>
                <th className="pb-3 text-left font-medium" style={{ color: "var(--text-muted)" }}>Views</th>
                <th className="pb-3 text-left font-medium" style={{ color: "var(--text-muted)" }}>Likes</th>
                <th className="pb-3 text-left font-medium" style={{ color: "var(--text-muted)" }}>Comments</th>
                <th className="pb-3 text-right font-medium" style={{ color: "var(--text-muted)" }}>Score</th>
                <th className="pb-3 text-right font-medium" style={{ color: "var(--text-muted)" }}>Video</th>
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
                  <td className="py-3 font-medium" style={{ color: "var(--text-primary)" }}>
                    {entry.user_name}
                  </td>
                  <td className="py-3" style={{ color: "var(--text-secondary)" }}>
                    {(entry.views / 1000).toFixed(0)}K
                  </td>
                  <td className="py-3" style={{ color: "var(--text-secondary)" }}>
                    {(entry.likes / 1000).toFixed(1)}K
                  </td>
                  <td className="py-3" style={{ color: "var(--text-secondary)" }}>
                    {entry.comments.toLocaleString()}
                  </td>
                  <td className="py-3 text-right font-semibold" style={{ color: "var(--text-primary)" }}>
                    {entry.score.toLocaleString()}
                  </td>
                  <td className="py-3 text-right">
                    <a
                      href={entry.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-brand hover:underline"
                    >
                      {t("leaderboardPage.watch")} <ExternalLink size={12} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
