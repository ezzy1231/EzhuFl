import { useEffect, useState } from "react";
import { Users, CheckCircle, Shield } from "lucide-react";

import { Spinner } from "../../components/Spinner";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Card, CardContent, CardTitle } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageHeader } from "../../components/ui/PageHeader";

import { getApiErrorMessage } from "../../services/api";
import * as adminService from "../../services/admin.service";
import type { InfluencerProfile, InfluencerVerificationStatus } from "../../types";

type StatusTab = { label: string; value: string };

const STATUS_TABS: StatusTab[] = [
  { label: "All", value: "" },
  { label: "Unverified", value: "unverified" },
  { label: "Basic", value: "basic" },
  { label: "Verified", value: "verified" },
];

function StatusBadge({ status }: { status: InfluencerVerificationStatus }) {
  if (status === "verified") {
    return (
      <Badge variant="success">
        <CheckCircle size={12} /> Verified
      </Badge>
    );
  }

  if (status === "basic") {
    return (
      <Badge variant="warning">
        <Shield size={12} /> Basic
      </Badge>
    );
  }

  return (
    <Badge variant="neutral">
      <Shield size={12} /> Unverified
    </Badge>
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStatus]);

  const handleVerify = async (id: string) => {
    setActionLoading(id);
    try {
      const updated = await adminService.reviewInfluencer(id, "verify");
      setInfluencers((prev) => prev.map((i) => (i.id === id ? updated : i)));
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
      setInfluencers((prev) => prev.map((i) => (i.id === id ? updated : i)));
      setError(null);
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Failed to update influencer verification")
      );
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Influencer Management"
        subtitle="View and verify creator accounts"
      />

      {error ? (
        <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-500">
          {error}
        </div>
      ) : null}

      <Card className="mb-6 rounded-2xl">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-wrap gap-2">
            {STATUS_TABS.map((tab) => (
              <Button
                key={tab.value}
                size="sm"
                variant={activeStatus === tab.value ? "primary" : "secondary"}
                onClick={() => setActiveStatus(tab.value)}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Spinner />
        </div>
      ) : influencers.length === 0 ? (
        <Card className="rounded-2xl">
          <CardContent className="p-6">
            <EmptyState
              icon={<Users size={28} style={{ color: "var(--text-tertiary)" }} />}
              title="No influencers found"
              description="Try switching the status filter."
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-2xl">
          <CardContent className="p-0">
            <div
              className="border-b px-6 py-5"
              style={{ borderColor: "var(--border-primary)" }}
            >
              <CardTitle className="text-base">
                Influencers · {influencers.length}
              </CardTitle>
            </div>

            <div className="divide-y" style={{ borderColor: "var(--border-primary)" }}>
              {influencers.map((inf) => (
                <div
                  key={inf.id}
                  className="flex items-center justify-between gap-4 px-6 py-4"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand">
                      {inf.display_name?.charAt(0)?.toUpperCase() || "?"}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-medium" style={{ color: "var(--text-primary)" }}>
                        {inf.display_name || "Unnamed Creator"}
                      </p>
                      <p className="truncate text-sm" style={{ color: "var(--text-muted)" }}>
                        {inf.city || "—"} · {inf.phone || "—"}
                        {inf.tiktok_handle ? ` · @${inf.tiktok_handle}` : ""}
                        {inf.instagram_handle ? ` · @${inf.instagram_handle}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={inf.verification_status} />

                    {inf.verification_status !== "verified" ? (
                      <Button
                        size="sm"
                        disabled={actionLoading === inf.id}
                        onClick={() => handleVerify(inf.id)}
                        className="bg-emerald-600 hover:opacity-90"
                      >
                        {actionLoading === inf.id ? <Spinner size="sm" /> : "Verify"}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={actionLoading === inf.id}
                        onClick={() => handleUnverify(inf.id)}
                      >
                        {actionLoading === inf.id ? <Spinner size="sm" /> : "Unverify"}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
