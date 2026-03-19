import { useState, useEffect, useRef, type FormEvent } from "react";
import { useAuth } from "../../hooks/useAuth";
import { TrustBadge } from "../../components/VerifiedBadge";
import {
  Mail,
  Calendar,
  Phone,
  MapPin,
  Upload,
  Save,
  User as UserIcon,
  Instagram,
  AtSign,
  FileText,
  Pencil,
  X,
} from "lucide-react";
import {
  updateInfluencerProfile,
  uploadFile,
} from "../../services/profile.service";
import type { InfluencerProfile } from "../../types";

export function InfluencerProfilePage() {
  const { user, verificationStatus, extendedProfile, refreshProfile } =
    useAuth();
  const ip = extendedProfile as InfluencerProfile | null;

  // Form state
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [tiktokHandle, setTiktokHandle] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [idDocumentUrl, setIdDocumentUrl] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingId, setUploadingId] = useState(false);

  // Edit mode: show form only when editing (default to true for new profiles)
  const isProfileComplete = !!(ip?.display_name && ip?.phone);
  const [editing, setEditing] = useState(!isProfileComplete);

  // Reset editing state when profile completeness changes
  useEffect(() => {
    setEditing(!isProfileComplete);
  }, [isProfileComplete]);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const idRef = useRef<HTMLInputElement>(null);

  // Hydrate form
  useEffect(() => {
    if (ip) {
      setDisplayName(ip.display_name || "");
      setBio(ip.bio || "");
      setPhone(ip.phone || "");
      setCity(ip.city || "");
      setTiktokHandle(ip.tiktok_handle || "");
      setInstagramHandle(ip.instagram_handle || "");
      setProfilePhotoUrl(ip.profile_photo_url || null);
      setIdDocumentUrl(ip.id_document_url || null);
    } else if (user) {
      setDisplayName(user.name || "");
    }
  }, [ip, user]);

  const handlePhotoUpload = async (file: File) => {
    if (!user) return;
    setUploadingPhoto(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/photo.${ext}`;
      const url = await uploadFile("profiles", path, file);
      setProfilePhotoUrl(url);
    } catch {
      setMessage({ type: "error", text: "Failed to upload photo" });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleIdUpload = async (file: File) => {
    if (!user) return;
    setUploadingId(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/id.${ext}`;
      const url = await uploadFile("ids", path, file);
      setIdDocumentUrl(url);
    } catch {
      setMessage({ type: "error", text: "Failed to upload ID document" });
    } finally {
      setUploadingId(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await updateInfluencerProfile({
        display_name: displayName,
        bio,
        phone,
        city,
        tiktok_handle: tiktokHandle || null,
        instagram_handle: instagramHandle || null,
        profile_photo_url: profilePhotoUrl,
        id_document_url: idDocumentUrl,
      });
      await refreshProfile();
      setMessage({ type: "success", text: "Profile saved successfully!" });
      setEditing(false);
    } catch {
      setMessage({ type: "error", text: "Failed to save profile" });
    } finally {
      setSaving(false);
    }
  };

  const tierLabel = (status: string | null) => {
    switch (status) {
      case "verified":
        return "Full verification — eligible for premium campaigns";
      case "basic":
        return "Basic tier — complete more info to level up";
      default:
        return "Fill in your details to unlock verification tiers";
    }
  };

  return (
    <div className="min-w-0 overflow-x-hidden">
      <div className="mb-8">
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Creator Profile
        </h1>
        <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
          {tierLabel(verificationStatus)}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left — identity card */}
        <div className="card rounded-xl p-8 lg:col-span-1">
          <div className="mb-6 flex flex-col items-center text-center">
            {/* Profile photo */}
            <div
              className="relative mb-3 flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-brand/20 text-2xl font-bold text-brand"
              onClick={() => photoRef.current?.click()}
            >
              {profilePhotoUrl ? (
                <img
                  src={profilePhotoUrl}
                  alt="profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                user?.name?.charAt(0)?.toUpperCase() || "?"
              )}
              {uploadingPhoto && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs text-white">
                  …
                </div>
              )}
            </div>
            <input
              ref={photoRef}
              type="file"
              className="hidden"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handlePhotoUpload(f);
              }}
            />

            <h2
              className="text-xl font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {displayName || user?.name}
            </h2>
            <span className="mt-1 inline-block rounded-full bg-brand/10 px-3 py-0.5 text-xs font-medium text-brand">
              Creator
            </span>
            <div className="mt-2">
              <TrustBadge
                level={
                  (verificationStatus as
                    | "unverified"
                    | "basic"
                    | "verified") || "unverified"
                }
                size="md"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div
              className="flex items-center gap-3 rounded-lg p-3"
              style={{ backgroundColor: "var(--bg-secondary)" }}
            >
              <Mail size={16} className="shrink-0" style={{ color: "var(--text-muted)" }} />
              <span
                className="min-w-0 truncate text-sm"
                style={{ color: "var(--text-primary)" }}
              >
                {user?.email}
              </span>
            </div>
            <div
              className="flex items-center gap-3 rounded-lg p-3"
              style={{ backgroundColor: "var(--bg-secondary)" }}
            >
              <Calendar size={16} style={{ color: "var(--text-muted)" }} />
              <span
                className="text-sm"
                style={{ color: "var(--text-primary)" }}
              >
                Joined{" "}
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : "—"}
              </span>
            </div>
          </div>

          {/* Tier progress */}
          <div className="mt-6 space-y-2">
            <p
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              Verification Progress
            </p>
            <div className="space-y-1">
              {[
                {
                  label: "Display name & phone",
                  done: !!(displayName && phone),
                },
                {
                  label: "Social handle linked",
                  done: !!(tiktokHandle || instagramHandle),
                },
                {
                  label: "ID document uploaded",
                  done: !!idDocumentUrl,
                },
              ].map((step, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm"
                  style={{
                    color: step.done
                      ? "var(--text-primary)"
                      : "var(--text-muted)",
                  }}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                      step.done
                        ? "bg-emerald-500 text-white"
                        : "border"
                    }`}
                    style={
                      !step.done
                        ? { borderColor: "var(--border-primary)" }
                        : undefined
                    }
                  >
                    {step.done ? "✓" : i + 1}
                  </span>
                  {step.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — details card */}
        <div className="card rounded-xl p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2
              className="text-lg font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Creator Details
            </h2>
            {!editing && isProfileComplete && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-brand/10"
                style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}
              >
                <Pencil size={14} />
                Edit Profile
              </button>
            )}
          </div>

          {message && (
            <div
              className={`mb-4 rounded-lg p-3 text-sm ${
                message.type === "success"
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-red-500/10 text-red-500"
              }`}
            >
              {message.text}
            </div>
          )}

          {!editing && isProfileComplete ? (
            /* Read-only summary */
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Display Name</p>
                  <p className="mt-1 text-sm" style={{ color: "var(--text-primary)" }}>{displayName || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Phone</p>
                  <p className="mt-1 text-sm" style={{ color: "var(--text-primary)" }}>{phone || "—"}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>City</p>
                <p className="mt-1 text-sm" style={{ color: "var(--text-primary)" }}>{city || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Bio</p>
                <p className="mt-1 text-sm" style={{ color: "var(--text-primary)" }}>{bio || "—"}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>TikTok Handle</p>
                  <p className="mt-1 text-sm" style={{ color: "var(--text-primary)" }}>{tiktokHandle || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Instagram Handle</p>
                  <p className="mt-1 text-sm" style={{ color: "var(--text-primary)" }}>{instagramHandle || "—"}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>ID Document</p>
                <p className="mt-1 text-sm" style={{ color: idDocumentUrl ? "var(--text-primary)" : "var(--text-muted)" }}>
                  {idDocumentUrl ? "✓ Uploaded" : "Not uploaded"}
                </p>
              </div>
            </div>
          ) : (

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row: Display Name + Phone */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  className="mb-1 block text-sm font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Display Name *
                </label>
                <div className="relative">
                  <UserIcon
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-muted)" }}
                  />
                  <input
                    type="text"
                    className="input-field w-full pl-10"
                    placeholder="Your creator name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <label
                  className="mb-1 block text-sm font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Phone *
                </label>
                <div className="relative flex">
                  <span
                    className="input-field flex items-center gap-1.5 rounded-r-none border-r-0 px-3 text-sm"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <Phone size={16} />
                    +251
                  </span>
                  <input
                    type="tel"
                    className="input-field w-full rounded-l-none"
                    placeholder="9xx xxx xxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* City */}
            <div>
              <label
                className="mb-1 block text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                City
              </label>
              <div className="relative">
                <MapPin
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                />
                <select
                  className="input-field w-full pl-10 appearance-none"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                >
                  <option value="">Select a city</option>
                  <option value="Addis Ababa">Addis Ababa</option>
                  <option value="Awassa">Awassa</option>
                  <option value="Dire Dawa">Dire Dawa</option>
                  <option value="Mekelle">Mekelle</option>
                  <option value="Adama">Adama</option>
                  <option value="Bahir Dar">Bahir Dar</option>
                  <option value="Gonder">Gonder</option>
                </select>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label
                className="mb-1 block text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                Bio
              </label>
              <textarea
                className="input-field w-full"
                rows={3}
                placeholder="Tell brands about yourself…"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            {/* Social handles */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  className="mb-1 block text-sm font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  TikTok Handle
                </label>
                <div className="relative">
                  <AtSign
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-muted)" }}
                  />
                  <input
                    type="text"
                    className="input-field w-full pl-10"
                    placeholder="@yourhandle"
                    value={tiktokHandle}
                    onChange={(e) => setTiktokHandle(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label
                  className="mb-1 block text-sm font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Instagram Handle
                </label>
                <div className="relative">
                  <Instagram
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-muted)" }}
                  />
                  <input
                    type="text"
                    className="input-field w-full pl-10"
                    placeholder="@yourhandle"
                    value={instagramHandle}
                    onChange={(e) => setInstagramHandle(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* ID Document Upload */}
            <div>
              <label
                className="mb-1 block text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                ID Document (for full verification)
              </label>
              {idDocumentUrl ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-emerald-600">
                    <FileText size={16} />
                    <span>ID uploaded</span>
                  </div>
                  <button
                    type="button"
                    className="text-xs text-red-500 underline"
                    onClick={() => {
                      setIdDocumentUrl(null);
                      if (idRef.current) idRef.current.value = "";
                    }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div
                  className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-dashed p-4"
                  style={{ borderColor: "var(--border-primary)" }}
                  onClick={() => idRef.current?.click()}
                >
                  <Upload size={20} style={{ color: "var(--text-muted)" }} />
                  <span
                    className="text-sm"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {uploadingId
                      ? "Uploading…"
                      : "Upload national ID or passport (JPG, PNG, PDF)"}
                  </span>
                </div>
              )}
              <input
                ref={idRef}
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleIdUpload(f);
                }}
              />
              <p
                className="mt-1 text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                Uploading an ID upgrades you from Basic → Verified tier
              </p>
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              {isProfileComplete && (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    // Reset form to saved values
                    if (ip) {
                      setDisplayName(ip.display_name || "");
                      setBio(ip.bio || "");
                      setPhone(ip.phone || "");
                      setCity(ip.city || "");
                      setTiktokHandle(ip.tiktok_handle || "");
                      setInstagramHandle(ip.instagram_handle || "");
                      setIdDocumentUrl(ip.id_document_url || null);
                    }
                    setMessage(null);
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border px-6 py-3 text-sm font-semibold transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                  style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}
                >
                  <X size={16} />
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={saving || uploadingPhoto || uploadingId}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
              >
                <Save size={16} />
                {saving ? "Saving…" : "Save Profile"}
              </button>
            </div>
          </form>
          )}
        </div>
      </div>
    </div>
  );
}
