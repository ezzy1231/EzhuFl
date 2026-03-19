import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";

export function LanguageToggle() {
  const { i18n } = useTranslation();
  const isAmharic = i18n.language === "am";

  return (
    <button
      onClick={() => i18n.changeLanguage(isAmharic ? "en" : "am")}
      className="relative flex h-9 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors hover:opacity-80"
      style={{
        borderColor: "var(--border-primary)",
        color: "var(--text-secondary)",
        backgroundColor: "var(--bg-secondary)",
      }}
      aria-label={isAmharic ? "Switch to English" : "ወደ አማርኛ ቀይር"}
    >
      <Languages size={14} />
      {isAmharic ? "EN" : "አማ"}
    </button>
  );
}
