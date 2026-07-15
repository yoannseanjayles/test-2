/**
 * Sérialisation du corps des guides pour l'édition back-office (7.1 jalon 4) :
 * une section par titre « ## », paragraphes séparés par une ligne vide.
 * Format volontairement minimal — pas de Markdown complet (D-037 : contenu
 * structuré en sections ancrées).
 */

export type GuideSection = { heading: string; paragraphs: string[] };

export function serializeGuideContent(content: GuideSection[] | null | undefined): string {
  if (!content || content.length === 0) return "";
  return content
    .map((s) => `## ${s.heading}\n\n${s.paragraphs.join("\n\n")}`)
    .join("\n\n");
}

export function parseGuideContent(text: string): GuideSection[] | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const sections: GuideSection[] = [];
  let current: GuideSection | null = null;
  for (const block of trimmed.split(/\n{2,}/)) {
    const piece = block.trim();
    if (!piece) continue;
    if (piece.startsWith("## ")) {
      // Un « ## » peut être suivi de son premier paragraphe dans le même bloc.
      const [headingLine, ...rest] = piece.split("\n");
      current = { heading: headingLine!.slice(3).trim(), paragraphs: [] };
      sections.push(current);
      const remainder = rest.join("\n").trim();
      if (remainder) current.paragraphs.push(remainder);
    } else if (current) {
      current.paragraphs.push(piece.replace(/\n/g, " "));
    } else {
      // Texte avant le premier titre : section implicite.
      current = { heading: "Introduction", paragraphs: [piece.replace(/\n/g, " ")] };
      sections.push(current);
    }
  }
  return sections.length > 0 ? sections : null;
}
