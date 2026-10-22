import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { prisma } from "../lib/prisma.js";
import type { Express } from "express";

const ADMIN_TOKEN = "test-admin-token";

const productPayload = {
  name: "Test Card",
  slug: "test-card",
  description: "A card used in integration tests.",
  category: "classic",
  material: "350gsm",
  finish: "Matte",
  imageUrl: "/images/cards/classic-matte.svg",
  featured: false,
  active: true,
  tiers: [
    { quantity: 50, pricePer100: 2000 },
    { quantity: 100, pricePer100: 1500 },
  ],
};

const orderPayload = {
  email: "buyer@example.com",
  fullName: "Test Buyer",
  addressLine1: "1 Main St",
  city: "Casablanca",
  postalCode: "20000",
  country: "MA",
  phone: "+212612345678",
  items: [
    {
      productSlug: "test-card",
      quantity: 100,
      custom: {
        template: "classic",
        bg: "#FFFFFF",
        accent: "#000000",
        font: "Inter",
        text: { name: "Test Buyer", title: "", company: "", phone: "", email: "", website: "", address: "" },
      },
    },
  ],
};

let app: Express;

beforeAll(async () => {
  app = createApp();
  await prisma.product.deleteMany();
  await prisma.product.create({ data: { ...productPayload, tiers: { create: productPayload.tiers } } });
});

describe("public API", () => {
  it("GET /api/health returns ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("lists products with tiers", async () => {
    const res = await request(app).get("/api/products");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].tiers).toHaveLength(2);
  });

  it("filters by category", async () => {
    const res = await request(app).get("/api/products?category=premium");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it("searches products", async () => {
    const res = await request(app).get("/api/products?search=test");
    expect(res.body.data).toHaveLength(1);
  });

  it("returns 404 for unknown products", async () => {
    const res = await request(app).get("/api/products/does-not-exist");
    expect(res.status).toBe(404);
  });
});

describe("orders", () => {
  it("creates an order with server-computed prices (demo mode)", async () => {
    const res = await request(app).post("/api/orders").send(orderPayload);
    expect(res.status).toBe(201);
    expect(res.body.data.isDemo).toBe(true);
    expect(res.body.data.status).toBe("CONFIRMED");
    expect(res.body.data.total).toBe(1990);

    const order = await prisma.order.findUnique({ where: { reference: res.body.data.reference }, include: { items: true } });
    expect(order).not.toBeNull();
    expect(order!.items[0]!.unitPrice).toBe(15);
    expect(order!.items[0]!.totalPrice).toBe(1500);
    expect(order!.subtotal).toBe(1500);
    expect(order!.shipping).toBe(490);
  });

  it("rejects a cart with a product below its minimum quantity", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ ...orderPayload, items: [{ ...orderPayload.items[0]!, quantity: 10 }] });
    expect(res.status).toBe(422);
    expect(res.body.error.detail.code).toBe("QUANTITY_BELOW_MINIMUM");
  });

  it("rejects unknown products", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ ...orderPayload, items: [{ ...orderPayload.items[0]!, productSlug: "nope" }] });
    expect(res.status).toBe(400);
  });

  it("rejects invalid payloads with 422 and field errors", async () => {
    const res = await request(app).post("/api/orders").send({ email: "x" });
    expect(res.status).toBe(422);
    expect(res.body.error.fields).toBeDefined();
  });

  it("fetches an order by reference", async () => {
    const created = await request(app).post("/api/orders").send(orderPayload);
    const res = await request(app).get(`/api/orders/${created.body.data.reference}`);
    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(1);
  });

  it("rejects malformed references", async () => {
    const res = await request(app).get("/api/orders/../../etc");
    expect(res.status).toBe(404);
  });
});

