import { useTranslation } from "react-i18next";
import Logo from "./Logo";

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink text-ivory">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo light />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ivory/60">{t("footer.blurb")}</p>
        </div>
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gold-light">{t("footer.shop")}</h3>
          <ul className="space-y-2 text-sm text-ivory/70">
            <li><a href="/catalog" className="hover:text-ivory">{t("nav.catalog")}</a></li>
            <li><a href="/catalog?category=premium" className="hover:text-ivory">{t("nav.customizer")}</a></li>
            <li><a href="/catalog?category=classic" className="hover:text-ivory">{t("catalog.categories.classic")}</a></li>
            <li><a href="/catalog?category=metal" className="hover:text-ivory">{t("catalog.categories.metal")}</a></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gold-light">{t("footer.help")}</h3>
          <ul className="space-y-2 text-sm text-ivory/70">
            <li><a href="mailto:hello@cartelier.example" className="hover:text-ivory">hello@cartelier.example</a></li>
            <li><span dir="ltr">+33 1 23 45 67 89</span></li>
            <li><a href="/catalog" className="hover:text-ivory">{t("footer.company")}</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ivory/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-ivory/40 sm:flex-row">
          <span>© {year} Cartelier. {t("footer.rights")}</span>
          <span className="font-display italic">Imprimé avec soin · Printed with care · يُطبع بعناية</span>
        </div>
      </div>
    </footer>
  );
}
