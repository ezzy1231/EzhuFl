import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Building2, Users, Trophy, Clock, ChevronRight } from "lucide-react";
import { Spinner } from "../../components/Spinner";
import * as adminService from "../../services/admin.service";
import type { AdminStats } from "../../types";

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getAdminStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const cards = [
    {
      label: "Pending Reviews",
      value: stats?.pendingBusinesses ?? 0,
      icon: <Clock size={20} />,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      link: "/admin/businesses?status=pending",
    },
    {
      label: "Approved Businesses",
      value: stats?.approvedBusinesses ?? 0,
      icon: <Building2 size={20} />,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      link: "/admin/businesses?status=approved",
    },
    {
      label: "Total Influencers",
      value: stats?.totalInfluencers ?? 0,
      icon: <Users size={20} />,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      link: "/admin/influencers",
    },
    {
      label: "Total Campaigns",
      value: stats?.totalCampaigns ?? 0,
      icon: <Trophy size={20} />,
      color: "text-brand",
      bg: "bg-brand/10",
      link: "/admin/businesses",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Admin Dashboard
        </h1>
        <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
          Platform overview and verification management
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.link}
            className="card rounded-xl p-5 transition-shadow hover:shadow-md"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className={`${c.bg} rounded-lg p-2 ${c.color}`}>
                {c.icon}
              </div>
              <ChevronRight
                size={16}
                style={{ color: "var(--text-muted)" }}
              />
            </div>
            <p
              className="text-2xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {c.value}
            </p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {c.label}
            </p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2
          className="mb-4 text-lg font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Quick Actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            to="/admin/businesses?status=pending"
            className="card flex items-center justify-between rounded-xl p-5 transition-shadow hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-500/10 p-2 text-amber-500">
                <Clock size={20} />
              </div>
              <div>
                <p
                  className="font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  Review Pending Businesses
                </p>
                <p
                  className="text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  {stats?.pendingBusinesses ?? 0} awaiting review
                </p>
              </div>
            </div>
            <ChevronRight
              size={16}
              style={{ color: "var(--text-muted)" }}
            />
          </Link>
          <Link
            to="/admin/influencers"
            className="card flex items-center justify-between rounded-xl p-5 transition-shadow hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-2 text-blue-500">
                <Users size={20} />
              </div>
              <div>
                <p
                  className="font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  Manage Influencers
                </p>
                <p
                  className="text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  View and verify creators
                </p>
              </div>
            </div>
            <ChevronRight
              size={16}
              style={{ color: "var(--text-muted)" }}
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
