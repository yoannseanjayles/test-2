import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Button } from "./Button";

describe("Button", () => {
  it("rend un bouton accessible sans violation axe", async () => {
    const { container } = render(<Button>Ajouter au panier</Button>);
    expect(screen.getByRole("button", { name: "Ajouter au panier" })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("déclenche onClick", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Valider</Button>);
    await userEvent.click(screen.getByRole("button", { name: "Valider" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("conserve le label et se désactive en état loading (4.1 §6)", () => {
    render(<Button loading>Ajouter au panier</Button>);
    const button = screen.getByRole("button", { name: "Ajouter au panier" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("ne déclenche pas onClick quand désactivé", async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Valider
      </Button>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Valider" }));
    expect(onClick).not.toHaveBeenCalled();
  });
});
