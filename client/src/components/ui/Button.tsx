import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition disabled:opacity-60 disabled:pointer-events-none";

  const sizes: Record<Size, string> = {
    sm: "h-9 rounded-xl px-3 text-sm",
    md: "h-11 rounded-2xl px-4 text-sm",
  };

  const variants: Record<Variant, string> = {
    primary: "btn btn-primary",
    secondary: "btn btn-secondary",
    ghost:
      "btn border border-transparent bg-transparent text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-hover)]",
  };

  return (
    <button
      type={type}
      className={cn(base, sizes[size], variants[variant], className)}
      {...props}
    />
  );
}
