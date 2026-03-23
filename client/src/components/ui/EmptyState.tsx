import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon ? (
        <div className="mb-4 rounded-2xl border p-4" style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-tertiary)" }}>
          {icon}
        </div>
      ) : null}
      {title ? (
        <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          {title}
        </div>
      ) : null}
      {description ? (
        <p className="mt-1 max-w-md text-sm" style={{ color: "var(--text-secondary)" }}>
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
