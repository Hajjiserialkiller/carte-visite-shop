import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Loader2, Package } from "lucide-react";
import { getOrder, verifyOrder } from "../lib/api";
import type { OrderDetail } from "../types";
import { formatPrice } from "../lib/format";

export default function OrderSuccess() {
  const { reference } = useParams<{ reference: string }>();
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? "en";
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!reference) return;
    let cancelled = false;

    async function load(ref: string) {
      try {
        let data = (await getOrder(ref)).data;
        if (data.status === "PENDING" && !data.isDemo) {
          data = (await verifyOrder(ref)).data;
        }
        if (!cancelled) setOrder(data);
      } catch {
        if (!cancelled) setNotFound(true);
      }
    }

    void load(reference);
    return () => {
      cancelled = true;
    };
  }, [reference]);

  if (notFound) {
    return (
      <div className="container-page py-32 text-center">
        <p className="text-lg font-medium">{t("misc.notFoundMsg")}</p>
        <Link to="/" className="btn-outline mt-6">
          {t("order.backHome")}
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-gold-dark" />
      </div>
    );
  }

  const confirmed = order.status === "CONFIRMED";

  return (
    <div className="container-page max-w-2xl py-16 lg:py-20">
      <div className="rounded-3xl bg-white p-8 text-center shadow-card sm:p-12">
        {confirmed ? (
          <CheckCircle2 className="mx-auto h-14 w-14 text-gold-dark" />
        ) : (
          <Package className="mx-auto h-14 w-14 text-ink/40" />
        )}
        <h1 className="mt-5 font-display text-3xl font-bold sm:text-4xl">{t("order.success")}</h1>
        {order.isDemo && <p className="mt-2 text-sm font-medium text-gold-dark">{t("order.successDemo")}</p>}
        <p className="mt-3 text-ink/60">{t("order.successMsg", { email: order.email })}</p>

        <div className="mx-auto mt-8 grid max-w-md grid-cols-2 gap-4">
          <div className="rounded-xl bg-ivory p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink/45">{t("order.reference")}</p>
            <p className="mt-1 font-mono text-sm font-bold" dir="ltr">{order.reference}</p>
          </div>
          <div className="rounded-xl bg-ivory p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink/45">{t("order.status")}</p>
            <p className="mt-1 text-sm font-bold text-gold-dark">
              {confirmed ? t("order.statusConfirmed") : t("order.statusPending")}
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-ink/10 text-start">
          <div className="border-b border-ink/10 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-ink/45">
            {t("order.items")}
          </div>
          <ul className="divide-y divide-ink/5">
            {order.items.map((item, i) => (
              <li key={i} className="flex items-center justify-between gap-3 px-5 py-3.5 text-sm">
                <div className="min-w-0">
                  <p className="font-medium">{item.productName}</p>
                  <p className="truncate text-xs text-ink/50">
                    {item.custom?.text?.name} · ×{item.quantity}
                  </p>
                </div>
                <span className="shrink-0 font-semibold">{formatPrice(item.totalPrice, locale)}</span>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between border-t border-ink/10 bg-ivory/60 px-5 py-3.5 text-sm font-bold">
            <span>{t("order.totals")}</span>
            <span className="font-display text-lg">{formatPrice(order.totals.total, locale)}</span>
          </div>
        </div>

        <p className="mt-6 text-xs text-ink/45">{t("order.printNote")}</p>

        <Link to="/" className="btn-primary mt-8">
          {t("order.backHome")}
        </Link>
      </div>
    </div>
  );
}
