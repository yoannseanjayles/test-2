/**
 * Sérialisation des champs riches de l'entité produit pour les formulaires
 * admin (import enrichi) : une entrée par ligne. Les caractéristiques
 * s'écrivent « libellé : valeur ».
 */

export function parseLines(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 12)
    .map((l) => l.slice(0, 200));
}

export type Spec = { label: string; value: string };

export function parseSpecs(text: string): Spec[] {
  return text
    .split("\n")
    .map((line) => {
      const i = line.indexOf(":");
      if (i < 1) return null;
      const label = line.slice(0, i).trim().slice(0, 60);
      const value = line.slice(i + 1).trim().slice(0, 200);
      return label && value ? { label, value } : null;
    })
    .filter((s): s is Spec => s !== null)
    .slice(0, 15);
}

export function serializeSpecs(specs: Spec[]): string {
  return specs.map((s) => `${s.label} : ${s.value}`).join("\n");
}
