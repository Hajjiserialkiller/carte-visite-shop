import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, PenLine, Layers, Truck, ShieldCheck } from "lucide-react";
import { getProducts, getFeatured } from "../lib/api";
import type { Product } from "../types";
import ProductCard from "../components/ProductCard";
import CardPreview from "../components/CardPreview";
import { useCart } from "../context/CartContext";
import { computeUnitPrice } from "../lib/format";

const heroCustom = {
  template: "elegant" as const,
  bg: "#14141A",
  accent: "#E3C566",
  font: "Playfair Display",
  text: {
    name: "Sophie Lambert",
    title: "Creative Director",
    company: "Atelier Lambert",
    phone: "+33 6 12 34 56 78",
    email: "sophie@lambert.fr",
    website: "www.lambert.fr",
    address: "",
  },
};

const backCustom = {
  template: "bold" as const,
  bg: "#C9A227",
  accent: "#14141A",
  font: "Montserrat",
  text: {
    name: "SOPHIE",
    title: "",
    company: "LAMBERT",
    phone: "+33 6 12 34 56 78",
    email: "sophie@lambert.fr",
    website: "",
    address: "",
  },
};

export default function Home() {
  const { t } = useTranslation();
  const [featured, setFeatured] = useState<Product[]>([]);
  const { addItem } = useCart();

  useEffect(() => {
    void getFeatured().then((r) => setFeatured(r.data));
  }, []);

  function quickAdd(slug: string) {
    getProducts({}).then((r) => {
      const product = r.data.find((p) => p.slug === slug);
      if (!product) return;
      const minQty = Math.min(...product.tiers.map((x) => x.quantity));
      addItem({
        productSlug: product.slug,
        productName: product.name,
        imageUrl: product.imageUrl,
        quantity: minQty,
        unitPrice: computeUnitPrice(product.tiers, minQty),
        custom: { ...heroCustom, text: { ...heroCustom.text, name: "Votre nom" } },
      });
    });
  }

  return (
    <div>
      <section className="bg-ink text-ivory">
        <div className="container-page grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <p className="mb-4 inline-block rounded-full border border-gold/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-gold-light">
              {t("common.tagline")}
            </p>
            <h1 className="font-display text-4xl font-bold leading-[1.1] sm:text-5xl lg:text-6xl">
              {t("home.heroTitle")}
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-ivory/70 sm:text-lg">{t("home.heroSub")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/customize/premium-gold-foil" className="btn-gold">
                {t("home.ctaPrimary")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
              <Link to="/catalog" className="btn border border-ivory/25 text-ivory hover:bg-ivory hover:text-ink">
                {t("home.ctaSecondary")}
              </Link>
            </div>
            <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-ivory/10 pt-6">
              {[t("home.stat1"), t("home.stat2"), t("home.stat3")].map((stat, i) => (
                <div key={i}>
                  <dt className="font-display text-xl font-bold text-gold-light sm:text-2xl">
                    <span className="text-ivory/30">0{i + 1}</span> {stat.split(" ")[0]}
                  </dt>
                  <dd className="mt-1 text-xs text-ivory/50">{stat}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="rotate-2 transition-transform duration-500 hover:rotate-0">
              <CardPreview custom={heroCustom} />
            </div>
            <div className="absolute -bottom-8 -start-4 w-1/2 -rotate-6 shadow-lift transition-transform duration-500 hover:rotate-0 sm:-start-8">
              <CardPreview custom={backCustom} />
            </div>
          </div>
        </div>

        <div className="border-t border-ivory/10">
          <div className="container-page grid grid-cols-2 gap-4 py-6 text-center text-xs font-medium text-ivory/70 sm:grid-cols-4">
            {[PenLine, Layers, Truck, ShieldCheck].map((Icon, i) => (
              <span key={i} className="flex items-center justify-center gap-2">
                <Icon className="h-4 w-4 text-gold-light" /> {t("home.trust")[i]}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16 lg:py-20">
        <h2 className="text-center font-display text-3xl font-bold">{t("home.howTitle")}</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {(t("home.steps", { returnObjects: true }) as { title: string; desc: string }[]).map((step, i) => (
            <div key={i} className="relative rounded-2xl bg-white p-6 shadow-card">
              <span className="font-display text-5xl font-bold text-gold/30">0{i + 1}</span>
              <h3 className="mt-3 font-display text-xl font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/60">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-16 lg:py-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold">{t("home.featured")}</h2>
            <p className="mt-1 text-sm text-ink/60">{t("home.featuredSub")}</p>
          </div>
          <Link to="/catalog" className="btn-outline hidden sm:inline-flex">
            {t("common.viewAll")}
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="bg-ink text-ivory">
        <div className="container-page flex flex-col items-center gap-6 py-16 text-center">
          <h2 className="max-w-xl font-display text-3xl font-bold sm:text-4xl">{t("home.ctaPrimary")}</h2>
          <button type="button" onClick={() => quickAdd("premium-gold-foil")} className="btn-gold">
            {t("customizer.addToCart")} — Gold Foil Luxury
          </button>
        </div>
      </section>
    </div>
  );
}
