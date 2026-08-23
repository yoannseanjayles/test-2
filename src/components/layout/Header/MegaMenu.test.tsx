import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MegaMenu } from "./MegaMenu";
import { mainNav } from "@/lib/navigation";

/**
 * Couvre D-002 (catégorie parente cliquable) et l'accessibilité clavier du
 * méga-menu. Porté sur l'axe rayon (refonte streetwear) : c'est le même
 * contrat, sur une autre taxonomie.
 */
describe("MegaMenu", () => {
  it("garde le rayon parent cliquable (D-002)", () => {
    render(<MegaMenu sections={mainNav} />);
    expect(screen.getByRole("link", { name: "Homme" })).toHaveAttribute(
      "href",
      "/homme",
    );
  });

  it("ouvre le panneau au clavier via le bouton disclosure et expose les colonnes", async () => {
    render(<MegaMenu sections={mainNav} />);
    const trigger = screen.getByRole("button", { name: "Afficher le menu Chaussures" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    trigger.focus();
    await userEvent.keyboard("{Enter}");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("link", { name: "Toutes les chaussures" }),
    ).toHaveAttribute("href", "/chaussures");
    expect(screen.getByRole("link", { name: "Running route" })).toHaveAttribute(
      "href",
      "/on/running",
    );
    // La marque n'est plus une entrée de premier niveau, mais reste une colonne.
    expect(screen.getByRole("link", { name: "Salomon" })).toHaveAttribute(
      "href",
      "/salomon",
    );
  });

  it("annonce les rayons pas encore ouverts", () => {
    render(<MegaMenu sections={mainNav} />);
    const ensembles = screen.getByRole("link", { name: /Ensembles/ });
    expect(ensembles).toHaveAttribute("href", "/ensembles");
    expect(ensembles).toHaveTextContent("Bientôt");
  });

  it("ferme le panneau avec Échap (4.1 §10)", async () => {
    render(<MegaMenu sections={mainNav} />);
    const trigger = screen.getByRole("button", { name: "Afficher le menu Femme" });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    await userEvent.keyboard("{Escape}");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
});