describe("admin API", () => {
  it("requires the admin token", async () => {
    const res = await request(app).get("/api/admin/products");
    expect(res.status).toBe(401);
  });

  it("lists products with a valid token", async () => {
    const res = await request(app).get("/api/admin/products").set("Authorization", `Bearer ${ADMIN_TOKEN}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it("creates a product", async () => {
    const res = await request(app)
      .post("/api/admin/products")
      .set("Authorization", `Bearer ${ADMIN_TOKEN}`)
      .send({ ...productPayload, slug: "test-card-2", name: "Test Card 2" });
    expect(res.status).toBe(201);
    expect(res.body.data.slug).toBe("test-card-2");
  });

  it("rejects duplicate slugs with 409", async () => {
    const res = await request(app)
      .post("/api/admin/products")
      .set("Authorization", `Bearer ${ADMIN_TOKEN}`)
      .send(productPayload);
    expect(res.status).toBe(409);
  });

  it("updates a product and its tiers", async () => {
    const list = await request(app).get("/api/admin/products").set("Authorization", `Bearer ${ADMIN_TOKEN}`);
    const id = list.body.data.find((p: { slug: string }) => p.slug === "test-card-2")!.id;
    const res = await request(app)
      .patch(`/api/admin/products/${id}`)
      .set("Authorization", `Bearer ${ADMIN_TOKEN}`)
      .send({ featured: true, tiers: [{ quantity: 250, pricePer100: 1200 }] });
    expect(res.status).toBe(200);
    expect(res.body.data.featured).toBe(true);
    expect(res.body.data.tiers).toHaveLength(1);
  });

  it("deletes a product", async () => {
    const list = await request(app).get("/api/admin/products").set("Authorization", `Bearer ${ADMIN_TOKEN}`);
    const id = list.body.data.find((p: { slug: string }) => p.slug === "test-card-2")!.id;
    const res = await request(app).delete(`/api/admin/products/${id}`).set("Authorization", `Bearer ${ADMIN_TOKEN}`);
    expect(res.status).toBe(204);
  });

  it("lists orders and updates their status", async () => {
    const created = await request(app).post("/api/orders").send(orderPayload);
    const id = created.body.data.reference;

    const list = await request(app).get("/api/admin/orders").set("Authorization", `Bearer ${ADMIN_TOKEN}`);
    expect(list.status).toBe(200);
    const target = list.body.data.find((o: { reference: string }) => o.reference === id)!;

    const res = await request(app)
      .patch(`/api/admin/orders/${target.id}`)
      .set("Authorization", `Bearer ${ADMIN_TOKEN}`)
      .send({ status: "CANCELLED" });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("CANCELLED");
  });

  it("rejects invalid status changes", async () => {
    const list = await request(app).get("/api/admin/orders").set("Authorization", `Bearer ${ADMIN_TOKEN}`);
    const res = await request(app)
      .patch(`/api/admin/orders/${list.body.data[0]!.id}`)
      .set("Authorization", `Bearer ${ADMIN_TOKEN}`)
      .send({ status: "HACKED" });
    expect(res.status).toBe(422);
  });
});

describe("admin image upload", () => {
  const PNG_1x1 = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  );

  it("requires the admin token", async () => {
    const res = await request(app)
      .post("/api/admin/upload")
      .attach("image", PNG_1x1, { filename: "pixel.png", contentType: "image/png" });
    expect(res.status).toBe(401);
  });

  it("accepts a PNG and serves it back", async () => {
    const res = await request(app)
      .post("/api/admin/upload")
      .set("Authorization", `Bearer ${ADMIN_TOKEN}`)
      .attach("image", PNG_1x1, { filename: "pixel.png", contentType: "image/png" });
    expect(res.status).toBe(201);
    expect(res.body.data.url).toMatch(/^\/uploads\/.+\.png$/);

    const fetched = await request(app).get(res.body.data.url);
    expect(fetched.status).toBe(200);
    expect(fetched.headers["content-type"]).toBe("image/png");
  });

  it("rejects non-image files", async () => {
    const res = await request(app)
      .post("/api/admin/upload")
      .set("Authorization", `Bearer ${ADMIN_TOKEN}`)
      .attach("image", Buffer.from("MZ this is not an image"), { filename: "evil.exe", contentType: "application/octet-stream" });
    expect(res.status).toBe(422);
  });

  it("rejects files over 2 MB", async () => {
    const res = await request(app)
      .post("/api/admin/upload")
      .set("Authorization", `Bearer ${ADMIN_TOKEN}`)
      .attach("image", Buffer.alloc(3 * 1024 * 1024), { filename: "big.png", contentType: "image/png" });
    expect(res.status).toBe(422);
  });
});
