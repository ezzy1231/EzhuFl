import { CheckCircle, Shield } from "lucide-react";

interface VerifiedBadgeProps {
  type: "business" | "influencer";
  size?: "sm" | "md";
}

export function VerifiedBadge({ type, size = "sm" }: VerifiedBadgeProps) {
  const label = type === "business" ? "Verified Business" : "Verified Creator";
  const sizeClass = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClass} bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`}
    >
      <CheckCircle size={size === "sm" ? 12 : 14} />
      {label}
    </span>
  );
}

interface TrustLevelProps {
  level: "unverified" | "basic" | "verified" | "pending" | "approved" | "rejected" | "suspended";
  size?: "sm" | "md";
}

export function TrustBadge({ level, size = "sm" }: TrustLevelProps) {
  const sizeClass = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";

  const config: Record<string, { bg: string; text: string; label: string; icon: React.ReactNode }> = {
    unverified: {
      bg: "bg-gray-500/10",
      text: "text-gray-500",
      label: "Unverified",
      icon: <Shield size={size === "sm" ? 12 : 14} />,
    },
    basic: {
      bg: "bg-amber-500/10",
      text: "text-amber-500",
      label: "Basic",
      icon: <Shield size={size === "sm" ? 12 : 14} />,
    },
    verified: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-600 dark:text-emerald-400",
      label: "Verified",
      icon: <CheckCircle size={size === "sm" ? 12 : 14} />,
    },
    pending: {
      bg: "bg-amber-500/10",
      text: "text-amber-500",
      label: "Pending",
      icon: <Shield size={size === "sm" ? 12 : 14} />,
    },
    approved: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-600 dark:text-emerald-400",
      label: "Verified",
      icon: <CheckCircle size={size === "sm" ? 12 : 14} />,
    },
    rejected: {
      bg: "bg-red-500/10",
      text: "text-red-500",
      label: "Rejected",
      icon: <Shield size={size === "sm" ? 12 : 14} />,
    },
    suspended: {
      bg: "bg-gray-500/10",
      text: "text-gray-500",
      label: "Suspended",
      icon: <Shield size={size === "sm" ? 12 : 14} />,
    },
  };

  const c = config[level] || config.unverified;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClass} ${c.bg} ${c.text}`}>
      {c.icon}
      {c.label}
    </span>
  );
}
