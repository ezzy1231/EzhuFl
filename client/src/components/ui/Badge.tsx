import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "neutral"
  | "brand";

export function Badge({
  className,
  variant = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  const base =
    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium";

  const variants: Record<BadgeVariant, string> = {
    default: "bg-[color:var(--bg-tertiary)] text-[color:var(--text-secondary)]",
    neutral: "bg-gray-500/10 text-gray-500",
    brand: "bg-brand/15 text-brand",
    success: "bg-emerald-500/10 text-emerald-600",
    warning: "bg-amber-500/10 text-amber-600",
    danger: "bg-rose-500/10 text-rose-600",
  };

  return <span className={cn(base, variants[variant], className)} {...props} />;
}
