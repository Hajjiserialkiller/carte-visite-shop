import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { Product } from "../types";
import { formatPrice } from "../lib/format";

export default function ProductCard({ product }: { product: Product }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? "en";
  const minTier = [...product.tiers].sort((a, b) => a.quantity - b.quantity)[0];

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group overflow-hidden rounded-2xl bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="relative overflow-hidden bg-ink/5">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <span className="absolute start-3 top-3 rounded-full bg-ink/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-ivory backdrop-blur">
          {t(`catalog.categories.${product.category}`)}
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg font-semibold group-hover:text-gold-dark">{product.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-ink/60">{product.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-ink/45">
            {t("common.from")}{" "}
            <span className="text-sm font-bold text-ink">
              {minTier ? formatPrice(minTier.pricePer100, locale) : ""}
            </span>{" "}
            {t("product.per100")}
          </span>
          <span className="rounded-full border border-gold/40 px-3 py-1 text-xs font-semibold text-gold-dark transition-colors group-hover:bg-gold group-hover:text-ink">
            {t("product.customize")}
          </span>
        </div>
      </div>
    </Link>
  );
}
