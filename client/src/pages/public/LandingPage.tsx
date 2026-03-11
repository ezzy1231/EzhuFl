import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Trophy,
  DollarSign,
  BarChart3,
  Users,
  ArrowRight,
  Star,
  TrendingUp,
} from "lucide-react";
import { mockTestimonials } from "../../data/mockData";
import { getAllCampaigns } from "../../services/campaign.service";
import { CampaignCard } from "../../components/CampaignCard";
import type { Campaign } from "../../types";

export function LandingPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    getAllCampaigns()
      .then((c) => setCampaigns(c))
      .catch(() => setCampaigns([]));
  }, []);

  const activeCampaigns = campaigns.filter((c) => c.status === "ACTIVE");

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-brand/8 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-24 text-center sm:pt-32">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-sm font-medium text-brand">
            <Trophy size={14} />
            Performance-Based Creator Campaigns
          </div>

          <h1
            className="mx-auto max-w-4xl text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl"
            style={{ color: "var(--text-primary)" }}
          >
            Earn Money From{" "}
            <span className="bg-gradient-to-r from-brand to-purple-400 bg-clip-text text-transparent">
              Your Content
            </span>
          </h1>

          <p
            className="mx-auto mt-6 max-w-2xl text-lg"
            style={{ color: "var(--text-secondary)" }}
          >
            Businesses create campaigns with real prize pools. Creators compete
            by posting content. Top performers climb the leaderboard and win
            cash. Simple.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-brand-hover hover:shadow-lg hover:shadow-brand/25"
            >
              Start Earning
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/signup"
              className="card inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-base font-semibold transition-colors"
              style={{ color: "var(--text-primary)" }}
            >
              I'm a Business
            </Link>
          </div>

          {/* Social proof */}
          <div className="mt-12 flex items-center justify-center gap-6">
            <div className="flex -space-x-2">
              {["AT", "SK", "DH", "HG", "YT"].map((initials, i) => (
                <div
                  key={i}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 text-[10px] font-bold text-brand"
                  style={{
                    borderColor: "var(--bg-primary)",
                    backgroundColor: "var(--bg-card)",
                  }}
                >
                  {initials}
                </div>
              ))}
            </div>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                500+
              </span>{" "}
              creators already earning
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        className="border-t py-24"
        style={{ borderColor: "var(--border-primary)" }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2
              className="text-3xl font-bold sm:text-4xl"
              style={{ color: "var(--text-primary)" }}
            >
              How It Works
            </h2>
            <p className="mt-4" style={{ color: "var(--text-secondary)" }}>
              Three simple steps to start earning
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Join a Campaign",
                description:
                  "Browse active campaigns from top Ethiopian brands. Pick one that matches your style and audience.",
                icon: <Trophy size={24} />,
              },
              {
                step: "02",
                title: "Create & Submit",
                description:
                  "Post your best TikTok or Instagram content. Your performance is tracked automatically in real-time.",
                icon: <BarChart3 size={24} />,
              },
              {
                step: "03",
                title: "Win Cash Prizes",
                description:
                  "Top creators on the leaderboard split the prize pool. More engagement = bigger rewards.",
                icon: <DollarSign size={24} />,
              },
            ].map((item) => (
              <div key={item.step} className="card group rounded-xl p-8 transition-all duration-300">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                  {item.icon}
                </div>
                <div className="mb-2 text-sm font-medium text-brand">
                  Step {item.step}
                </div>
                <h3
                  className="mb-2 text-xl font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Campaigns */}
      <section
        className="border-t py-24"
        style={{
          borderColor: "var(--border-primary)",
          backgroundColor: "var(--bg-primary)",
        }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h2
                className="text-3xl font-bold sm:text-4xl"
                style={{ color: "var(--text-primary)" }}
              >
                Active Campaigns
              </h2>
              <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
                Join now and start competing
              </p>
            </div>
            <Link
              to="/signup"
              className="hidden items-center gap-1 text-sm font-medium text-brand hover:underline sm:flex"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeCampaigns.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  No active campaigns right now — check back soon!
                </p>
              </div>
            ) : (
              activeCampaigns.slice(0, 6).map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  linkPrefix="/signup"
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section
        className="border-t py-24"
        style={{
          borderColor: "var(--border-primary)",
          backgroundColor: "var(--bg-primary)",
        }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            {[
              { label: "Campaigns Created", value: "500+", icon: <Trophy size={20} /> },
              { label: "Active Creators", value: "10K+", icon: <Users size={20} /> },
              { label: "Total Paid Out", value: "$250K+", icon: <DollarSign size={20} /> },
              { label: "Avg. Engagement", value: "8.4%", icon: <TrendingUp size={20} /> },
            ].map((stat) => (
              <div key={stat.label} className="card rounded-xl p-6 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  {stat.icon}
                </div>
                <div
                  className="text-3xl font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {stat.value}
                </div>
                <div
                  className="mt-1 text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section
        className="border-t py-24"
        style={{ borderColor: "var(--border-primary)" }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2
              className="text-3xl font-bold sm:text-4xl"
              style={{ color: "var(--text-primary)" }}
            >
              What Creators Say
            </h2>
            <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
              Real results from real creators
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {mockTestimonials.map((t, i) => (
              <div key={i} className="card rounded-xl p-6">
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p
                  className="mb-6 text-sm leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/15 text-sm font-bold text-brand">
                    {t.avatar}
                  </div>
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {t.name}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {t.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="border-t py-24"
        style={{
          borderColor: "var(--border-primary)",
          backgroundColor: "var(--bg-primary)",
        }}
      >
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2
            className="text-3xl font-bold sm:text-4xl"
            style={{ color: "var(--text-primary)" }}
          >
            Ready to Start Earning?
          </h2>
          <p className="mt-4" style={{ color: "var(--text-secondary)" }}>
            Whether you're a business looking to amplify your brand or a creator
            ready to earn — CreatorPay has you covered.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-brand-hover hover:shadow-lg hover:shadow-brand/25"
            >
              Create Your Account
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="border-t py-8"
        style={{ borderColor: "var(--border-primary)" }}
      >
        <div
          className="mx-auto max-w-7xl px-6 text-center text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          © 2026 CreatorPay. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
