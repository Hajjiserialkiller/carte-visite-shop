import Stripe from "stripe";
import { config } from "../config.js";

type LineItem = {
  name: string;
  unitAmount: number;
  quantity: number;
};

type CheckoutParams = {
  orderId: string;
  reference: string;
  email: string;
  currency: string;
  lineItems: LineItem[];
  shippingCents: number;
  totalCents: number;
};

export function getStripe(): Stripe | null {
  if (!config.STRIPE_SECRET_KEY) return null;
  return new Stripe(config.STRIPE_SECRET_KEY, { apiVersion: "2025-02-24.acacia" });
}

export async function createCheckoutSession(params: CheckoutParams): Promise<string> {
  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe is not configured");

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: params.email,
    client_reference_id: params.orderId,
    currency: params.currency,
    line_items: params.lineItems.map((li) => ({
      price_data: {
        currency: params.currency,
        product_data: { name: li.name },
        unit_amount: li.unitAmount,
      },
      quantity: li.quantity,
    })),
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: params.shippingCents, currency: params.currency },
          display_name: "Standard shipping",
        },
      },
    ],
    metadata: { order_reference: params.reference, order_id: params.orderId },
    success_url: `${config.APP_URL}/api/orders/${params.reference}/verify?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.APP_URL}/api/orders/${params.reference}/cancel`,
  });

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL");
  }

  return session.url;
}

export async function confirmStripePayment(sessionId: string): Promise<boolean> {
  const stripe = getStripe();
  if (!stripe) return false;

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return session.payment_status === "paid";
}

export async function savePaymentId(orderId: string, sessionId: string): Promise<void> {
  const { prisma } = await import("../lib/prisma.js");
  await prisma.order.update({
    where: { id: orderId },
    data: { paymentId: sessionId },
  });
}
