import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";

import { CampaignCard } from "../../components/CampaignCard";
import { Spinner } from "../../components/Spinner";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardTitle } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageHeader } from "../../components/ui/PageHeader";

import type { Campaign } from "../../types";
import { getApiErrorMessage } from "../../services/api";
import { getAllCampaigns } from "../../services/campaign.service";

type StatusFilter = "ALL" | "ACTIVE" | "COMPLETED" | "DRAFT";

export function CampaignsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    getAllCampaigns()
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

  const filtered = campaigns.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <PageHeader title={t("campaignsPage.title")} subtitle={t("campaignsPage.subtitle")} />

      <Card className="mb-6 rounded-2xl">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("campaignsPage.searchPlaceholder")}
                className="input-field w-full pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {(["ALL", "ACTIVE", "COMPLETED", "DRAFT"] as const).map((s) => (
                <Button
                  key={s}
                  variant={statusFilter === s ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => setStatusFilter(s)}
                >
                  {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {error && !loading ? (
        <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-500">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="rounded-2xl">
          <CardContent className="p-6">
            <EmptyState
              title={t("campaignsPage.noCampaigns")}
              description={t("campaignsPage.tryAdjusting")}
            />
          </CardContent>
        </Card>
      ) : (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <CardTitle className="text-base">
              {t("campaignsPage.title")} · {filtered.length}
            </CardTitle>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                linkPrefix="/influencer/campaigns"
                showJoin
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
