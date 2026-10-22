import type { Request, Response, NextFunction } from "express";
import { orderSchema } from "../validators/order.js";
import * as orderService from "../services/orderService.js";
import { savePaymentId } from "../services/stripeService.js";

export async function createOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = orderSchema.parse(req.body);
    const ip = req.ip ?? req.socket.remoteAddress ?? "unknown";
    const { order, checkoutUrl, isDemo } = await orderService.createOrder(payload, ip);

    res.status(201).json({
      data: {
        reference: order.reference,
        checkoutUrl,
        isDemo,
        status: order.status,
        total: order.total,
      },
    });
  } catch (err) {
    next(err);
  }
}

function getReference(req: Request, res: Response): string | null {
  const ref = req.params.reference;
  if (!ref || !/^CT-[A-Z0-9-]+$/.test(ref)) {
    res.status(404).json({ error: { code: "NOT_FOUND", message: "Order not found" } });
    return null;
  }
  return ref;
}

export async function getOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const reference = getReference(req, res);
    if (!reference) return;
    const order = await orderService.getOrderByReference(reference);
    if (!order) {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Order not found" } });
    }
    res.json({ data: serializeOrder(order) });
  } catch (err) {
    next(err);
  }
}

export async function verifyOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const reference = getReference(req, res);
    if (!reference) return;
    const sessionId = typeof req.query.session_id === "string" ? req.query.session_id : null;
    const order = await orderService.getOrderByReference(reference);
    if (!order) {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Order not found" } });
    }

    if (sessionId && !order.paymentId) {
      await savePaymentId(order.id, sessionId);
    }

    const verified = await orderService.verifyOrderPayment(order.id);
    if (!verified) {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Order not found" } });
    }
    res.json({ data: serializeOrder(verified) });
  } catch (err) {
    next(err);
  }
}

export async function cancelOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const reference = getReference(req, res);
    if (!reference) return;
    const order = await orderService.getOrderByReference(reference);
    if (!order) {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Order not found" } });
    }
    const cancelled = await prismaCancel(order.id);
    res.json({ data: serializeOrder(cancelled) });
  } catch (err) {
    next(err);
  }
}

function serializeOrder(order: {
  reference: string;
  status: string;
  total: number;
  subtotal: number;
  shipping: number;
  isDemo: boolean;
  paymentMethod: string;
  createdAt: Date;
  email: string;
  fullName: string;
  items: { productName: string; quantity: number; unitPrice: number; totalPrice: number; custom: string }[];
}) {
  return {
    reference: order.reference,
    status: order.status,
    totals: { subtotal: order.subtotal, shipping: order.shipping, total: order.total },
    isDemo: order.isDemo,
    paymentMethod: order.paymentMethod,
    createdAt: order.createdAt,
    email: order.email,
    fullName: order.fullName,
    items: order.items.map((i) => ({
      productName: i.productName,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      totalPrice: i.totalPrice,
      custom: safeParseCustom(i.custom),
    })),
  };
}

function safeParseCustom(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function prismaCancel(id: string) {
  const { prisma } = await import("../lib/prisma.js");
  return prisma.order.update({
    where: { id },
    data: { status: "CANCELLED" },
    include: { items: true },
  });
}
