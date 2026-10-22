import type { Product, PriceTier } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { isStripeConfigured } from "../config.js";
import { createCheckoutSession, confirmStripePayment } from "./stripeService.js";

export const SHIPPING_FLAT_CENTS = 490;
export const FREE_SHIPPING_THRESHOLD_CENTS = 15000;

export type ProductWithTiers = Product & { tiers: PriceTier[] };

export type OrderItemInput = {
  productSlug: string;
  quantity: number;
  custom: Record<string, unknown>;
};

export type OrderInput = {
  email: string;
  fullName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  items: OrderItemInput[];
};

export type PricedItem = {
  product: ProductWithTiers;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  custom: string;
};

function effectiveRate(tiers: PriceTier[], quantity: number): { quantity: number; rate: number } {
  const sorted = [...tiers].sort((a, b) => a.quantity - b.quantity);
  const first = sorted[0]!;
  if (quantity < first.quantity) return { quantity: first.quantity, rate: first.pricePer100 };
  let chosen = sorted[sorted.length - 1]!;
  for (const t of sorted) {
    if (t.quantity <= quantity) chosen = t;
  }
  return { quantity: chosen.quantity, rate: chosen.pricePer100 };
}

export function computeItemPrice(product: ProductWithTiers, quantity: number): number {
  const { rate } = effectiveRate(product.tiers, quantity);
  return Math.round((rate * quantity) / 100);
}

export function computePerCardPrice(product: ProductWithTiers, quantity: number): number {
  const { rate } = effectiveRate(product.tiers, quantity);
  return Math.round(rate / 100);
}

export async function buildPricedItems(items: OrderItemInput[]): Promise<{
  priced: PricedItem[];
  subtotal: number;
  minQuantityViolations: string[];
}> {
  const priced: PricedItem[] = [];
  const minQuantityViolations: string[] = [];

  for (const item of items) {
    const product = await prisma.product.findFirst({
      where: { slug: item.productSlug, active: true },
      include: { tiers: true },
    });

    if (!product) {
      throw new OrderError(`Unknown product: ${item.productSlug}`);
    }

    const minQty = Math.min(...product.tiers.map((t) => t.quantity));
    if (item.quantity < minQty || item.quantity > 10000) {
      minQuantityViolations.push(item.productSlug);
      continue;
    }

    const unitPrice = computePerCardPrice(product, item.quantity);
    priced.push({
      product,
      quantity: item.quantity,
      unitPrice,
      totalPrice: unitPrice * item.quantity,
      custom: JSON.stringify(item.custom ?? {}),
    });
  }

  const subtotal = priced.reduce((sum, p) => sum + p.totalPrice, 0);
  return { priced, subtotal, minQuantityViolations };
}

export function computeShipping(subtotal: number): number {
  if (subtotal >= FREE_SHIPPING_THRESHOLD_CENTS) return 0;
  return SHIPPING_FLAT_CENTS;
}

export function generateReference(): string {
  const time = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `CT-${time}-${rand}`;
}

export async function createOrder(input: OrderInput, ip: string) {
  const { priced, subtotal, minQuantityViolations } = await buildPricedItems(input.items);

  if (priced.length === 0) {
    const detail =
      minQuantityViolations.length > 0
        ? { code: "QUANTITY_BELOW_MINIMUM", products: minQuantityViolations }
        : { code: "EMPTY_ORDER" };
    throw new OrderError("No valid items in order", 422, detail);
  }

  const shipping = computeShipping(subtotal);
  const total = subtotal + shipping;
  const reference = generateReference();
  const demo = !isStripeConfigured;

  const order = await prisma.order.create({
    data: {
      reference,
      email: input.email,
      fullName: input.fullName,
      company: input.company || null,
      addressLine1: input.addressLine1,
      addressLine2: input.addressLine2 || null,
      city: input.city,
      postalCode: input.postalCode,
      country: input.country,
      phone: input.phone,
      subtotal,
      shipping,
      total,
      status: demo ? "CONFIRMED" : "PENDING",
      paymentMethod: demo ? "demo" : "stripe",
      isDemo: demo,
      items: {
        create: priced.map((p) => ({
          productId: p.product.id,
          productSlug: p.product.slug,
          productName: p.product.name,
          quantity: p.quantity,
          unitPrice: p.unitPrice,
          totalPrice: p.totalPrice,
          custom: p.custom,
        })),
      },
    },
    include: { items: true },
  });

  let checkoutUrl: string | null = null;

  if (!demo) {
    checkoutUrl = await createCheckoutSession({
      orderId: order.id,
      reference,
      email: input.email,
      currency: "EUR",
      lineItems: priced.map((p) => ({
        name: `${p.product.name} × ${p.quantity}`,
        unitAmount: p.unitPrice,
        quantity: p.quantity,
      })),
      shippingCents: shipping,
      totalCents: total,
    });
  }

  return { order, checkoutUrl, isDemo: demo };
}

export async function getOrderByReference(reference: string) {
  return prisma.order.findUnique({
    where: { reference },
    include: { items: true },
  });
}

export async function verifyOrderPayment(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order || order.status !== "PENDING" || !order.paymentId) return order;

  const paid = await confirmStripePayment(order.paymentId);
  if (paid) {
    return prisma.order.update({ where: { id: orderId }, data: { status: "CONFIRMED" }, include: { items: true } });
  }
  return order;
}

export class OrderError extends Error {
  status: number;
  detail?: Record<string, unknown>;

  constructor(message: string, status = 400, detail?: Record<string, unknown>) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}
