import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Building2,
  User,
  Phone,
  MapPin,
  FileText,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Ban,
  Clock,
  ExternalLink,
} from "lucide-react";
import { Spinner } from "../../components/Spinner";
import * as adminService from "../../services/admin.service";
import type { BusinessProfile } from "../../types";

export function BusinessDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  useEffect(() => {
    if (!id) return;
    adminService
      .getBusinessDetail(id)
      .then(setBusiness)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleApprove = async () => {
    if (!business) return;
    setActionLoading(true);
    try {
      const updated = await adminService.reviewBusiness(business.id, "approve");
      setBusiness(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!business) return;
    setActionLoading(true);
    try {
      const updated = await adminService.reviewBusiness(
        business.id,
        "reject",
        rejectionReason
      );
      setBusiness(updated);
      setShowRejectForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!business) return;
    setActionLoading(true);
    try {
      const updated = await adminService.suspendBusiness(
        business.id,
        "Policy violation"
      );
      setBusiness(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="text-center" style={{ color: "var(--text-muted)" }}>
        Business not found
      </div>
    );
  }

  const statusColor: Record<string, string> = {
    pending: "text-amber-500",
    approved: "text-emerald-500",
    rejected: "text-red-500",
    suspended: "text-gray-500",
  };

  const statusIcon: Record<string, React.ReactNode> = {
    pending: <Clock size={16} />,
    approved: <CheckCircle size={16} />,
    rejected: <XCircle size={16} />,
    suspended: <Ban size={16} />,
  };

  return (
    <div>
      {/* Header */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
        style={{ color: "var(--text-secondary)" }}
      >
        <ArrowLeft size={16} />
        Back to list
      </button>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            {business.business_name || "Unnamed Business"}
          </h1>
          <div className={`mt-1 flex items-center gap-1.5 text-sm font-medium ${statusColor[business.verification_status]}`}>
            {statusIcon[business.verification_status]}
            {business.verification_status.charAt(0).toUpperCase() +
              business.verification_status.slice(1)}
          </div>
        </div>

        {/* Action Buttons */}
        {business.verification_status === "pending" && (
          <div className="flex gap-2">
            <button
              onClick={handleApprove}
              disabled={actionLoading}
              className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-50"
            >
              <CheckCircle size={16} /> Approve
            </button>
            <button
              onClick={() => setShowRejectForm(true)}
              disabled={actionLoading}
              className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
            >
              <XCircle size={16} /> Reject
            </button>
          </div>
        )}
        {business.verification_status === "approved" && (
          <button
            onClick={handleSuspend}
            disabled={actionLoading}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:opacity-80 disabled:opacity-50"
            style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)" }}
          >
            <Ban size={16} /> Suspend
          </button>
        )}
        {business.verification_status === "rejected" && (
          <button
            onClick={handleApprove}
            disabled={actionLoading}
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-50"
          >
            <CheckCircle size={16} /> Approve
          </button>
        )}
      </div>

      {/* Rejection Form */}
      {showRejectForm && (
        <div className="card mb-6 rounded-xl p-5">
          <h3 className="mb-3 font-semibold" style={{ color: "var(--text-primary)" }}>
            Rejection Reason
          </h3>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={3}
            className="mb-3 w-full rounded-lg border p-3 text-sm"
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--border-primary)",
              color: "var(--text-primary)",
            }}
            placeholder="Explain why this business was rejected..."
          />
          <div className="flex gap-2">
            <button
              onClick={handleReject}
              disabled={actionLoading}
              className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
            >
              Confirm Rejection
            </button>
            <button
              onClick={() => setShowRejectForm(false)}
              className="rounded-lg px-4 py-2 text-sm font-medium"
              style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Rejection notice */}
      {business.verification_status === "rejected" && business.rejection_reason && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
          <p className="text-sm font-medium text-red-600 dark:text-red-400">
            Rejection Reason:
          </p>
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {business.rejection_reason}
          </p>
        </div>
      )}

      {/* Details Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card rounded-xl p-6">
          <h2 className="mb-4 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Business Information
          </h2>
          <div className="space-y-4">
            <InfoRow icon={<Building2 size={16} />} label="Business Name" value={business.business_name} />
            <InfoRow icon={<User size={16} />} label="Owner Name" value={business.owner_name} />
            <InfoRow icon={<Phone size={16} />} label="Phone" value={business.phone} />
            <InfoRow icon={<MapPin size={16} />} label="City" value={business.city} />
            <InfoRow icon={<MapPin size={16} />} label="Address" value={business.address} />
          </div>
        </div>

        <div className="card rounded-xl p-6">
          <h2 className="mb-4 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Verification Documents
          </h2>
          <div className="space-y-4">
            <InfoRow icon={<FileText size={16} />} label="License Number" value={business.license_number} />
            {business.license_file_url && (
              <div className="flex items-center gap-3 rounded-lg p-3" style={{ backgroundColor: "var(--bg-secondary)" }}>
                <FileText size={16} style={{ color: "var(--text-muted)" }} />
                <div className="flex-1">
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>License File</p>
                  <a
                    href={business.license_file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm font-medium text-brand hover:underline"
                  >
                    View Document <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            )}
            {business.map_lat && business.map_lng && (
              <InfoRow
                icon={<MapPin size={16} />}
                label="Map Coordinates"
                value={`${business.map_lat}, ${business.map_lng}`}
              />
            )}
          </div>

          {/* Timestamps */}
          <div className="mt-6 border-t pt-4" style={{ borderColor: "var(--border-primary)" }}>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Submitted: {new Date(business.created_at).toLocaleDateString()}
            </p>
            {business.reviewed_at && (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Reviewed: {new Date(business.reviewed_at).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg p-3" style={{ backgroundColor: "var(--bg-secondary)" }}>
      <span style={{ color: "var(--text-muted)" }}>{icon}</span>
      <div>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          {label}
        </p>
        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
          {value || "—"}
        </p>
      </div>
    </div>
  );
}
