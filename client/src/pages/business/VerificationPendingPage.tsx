import { Clock, RefreshCw } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useTranslation } from "react-i18next";

export function VerificationPendingPage() {
  const { refreshProfile, signOut } = useAuth();
  const { t } = useTranslation();

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ backgroundColor: "var(--bg-secondary)" }}
    >
      <div className="card w-full max-w-md rounded-2xl p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
          <Clock size={32} className="text-amber-500" />
        </div>

        <h1
          className="mb-2 text-xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Verification Under Review
        </h1>

        <p
          className="mb-6 text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          {t("verificationPending.text")}
        </p>

        <div
          className="mb-6 rounded-lg p-4"
          style={{ backgroundColor: "var(--bg-secondary)" }}
        >
          <p
            className="text-xs font-medium"
            style={{ color: "var(--text-muted)" }}
          >
            While you wait, make sure you've submitted:
          </p>
          <ul
            className="mt-2 space-y-1 text-left text-xs"
            style={{ color: "var(--text-secondary)" }}
          >
            <li>{t("verificationPending.check1")}</li>
            <li>{t("verificationPending.check2")}</li>
            <li>{t("verificationPending.check3")}</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={refreshProfile}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
          >
            <RefreshCw size={16} />
            {t("verificationPending.checkStatus")}
          </button>
          <button
            onClick={signOut}
            className="rounded-lg px-4 py-2.5 text-sm font-medium transition-colors hover:opacity-80"
            style={{
              backgroundColor: "var(--bg-secondary)",
              color: "var(--text-secondary)",
            }}
          >
            {t("common.signOut")}
          </button>
        </div>
      </div>
    </div>
  );
}
