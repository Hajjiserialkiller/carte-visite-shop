import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Loader2, Palette } from "lucide-react";
import { getProduct } from "../lib/api";
import type { Product } from "../types";
import { formatPrice } from "../lib/format";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? "en";
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    void getProduct(slug)
      .then((r) => !cancelled && setProduct(r.data))
      .catch(() => !cancelled && setProduct(null))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-gold-dark" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-page py-32 text-center">
        <p className="text-lg font-medium">{t("misc.productNotFound")}</p>
        <Link to="/catalog" className="btn-outline mt-6">
          {t("product.backToCatalog")}
        </Link>
      </div>
    );
  }

  const sortedTiers = [...product.tiers].sort((a, b) => a.quantity - b.quantity);

  return (
    <div className="container-page py-10 lg:py-16">
      <Link to="/catalog" className="inline-flex items-center gap-2 text-sm text-ink/60 hover:text-ink">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t("product.backToCatalog")}
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div className="relative">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="aspect-[4/3] w-full rounded-2xl object-cover shadow-card"
          />
          <span className="absolute start-4 top-4 rounded-full bg-ink/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-ivory backdrop-blur">
            {t(`catalog.categories.${product.category}`)}
          </span>
        </div>

        <div className="flex flex-col">
          <h1 className="font-display text-4xl font-bold">{product.name}</h1>
          <p className="mt-3 leading-relaxed text-ink/70">{product.description}</p>

          <dl className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-white p-4 shadow-card">
              <dt className="text-xs font-semibold uppercase tracking-wider text-ink/45">{t("product.material")}</dt>
              <dd className="mt-1 font-medium">{product.material}</dd>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-card">
              <dt className="text-xs font-semibold uppercase tracking-wider text-ink/45">{t("product.finish")}</dt>
              <dd className="mt-1 font-medium">{product.finish}</dd>
            </div>
          </dl>

          <div className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-ink/45">{t("product.pricing")}</h2>
            <div className="mt-3 overflow-hidden rounded-xl border border-ink/10">
              <table className="w-full text-sm">
                <tbody>
                  {sortedTiers.map((tier, i) => (
                    <tr key={tier.id} className={i % 2 ? "bg-white/60" : "bg-white"}>
                      <td className="px-4 py-3 font-medium">{tier.quantity} {t("product.qty").toLowerCase()}</td>
                      <td className="px-4 py-3 text-end">
                        <span className="font-bold">{formatPrice(tier.pricePer100, locale)}</span>{" "}
                        <span className="text-xs text-ink/45">{t("product.per100")}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-ink/45">{t("common.from")} {formatPrice(sortedTiers[0]?.pricePer100 ?? 0, locale)} {t("product.per100")}</p>
          </div>

          <Link to={`/customize/${product.slug}`} className="btn-gold mt-8 w-full sm:w-auto">
            <Palette className="h-4 w-4" /> {t("product.customize")}
          </Link>
        </div>
      </div>
    </div>
  );
}
