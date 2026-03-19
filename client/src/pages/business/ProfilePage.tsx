import { useState, useEffect, useRef, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import { TrustBadge } from "../../components/VerifiedBadge";
import {
  Mail,
  Calendar,
  Building2,
  Phone,
  MapPin,
  FileText,
  Upload,
  Save,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Camera,
  Pencil,
  X,
} from "lucide-react";
import {
  updateBusinessProfile,
  uploadFile,
} from "../../services/profile.service";
import type { BusinessProfile } from "../../types";

export function BusinessProfilePage() {
  const { user, verificationStatus, extendedProfile, refreshProfile } =
    useAuth();
  const { t } = useTranslation();
  const bp = extendedProfile as BusinessProfile | null;

  // Form state
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseFileUrl, setLicenseFileUrl] = useState<string | null>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Edit mode: show form only when editing (default to true for new profiles)
  const isProfileComplete = !!(bp?.business_name && bp?.phone && bp?.license_number);
  const [editing, setEditing] = useState(!isProfileComplete);

  // Reset editing state when profile completeness changes
  useEffect(() => {
    setEditing(!isProfileComplete);
  }, [isProfileComplete]);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  // Hydrate form from extendedProfile
  useEffect(() => {
    if (bp) {
      setBusinessName(bp.business_name || "");
      setOwnerName(bp.owner_name || "");
      setPhone(bp.phone || "");
      setCity(bp.city || "");
      setAddress(bp.address || "");
      setLicenseNumber(bp.license_number || "");
      setLicenseFileUrl(bp.license_file_url || null);
      setProfilePhotoUrl(bp.profile_photo_url || null);
    } else if (user) {
      setOwnerName(user.name || "");
    }
  }, [bp, user]);

  const handleFileUpload = async (file: File) => {
    if (!user) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/license.${ext}`;
      const url = await uploadFile("licenses", path, file);
      setLicenseFileUrl(url);
    } catch {
      setMessage({ type: "error", text: t("profilePage.failedUpload") });
    } finally {
      setUploading(false);
    }
  };

  const handlePhotoUpload = async (file: File) => {
    if (!user) return;
    setUploadingPhoto(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/profile-photo.${ext}`;
      const url = await uploadFile("profile-photos", path, file);
      setProfilePhotoUrl(url);
    } catch {
      setMessage({ type: "error", text: t("profilePage.failedUploadPhoto") });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await updateBusinessProfile({
        business_name: businessName,
        owner_name: ownerName,
        phone,
        city,
        address,
        license_number: licenseNumber,
        license_file_url: licenseFileUrl,
        profile_photo_url: profilePhotoUrl,
      });
      await refreshProfile();
      setMessage({
        type: "success",
        text:
          verificationStatus === "rejected"
            ? t("profilePage.profileResubmitted")
            : t("profilePage.profileSaved"),
      });
      setEditing(false);
    } catch {
      setMessage({ type: "error", text: t("profilePage.failedSave") });
    } finally {
      setSaving(false);
    }
  };

  const isEditable =
    !verificationStatus ||
    verificationStatus === "pending" ||
    verificationStatus === "rejected";

  return (
    <div className="min-w-0 overflow-x-hidden">
      <div className="mb-8">
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          {t("profilePage.businessProfile")}
        </h1>
        <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
          {t("profilePage.completeProfile")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left — identity card */}
        <div className="card rounded-xl p-8 lg:col-span-1">
          <div className="mb-6 flex flex-col items-center text-center">
            {/* Profile Photo with upload */}
            <input
              ref={photoRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handlePhotoUpload(file);
              }}
            />
            <button
              type="button"
              onClick={() => photoRef.current?.click()}
              className="group relative mb-3 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-brand/20 text-2xl font-bold text-brand"
            >
              {uploadingPhoto ? (
                <div className="flex items-center justify-center"><div className="h-5 w-5 animate-spin rounded-full border-2 border-brand border-t-transparent" /></div>
              ) : profilePhotoUrl ? (
                <img src={profilePhotoUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                user?.name?.charAt(0)?.toUpperCase() || "?"
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera size={20} className="text-white" />
              </div>
            </button>
            <h2
              className="text-xl font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {user?.name}
            </h2>
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-brand/10 px-3 py-0.5 text-xs font-medium text-brand">
              <Building2 size={12} /> {t("common.business")}
            </span>
            <div className="mt-2">
              <TrustBadge
                level={
                  (verificationStatus as
                    | "pending"
                    | "approved"
                    | "rejected"
                    | "suspended") || "unverified"
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

          {/* Verification status banner */}
          {verificationStatus && (
            <div className="mt-6">
              {verificationStatus === "pending" && (
                <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 p-4 text-amber-600">
                  <Clock size={18} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">{t("profilePage.underReview")}</p>
                    <p className="mt-0.5 text-xs opacity-80">
                      {t("profilePage.underReviewText")}
                    </p>
                  </div>
                </div>
              )}
              {verificationStatus === "approved" && (
                <div className="flex items-start gap-2 rounded-lg bg-emerald-500/10 p-4 text-emerald-600">
                  <CheckCircle size={18} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">{t("profilePage.verified")}</p>
                    <p className="mt-0.5 text-xs opacity-80">
                      {t("profilePage.verifiedText")}
                    </p>
                  </div>
                </div>
              )}
              {verificationStatus === "rejected" && (
                <div className="flex items-start gap-2 rounded-lg bg-red-500/10 p-4 text-red-500">
                  <XCircle size={18} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">{t("profilePage.rejected")}</p>
                    <p className="mt-0.5 text-xs opacity-80">
                      {bp?.rejection_reason ||
                        t("profilePage.rejectedText")}
                    </p>
                  </div>
                </div>
              )}
              {verificationStatus === "suspended" && (
                <div className="flex items-start gap-2 rounded-lg bg-gray-500/10 p-4 text-gray-500">
                  <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">{t("profilePage.suspended")}</p>
                    <p className="mt-0.5 text-xs opacity-80">
                      {t("profilePage.suspendedText")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right — details card */}
        <div className="card rounded-xl p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2
              className="text-lg font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {t("profilePage.businessDetails")}
            </h2>
            {!editing && isProfileComplete && isEditable && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-brand/10"
                style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}
              >
                <Pencil size={14} />
                {t("profilePage.editProfile")}
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
                  <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{t("profilePage.businessNameLabel")}</p>
                  <p className="mt-1 text-sm" style={{ color: "var(--text-primary)" }}>{businessName || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{t("profilePage.ownerName")}</p>
                  <p className="mt-1 text-sm" style={{ color: "var(--text-primary)" }}>{ownerName || "—"}</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{t("profilePage.phone")}</p>
                  <p className="mt-1 text-sm" style={{ color: "var(--text-primary)" }}>{phone || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{t("profilePage.city")}</p>
                  <p className="mt-1 text-sm" style={{ color: "var(--text-primary)" }}>{city || "—"}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{t("profilePage.address")}</p>
                <p className="mt-1 text-sm" style={{ color: "var(--text-primary)" }}>{address || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{t("profilePage.licenseNumber")}</p>
                <p className="mt-1 text-sm" style={{ color: "var(--text-primary)" }}>{licenseNumber || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{t("profilePage.licenseDocument")}</p>
                <p className="mt-1 text-sm" style={{ color: licenseFileUrl ? "var(--text-primary)" : "var(--text-muted)" }}>
                  {licenseFileUrl ? (
                    <a href={licenseFileUrl} target="_blank" rel="noreferrer" className="text-brand underline">{t("profilePage.viewDocument")}</a>
                  ) : "Not uploaded"}
                </p>
              </div>
            </div>
          ) : (

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row: Business Name + Owner Name */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  className="mb-1 block text-sm font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {t("profilePage.businessNameRequired")}
                </label>
                <div className="relative">
                  <Building2
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-muted)" }}
                  />
                  <input
                    type="text"
                    className="input-field w-full pl-10"
                    placeholder="Your business name"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                    disabled={!isEditable}
                  />
                </div>
              </div>
              <div>
                <label
                  className="mb-1 block text-sm font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {t("profilePage.ownerNameRequired")}
                </label>
                <input
                  type="text"
                  className="input-field w-full"
                  placeholder="Full name"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  required
                  disabled={!isEditable}
                />
              </div>
            </div>

            {/* Row: Phone + City */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  className="mb-1 block text-sm font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {t("profilePage.phoneRequired")}
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
                    disabled={!isEditable}
                  />
                </div>
              </div>
              <div>
                <label
                  className="mb-1 block text-sm font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {t("profilePage.cityRequired")}
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
                    required
                    disabled={!isEditable}
                  >
                    <option value="">{t("profilePage.selectCity")}</option>
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
            </div>

            {/* Address */}
            <div>
              <label
                className="mb-1 block text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                {t("profilePage.address")}
              </label>
              <input
                type="text"
                className="input-field w-full"
                placeholder={t("profilePage.addressPlaceholder")}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={!isEditable}
              />
            </div>

            {/* License Number */}
            <div>
              <label
                className="mb-1 block text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                {t("profilePage.licenseNumberRequired")}
              </label>
              <div className="relative">
                <FileText
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  type="text"
                  className="input-field w-full pl-10"
                  placeholder="License / registration number"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  required
                  disabled={!isEditable}
                />
              </div>
            </div>

            {/* License File Upload */}
            <div>
              <label
                className="mb-1 block text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                {t("profilePage.licenseDocument")}
              </label>
              {licenseFileUrl ? (
                <div className="flex items-center gap-3">
                  <a
                    href={licenseFileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-brand underline"
                  >
                    {t("profilePage.viewDocument")}
                  </a>
                  {isEditable && (
                    <button
                      type="button"
                      className="text-xs text-red-500 underline"
                      onClick={() => {
                        setLicenseFileUrl(null);
                        if (fileRef.current) fileRef.current.value = "";
                      }}
                    >
                      {t("common.remove")}
                    </button>
                  )}
                </div>
              ) : (
                <div
                  className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-dashed p-4"
                  style={{ borderColor: "var(--border-primary)" }}
                  onClick={() => isEditable && fileRef.current?.click()}
                >
                  <Upload
                    size={20}
                    style={{ color: "var(--text-muted)" }}
                  />
                  <span
                    className="text-sm"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {uploading
                      ? t("common.uploading")
                      : t("profilePage.uploadLicense")}
                  </span>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileUpload(f);
                }}
                disabled={!isEditable}
              />
            </div>

            {/* Submit */}
            {isEditable && (
              <div className="flex gap-3">
                {isProfileComplete && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      // Reset form to saved values
                      if (bp) {
                        setBusinessName(bp.business_name || "");
                        setOwnerName(bp.owner_name || "");
                        setPhone(bp.phone || "");
                        setCity(bp.city || "");
                        setAddress(bp.address || "");
                        setLicenseNumber(bp.license_number || "");
                        setLicenseFileUrl(bp.license_file_url || null);
                      }
                      setMessage(null);
                    }}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border px-6 py-3 text-sm font-semibold transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                    style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}
                  >
                    <X size={16} />
                    {t("common.cancel")}
                  </button>
                )}
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
                >
                  <Save size={16} />
                  {saving
                    ? t("common.loading")
                    : verificationStatus === "rejected"
                    ? t("profilePage.resubmitVerification")
                    : verificationStatus === "pending"
                    ? t("profilePage.updateResubmit")
                    : t("profilePage.saveSubmitVerification")}
                </button>
              </div>
            )}
          </form>
          )}
        </div>
      </div>
    </div>
  );
}
