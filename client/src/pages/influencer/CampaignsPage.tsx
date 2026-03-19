import { useState, useEffect } from "react";
import { CampaignCard } from "../../components/CampaignCard";
import { Spinner } from "../../components/Spinner";
import { useTranslation } from "react-i18next";
import type { Campaign } from "../../types";
import { Search } from "lucide-react";
import { getAllCampaigns } from "../../services/campaign.service";

export function CampaignsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    getAllCampaigns()
      .then((c) => setCampaigns(c))
      .catch(() => setCampaigns([]))
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          {t("campaignsPage.title")}
        </h1>
        <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
          {t("campaignsPage.subtitle")}
        </p>
      </div>

      {/* Search & Filter */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
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
        <div className="flex gap-2">
          {["ALL", "ACTIVE", "COMPLETED", "DRAFT"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                statusFilter === s ? "bg-brand text-white" : "card"
              }`}
              style={
                statusFilter !== s ? { color: "var(--text-secondary)" } : undefined
              }
            >
              {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="card flex flex-col items-center justify-center rounded-xl py-20 text-center"
        >
          <p style={{ color: "var(--text-secondary)" }}>{t("campaignsPage.noCampaigns")}</p>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            {t("campaignsPage.tryAdjusting")}
          </p>
        </div>
      ) : (
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
      )}
    </div>
  );
}
