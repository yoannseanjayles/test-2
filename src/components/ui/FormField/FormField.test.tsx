import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { FormField } from "./FormField";

describe("FormField", () => {
  it("associe le label au champ et reste accessible", async () => {
    const { container } = render(
      <FormField label="Adresse e-mail" type="email" help="Jamais partagée." />,
    );
    const input = screen.getByLabelText("Adresse e-mail");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAccessibleDescription("Jamais partagée.");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("annonce l'erreur et la relie au champ (D-033)", async () => {
    const { container } = render(
      <FormField label="Adresse e-mail" error="Adresse invalide." />,
    );
    const input = screen.getByLabelText("Adresse e-mail");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Adresse invalide.");
    expect(input).toHaveAccessibleDescription(/Adresse invalide\./);
    expect(await axe(container)).toHaveNoViolations();
  });
});
