import { expect, test } from "@playwright/test";

const ADMIN_TOKEN = "cartelier-demo-admin-token";

const PNG_1x1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

test.describe("admin dashboard", () => {
  test("requires login and manages products and orders", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByText("Enter the admin token")).toBeVisible();

    await page.getByPlaceholder("ADMIN_TOKEN").fill("wrong-token");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.getByText(/invalid admin token/i)).toBeVisible();

    await page.getByPlaceholder("ADMIN_TOKEN").fill(ADMIN_TOKEN);
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page.getByRole("button", { name: /products/i })).toBeVisible();
    await expect(page.getByText("Gold Foil Luxury")).toBeVisible();

    await page.getByRole("button", { name: /new product/i }).click();
    const slug = `e2e-card-${Date.now()}`;
    await page.getByLabel(/name \*/i).fill("E2E Card");
    await page.getByLabel(/slug \*/i).fill(slug);
    await page.getByLabel(/description \*/i).fill("Created by the end-to-end test.");
    await page.getByLabel(/material \*/i).fill("350gsm");
    await page.getByLabel(/finish \*/i).fill("Matte");

    await page.locator('input[type="file"]').setInputFiles({
      name: "pixel.png",
      mimeType: "image/png",
      buffer: PNG_1x1,
    });
    await expect(page.locator('img[alt="Product preview"]')).toHaveAttribute("src", /^\/uploads\//);

    await page.getByRole("button", { name: /create product/i }).click();

    await expect(page.getByText(slug)).toBeVisible();

    await page.getByRole("button", { name: /orders/i }).click();
    await expect(page.getByText(/no orders yet|reference/i).first()).toBeVisible();
  });
});
