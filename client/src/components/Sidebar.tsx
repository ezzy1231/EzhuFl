import { NavLink, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import type { BusinessProfile, InfluencerProfile } from "../types";
import {
  LayoutDashboard,
  Trophy,
  PlusCircle,
  FolderOpen,
  DollarSign,
  UserCircle,
  LogOut,
  Building2,
  Users,
} from "lucide-react";

interface SidebarLink {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const influencerLinks: SidebarLink[] = [
  { to: "/influencer/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
  { to: "/influencer/campaigns", label: "Campaigns", icon: <Trophy size={20} /> },
  { to: "/influencer/my-campaigns", label: "My Campaigns", icon: <FolderOpen size={20} /> },
  { to: "/influencer/earnings", label: "Earnings", icon: <DollarSign size={20} /> },
  { to: "/influencer/profile", label: "Profile", icon: <UserCircle size={20} /> },
];

const businessLinks: SidebarLink[] = [
  { to: "/business/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
  { to: "/business/create", label: "Create Campaign", icon: <PlusCircle size={20} /> },
  { to: "/business/campaigns", label: "My Campaigns", icon: <FolderOpen size={20} /> },
  { to: "/business/profile", label: "Profile", icon: <UserCircle size={20} /> },
];

const adminLinks: SidebarLink[] = [
  { to: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
  { to: "/admin/businesses", label: "Businesses", icon: <Building2 size={20} /> },
  { to: "/admin/influencers", label: "Influencers", icon: <Users size={20} /> },
];

export function Sidebar() {
  const { user, signOut, extendedProfile } = useAuth();
  const navigate = useNavigate();

  // Resolve profile photo URL
  const profilePhotoUrl =
    user?.role === "BUSINESS"
      ? (extendedProfile as BusinessProfile | null)?.profile_photo_url
      : user?.role === "INFLUENCER"
        ? (extendedProfile as InfluencerProfile | null)?.profile_photo_url
        : null;

  let links: SidebarLink[];
  if (user?.role === "ADMIN") {
    links = adminLinks;
  } else if (user?.role === "BUSINESS") {
    links = businessLinks;
  } else {
    links = influencerLinks;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <aside
      className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r"
      style={{
        backgroundColor: "var(--bg-primary)",
        borderColor: "var(--border-primary)",
      }}
    >
      {/* Logo */}
      <div
        className="flex h-16 items-center gap-2.5 border-b px-6"
        style={{ borderColor: "var(--border-primary)" }}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
          <Trophy size={16} className="text-white" />
        </div>
        <span className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
          CreatorPay
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? "bg-brand/10 text-brand" : ""
              }`
            }
            style={({ isActive }) =>
              isActive
                ? {}
                : { color: "var(--text-secondary)" }
            }
          >
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t p-4" style={{ borderColor: "var(--border-primary)" }}>
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand/20 text-sm font-bold text-brand">
            {profilePhotoUrl ? (
              <img src={profilePhotoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              user?.name?.charAt(0)?.toUpperCase() || "?"
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              {user?.name || "User"}
            </p>
            <p className="truncate text-xs" style={{ color: "var(--text-muted)" }}>
              {user?.role === "ADMIN" ? "Admin" : user?.role === "BUSINESS" ? "Business" : "Creator"}
            </p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-red-500/10 hover:text-red-500"
          style={{ color: "var(--text-secondary)" }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
