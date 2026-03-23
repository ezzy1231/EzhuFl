import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useTranslation } from "react-i18next";
import { DashboardCard } from "../../components/DashboardCard";
import { CampaignCard } from "../../components/CampaignCard";
import { Spinner } from "../../components/Spinner";
import { Card, CardContent, CardTitle } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageHeader } from "../../components/ui/PageHeader";
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
      <PageHeader
        title={t("businessDashboard.welcomeBack", {
          name: user?.name || "Business",
        })}
        subtitle={t("businessDashboard.subtitle")}
      />

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
          value={
            campaigns.length
              ? `$${Math.round(totalSpent / campaigns.length).toLocaleString()}`
              : "$0"
          }
          icon={<BarChart3 size={20} />}
          color="rose"
        />
      </div>

      {/* Recent Campaigns */}
      <Card className="rounded-2xl">
        <CardContent className="p-0">
          <div className="px-6 pt-6">
            <CardTitle className="text-lg">{t("businessDashboard.recentCampaigns")}</CardTitle>
          </div>

          <div className="px-6 pb-6 pt-4">
            {error && (
              <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-500">
                {error}
              </div>
            )}

            {campaigns.length === 0 ? (
              <EmptyState
                icon={<FolderOpen size={28} className="text-brand" />}
                description={t("businessDashboard.noCampaigns")}
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {campaigns.slice(0, 6).map((c) => (
                  <CampaignCard
                    key={c.id}
                    campaign={c}
                    linkPrefix="/business/campaigns"
                  />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
