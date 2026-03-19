import { Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";

export function EarningsPage() {
  const { t } = useTranslation();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          {t("earningsPage.title")}
        </h1>
        <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
          {t("earningsPage.subtitle")}
        </p>
      </div>

      {/* Earnings summary */}
      <div className="mb-8 grid gap-6 sm:grid-cols-3">
        <div className="card rounded-xl p-6">
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{t("earningsPage.totalEarned")}</p>
          <p className="mt-2 text-3xl font-bold text-emerald-500">$0</p>
        </div>
        <div className="card rounded-xl p-6">
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{t("earningsPage.pending")}</p>
          <p className="mt-2 text-3xl font-bold text-amber-500">$0</p>
        </div>
        <div className="card rounded-xl p-6">
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{t("earningsPage.campaignsWon")}</p>
          <p className="mt-2 text-3xl font-bold text-brand">0</p>
        </div>
      </div>

      {/* Payment history */}
      <div className="card rounded-xl p-6">
        <h2 className="mb-4 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
          {t("earningsPage.paymentHistory")}
        </h2>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 rounded-full bg-brand/10 p-4">
            <Wallet size={32} className="text-brand" />
          </div>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {t("earningsPage.noPayments")}
          </p>
        </div>
      </div>
    </div>
  );
}
