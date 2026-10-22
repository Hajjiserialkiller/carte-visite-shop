import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Loader2, ShoppingBag, Check, Ruler } from "lucide-react";
import { getProduct } from "../lib/api";
import type { CardCustomization, CardTemplate, Product } from "../types";
import { computeTotalPrice, formatPrice } from "../lib/format";
import CardPreview from "../components/CardPreview";
import { useCart } from "../context/CartContext";

const BG_SWATCHES = ["#14141A", "#000000", "#FFFFFF", "#FAF7F0", "#EDE3D3", "#C9A227", "#B4552D", "#1F3D2B", "#1E2A44", "#4A1E22"];
const ACCENT_SWATCHES = ["#C9A227", "#E3C566", "#14141A", "#FFFFFF", "#B4552D", "#B3372E", "#1F6F6B", "#2B5B84", "#5B2E5C", "#000000"];
const FONTS = ["Playfair Display", "Cormorant Garamond", "Inter", "Montserrat", "Cairo", "Amiri"];

const DEFAULT_CUSTOM: CardCustomization = {
  template: "classic",
  bg: "#14141A",
  accent: "#C9A227",
  font: "Playfair Display",
  text: { name: "", title: "", company: "", phone: "", email: "", website: "", address: "" },
};

const TEXT_FIELDS: { key: keyof CardCustomization["text"]; ltr?: boolean }[] = [
  { key: "name" },
  { key: "title" },
  { key: "company" },
  { key: "phone", ltr: true },
  { key: "email", ltr: true },
  { key: "website", ltr: true },
  { key: "address" },
];

