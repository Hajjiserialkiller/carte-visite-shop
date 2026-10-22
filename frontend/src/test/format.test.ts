import { describe, expect, it } from "vitest";
import {
  computeUnitPrice,
  computeTotalPrice,
  computeShippingCents,
  formatPrice,
  validHex,
} from "../lib/format";

const tiers = [
  { quantity: 50, pricePer100: 2400 },
  { quantity: 100, pricePer100: 1800 },
  { quantity: 250, pricePer100: 1400 },
];

describe("format utils", () => {
  it("formats cents as currency", () => {
    expect(formatPrice(490, "en")).toBe("€4.90");
    expect(formatPrice(1500, "fr-FR")).toContain("15,00");
    expect(formatPrice(0, "en")).toBe("€0.00");
  });

  it("computes the unit price at tier boundaries", () => {
    expect(computeUnitPrice(tiers, 50)).toBe(24);
    expect(computeUnitPrice(tiers, 100)).toBe(18);
    expect(computeUnitPrice(tiers, 250)).toBe(14);
  });

  it("falls back to the smallest tier below the minimum", () => {
    expect(computeUnitPrice(tiers, 25)).toBe(24);
  });

  it("extends bulk pricing above the largest tier", () => {
    expect(computeUnitPrice(tiers, 500)).toBe(14);
  });

  it("computes totals consistently with the unit price", () => {
    expect(computeTotalPrice(tiers, 100)).toBe(1800);
    expect(computeTotalPrice(tiers, 250)).toBe(3500);
  });

  it("handles empty tier lists", () => {
    expect(computeUnitPrice([], 100)).toBe(0);
    expect(computeTotalPrice([], 100)).toBe(0);
  });

  it("computes shipping with the free threshold", () => {
    expect(computeShippingCents(1000)).toEqual({ shipping: 490, free: false });
    expect(computeShippingCents(15000)).toEqual({ shipping: 0, free: true });
    expect(computeShippingCents(50000)).toEqual({ shipping: 0, free: true });
  });

  it("validates hex colors", () => {
    expect(validHex("#C9A227")).toBe(true);
    expect(validHex("#000000")).toBe(true);
    expect(validHex("red")).toBe(false);
    expect(validHex("#12345")).toBe(false);
  });
});
