import { useState, useEffect } from "react";
import { Link } from "react-router";
import { CampaignCard } from "../../components/CampaignCard";
import { Spinner } from "../../components/Spinner";
import { PlusCircle } from "lucide-react";
import { getMyCampaigns } from "../../services/campaign.service";
import type { Campaign } from "../../types";

export function BusinessMyCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMyCampaigns()
      .then((c) => {
        setCampaigns(c);
        setError(null);
      })
      .catch((err: any) => {
        setCampaigns([]);
        setError(err?.response?.data?.error || err?.message || "Failed to load campaigns");
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            My Campaigns
          </h1>
          <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
            Manage your created campaigns
          </p>
        </div>
        <Link
          to="/business/create"
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
        >
          <PlusCircle size={16} />
          New Campaign
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="card flex flex-col items-center justify-center rounded-xl py-20 text-center">
          {error && (
            <div className="mb-6 w-full max-w-xl rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-500">
              {error}
            </div>
          )}
          <div className="mb-4 rounded-full bg-brand/10 p-4">
            <PlusCircle size={32} className="text-brand" />
          </div>
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            No Campaigns Yet
          </h2>
          <p className="mt-2 max-w-md text-sm" style={{ color: "var(--text-secondary)" }}>
            Create your first campaign and start getting amazing content from
            creators.
          </p>
          <Link
            to="/business/create"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
          >
            <PlusCircle size={16} />
            Create Campaign
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              linkPrefix="/business/campaigns"
            />
          ))}
        </div>
      )}
    </div>
  );
}
