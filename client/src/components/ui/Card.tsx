import type { HTMLAttributes, PropsWithChildren } from "react";
import { cn } from "../../lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("card", className)} {...props} />;
}

export function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 border-b px-6 py-5",
        className
      )}
      style={{ borderColor: "var(--border-primary)" }}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("text-base font-semibold", className)}
      style={{ color: "var(--text-primary)" }}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("mt-1 text-sm", className)}
      style={{ color: "var(--text-secondary)" }}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 py-6", className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center justify-end gap-3 border-t px-6 py-5", className)}
      style={{ borderColor: "var(--border-primary)" }}
      {...props}
    />
  );
}

export function CardKicker({ children }: PropsWithChildren) {
  return (
    <div className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>
      {children}
    </div>
  );
}
