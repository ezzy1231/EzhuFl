import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { PlusCircle, Search, ArrowUpDown } from "lucide-react";

import { CampaignCard } from "../../components/CampaignCard";
import { Spinner } from "../../components/Spinner";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Card, CardContent, CardTitle } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageHeader } from "../../components/ui/PageHeader";
import { Table, TBody, TD, TH, THead, TR } from "../../components/ui/Table";

import { getApiErrorMessage } from "../../services/api";
import { getMyCampaigns } from "../../services/campaign.service";
import type { Campaign } from "../../types";

export function BusinessMyCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "ACTIVE" | "COMPLETED" | "DRAFT" | "CANCELLED"
  >("ALL");
  const [sortBy, setSortBy] = useState<"date" | "budget" | "status">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const { t } = useTranslation();

  useEffect(() => {
    getMyCampaigns()
      .then((c) => {
        setCampaigns(c);
        setError(null);
      })
      .catch((err) => {
        setCampaigns([]);
        setError(getApiErrorMessage(err, "Failed to load campaigns"));
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredCampaigns = useMemo(() => {
    const s = search.trim().toLowerCase();

    const statusRank: Record<string, number> = {
      ACTIVE: 1,
      DRAFT: 2,
      COMPLETED: 3,
      CANCELLED: 4,
    };

    const list = campaigns
      .filter((c) => {
        const matchesSearch =
          !s ||
          c.title.toLowerCase().includes(s) ||
          (c.description ? c.description.toLowerCase().includes(s) : false);

        const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .slice();

    list.sort((a, b) => {
      let av: number | string = 0;
      let bv: number | string = 0;

      if (sortBy === "budget") {
        av = a.budget;
        bv = b.budget;
      } else if (sortBy === "status") {
        av = statusRank[a.status] ?? 99;
        bv = statusRank[b.status] ?? 99;
      } else {
        // date
        av = new Date(a.created_at).getTime();
        bv = new Date(b.created_at).getTime();
      }

      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [campaigns, search, sortBy, sortDir, statusFilter]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={t("businessMyCampaigns.title")}
        subtitle={t("businessMyCampaigns.subtitle")}
        action={
          <Link to="/business/create">
            <Button>
              <PlusCircle size={16} /> {t("businessMyCampaigns.newCampaign")}
            </Button>
          </Link>
        }
      />

      {campaigns.length === 0 ? (
        <Card className="rounded-2xl">
          <CardContent className="p-6">
            {error ? (
              <div className="mb-6 w-full rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-500">
                {error}
              </div>
            ) : null}

            <EmptyState
              icon={<PlusCircle size={28} className="text-brand" />}
              title={t("businessMyCampaigns.noCampaignsTitle")}
              description={t("businessMyCampaigns.noCampaignsText")}
              action={
                <Link to="/business/create">
                  <Button>
                    <PlusCircle size={16} /> {t("businessMyCampaigns.createCampaign")}
                  </Button>
                </Link>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div>
          {/* Mobile / small screens: keep cards (but filtered/sorted) */}
          <div className="mb-4 flex flex-col gap-3 lg:hidden">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("campaignsPage.searchPlaceholder", "Search campaigns...")}
                className="input-field w-full pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {(["ALL", "ACTIVE", "DRAFT", "COMPLETED", "CANCELLED"] as const).map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={statusFilter === s ? "primary" : "secondary"}
                  onClick={() => setStatusFilter(s)}
                >
                  {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:hidden">
            {filteredCampaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                linkPrefix="/business/campaigns"
              />
            ))}
          </div>

          {/* Desktop: table view */}
          <Card className="hidden rounded-2xl lg:block">
            <CardContent className="p-0">
              <div
                className="border-b px-6 py-5"
                style={{ borderColor: "var(--border-primary)" }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-base">
                      {t("businessMyCampaigns.title")} · {filteredCampaigns.length}
                    </CardTitle>
                    <div
                      className="mt-1 text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {t("businessMyCampaigns.subtitle")}
                    </div>

                    <div className="mt-2 text-xs" style={{ color: "var(--text-tertiary)" }}>
                      Showing {filteredCampaigns.length} of {campaigns.length}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="relative">
                      <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2"
                        style={{ color: "var(--text-muted)" }}
                      />
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t(
                          "campaignsPage.searchPlaceholder",
                          "Search campaigns..."
                        )}
                        className="input-field w-72 pl-10"
                      />
                    </div>

                    <select
                      className="input-field h-11 w-44"
                      value={`${sortBy}:${sortDir}`}
                      onChange={(e) => {
                        const [sb, sd] = e.target.value.split(":") as [
                          "date" | "budget" | "status",
                          "asc" | "desc",
                        ];
                        setSortBy(sb);
                        setSortDir(sd);
                      }}
                    >
                      <option value="date:desc">Newest</option>
                      <option value="date:asc">Oldest</option>
                      <option value="budget:desc">Budget (high → low)</option>
                      <option value="budget:asc">Budget (low → high)</option>
                      <option value="status:asc">Status (A → Z)</option>
                      <option value="status:desc">Status (Z → A)</option>
                    </select>

                    <div className="flex flex-wrap gap-2">
                      {(
                        ["ALL", "ACTIVE", "DRAFT", "COMPLETED", "CANCELLED"] as const
                      ).map((s) => (
                        <Button
                          key={s}
                          size="sm"
                          variant={statusFilter === s ? "primary" : "secondary"}
                          onClick={() => setStatusFilter(s)}
                        >
                          {s === "ALL"
                            ? "All"
                            : s.charAt(0) + s.slice(1).toLowerCase()}
                        </Button>
                      ))}
                    </div>

                    {(search.trim() || statusFilter !== "ALL" || `${sortBy}:${sortDir}` !== "date:desc") ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSearch("");
                          setStatusFilter("ALL");
                          setSortBy("date");
                          setSortDir("desc");
                        }}
                      >
                        Clear filters
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="px-6 py-2">
                <Table>
                  <THead>
                    <TR
                      className="border-b"
                      style={{ borderColor: "var(--border-primary)" }}
                    >
                      <TH>Campaign</TH>
                      <TH>Status</TH>
                      <TH>
                        <button
                          type="button"
                          onClick={() => {
                            if (sortBy !== "budget") {
                              setSortBy("budget");
                              setSortDir("desc");
                            } else {
                              setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                            }
                          }}
                          className="inline-flex items-center gap-1"
                        >
                          Budget <ArrowUpDown size={14} />
                        </button>
                      </TH>
                      <TH>Duration</TH>
                      <TH>Winners</TH>
                      <TH className="text-right">Open</TH>
                    </TR>
                  </THead>

                  <TBody>
                    {filteredCampaigns.map((c) => {
                      const badgeVariant =
                        c.status === "ACTIVE"
                          ? "success"
                          : c.status === "COMPLETED"
                            ? "brand"
                            : c.status === "CANCELLED"
                              ? "danger"
                              : "neutral";

                      return (
                        <TR
                          key={c.id}
                          className="hover:bg-[color:var(--bg-hover)]"
                        >
                          <TD className="max-w-[420px]">
                            <div className="min-w-0">
                              <div
                                className="truncate font-medium"
                                style={{ color: "var(--text-primary)" }}
                              >
                                {c.title}
                              </div>
                              {c.description ? (
                                <div
                                  className="mt-0.5 truncate text-xs"
                                  style={{ color: "var(--text-muted)" }}
                                >
                                  {c.description}
                                </div>
                              ) : null}
                            </div>
                          </TD>

                          <TD>
                            <Badge
                              variant={badgeVariant as "neutral" | "success" | "danger" | "brand"}
                            >
                              {c.status}
                            </Badge>
                          </TD>

                          <TD
                            className="font-medium"
                            style={{ color: "var(--text-primary)" }}
                          >
                            ${c.budget.toLocaleString()}
                          </TD>

                          <TD>{c.duration_days}d</TD>
                          <TD>{c.winners_count}</TD>

                          <TD className="text-right">
                            <Link to={`/business/campaigns/${c.id}`}>
                              <Button size="sm" variant="secondary">
                                Open
                              </Button>
                            </Link>
                          </TD>
                        </TR>
                      );
                    })}
                  </TBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
