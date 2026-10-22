import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { orderStatusSchema, productSchema, productUpdateSchema } from "../validators/product.js";
import { OrderError } from "../services/orderService.js";

function handlePrismaError(err: unknown): unknown {
  if (typeof err === "object" && err !== null && "code" in err && err.code === "P2002") {
    return new OrderError("A product with this slug already exists", 409);
  }
  return err;
}

export async function listProducts(_req: Request, res: Response, next: NextFunction) {
  try {
    const products = await prisma.product.findMany({
      include: { tiers: { orderBy: { quantity: "asc" } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ data: products });
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = productSchema.parse(req.body);
    const { tiers, ...product } = payload;

    const created = await prisma.product.create({
      data: { ...product, tiers: { create: tiers } },
      include: { tiers: true },
    });
    res.status(201).json({ data: created });
  } catch (err) {
    next(handlePrismaError(err));
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = productUpdateSchema.parse(req.body);
    const { tiers, ...product } = payload;

    const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Product not found" } });
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (tiers) {
        await tx.priceTier.deleteMany({ where: { productId: existing.id } });
      }
      return tx.product.update({
        where: { id: existing.id },
        data: {
          ...product,
          ...(tiers ? { tiers: { create: tiers } } : {}),
        },
        include: { tiers: { orderBy: { quantity: "asc" } } },
      });
    });

    res.json({ data: updated });
  } catch (err) {
    next(handlePrismaError(err));
  }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Product not found" } });
    }
    await prisma.product.delete({ where: { id: existing.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export async function listOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const { status } = req.query;
    const orders = await prisma.order.findMany({
      where: typeof status === "string" && status !== "all" ? { status } : {},
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    res.json({ data: orders });
  } catch (err) {
    next(err);
  }
}

export async function updateOrderStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { status } = orderStatusSchema.parse(req.body);
    const existing = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Order not found" } });
    }

    const updated = await prisma.order.update({
      where: { id: existing.id },
      data: { status },
      include: { items: true },
    });
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
}
