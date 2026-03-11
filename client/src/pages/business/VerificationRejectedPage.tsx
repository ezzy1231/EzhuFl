import { XCircle, RefreshCw, FileText } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export function VerificationRejectedPage() {
  const { refreshProfile, signOut } = useAuth();

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ backgroundColor: "var(--bg-secondary)" }}
    >
      <div className="card w-full max-w-md rounded-2xl p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
          <XCircle size={32} className="text-red-500" />
        </div>

        <h1
          className="mb-2 text-xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Verification Rejected
        </h1>

        <p
          className="mb-6 text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          Your business verification was rejected. Please review the feedback
          below and resubmit your documents.
        </p>

        <div
          className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-left dark:border-red-900 dark:bg-red-950/30"
        >
          <p className="text-sm font-medium text-red-600 dark:text-red-400">
            Rejection Reason:
          </p>
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            Documents insufficient or invalid. Please re-upload a clear copy of
            your business license and ensure all information is accurate.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              // Navigate to profile edit to resubmit
              window.location.href = "/business/profile";
            }}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
          >
            <FileText size={16} />
            Resubmit Documents
          </button>
          <button
            onClick={refreshProfile}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors hover:opacity-80"
            style={{
              backgroundColor: "var(--bg-secondary)",
              color: "var(--text-secondary)",
            }}
          >
            <RefreshCw size={16} />
            Check Status
          </button>
          <button
            onClick={signOut}
            className="rounded-lg px-4 py-2.5 text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: "var(--text-muted)" }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
