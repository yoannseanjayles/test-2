import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Accordion } from "./Accordion";

const items = [
  { title: "Caractéristiques", content: "Cuir pleine fleur, boucle laiton." },
  { title: "Entretien", content: "Nourrir le cuir deux fois par an." },
];

describe("Accordion", () => {
  it("ouvre et ferme un panneau au clic", async () => {
    render(<Accordion items={items} />);
    const trigger = screen.getByRole("button", { name: "Caractéristiques" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Cuir pleine fleur, boucle laiton.")).toBeVisible();

    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("n'ouvre qu'un panneau à la fois", async () => {
    render(<Accordion items={items} defaultOpen={0} />);
    await userEvent.click(screen.getByRole("button", { name: "Entretien" }));
    expect(
      screen.getByRole("button", { name: "Caractéristiques" }),
    ).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("Nourrir le cuir deux fois par an.")).toBeVisible();
  });

  it("est accessible (axe)", async () => {
    const { container } = render(<Accordion items={items} defaultOpen={0} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
