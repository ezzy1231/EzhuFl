import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { Spinner } from "../../components/Spinner";
import { Trophy } from "lucide-react";
import type { UserRole } from "../../types";

/**
 * OAuth callback page.
 * After Google redirects back, Supabase processes the tokens automatically.
 * - If user already has a role → redirect to dashboard.
 * - If new Google user (no role) → show role picker.
 */
export function AuthCallbackPage() {
  const navigate = useNavigate();
  const { user, session, loading, setUserRole } = useAuth();
  const [picking, setPicking] = useState(false);
  const [saving, setSaving] = useState(false);

  // Once auth resolves, decide what to do
  useEffect(() => {
    if (loading) return;

    // Not logged in at all — send to login
    if (!session) {
      navigate("/login", { replace: true });
      return;
    }

    // User has a role from metadata or DB → go to dashboard
    if (user?.role) {
      // Check if it's a real role (not the default)
      const meta = session.user?.user_metadata || {};
      if (meta.role) {
        const path =
          user.role === "BUSINESS"
            ? "/business/dashboard"
            : "/influencer/dashboard";
        navigate(path, { replace: true });
        return;
      }
    }

    // New OAuth user with no role — show picker
    setPicking(true);
  }, [loading, session, user, navigate]);

  const handleRoleSelect = async (role: UserRole) => {
    setSaving(true);
    try {
      await setUserRole(role);
      const path =
        role === "BUSINESS"
          ? "/business/dashboard"
          : "/influencer/dashboard";
      navigate(path, { replace: true });
    } catch {
      setSaving(false);
    }
  };

  if (loading || (!picking && session)) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-4"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        <Spinner size="lg" />
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Signing you in...
        </p>
      </div>
    );
  }

  if (!picking) return null;

  // Role picker for new Google users
  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="card w-full max-w-md rounded-2xl p-8 shadow-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand">
            <Trophy size={24} className="text-white" />
          </div>
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Welcome to CreatorPay!
          </h1>
          <p
            className="mt-2 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            One last step — how will you use CreatorPay?
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleRoleSelect("INFLUENCER")}
            disabled={saving}
            className="card flex w-full items-center gap-4 rounded-xl p-5 text-left transition-all hover:ring-2 hover:ring-brand/50 disabled:opacity-50"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-2xl">
              🎬
            </div>
            <div>
              <p
                className="font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                I'm a Creator
              </p>
              <p
                className="mt-0.5 text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                Join campaigns and earn money from your content
              </p>
            </div>
          </button>

          <button
            onClick={() => handleRoleSelect("BUSINESS")}
            disabled={saving}
            className="card flex w-full items-center gap-4 rounded-xl p-5 text-left transition-all hover:ring-2 hover:ring-brand/50 disabled:opacity-50"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-2xl">
              🏢
            </div>
            <div>
              <p
                className="font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                I'm a Business
              </p>
              <p
                className="mt-0.5 text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                Create campaigns and promote your brand
              </p>
            </div>
          </button>
        </div>

        {saving && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <Spinner size="sm" />
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>
              Setting up your account...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
