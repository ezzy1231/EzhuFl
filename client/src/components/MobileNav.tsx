import { NavLink } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Trophy,
  FolderOpen,
  DollarSign,
  PlusCircle,
  UserCircle,
  Building2,
  Users,
  BarChart3,
} from "lucide-react";

interface MobileLink {
  to: string;
  label: string;
  icon: React.ReactNode;
}

export function MobileNav() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const influencerLinks: MobileLink[] = [
    { to: "/influencer/dashboard", label: t("nav.home"), icon: <LayoutDashboard size={20} /> },
    { to: "/influencer/campaigns", label: t("nav.campaigns"), icon: <Trophy size={20} /> },
    { to: "/influencer/my-campaigns", label: t("nav.active"), icon: <FolderOpen size={20} /> },
    { to: "/influencer/leaderboard", label: t("nav.board"), icon: <BarChart3 size={20} /> },
    { to: "/influencer/earnings", label: t("nav.earnings"), icon: <DollarSign size={20} /> },
    { to: "/influencer/profile", label: t("nav.profile"), icon: <UserCircle size={20} /> },
  ];

  const businessLinks: MobileLink[] = [
    { to: "/business/dashboard", label: t("nav.home"), icon: <LayoutDashboard size={20} /> },
    { to: "/business/create", label: t("nav.create"), icon: <PlusCircle size={20} /> },
    { to: "/business/campaigns", label: t("nav.campaigns"), icon: <FolderOpen size={20} /> },
    { to: "/business/leaderboard", label: t("nav.board"), icon: <BarChart3 size={20} /> },
    { to: "/business/profile", label: t("nav.profile"), icon: <UserCircle size={20} /> },
  ];

  const adminLinks: MobileLink[] = [
    { to: "/admin/dashboard", label: t("nav.home"), icon: <LayoutDashboard size={20} /> },
    { to: "/admin/businesses", label: t("common.business"), icon: <Building2 size={20} /> },
    { to: "/admin/influencers", label: t("nav.creators"), icon: <Users size={20} /> },
  ];

  let links: MobileLink[];
  if (user?.role === "ADMIN") {
    links = adminLinks;
  } else if (user?.role === "BUSINESS") {
    links = businessLinks;
  } else {
    links = influencerLinks;
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t"
      style={{
        backgroundColor: "var(--bg-primary)",
        borderColor: "var(--border-primary)",
      }}
    >
      <div className="flex items-center justify-around py-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-medium transition-colors ${
                isActive ? "text-brand" : ""
              }`
            }
            style={({ isActive }) =>
              isActive ? {} : { color: "var(--text-muted)" }
            }
          >
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
