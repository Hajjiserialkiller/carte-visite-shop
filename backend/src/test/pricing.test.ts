import { describe, expect, it } from "vitest";
import {
  computePerCardPrice,
  computeShipping,
  computeItemPrice,
  generateReference,
  FREE_SHIPPING_THRESHOLD_CENTS,
  SHIPPING_FLAT_CENTS,
} from "../services/orderService.js";
import type { PriceTier } from "@prisma/client";

const tiers: PriceTier[] = [
  { id: "a", productId: "p", quantity: 50, pricePer100: 2400 },
  { id: "b", productId: "p", quantity: 100, pricePer100: 1800 },
  { id: "c", productId: "p", quantity: 250, pricePer100: 1400 },
  { id: "d", productId: "p", quantity: 500, pricePer100: 1100 },
];

const product = {
  id: "p",
  slug: "test",
  name: "Test",
  description: "d",
  category: "classic",
  material: "m",
  finish: "f",
  imageUrl: "/x.svg",
  featured: false,
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  tiers,
};

describe("pricing", () => {
  it("applies the largest tier at or below the quantity", () => {
    expect(computeItemPrice(product, 50)).toBe(1200);
    expect(computeItemPrice(product, 100)).toBe(1800);
    expect(computeItemPrice(product, 250)).toBe(3500);
    expect(computeItemPrice(product, 500)).toBe(5500);
  });

  it("uses the smallest tier for quantities below the minimum", () => {
    expect(computeItemPrice(product, 10)).toBe(240);
  });

  it("applies bulk pricing above the largest tier", () => {
    expect(computeItemPrice(product, 1000)).toBe(11000);
  });

  it("computes a deterministic per-card price", () => {
    expect(computePerCardPrice(product, 100)).toBe(18);
    expect(computePerCardPrice(product, 250) * 250).toBe(computeItemPrice(product, 250));
  });

  it("computes per-card price for odd rates without drift", () => {
    const odd: PriceTier[] = [{ id: "x", productId: "p", quantity: 50, pricePer100: 1150 }];
    expect(computePerCardPrice({ ...product, tiers: odd }, 50)).toBe(12);
  });
});

describe("shipping", () => {
  it("charges the flat rate below the threshold", () => {
    expect(computeShipping(FREE_SHIPPING_THRESHOLD_CENTS - 1)).toBe(SHIPPING_FLAT_CENTS);
  });

  it("is free at and above the threshold", () => {
    expect(computeShipping(FREE_SHIPPING_THRESHOLD_CENTS)).toBe(0);
    expect(computeShipping(30000)).toBe(0);
  });
});

describe("references", () => {
  it("generates unique prefixed references", () => {
    const a = generateReference();
    const b = generateReference();
    expect(a).toMatch(/^CT-[A-Z0-9-]+$/);
    expect(a).not.toBe(b);
  });
});
