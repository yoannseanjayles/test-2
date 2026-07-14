import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MegaMenu } from "./MegaMenu";
import { animalCategories } from "@/lib/navigation";

describe("MegaMenu", () => {
  it("garde la catégorie parente cliquable (D-002)", () => {
    render(<MegaMenu categories={animalCategories} />);
    expect(screen.getByRole("link", { name: "Chien" })).toHaveAttribute(
      "href",
      "/chien",
    );
  });

  it("ouvre le panneau au clavier via le bouton disclosure et expose les sous-catégories", async () => {
    render(<MegaMenu categories={animalCategories} />);
    const trigger = screen.getByRole("button", {
      name: "Afficher les sous-catégories Chien",
    });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    trigger.focus();
    await userEvent.keyboard("{Enter}");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("link", { name: "Colliers & Harnais" }),
    ).toHaveAttribute("href", "/chien/colliers-harnais");
    expect(
      screen.getByRole("link", { name: /Tout voir Chien/ }),
    ).toHaveAttribute("href", "/chien");
  });

  it("ferme le panneau avec Échap (4.1 §10)", async () => {
    render(<MegaMenu categories={animalCategories} />);
    const trigger = screen.getByRole("button", {
      name: "Afficher les sous-catégories Chat",
    });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    await userEvent.keyboard("{Escape}");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
});
