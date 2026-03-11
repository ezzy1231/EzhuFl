import { Navigate, Outlet } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { Spinner } from "./Spinner";
import type { UserRole } from "../types";

interface RoleGuardProps {
  allowedRole: UserRole;
  redirectTo: string;
}

export function RoleGuard({ allowedRole, redirectTo }: RoleGuardProps) {
  const { user, loading } = useAuth();

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

  if (!user || user.role !== allowedRole) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
