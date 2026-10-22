import { expect, test } from "@playwright/test";

test.describe("customer journey", () => {
  test("browses, customizes, and completes a demo purchase", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /printed to perfection/i })).toBeVisible();

    await page.getByRole("link", { name: /browse the catalog/i }).click();
    await expect(page).toHaveURL(/\/catalog/);
    await expect(page.getByText("Gold Foil Luxury")).toBeVisible();

    await page.getByRole("link", { name: /gold foil luxury/i }).first().click();
    await expect(page.getByRole("heading", { name: "Gold Foil Luxury" })).toBeVisible();
    await page.getByRole("link", { name: /customize this card/i }).click();
    await expect(page).toHaveURL(/\/customize\/premium-gold-foil/);

    await page.getByLabel(/full name/i).fill("E2E Buyer");
    await page.getByLabel(/job title/i).fill("Director");

    await page.getByRole("button", { name: /bold/i }).click();

    const addButton = page.getByRole("button", { name: /add to cart/i });
    await expect(addButton).toBeEnabled();
    await addButton.click();
    await expect(page.getByText(/added to cart/i)).toBeVisible();

    await page.getByRole("link", { name: /checkout/i }).click();
    await expect(page).toHaveURL(/\/checkout/);

    await page.getByLabel(/email/i).fill("buyer@example.com");
    await page.getByLabel(/phone/i).fill("+33612345678");
    await page.getByLabel(/full name/i).fill("E2E Buyer");
    await page.getByLabel("Address *").fill("12 Rue de Rivoli");
    await page.getByLabel(/city/i).fill("Paris");
    await page.getByLabel(/postal code/i).fill("75001");
    await page.getByLabel(/country/i).fill("FR");

    await page.getByRole("button", { name: /place order/i }).click();

    await expect(page).toHaveURL(/\/order\/CT-/);
    await expect(page.getByText(/your order is confirmed/i)).toBeVisible();
    await expect(page.getByText(/buyer@example.com/i)).toBeVisible();
    await expect(page.getByText("E2E Buyer")).toBeVisible();
  });

  test("switches to Arabic with RTL layout", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "العربية" }).click();
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.getByRole("link", { name: "الرئيسية" })).toBeVisible();
  });
});
