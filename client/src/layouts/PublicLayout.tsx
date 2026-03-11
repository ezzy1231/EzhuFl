import { Outlet, Link } from "react-router";
import { Trophy } from "lucide-react";
import { ThemeToggle } from "../components/ThemeToggle";

export function PublicLayout() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-secondary)" }}>
      {/* Header */}
      <header
        className="fixed top-0 z-50 w-full border-b backdrop-blur-md"
        style={{
          backgroundColor: "color-mix(in srgb, var(--bg-primary) 80%, transparent)",
          borderColor: "var(--border-primary)",
        }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
              <Trophy size={16} className="text-white" />
            </div>
            <span
              className="text-lg font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              CreatorPay
            </span>
          </Link>

          <nav className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/login"
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: "var(--text-secondary)" }}
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}
