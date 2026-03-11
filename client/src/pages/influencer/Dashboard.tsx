import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { DashboardCard } from "../../components/DashboardCard";
import { CampaignCard } from "../../components/CampaignCard";
import { Spinner } from "../../components/Spinner";
import {
  DollarSign,
  Trophy,
  Eye,
  TrendingUp,
  FolderOpen,
} from "lucide-react";
import { getAllCampaigns } from "../../services/campaign.service";
import type { Campaign } from "../../types";

export function InfluencerDashboard() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllCampaigns()
      .then((c) => setCampaigns(c))
      .catch(() => setCampaigns([]))
      .finally(() => setLoading(false));
  }, []);

  const activeCampaigns = campaigns.filter((c) => c.status === "ACTIVE").slice(0, 3);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Welcome back, {user?.name || "Creator"} 👋
        </h1>
        <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
          Here's what's happening with your campaigns
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Earnings"
          value="$0"
          icon={<DollarSign size={20} />}
          color="emerald"
        />
        <DashboardCard
          title="Active Campaigns"
          value={activeCampaigns.length}
          icon={<Trophy size={20} />}
          color="brand"
        />
        <DashboardCard
          title="Total Views"
          value="0"
          icon={<Eye size={20} />}
          color="amber"
        />
        <DashboardCard
          title="Win Rate"
          value="0%"
          icon={<TrendingUp size={20} />}
          color="rose"
        />
      </div>

      {/* Available Campaigns */}
      <div className="card rounded-xl p-6">
        <h2 className="mb-4 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
          Available Campaigns
        </h2>
        {activeCampaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full bg-brand/10 p-4">
              <FolderOpen size={32} className="text-brand" />
            </div>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              No active campaigns right now. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeCampaigns.map((c) => (
              <CampaignCard key={c.id} campaign={c} linkPrefix="/influencer/campaigns" showJoin />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
