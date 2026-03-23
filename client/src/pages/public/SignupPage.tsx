import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { useTranslation } from "react-i18next";
import { Spinner } from "../../components/Spinner";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { Trophy } from "lucide-react";
import type { UserRole } from "../../types";
import { getApiErrorMessage } from "../../services/api";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.18 8.18 0 0 0 4.76 1.52V6.84a4.84 4.84 0 0 1-1-.15z" />
    </svg>
  );
}

export function SignupPage() {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle, signInWithTikTok } = useAuth();
  const { t } = useTranslation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("INFLUENCER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [tiktokLoading, setTiktokLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signUp(email, password, name, role);
      if (result.needsConfirmation) {
        setNeedsConfirmation(true);
      } else {
        const path =
          role === "BUSINESS"
            ? "/business/dashboard"
            : "/influencer/dashboard";
        navigate(path);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to sign up"));
    } finally {
      setLoading(false);
    }
  };

  if (needsConfirmation) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <Card className="w-full max-w-md rounded-2xl">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20">
              <span className="text-2xl">✉️</span>
            </div>
            <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              {t("signup.checkEmail")}
            </h2>
            <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>
              {t("signup.confirmationSent")} <strong>{email}</strong>. {t("signup.confirmText")}
            </p>
            <Link to="/login" className="mt-6 inline-block">
              <Button variant="secondary">{t("signup.backToLogin")}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-[440px] w-[640px] -translate-x-1/2 rounded-full bg-brand/10 blur-[110px]" />
        <div className="absolute left-[8%] top-20 h-52 w-52 rounded-full bg-blue-500/10 blur-[96px]" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="surface-panel p-8 sm:p-9">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-blue-500 shadow-lg shadow-brand/20">
              <Trophy size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              {t("signup.createAccount")}
            </h1>
            <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              {t("signup.joinSubtitle")}
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-500">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Toggle */}
            <div>
              <label
                className="mb-1.5 block text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                {t("signup.iAmA")}
              </label>
              <div className="segmented-control">
                <button
                  type="button"
                  onClick={() => setRole("INFLUENCER")}
                  className={`segmented-option ${
                    role === "INFLUENCER"
                      ? "segmented-option-active"
                      : "segmented-option-inactive"
                  }`}
                >
                  {t("common.creator")}
                </button>
                <button
                  type="button"
                  onClick={() => setRole("BUSINESS")}
                  className={`segmented-option ${
                    role === "BUSINESS"
                      ? "segmented-option-active"
                      : "segmented-option-inactive"
                  }`}
                >
                  {t("common.business")}
                </button>
              </div>
            </div>

            <div>
              <label
                className="mb-1.5 block text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                {role === "BUSINESS" ? t("signup.businessName") : t("signup.fullName")}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="input-field w-full"
                placeholder={role === "BUSINESS" ? "Addis Coffee Co." : "Abel Tesfaye"}
              />
            </div>

            <div>
              <label
                className="mb-1.5 block text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                {t("signup.email")}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field w-full"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                className="mb-1.5 block text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                {t("signup.password")}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="input-field w-full"
                placeholder="••••••••"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <Spinner size="sm" /> : t("signup.createAccountBtn")}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1" style={{ backgroundColor: "var(--border-primary)" }} />
            <span className="text-xs font-medium uppercase tracking-[0.18em]" style={{ color: "var(--text-tertiary)" }}>{t("common.or")}</span>
            <div className="h-px flex-1" style={{ backgroundColor: "var(--border-primary)" }} />
          </div>

          {/* Google Sign Up */}
          <Button
            onClick={async () => {
              setError("");
              setGoogleLoading(true);
              try {
                await signInWithGoogle();
              } catch (err) {
                setError(getApiErrorMessage(err, "Failed to sign in with Google"));
                setGoogleLoading(false);
              }
            }}
            disabled={googleLoading}
            variant="secondary"
            className="w-full justify-center"
          >
            {googleLoading ? (
              <Spinner size="sm" />
            ) : (
              <>
                <GoogleIcon className="h-5 w-5" /> {t("signup.continueWithGoogle")}
              </>
            )}
          </Button>

          {/* TikTok Sign Up */}
          <Button
            onClick={() => {
              setError("");
              setTiktokLoading(true);
              signInWithTikTok();
            }}
            disabled={tiktokLoading}
            variant="secondary"
            className="mt-3 w-full justify-center"
          >
            {tiktokLoading ? (
              <Spinner size="sm" />
            ) : (
              <>
                <TikTokIcon className="h-5 w-5" /> {t("signup.continueWithTiktok")}
              </>
            )}
          </Button>

          <p className="mt-6 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
            {t("signup.haveAccount")}{" "}
            <Link to="/login" className="font-medium text-brand hover:underline">
              {t("signup.signIn")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
