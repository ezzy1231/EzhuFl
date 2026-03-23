import { useEffect, useState } from "react";
import {
  Users,
  CheckCircle,
  Shield,
} from "lucide-react";
import { Spinner } from "../../components/Spinner";
import { getApiErrorMessage } from "../../services/api";
import * as adminService from "../../services/admin.service";
import type { InfluencerProfile, InfluencerVerificationStatus } from "../../types";

const STATUS_TABS = [
  { label: "All", value: "" },
  { label: "Unverified", value: "unverified" },
  { label: "Basic", value: "basic" },
  { label: "Verified", value: "verified" },
];

function StatusBadge({ status }: { status: InfluencerVerificationStatus }) {
  const styles: Record<string, { bg: string; text: string }> = {
    unverified: { bg: "bg-gray-500/10", text: "text-gray-500" },
    basic: { bg: "bg-amber-500/10", text: "text-amber-500" },
    verified: { bg: "bg-emerald-500/10", text: "text-emerald-500" },
  };
  const s = styles[status] || styles.unverified;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${s.bg} ${s.text}`}>
      {status === "verified" ? <CheckCircle size={12} /> : <Shield size={12} />}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export function InfluencerListPage() {
  const [activeStatus, setActiveStatus] = useState("");
  const [influencers, setInfluencers] = useState<InfluencerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchInfluencers = () => {
    setLoading(true);
    adminService
      .getInfluencers(activeStatus || undefined)
      .then((value) => {
        setInfluencers(value);
        setError(null);
      })
      .catch((err) => {
        setInfluencers([]);
        setError(getApiErrorMessage(err, "Failed to load influencers"));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInfluencers();
  }, [activeStatus]);

  const handleVerify = async (id: string) => {
    setActionLoading(id);
    try {
      const updated = await adminService.reviewInfluencer(id, "verify");
      setInfluencers((prev) =>
        prev.map((i) => (i.id === id ? updated : i))
      );
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to verify influencer"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnverify = async (id: string) => {
    setActionLoading(id);
    try {
      const updated = await adminService.reviewInfluencer(id, "unverify");
      setInfluencers((prev) =>
        prev.map((i) => (i.id === id ? updated : i))
      );
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to update influencer verification"));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-500">
          {error}
        </div>
      )}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Influencer Management
        </h1>
        <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
          View and verify creator accounts
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveStatus(tab.value)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeStatus === tab.value
                ? "bg-brand text-white"
                : ""
            }`}
            style={
              activeStatus !== tab.value
                ? { backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)" }
                : undefined
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Spinner />
        </div>
      ) : influencers.length === 0 ? (
        <div className="card rounded-xl p-10 text-center" style={{ color: "var(--text-muted)" }}>
          <Users size={40} className="mx-auto mb-3 opacity-40" />
          <p>No influencers found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {influencers.map((inf) => (
            <div
              key={inf.id}
              className="card flex items-center justify-between rounded-xl p-4"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand">
                  {inf.display_name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div>
                  <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                    {inf.display_name || "Unnamed Creator"}
                  </p>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    {inf.city || "—"} &middot; {inf.phone || "—"}
                    {inf.tiktok_handle && ` · @${inf.tiktok_handle}`}
                    {inf.instagram_handle && ` · @${inf.instagram_handle}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={inf.verification_status} />
                {inf.verification_status !== "verified" && (
                  <button
                    onClick={() => handleVerify(inf.id)}
                    disabled={actionLoading === inf.id}
                    className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-50"
                  >
                    Verify
                  </button>
                )}
                {inf.verification_status === "verified" && (
                  <button
                    onClick={() => handleUnverify(inf.id)}
                    disabled={actionLoading === inf.id}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors hover:opacity-80 disabled:opacity-50"
                    style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)" }}
                  >
                    Unverify
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
