import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Customize from "../pages/Customize";
import { CartProvider } from "../context/CartContext";
import type { Product } from "../types";

vi.mock("../lib/api", () => ({
  getProduct: vi.fn(),
}));

import { getProduct } from "../lib/api";

const product: Product = {
  id: "p1",
  slug: "premium-gold-foil",
  name: "Gold Foil Luxury",
  description: "Hot-stamped gold foil on deep black.",
  category: "premium",
  material: "400gsm cotton",
  finish: "Gold foil",
  imageUrl: "/images/cards/premium-gold-foil.svg",
  featured: true,
  active: true,
  tiers: [
    { id: "t1", quantity: 50, pricePer100: 6200 },
    { id: "t2", quantity: 100, pricePer100: 4800 },
  ],
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/customize/premium-gold-foil"]}>
      <CartProvider>
        <Routes>
          <Route path="/customize/:slug" element={<Customize />} />
        </Routes>
      </CartProvider>
    </MemoryRouter>,
  );
}

describe("Customize page", () => {
  beforeEach(() => {
    vi.mocked(getProduct).mockReset();
    localStorage.clear();
  });

  it("shows a loading state then the product name", async () => {
    vi.mocked(getProduct).mockResolvedValue({ data: product });
    renderPage();
    await waitFor(() => expect(screen.getByText("Gold Foil Luxury")).toBeInTheDocument());
  });

  it("shows a not-found message for missing products", async () => {
    vi.mocked(getProduct).mockRejectedValue(new Error("404"));
    renderPage();
    await waitFor(() => expect(screen.getByText(/no longer available/i)).toBeInTheDocument());
  });

  it("computes the price from the selected quantity tier", async () => {
    vi.mocked(getProduct).mockResolvedValue({ data: product });
    renderPage();
    await waitFor(() => expect(screen.getByText("Gold Foil Luxury")).toBeInTheDocument());

    expect(screen.getByText("€31.00")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "100" }));
    expect(screen.getByText("€48.00")).toBeInTheDocument();
  });

  it("disables add-to-cart until a name is entered", async () => {
    vi.mocked(getProduct).mockResolvedValue({ data: product });
    renderPage();
    await waitFor(() => expect(screen.getByText("Gold Foil Luxury")).toBeInTheDocument());

    const addButton = screen.getByRole("button", { name: /add to cart/i });
    expect(addButton).toBeDisabled();

    await userEvent.type(screen.getByLabelText(/full name/i), "Jane Doe");
    expect(addButton).toBeEnabled();
  });

  it("adds the item to the cart with the chosen customization", async () => {
    vi.mocked(getProduct).mockResolvedValue({ data: product });
    renderPage();
    await waitFor(() => expect(screen.getByText("Gold Foil Luxury")).toBeInTheDocument());

    await userEvent.type(screen.getByLabelText(/full name/i), "Jane Doe");
    await userEvent.click(screen.getByRole("button", { name: /add to cart/i }));

    await waitFor(() => expect(screen.getByText(/added to cart/i)).toBeInTheDocument());
    expect(localStorage.getItem("cartelier.cart.v1")).toContain("Jane Doe");
  });
});
