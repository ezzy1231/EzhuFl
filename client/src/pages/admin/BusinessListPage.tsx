import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  Ban,
  ChevronRight,
} from "lucide-react";

import { Spinner } from "../../components/Spinner";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Card, CardContent, CardTitle } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageHeader } from "../../components/ui/PageHeader";

import { getApiErrorMessage } from "../../services/api";
import * as adminService from "../../services/admin.service";
import type { BusinessProfile, BusinessVerificationStatus } from "../../types";

const STATUS_TABS: { label: string; value: string }[] = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Suspended", value: "suspended" },
];

function StatusBadge({ status }: { status: BusinessVerificationStatus }) {
  const styles: Record<
    string,
    { variant: Parameters<typeof Badge>[0]["variant"]; icon: React.ReactNode }
  > = {
    pending: { variant: "warning", icon: <Clock size={12} /> },
    approved: { variant: "success", icon: <CheckCircle size={12} /> },
    rejected: { variant: "danger", icon: <XCircle size={12} /> },
    suspended: { variant: "neutral", icon: <Ban size={12} /> },
  };

  const s = styles[status] || styles.pending;

  return (
    <Badge variant={s.variant}>
      {s.icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

export function BusinessListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeStatus = searchParams.get("status") || "";
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    adminService
      .getBusinesses(activeStatus || undefined)
      .then((value) => {
        setBusinesses(value);
        setError(null);
      })
      .catch((err) => {
        setBusinesses([]);
        setError(getApiErrorMessage(err, "Failed to load businesses"));
      })
      .finally(() => setLoading(false));
  }, [activeStatus]);

  return (
    <div>
      <PageHeader
        title="Business Verification"
        subtitle="Review and manage business accounts"
      />

      {error ? (
        <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-500">
          {error}
        </div>
      ) : null}

      {/* Tabs */}
      <Card className="mb-6 rounded-2xl">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-wrap gap-2">
            {STATUS_TABS.map((tab) => (
              <Button
                key={tab.value}
                size="sm"
                variant={activeStatus === tab.value ? "primary" : "secondary"}
                onClick={() => {
                  if (tab.value) setSearchParams({ status: tab.value });
                  else setSearchParams({});
                }}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* List */}
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Spinner />
        </div>
      ) : businesses.length === 0 ? (
        <Card className="rounded-2xl">
          <CardContent className="p-6">
            <EmptyState
              icon={<Building2 size={28} style={{ color: "var(--text-tertiary)" }} />}
              title="No businesses found"
              description="Try switching the status filter."
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-2xl">
          <CardContent className="p-0">
            <div className="border-b px-6 py-5" style={{ borderColor: "var(--border-primary)" }}>
              <CardTitle className="text-base">Businesses · {businesses.length}</CardTitle>
            </div>

            <div className="divide-y" style={{ borderColor: "var(--border-primary)" }}>
              {businesses.map((b) => (
                <Link
                  key={b.id}
                  to={`/admin/businesses/${b.id}`}
                  className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-[color:var(--bg-hover)]"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand">
                      {b.business_name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium" style={{ color: "var(--text-primary)" }}>
                        {b.business_name || "Unnamed Business"}
                      </p>
                      <p className="truncate text-sm" style={{ color: "var(--text-muted)" }}>
                        {b.owner_name} · {b.city || "—"} · {b.phone || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={b.verification_status} />
                    <ChevronRight size={16} style={{ color: "var(--text-muted)" }} />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
