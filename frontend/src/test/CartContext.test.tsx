import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CartProvider, useCart } from "../context/CartContext";
import type { CardCustomization } from "../types";

const custom: CardCustomization = {
  template: "classic",
  bg: "#14141A",
  accent: "#C9A227",
  font: "Playfair Display",
  text: { name: "Jane Doe", title: "", company: "", phone: "", email: "", website: "", address: "" },
};

function CartProbe() {
  const { items, count, subtotal, addItem, updateQuantity, removeItem, clear } = useCart();
  return (
    <div>
      <span data-testid="count">{count}</span>
      <span data-testid="subtotal">{subtotal}</span>
      <span data-testid="items">{items.length}</span>
      <button type="button" onClick={() => addItem({ productSlug: "gold", productName: "Gold", imageUrl: "/x.svg", quantity: 2, unitPrice: 4800, custom })}>
        add
      </button>
      <button type="button" onClick={() => addItem({ productSlug: "gold", productName: "Gold", imageUrl: "/x.svg", quantity: 3, unitPrice: 4800, custom })}>
        add-more
      </button>
      <button type="button" onClick={() => updateQuantity(items[0]?.key ?? "", 5)}>set-qty</button>
      <button type="button" onClick={() => removeItem(items[0]?.key ?? "")}>remove</button>
      <button type="button" onClick={clear}>clear</button>
    </div>
  );
}

describe("CartContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("adds an item and computes totals", async () => {
    render(
      <CartProvider>
        <CartProbe />
      </CartProvider>,
    );
    await userEvent.click(screen.getByText("add"));
    expect(screen.getByTestId("count").textContent).toBe("2");
    expect(screen.getByTestId("subtotal").textContent).toBe("9600");
  });

  it("merges identical customizations instead of duplicating", async () => {
    render(
      <CartProvider>
        <CartProbe />
      </CartProvider>,
    );
    await userEvent.click(screen.getByText("add"));
    await userEvent.click(screen.getByText("add-more"));
    expect(screen.getByTestId("items").textContent).toBe("1");
    expect(screen.getByTestId("count").textContent).toBe("5");
    expect(screen.getByTestId("subtotal").textContent).toBe("24000");
  });

  it("updates and removes items", async () => {
    render(
      <CartProvider>
        <CartProbe />
      </CartProvider>,
    );
    await userEvent.click(screen.getByText("add"));
    await userEvent.click(screen.getByText("set-qty"));
    expect(screen.getByTestId("count").textContent).toBe("5");
    await userEvent.click(screen.getByText("remove"));
    expect(screen.getByTestId("items").textContent).toBe("0");
    expect(screen.getByTestId("subtotal").textContent).toBe("0");
  });

  it("clears the cart", async () => {
    render(
      <CartProvider>
        <CartProbe />
      </CartProvider>,
    );
    await userEvent.click(screen.getByText("add"));
    await userEvent.click(screen.getByText("clear"));
    expect(screen.getByTestId("count").textContent).toBe("0");
  });

  it("persists the cart to localStorage", async () => {
    render(
      <CartProvider>
        <CartProbe />
      </CartProvider>,
    );
    await userEvent.click(screen.getByText("add"));
    expect(localStorage.getItem("cartelier.cart.v1")).toContain("gold");
  });
});
