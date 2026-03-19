import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
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
import { getPublicStats, type PublicStats } from "../../services/stats.service";
import { CampaignCard } from "../../components/CampaignCard";
import type { Campaign } from "../../types";

export function LandingPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<PublicStats | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    getAllCampaigns()
      .then((c) => setCampaigns(c))
      .catch(() => setCampaigns([]));
    getPublicStats()
      .then((s) => setStats(s))
      .catch(() => setStats(null));
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
            {t("landing.badge")}
          </div>

          <h1
            className="mx-auto max-w-4xl text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl"
            style={{ color: "var(--text-primary)" }}
          >
            {t("landing.heroTitle1")}{" "}
            <span className="bg-gradient-to-r from-brand to-purple-400 bg-clip-text text-transparent">
              {t("landing.heroTitle2")}
            </span>
          </h1>

          <p
            className="mx-auto mt-6 max-w-2xl text-lg"
            style={{ color: "var(--text-secondary)" }}
          >
            {t("landing.heroSubtitle")}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-brand-hover hover:shadow-lg hover:shadow-brand/25"
            >
              {t("landing.startEarning")}
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/signup"
              className="card inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-base font-semibold transition-colors"
              style={{ color: "var(--text-primary)" }}
            >
              {t("landing.imBusiness")}
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
                {t("landing.creatorsCount")}
              </span>{" "}
              {t("landing.creatorsEarning")}
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
              {t("landing.howItWorks")}
            </h2>
            <p className="mt-4" style={{ color: "var(--text-secondary)" }}>
              {t("landing.howItWorksSubtitle")}
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: t("landing.step1Title"),
                description: t("landing.step1Desc"),
                icon: <Trophy size={24} />,
              },
              {
                step: "02",
                title: t("landing.step2Title"),
                description: t("landing.step2Desc"),
                icon: <BarChart3 size={24} />,
              },
              {
                step: "03",
                title: t("landing.step3Title"),
                description: t("landing.step3Desc"),
                icon: <DollarSign size={24} />,
              },
            ].map((item) => (
              <div key={item.step} className="card group rounded-xl p-8 transition-all duration-300">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                  {item.icon}
                </div>
                <div className="mb-2 text-sm font-medium text-brand">
                  {t("landing.step")} {item.step}
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
                {t("landing.activeCampaigns")}
              </h2>
              <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
                {t("landing.joinAndCompete")}
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
                  {t("landing.noActiveCampaigns")}
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
              { label: t("landing.campaignsCreated"), value: stats ? String(stats.totalCampaigns) : "—", icon: <Trophy size={20} /> },
              { label: t("landing.activeCreators"), value: stats ? String(stats.activeCreators) : "—", icon: <Users size={20} /> },
              { label: t("landing.totalPaidOut"), value: stats ? `$${stats.totalPaidOut.toLocaleString()}` : "—", icon: <DollarSign size={20} /> },
              { label: t("landing.avgEngagement"), value: stats ? `${stats.avgEngagementRate}%` : "—", icon: <TrendingUp size={20} /> },
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
              {t("landing.whatCreatorsSay")}
            </h2>
            <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
              {t("landing.realResults")}
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {mockTestimonials.map((item, i) => (
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
                  "{item.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/15 text-sm font-bold text-brand">
                    {item.avatar}
                  </div>
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {item.name}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {item.role}
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
              {t("landing.createYourAccount")}
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
          {t("landing.copyright")}
        </div>
      </footer>
    </div>
  );
}
