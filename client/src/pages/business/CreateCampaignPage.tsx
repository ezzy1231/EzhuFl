import { useState, useRef, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { createCampaign } from "../../services/campaign.service";
import { uploadFile } from "../../services/profile.service";
import { useAuth } from "../../hooks/useAuth";
import { Spinner } from "../../components/Spinner";
import { ImagePlus, X } from "lucide-react";

const PLATFORM_KEYS: Record<string, string> = {
  TIKTOK: "createCampaign.tiktok",
  INSTAGRAM: "createCampaign.instagram",
  YOUTUBE: "createCampaign.youtube",
  TWITTER: "createCampaign.twitter",
};

const PLATFORM_VALUES = ["TIKTOK", "INSTAGRAM", "YOUTUBE", "TWITTER"];

export function CreateCampaignPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [durationDays, setDurationDays] = useState(1);
  const [winnersCount, setWinnersCount] = useState(3);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [platforms, setPlatforms] = useState<string[]>(["TIKTOK"]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const coverRef = useRef<HTMLInputElement>(null);

  const handleCoverUpload = async (file: File) => {
    if (!user) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/campaign-cover-${Date.now()}.${ext}`;
      const url = await uploadFile("campaign-covers", path, file);
      setCoverImageUrl(url);
    } catch {
      setError(t("createCampaign.failedUpload"));
    } finally {
      setUploading(false);
    }
  };

  const togglePlatform = (p: string) => {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const campaign = await createCampaign({
        title,
        description: description || undefined,
        budget: parseFloat(budget),
        duration_days: durationDays,
        winners_count: winnersCount,
        cover_image_url: coverImageUrl || undefined,
        platforms,

      });
      navigate(`/business/campaigns/${campaign.id}`);
    } catch (err: any) {
      setError(
        err.response?.data?.error || err.message || t("createCampaign.failedCreate")
      );
    } finally {
      setLoading(false);
    }
  };

  // Prize distribution preview
  const budgetNum = parseFloat(budget) || 0;
  const getDistribution = () => {
    if (winnersCount === 1) return [100];
    if (winnersCount === 2) return [60, 40];
    if (winnersCount === 3) return [50, 30, 20];
    const rest = Array(winnersCount - 3).fill(Math.round(20 / (winnersCount - 3)));
    return [40, 25, 15, ...rest];
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          {t("createCampaign.title")}
        </h1>
        <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
          {t("createCampaign.subtitle")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="card rounded-xl p-8">
            {error && (
              <div className="mb-6 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-500">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  {t("createCampaign.campaignTitle")}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="input-field w-full"
                  placeholder="e.g., Summer Coffee Challenge"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  {t("createCampaign.description")}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="input-field w-full"
                  placeholder="Describe what kind of content you're looking for..."
                />
              </div>

              {/* Cover Image Upload */}
              <div>
                <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  {t("createCampaign.coverImage")}
                </label>
                <input
                  ref={coverRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleCoverUpload(file);
                  }}
                />
                {coverImageUrl ? (
                  <div className="relative overflow-hidden rounded-lg">
                    <img
                      src={coverImageUrl}
                      alt="Cover"
                      className="h-40 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setCoverImageUrl(null)}
                      className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => coverRef.current?.click()}
                    disabled={uploading}
                    className="flex h-40 w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors hover:border-brand"
                    style={{
                      borderColor: "var(--border-primary)",
                      color: "var(--text-muted)",
                    }}
                  >
                    {uploading ? (
                      <Spinner size="sm" />
                    ) : (
                      <>
                        <ImagePlus size={20} />
                        <span className="text-sm">{t("createCampaign.uploadCover")}</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Target Platforms */}
              <div>
                <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  {t("createCampaign.targetPlatforms")}
                </label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORM_VALUES.map((pv) => (
                    <button
                      key={pv}
                      type="button"
                      onClick={() => togglePlatform(pv)}
                      className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                        platforms.includes(pv)
                          ? "border-brand bg-brand/10 text-brand"
                          : ""
                      }`}
                      style={
                        !platforms.includes(pv)
                          ? {
                              borderColor: "var(--border-primary)",
                              color: "var(--text-secondary)",
                              backgroundColor: "var(--bg-secondary)",
                            }
                          : undefined
                      }
                    >
                      {t(PLATFORM_KEYS[pv])}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  {t("createCampaign.prizePool")}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
                    $
                  </span>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    required
                    min="1"
                    step="0.01"
                    className="input-field w-full pl-8"
                    placeholder="5000"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  {t("createCampaign.durationDays")}
                </label>
                <div className="flex gap-3">
                  {[1, 2, 3].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDurationDays(d)}
                      className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition-all ${
                        durationDays === d
                          ? "border-brand bg-brand/10 text-brand"
                          : ""
                      }`}
                      style={
                        durationDays !== d
                          ? {
                              borderColor: "var(--border-primary)",
                              color: "var(--text-secondary)",
                              backgroundColor: "var(--bg-secondary)",
                            }
                          : undefined
                      }
                    >
                      {d} {d > 1 ? t("createCampaign.days") : t("createCampaign.day")}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  {t("createCampaign.winnersCount")}
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setWinnersCount(n)}
                      className={`flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-medium transition-all ${
                        winnersCount === n
                          ? "border-brand bg-brand/10 text-brand"
                          : ""
                      }`}
                      style={
                        winnersCount !== n
                          ? {
                              borderColor: "var(--border-primary)",
                              color: "var(--text-secondary)",
                              backgroundColor: "var(--bg-secondary)",
                            }
                          : undefined
                      }
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
                >
                  {loading ? <Spinner size="sm" /> : t("createCampaign.createCampaignBtn")}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="card rounded-lg px-6 py-2.5 text-sm font-medium transition-colors"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {t("common.cancel")}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Prize Distribution Preview */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24 rounded-xl p-6">
            <h3 className="mb-4 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              {t("createCampaign.prizeDistribution")}
            </h3>
            {budgetNum > 0 ? (
              <div className="space-y-2">
                {getDistribution().map((pct, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg p-2.5"
                    style={{ backgroundColor: "var(--bg-secondary)" }}
                  >
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      {i === 0 ? t("createCampaign.1stPlace") : i === 1 ? t("createCampaign.2ndPlace") : i === 2 ? t("createCampaign.3rdPlace") : t("createCampaign.nthPlace", { n: i + 1 })}
                    </span>
                    <span className="text-sm font-bold text-brand">
                      ${Math.round((budgetNum * pct) / 100).toLocaleString()}
                    </span>
                  </div>
                ))}
                <div
                  className="mt-3 flex items-center justify-between border-t pt-3"
                  style={{ borderColor: "var(--border-primary)" }}
                >
                  <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{t("createCampaign.total")}</span>
                  <span className="text-lg font-bold text-brand">${budgetNum.toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                {t("createCampaign.prizeHint")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
