import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useTranslation } from "react-i18next";
import { DashboardCard } from "../../components/DashboardCard";
import { CampaignCard } from "../../components/CampaignCard";
import { Spinner } from "../../components/Spinner";
import {
  Trophy,
  DollarSign,
  Users,
  BarChart3,
  FolderOpen,
} from "lucide-react";
import { getApiErrorMessage } from "../../services/api";
import { getMyCampaigns } from "../../services/campaign.service";
import type { Campaign } from "../../types";

export function BusinessDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMyCampaigns()
      .then((c) => {
        setCampaigns(c);
        setError(null);
      })
      .catch((err) => {
        setCampaigns([]);
        setError(getApiErrorMessage(err, "Failed to load campaigns"));
      })
      .finally(() => setLoading(false));
  }, []);

  const activeCampaigns = campaigns.filter((c) => c.status === "ACTIVE");
  const totalSpent = campaigns.reduce((sum, c) => sum + c.budget, 0);

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
          {t("businessDashboard.welcomeBack", { name: user?.name || "Business" })}
        </h1>
        <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
          {t("businessDashboard.subtitle")}
        </p>
      </div>

      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title={t("businessDashboard.activeCampaigns")}
          value={activeCampaigns.length}
          icon={<Trophy size={20} />}
          color="brand"
        />
        <DashboardCard
          title={t("businessDashboard.totalSpent")}
          value={`$${totalSpent.toLocaleString()}`}
          icon={<DollarSign size={20} />}
          color="emerald"
        />
        <DashboardCard
          title={t("businessDashboard.totalCampaigns")}
          value={campaigns.length}
          icon={<Users size={20} />}
          color="amber"
        />
        <DashboardCard
          title={t("businessDashboard.avgBudget")}
          value={campaigns.length ? `$${Math.round(totalSpent / campaigns.length).toLocaleString()}` : "$0"}
          icon={<BarChart3 size={20} />}
          color="rose"
        />
      </div>

      {/* Recent Campaigns */}
      <div className="card rounded-xl p-6">
        <h2 className="mb-4 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
          {t("businessDashboard.recentCampaigns")}
        </h2>
        {error && (
          <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-500">
            {error}
          </div>
        )}
        {campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full bg-brand/10 p-4">
              <FolderOpen size={32} className="text-brand" />
            </div>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {t("businessDashboard.noCampaigns")}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {campaigns.slice(0, 6).map((c) => (
              <CampaignCard key={c.id} campaign={c} linkPrefix="/business/campaigns" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
