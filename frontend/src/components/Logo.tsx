import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Logo({ light = false }: { light?: boolean }) {
  const { t } = useTranslation();
  return (
    <Link to="/" className="group flex items-center gap-2.5" aria-label={t("common.brand")}>
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink">
        <svg viewBox="0 0 64 64" className="h-5 w-5" aria-hidden="true">
          <rect x="14" y="22" width="36" height="20" rx="2.5" fill="none" stroke="#C9A227" strokeWidth="5" />
          <circle cx="32" cy="27.5" r="2.4" fill="#C9A227" />
          <line x1="32" y1="32.5" x2="32" y2="37.5" stroke="#C9A227" strokeWidth="5" strokeLinecap="round" />
        </svg>
      </span>
      <span className="leading-none">
        <span className={`block font-display text-lg font-semibold tracking-wide ${light ? "text-ivory" : "text-ink"}`}>
          Cartelier
        </span>
        <span className={`block text-[10px] uppercase tracking-[0.28em] ${light ? "text-gold-light" : "text-gold-dark"}`}>
          carte visite
        </span>
      </span>
    </Link>
  );
}
