import { Outlet } from "react-router";
import { Sidebar } from "../components/Sidebar";
import { MobileNav } from "../components/MobileNav";
import { ThemeToggle } from "../components/ThemeToggle";
import { useAuth } from "../hooks/useAuth";
import type { BusinessProfile, InfluencerProfile } from "../types";

export function AuthLayout() {
  const { user, extendedProfile } = useAuth();

  // Resolve profile photo URL
  const profilePhotoUrl =
    user?.role === "BUSINESS"
      ? (extendedProfile as BusinessProfile | null)?.profile_photo_url
      : user?.role === "INFLUENCER"
        ? (extendedProfile as InfluencerProfile | null)?.profile_photo_url
        : null;

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "var(--bg-secondary)" }}>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main content */}
      <main className="flex-1 lg:ml-64">
        {/* Top bar */}
        <div
          className="sticky top-0 z-30 flex h-16 items-center justify-between border-b px-6 backdrop-blur-md"
          style={{
            backgroundColor: "color-mix(in srgb, var(--bg-primary) 90%, transparent)",
            borderColor: "var(--border-primary)",
          }}
        >
          <div>
            <h2
              className="text-sm font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              {user?.role === "ADMIN" ? "Admin Panel" : user?.role === "BUSINESS" ? "Business Dashboard" : "Creator Dashboard"}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-brand/20 text-xs font-bold text-brand">
              {profilePhotoUrl ? (
                <img src={profilePhotoUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                user?.name?.charAt(0)?.toUpperCase() || "?"
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="p-6 pb-24 lg:p-8 lg:pb-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <div className="lg:hidden">
        <MobileNav />
      </div>
    </div>
  );
}
