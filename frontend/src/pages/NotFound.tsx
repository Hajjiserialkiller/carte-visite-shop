import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="container-page flex flex-col items-center py-32 text-center">
      <p className="font-display text-8xl font-bold text-gold/40">404</p>
      <h1 className="mt-4 font-display text-3xl font-bold">{t("misc.notFoundTitle")}</h1>
      <p className="mt-2 text-ink/60">{t("misc.notFoundMsg")}</p>
      <Link to="/" className="btn-gold mt-8">
        {t("misc.notFoundCta")}
      </Link>
    </div>
  );
}
