import type { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: { value: number; label: string };
  color?: "brand" | "emerald" | "amber" | "rose";
}

const iconBgMap = {
  brand: "bg-brand/15 text-brand",
  emerald: "bg-emerald-500/15 text-emerald-500",
  amber: "bg-amber-500/15 text-amber-500",
  rose: "bg-rose-500/15 text-rose-500",
};

export function DashboardCard({
  title,
  value,
  icon,
  trend,
  color = "brand",
}: DashboardCardProps) {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
            {value}
          </p>
          {trend && (
            <p
              className={`mt-1 text-xs ${
                trend.value >= 0 ? "text-emerald-500" : "text-rose-500"
              }`}
            >
              {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%{" "}
              {trend.label}
            </p>
          )}
        </div>
        <div className={`rounded-lg p-3 ${iconBgMap[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
