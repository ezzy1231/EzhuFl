import { useState, useEffect } from "react";
import { FolderOpen } from "lucide-react";
import { CampaignCard } from "../../components/CampaignCard";
import { Spinner } from "../../components/Spinner";
import { useTranslation } from "react-i18next";
import { getApiErrorMessage } from "../../services/api";
import { getMyJoinedCampaigns } from "../../services/campaign.service";
import type { Campaign } from "../../types";

export function MyCampaignsPage() {
  const [myCampaigns, setMyCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    getMyJoinedCampaigns()
      .then((c) => {
        setMyCampaigns(c);
        setError(null);
      })
      .catch((err) => {
        setMyCampaigns([]);
        setError(getApiErrorMessage(err, "Failed to load joined campaigns"));
      })
      .finally(() => setLoading(false));
  }, []);

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
          {t("myCampaignsPage.title")}
        </h1>
        <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
          {t("myCampaignsPage.subtitle")}
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-500">
          {error}
        </div>
      )}

      {myCampaigns.length === 0 ? (
        <div className="card flex flex-col items-center justify-center rounded-xl py-20 text-center">
          <div className="mb-4 rounded-full bg-brand/10 p-4">
            <FolderOpen size={32} className="text-brand" />
          </div>
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            {t("myCampaignsPage.noCampaignsTitle")}
          </h2>
          <p className="mt-2 max-w-md text-sm" style={{ color: "var(--text-secondary)" }}>
            {t("myCampaignsPage.noCampaignsText")}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {myCampaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              linkPrefix="/influencer/campaigns"
            />
          ))}
        </div>
      )}
    </div>
  );
}
