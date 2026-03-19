import { NavLink } from "react-router";
import { useAuth } from "../hooks/useAuth";
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

const influencerLinks: MobileLink[] = [
  { to: "/influencer/dashboard", label: "Home", icon: <LayoutDashboard size={20} /> },
  { to: "/influencer/campaigns", label: "Campaigns", icon: <Trophy size={20} /> },
  { to: "/influencer/my-campaigns", label: "Active", icon: <FolderOpen size={20} /> },
  { to: "/influencer/leaderboard", label: "Board", icon: <BarChart3 size={20} /> },
  { to: "/influencer/earnings", label: "Earnings", icon: <DollarSign size={20} /> },
  { to: "/influencer/profile", label: "Profile", icon: <UserCircle size={20} /> },
];

const businessLinks: MobileLink[] = [
  { to: "/business/dashboard", label: "Home", icon: <LayoutDashboard size={20} /> },
  { to: "/business/create", label: "Create", icon: <PlusCircle size={20} /> },
  { to: "/business/campaigns", label: "Campaigns", icon: <FolderOpen size={20} /> },
  { to: "/business/leaderboard", label: "Board", icon: <BarChart3 size={20} /> },
  { to: "/business/profile", label: "Profile", icon: <UserCircle size={20} /> },
];

const adminLinks: MobileLink[] = [
  { to: "/admin/dashboard", label: "Home", icon: <LayoutDashboard size={20} /> },
  { to: "/admin/businesses", label: "Business", icon: <Building2 size={20} /> },
  { to: "/admin/influencers", label: "Creators", icon: <Users size={20} /> },
];

export function MobileNav() {
  const { user } = useAuth();

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
