import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { X, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatPrice, computeShippingCents } from "../lib/format";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function CartDrawer({ open, onClose }: Props) {
  const { t, i18n } = useTranslation();
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  const { shipping, free } = computeShippingCents(subtotal);
  const locale = i18n.resolvedLanguage ?? "en";

  return createPortal(
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        className={`absolute inset-0 bg-ink/40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-label={t("cart.title")}
        className={`absolute inset-y-0 end-0 flex w-full max-w-md flex-col bg-ivory shadow-lift transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full rtl:-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
          <h2 className="font-display text-xl font-semibold">
            {t("cart.title")}
            {items.length > 0 && <span className="ms-2 text-sm font-sans text-ink/50">{t("cart.count", { count: items.length })}</span>}
          </h2>
          <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-ink/5" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <ShoppingBag className="h-10 w-10 text-ink/20" />
            <p className="text-sm text-ink/60">{t("cart.empty")}</p>
            <Link to="/catalog" onClick={onClose} className="btn-gold">
              {t("cart.emptyCta")}
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
              {items.map((item) => (
                <li key={item.key} className="flex gap-4 rounded-xl bg-white p-3.5 shadow-card">
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="h-16 w-16 shrink-0 rounded-lg object-cover bg-ink/5"
                    loading="lazy"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-semibold">{item.productName}</p>
                      <button
                        type="button"
                        onClick={() => removeItem(item.key)}
                        className="rounded p-1 text-ink/40 hover:text-clay"
                        aria-label={t("cart.remove")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-ink/50">
                      {item.custom.text.name || item.custom.template} · {item.custom.font}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <label className="flex items-center gap-2 text-xs text-ink/60">
                        {t("cart.quantity")}
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.key, Number(e.target.value))}
                          className="input w-16 !py-1 text-center"
                        />
                      </label>
                      <span className="text-sm font-bold">{formatPrice(item.totalPrice, locale)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-ink/10 px-6 py-5">
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink/60">{t("cart.subtotal")}</dt>
                  <dd className="font-semibold">{formatPrice(subtotal, locale)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink/60">{t("cart.shipping")}</dt>
                  <dd className={free ? "font-semibold text-gold-dark" : ""}>
                    {free ? t("cart.free") : formatPrice(shipping, locale)}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-ink/10 pt-2 text-base">
                  <dt className="font-semibold">{t("cart.total")}</dt>
                  <dd className="font-display text-lg font-bold">{formatPrice(subtotal + shipping, locale)}</dd>
                </div>
              </dl>
              {!free && <p className="mt-1.5 text-xs text-ink/45">{t("cart.shippingNote")}</p>}
              <Link to="/checkout" onClick={onClose} className="btn-gold mt-4 w-full">
                {t("cart.checkout")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>,
    document.body,
  );
}
