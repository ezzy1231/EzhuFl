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
  const styles: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    pending: { bg: "bg-amber-500/10", text: "text-amber-500", icon: <Clock size={12} /> },
    approved: { bg: "bg-emerald-500/10", text: "text-emerald-500", icon: <CheckCircle size={12} /> },
    rejected: { bg: "bg-red-500/10", text: "text-red-500", icon: <XCircle size={12} /> },
    suspended: { bg: "bg-gray-500/10", text: "text-gray-500", icon: <Ban size={12} /> },
  };
  const s = styles[status] || styles.pending;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${s.bg} ${s.text}`}>
      {s.icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
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
      {error && (
        <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-500">
          {error}
        </div>
      )}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Business Verification
        </h1>
        <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
          Review and manage business accounts
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              if (tab.value) {
                setSearchParams({ status: tab.value });
              } else {
                setSearchParams({});
              }
            }}
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
      ) : businesses.length === 0 ? (
        <div
          className="card rounded-xl p-10 text-center"
          style={{ color: "var(--text-muted)" }}
        >
          <Building2 size={40} className="mx-auto mb-3 opacity-40" />
          <p>No businesses found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {businesses.map((b) => (
            <Link
              key={b.id}
              to={`/admin/businesses/${b.id}`}
              className="card flex items-center justify-between rounded-xl p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand">
                  {b.business_name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div>
                  <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                    {b.business_name || "Unnamed Business"}
                  </p>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    {b.owner_name} &middot; {b.city || "—"} &middot; {b.phone || "—"}
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
      )}
    </div>
  );
}
