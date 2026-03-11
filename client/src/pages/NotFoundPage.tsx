import { Link } from "react-router";
import { Trophy, Home, ArrowLeft } from "lucide-react";

export function NotFoundPage() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 text-center"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="mb-6 flex items-center gap-2">
        <Trophy size={32} className="text-brand" />
        <span className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
          CreatorPay
        </span>
      </div>

      <h1
        className="mb-2 text-7xl font-extrabold tracking-tight"
        style={{ color: "var(--text-primary)" }}
      >
        404
      </h1>
      <p
        className="mb-2 text-xl font-semibold"
        style={{ color: "var(--text-secondary)" }}
      >
        Page not found
      </p>
      <p
        className="mb-8 max-w-md text-sm"
        style={{ color: "var(--text-muted)" }}
      >
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Let&apos;s get you back on track.
      </p>

      <div className="flex gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
        >
          <Home size={16} /> Go Home
        </Link>
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-semibold transition-colors"
          style={{
            borderColor: "var(--border-primary)",
            color: "var(--text-primary)",
            backgroundColor: "var(--bg-card)",
          }}
        >
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    </div>
  );
}
