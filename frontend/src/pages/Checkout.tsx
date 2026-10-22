import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Loader2, Info, Lock } from "lucide-react";
import { useCart } from "../context/CartContext";
import { computeShippingCents, formatPrice } from "../lib/format";
import { createOrder } from "../lib/api";
import type { OrderPayload } from "../types";
import { ApiError } from "../lib/api";

type FormState = {
  email: string;
  fullName: string;
  company: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postalCode: string;
  country: string;
};

const INITIAL: FormState = {
  email: "",
  fullName: "",
  company: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  postalCode: "",
  country: "",
};

export default function Checkout() {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? "en";
  const navigate = useNavigate();
  const { items, subtotal, clear } = useCart();

  const [form, setForm] = useState<FormState>(INITIAL);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { shipping, free } = computeShippingCents(subtotal);
  const total = subtotal + shipping;

  function set<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;

    setSubmitting(true);
    setError(null);

    const payload: OrderPayload = {
      email: form.email,
      fullName: form.fullName,
      company: form.company || undefined,
      addressLine1: form.addressLine1,
      addressLine2: form.addressLine2 || undefined,
      city: form.city,
      postalCode: form.postalCode,
      country: form.country,
      phone: form.phone,
      items: items.map((i) => ({
        productSlug: i.productSlug,
        quantity: i.quantity,
        custom: i.custom,
      })),
    };

    try {
      const res = await createOrder(payload);
      if (res.data.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
        return;
      }
      clear();
      navigate(`/order/${res.data.reference}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("checkout.error"));
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-32 text-center">
        <p className="text-lg font-medium">{t("cart.empty")}</p>
        <Link to="/catalog" className="btn-outline mt-6">
          {t("cart.emptyCta")}
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-12 lg:py-16">
      <Link to="/catalog" className="inline-flex items-center gap-2 text-sm text-ink/60 hover:text-ink">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t("checkout.backToCart")}
      </Link>

      <h1 className="mt-4 font-display text-4xl font-bold">{t("checkout.title")}</h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <form onSubmit={handleSubmit} className="space-y-8">
          <fieldset>
            <legend className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-ink/60">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-ink text-xs text-ivory">1</span>
              {t("checkout.contact")}
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="co-email">{t("checkout.email")} *</label>
                <input id="co-email" type="email" required dir="ltr" value={form.email} onChange={(e) => set("email", e.target.value)} className="input" placeholder="jane@acme.com" />
              </div>
              <div>
                <label className="label" htmlFor="co-phone">{t("checkout.phone")} *</label>
                <input id="co-phone" type="tel" required dir="ltr" value={form.phone} onChange={(e) => set("phone", e.target.value)} className="input" placeholder="+33 6 12 34 56 78" />
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-ink/60">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-ink text-xs text-ivory">2</span>
              {t("checkout.shippingAddress")}
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label" htmlFor="co-name">{t("checkout.firstName")} *</label>
                <input id="co-name" required value={form.fullName} onChange={(e) => set("fullName", e.target.value)} className="input" />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="co-company">{t("checkout.company")}</label>
                <input id="co-company" value={form.company} onChange={(e) => set("company", e.target.value)} className="input" />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="co-addr1">{t("checkout.address1")} *</label>
                <input id="co-addr1" required value={form.addressLine1} onChange={(e) => set("addressLine1", e.target.value)} className="input" />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="co-addr2">{t("checkout.address2")}</label>
                <input id="co-addr2" value={form.addressLine2} onChange={(e) => set("addressLine2", e.target.value)} className="input" />
              </div>
              <div>
                <label className="label" htmlFor="co-city">{t("checkout.city")} *</label>
                <input id="co-city" required value={form.city} onChange={(e) => set("city", e.target.value)} className="input" />
              </div>
              <div>
                <label className="label" htmlFor="co-postal">{t("checkout.postal")} *</label>
                <input id="co-postal" required dir="ltr" value={form.postalCode} onChange={(e) => set("postalCode", e.target.value)} className="input" />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="co-country">{t("checkout.country")} *</label>
                <input id="co-country" required dir="ltr" maxLength={2} value={form.country} onChange={(e) => set("country", e.target.value.toUpperCase())} className="input w-24 uppercase" placeholder="FR" />
              </div>
            </div>
          </fieldset>

          {error && (
            <p role="alert" className="rounded-xl border border-clay/40 bg-clay/10 px-4 py-3 text-sm font-medium text-clay">
              {error}
            </p>
          )}

          <button type="submit" disabled={submitting} className="btn-gold w-full sm:w-auto">
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> {t("checkout.processing")}
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" /> {t("checkout.placeOrder")} — {formatPrice(total, locale)}
              </>
            )}
          </button>
        </form>

        <aside className="h-fit rounded-2xl bg-white p-6 shadow-card lg:sticky lg:top-24">
          <h2 className="font-display text-lg font-semibold">{t("checkout.summary")}</h2>
          <ul className="mt-4 space-y-3">
            {items.map((item) => (
              <li key={item.key} className="flex items-center gap-3">
                <img src={item.imageUrl} alt="" className="h-12 w-12 rounded-lg object-cover bg-ink/5" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.productName}</p>
                  <p className="truncate text-xs text-ink/50">
                    {item.custom.text.name || item.custom.template} · ×{item.quantity}
                  </p>
                </div>
                <span className="text-sm font-semibold">{formatPrice(item.totalPrice, locale)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-1.5 border-t border-ink/10 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink/60">{t("cart.subtotal")}</dt>
              <dd>{formatPrice(subtotal, locale)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink/60">{t("cart.shipping")}</dt>
              <dd className={free ? "font-semibold text-gold-dark" : ""}>{free ? t("cart.free") : formatPrice(shipping, locale)}</dd>
            </div>
            <div className="flex justify-between border-t border-ink/10 pt-2 font-display text-lg font-bold">
              <dt>{t("cart.total")}</dt>
              <dd>{formatPrice(total, locale)}</dd>
            </div>
          </dl>
          <p className="mt-4 flex items-start gap-2 rounded-lg bg-ink/5 px-3 py-2.5 text-xs leading-relaxed text-ink/60">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-dark" />
            {t("checkout.demoNotice")}
          </p>
        </aside>
      </div>
    </div>
  );
}
