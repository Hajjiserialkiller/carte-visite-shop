import { beforeAll, describe, expect, it } from "vitest";
import { orderSchema, customizationSchema } from "../validators/order.js";

describe("order validation", () => {
  const validCustom = {
    template: "classic",
    bg: "#14141A",
    accent: "#C9A227",
    font: "Playfair Display",
    text: { name: "Jane Doe", title: "Director", company: "", phone: "", email: "", website: "", address: "" },
  };

  const validOrder = {
    email: "jane@acme.com",
    fullName: "Jane Doe",
    addressLine1: "12 Rue de Rivoli",
    city: "Paris",
    postalCode: "75001",
    country: "FR",
    phone: "+33612345678",
    items: [{ productSlug: "premium-gold-foil", quantity: 100, custom: validCustom }],
  };

  it("accepts a valid order", () => {
    expect(orderSchema.safeParse(validOrder).success).toBe(true);
  });

  it("rejects an invalid email", () => {
    expect(orderSchema.safeParse({ ...validOrder, email: "not-an-email" }).success).toBe(false);
  });

  it("rejects missing name", () => {
    expect(orderSchema.safeParse({ ...validOrder, fullName: "" }).success).toBe(false);
  });

  it("rejects a country that is not 2 letters", () => {
    expect(orderSchema.safeParse({ ...validOrder, country: "FRANCE" }).success).toBe(false);
  });

  it("rejects an empty cart", () => {
    expect(orderSchema.safeParse({ ...validOrder, items: [] }).success).toBe(false);
  });

  it("rejects negative or fractional quantities", () => {
    expect(orderSchema.safeParse({ ...validOrder, items: [{ ...validOrder.items[0]!, quantity: -5 }] }).success).toBe(false);
    expect(orderSchema.safeParse({ ...validOrder, items: [{ ...validOrder.items[0]!, quantity: 1.5 }] }).success).toBe(false);
  });

  it("rejects non-hex colors", () => {
    const bad = { ...validCustom, bg: "red" };
    expect(customizationSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects unknown templates and oversized text", () => {
    expect(customizationSchema.safeParse({ ...validCustom, template: "hack" }).success).toBe(false);
    expect(customizationSchema.safeParse({ ...validCustom, text: { ...validCustom.text, name: "x".repeat(100) } }).success).toBe(false);
  });
});
