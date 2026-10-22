import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES } from "../i18n";
import { Languages } from "lucide-react";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.resolvedLanguage ?? "en";

  return (
    <div className="flex items-center gap-1 rounded-full border border-ink/15 p-1" role="group" aria-label="Language">
      <Languages className="h-3.5 w-3.5 text-ink/40" aria-hidden="true" />
      {SUPPORTED_LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          type="button"
          onClick={() => void i18n.changeLanguage(lang.code)}
          className={`rounded-full px-2 py-0.5 text-xs font-semibold transition-colors ${
            current.startsWith(lang.code) ? "bg-ink text-ivory" : "text-ink/60 hover:text-ink"
          }`}
          aria-pressed={current.startsWith(lang.code)}
        >
          {lang.label.split(" ")[0]}
        </button>
      ))}
    </div>
  );
}
