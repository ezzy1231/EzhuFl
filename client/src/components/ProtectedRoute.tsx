import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { Spinner } from "./Spinner";

export function ProtectedRoute() {
  const { session, user, loading, profileComplete, verificationStatus } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        className="flex h-screen items-center justify-center"
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        <Spinner size="lg" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Smart routing for business users based on verification status
  if (
    user?.role === "BUSINESS" &&
    profileComplete &&
    verificationStatus &&
    verificationStatus !== "approved"
  ) {
    // Allow access to profile page for resubmission
    const allowedPaths = [
      "/business/profile",
      "/business/verification-pending",
      "/business/verification-rejected",
    ];
    const isAllowed = allowedPaths.some((p) => location.pathname.startsWith(p));

    if (!isAllowed) {
      if (verificationStatus === "rejected") {
        return <Navigate to="/business/verification-rejected" replace />;
      }
      // pending or suspended
      return <Navigate to="/business/verification-pending" replace />;
    }
  }

  return <Outlet />;
}