export default function Customize() {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? "en";
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [custom, setCustom] = useState<CardCustomization>(DEFAULT_CUSTOM);
  const [quantity, setQuantity] = useState(100);
  const [added, setAdded] = useState(false);

  const minQty = useMemo(() => {
    if (!product || product.tiers.length === 0) return 50;
    return Math.min(...product.tiers.map((x) => x.quantity));
  }, [product]);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    void getProduct(slug)
      .then((r) => {
        if (cancelled) return;
        setProduct(r.data);
        setQuantity(Math.min(...r.data.tiers.map((x) => x.quantity)));
      })
      .catch(() => !cancelled && setProduct(null))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (quantity < minQty) setQuantity(minQty);
  }, [minQty, quantity]);

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

  const total = computeTotalPrice(product.tiers, quantity);
  const sortedTiers = [...product.tiers].sort((a, b) => a.quantity - b.quantity);

  function setText(key: keyof CardCustomization["text"], value: string) {
    setCustom((c) => ({ ...c, text: { ...c.text, [key]: value } }));
    setAdded(false);
  }

  function setTemplate(template: CardTemplate) {
    setCustom((c) => ({ ...c, template }));
    setAdded(false);
  }

  function addToCart() {
    if (!product || !custom.text.name.trim()) return;
    addItem({
      productSlug: product.slug,
      productName: product.name,
      imageUrl: product.imageUrl,
      quantity,
      unitPrice: total / quantity,
      custom,
    });
    setAdded(true);
  }

  return (
    <div className="container-page py-10 lg:py-14">
      <Link to={`/product/${product.slug}`} className="inline-flex items-center gap-2 text-sm text-ink/60 hover:text-ink">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t("customizer.backToProduct")}
      </Link>

      <header className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold">{t("customizer.title")}</h1>
          <p className="mt-1 text-ink/60">{t("customizer.sub")}</p>
        </div>
        <p className="font-display text-2xl font-bold text-gold-dark">{product.name}</p>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink/45">{t("customizer.preview")}</p>
            <span className="flex items-center gap-1.5 text-xs text-ink/45">
              <Ruler className="h-3.5 w-3.5" /> {t("customizer.dimensions")}
            </span>
          </div>
          <div className="mt-3 rounded-2xl bg-ink/95 p-6 sm:p-10">
            <CardPreview custom={custom} />
          </div>
          <div className="mt-6 rounded-2xl bg-white p-6 shadow-card">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink/45">{t("customizer.price")}</p>
                <p className="mt-1 font-display text-3xl font-bold">{formatPrice(total, locale)}</p>
                <p className="text-xs text-ink/45">
                  {quantity} {t("product.qty").toLowerCase()} · {formatPrice(Math.round(total / quantity), locale)} / carte
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={addToCart}
              disabled={!custom.text.name.trim()}
              className={`mt-5 w-full ${added ? "bg-ink text-ivory hover:bg-ink-soft" : "btn-gold"}`}
            >
              {added ? (
                <>
                  <Check className="h-4 w-4" /> {t("product.inCart")} —{" "}
                  <Link to="/checkout" className="underline underline-offset-2">
                    {t("cart.checkout")}
                  </Link>
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" /> {t("customizer.addToCart")}
                </>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-8">
          <fieldset>
            <legend className="label">{t("customizer.template")}</legend>
            <div className="grid grid-cols-4 gap-2">
              {(["classic", "minimal", "bold", "elegant"] as CardTemplate[]).map((tp) => (
                <button
                  key={tp}
                  type="button"
                  onClick={() => setTemplate(tp)}
                  className={`rounded-xl border-2 px-2 py-3 text-sm font-semibold transition-all ${
                    custom.template === tp
                      ? "border-gold bg-gold/10 text-gold-dark"
                      : "border-ink/10 bg-white text-ink/60 hover:border-ink/30"
                  }`}
                  aria-pressed={custom.template === tp}
                >
                  {t(`customizer.templates.${tp}`)}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="label">{t("customizer.background")}</legend>
            <div className="flex flex-wrap items-center gap-2">
              {BG_SWATCHES.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    setCustom((c) => ({ ...c, bg: color }));
                    setAdded(false);
                  }}
                  className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
                    custom.bg.toLowerCase() === color.toLowerCase() ? "border-gold ring-2 ring-gold/30" : "border-ink/10"
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={color}
                />
              ))}
              <label className="ms-1 flex cursor-pointer items-center gap-2 rounded-full border border-ink/15 px-3 py-1.5 text-xs font-medium text-ink/60">
                <input
                  type="color"
                  value={custom.bg}
                  onChange={(e) => {
                    setCustom((c) => ({ ...c, bg: e.target.value }));
                    setAdded(false);
                  }}
                  className="h-5 w-5 cursor-pointer appearance-none rounded border-0 bg-transparent p-0"
                  aria-label={t("customizer.background")}
                />
                {custom.bg.toUpperCase()}
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend className="label">{t("customizer.accent")}</legend>
            <div className="flex flex-wrap items-center gap-2">
              {ACCENT_SWATCHES.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    setCustom((c) => ({ ...c, accent: color }));
                    setAdded(false);
                  }}
                  className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
                    custom.accent.toLowerCase() === color.toLowerCase() ? "border-gold ring-2 ring-gold/30" : "border-ink/10"
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={color}
                />
              ))}
              <label className="ms-1 flex cursor-pointer items-center gap-2 rounded-full border border-ink/15 px-3 py-1.5 text-xs font-medium text-ink/60">
                <input
                  type="color"
                  value={custom.accent}
                  onChange={(e) => {
                    setCustom((c) => ({ ...c, accent: e.target.value }));
                    setAdded(false);
                  }}
                  className="h-5 w-5 cursor-pointer appearance-none rounded border-0 bg-transparent p-0"
                  aria-label={t("customizer.accent")}
                />
                {custom.accent.toUpperCase()}
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend className="label">{t("customizer.font")}</legend>
            <select
              value={custom.font}
              onChange={(e) => {
                setCustom((c) => ({ ...c, font: e.target.value }));
                setAdded(false);
              }}
              className="input"
              style={{ fontFamily: `"${custom.font}", serif` }}
            >
              {FONTS.map((f) => (
                <option key={f} value={f}>
                  {t(`customizer.fonts.${f}`)}
                </option>
              ))}
            </select>
          </fieldset>

          <fieldset>
            <legend className="label">Textes</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {TEXT_FIELDS.map(({ key, ltr }) => (
                <div key={key} className={key === "address" || key === "name" ? "sm:col-span-2" : ""}>
                  <label className="mb-1 block text-xs font-medium text-ink/60" htmlFor={`field-${key}`}>
                    {t(`customizer.${key === "title" ? "jobTitle" : key}`)}
                  </label>
                  <input
                    id={`field-${key}`}
                    type="text"
                    dir={ltr ? "ltr" : undefined}
                    value={custom.text[key]}
                    maxLength={key === "address" ? 120 : 60}
                    placeholder={t(`customizer.${key === "title" ? "jobTitle" : key}Ph`)}
                    onChange={(e) => setText(key, e.target.value)}
                    className="input"
                  />
                </div>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="label">{t("customizer.quantity")}</legend>
            <div className="flex flex-wrap gap-2">
              {sortedTiers.map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setQuantity(tier.quantity)}
                  className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
                    quantity === tier.quantity ? "chip-active" : "chip"
                  }`}
                  aria-pressed={quantity === tier.quantity}
                >
                  {tier.quantity}
                </button>
              ))}
            </div>
            <label className="mt-3 block text-xs font-medium text-ink/60" htmlFor="custom-qty">
              {t("checkout.summary")}:
            </label>
            <input
              id="custom-qty"
              type="number"
              min={minQty}
              max={10000}
              step={50}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(minQty, Number(e.target.value) || minQty))}
              className="input mt-1 w-40"
            />
          </fieldset>

          {!custom.text.name.trim() && (
            <p className="rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold-dark">
              {t("customizer.nameRequired")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
