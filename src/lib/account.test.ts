import { describe, expect, it } from "vitest";
import {
  isReturnEligible,
  orderStatuses,
  orderTransitions,
  statusDescriptions,
  statusIndex,
} from "./account";

describe("statusIndex (timeline D-016)", () => {
  it("place les statuts nominaux dans l'ordre", () => {
    expect(orderStatuses.map(statusIndex)).toEqual([0, 1, 2, 3, 4]);
  });

  it("compte « Payée (démonstration) » comme payée", () => {
    expect(statusIndex("Payée (démonstration)")).toBe(0);
  });

  it("renvoie -1 pour les statuts hors parcours (affichés en badge)", () => {
    for (const s of ["En attente de paiement", "Échec de paiement", "Retour en cours", "Remboursée", "Annulée"]) {
      expect(statusIndex(s)).toBe(-1);
    }
  });
});

describe("orderTransitions (D-016)", () => {
  it("suit le parcours nominal Payée → … → Clôturée", () => {
    expect(orderTransitions["Payée"]).toContain("En préparation");
    expect(orderTransitions["En préparation"]).toContain("Expédiée");
    expect(orderTransitions["Expédiée"]).toContain("Livrée");
    expect(orderTransitions["Livrée"]).toContain("Clôturée");
  });

  it("mène tout retour vers Remboursée, et Remboursée/Annulée sont terminaux", () => {
    expect(orderTransitions["Retour en cours"]).toEqual(["Remboursée"]);
    expect(orderTransitions["Remboursée"]).toBeUndefined();
    expect(orderTransitions["Annulée"]).toBeUndefined();
  });

  it("interdit d'annuler une commande expédiée (passer par le retour)", () => {
    expect(orderTransitions["Expédiée"]).not.toContain("Annulée");
    expect(orderTransitions["Livrée"]).not.toContain("Annulée");
  });

  it("chaque statut cible existe comme clé de transition ou statut terminal décrit", () => {
    const known = new Set([...Object.keys(orderTransitions), "Remboursée", "Annulée"]);
    for (const targets of Object.values(orderTransitions)) {
      for (const t of targets) expect(known.has(t)).toBe(true);
    }
  });
});

describe("retour self-service (D-035/D-040)", () => {
  it("possible seulement après expédition", () => {
    expect(isReturnEligible("Expédiée")).toBe(true);
    expect(isReturnEligible("Livrée")).toBe(true);
    expect(isReturnEligible("Clôturée")).toBe(true);
    expect(isReturnEligible("Payée")).toBe(false);
    expect(isReturnEligible("En préparation")).toBe(false);
    expect(isReturnEligible("Remboursée")).toBe(false);
  });

  it("chaque statut a un message client", () => {
    for (const s of [...Object.keys(orderTransitions), "Remboursée", "Annulée"]) {
      expect(statusDescriptions[s], `message manquant pour ${s}`).toBeTruthy();
    }
  });
});
