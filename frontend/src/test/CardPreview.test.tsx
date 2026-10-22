import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import CardPreview from "../components/CardPreview";
import type { CardCustomization } from "../types";

const custom: CardCustomization = {
  template: "classic",
  bg: "#14141A",
  accent: "#C9A227",
  font: "Playfair Display",
  text: { name: "Jane Doe", title: "Director", company: "Acme", phone: "+33 6", email: "j@a.com", website: "", address: "" },
};

describe("CardPreview", () => {
  it("renders the name and contact details", () => {
    render(<CardPreview custom={custom} />);
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Acme")).toBeInTheDocument();
    expect(screen.getByText("j@a.com")).toBeInTheDocument();
  });

  it("renders every template without crashing", () => {
    for (const template of ["classic", "minimal", "bold", "elegant"] as const) {
      const { container } = render(<CardPreview custom={{ ...custom, template }} />);
      expect(container.querySelector(`[data-template="${template}"]`)).not.toBeNull();
    }
  });

  it("falls back to a placeholder name when empty", () => {
    render(<CardPreview custom={{ ...custom, text: { ...custom.text, name: "" } }} />);
    expect(screen.getByText("Votre nom")).toBeInTheDocument();
  });

  it("shows a watermark", () => {
    render(<CardPreview custom={custom} />);
    expect(screen.getByText("Cartelier")).toBeInTheDocument();
  });
});
