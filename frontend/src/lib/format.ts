export const CURRENCY = "EUR";

export function formatPrice(cents: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: CURRENCY,
  }).format(cents / 100);
}

export function formatPricePer100(cents: number, locale: string): string {
  return formatPrice(cents, locale);
}

export function computeUnitPrice(tiers: { quantity: number; pricePer100: number }[], quantity: number): number {
  const sorted = [...tiers].sort((a, b) => a.quantity - b.quantity);
  const first = sorted[0];
  if (!first) return 0;
  if (quantity < first.quantity) return Math.round(first.pricePer100 / 100);
  let chosen = sorted[sorted.length - 1]!;
  for (const t of sorted) {
    if (t.quantity <= quantity) chosen = t;
  }
  return Math.round(chosen.pricePer100 / 100);
}

export function computeTotalPrice(tiers: { quantity: number; pricePer100: number }[], quantity: number): number {
  return computeUnitPrice(tiers, quantity) * quantity;
}

export function computeShippingCents(subtotal: number): { shipping: number; free: boolean } {
  if (subtotal >= 15000) return { shipping: 0, free: true };
  return { shipping: 490, free: false };
}

export function validHex(color: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(color);
}
