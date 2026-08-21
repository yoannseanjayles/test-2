import "server-only";

/**
 * Contrôle du contenu réel des fichiers d'import (audit 2026-08, MO-4).
 *
 * L'import n'inspectait ni le type MIME ni les octets d'en-tête : n'importe
 * quel fichier était lu en UTF-8 puis passé à une batterie d'expressions
 * régulières. Le risque restait faible — action réservée au rôle Catalogue,
 * fichier jamais stocké ni servi — mais quinze mégaoctets de binaire à
 * travers les regex du parseur suffisent à faire expirer la fonction.
 *
 * On attend une page enregistrée depuis le navigateur : HTML ou snapshot
 * MHTML. Renvoie un message d'erreur, ou `null` si le fichier est plausible.
 */
export function rejectNonPageFile(
  fileName: string,
  mimeType: string,
  buffer: Buffer,
): string | null {
  const name = fileName.toLowerCase();
  const extensionOk = /\.(html?|mhtml|mht|xhtml|txt)$/.test(name);
  // Chrome envoie parfois un type vide pour un .mhtml — l'extension tranche.
  const mimeOk =
    mimeType === "" ||
    /^(text\/(html|plain)|application\/(x-mimearchive|xhtml\+xml)|message\/rfc822)$/.test(mimeType);
  if (!extensionOk) return "Format inattendu — enregistrez la page en .html ou .mhtml.";
  if (!mimeOk) return `Type de fichier refusé (${mimeType}).`;

  // Signatures binaires courantes : archive, exécutable, image, PDF.
  const head = buffer.subarray(0, 8);
  const magics: [string, number[]][] = [
    ["archive ZIP/Office", [0x50, 0x4b, 0x03, 0x04]],
    ["exécutable Windows", [0x4d, 0x5a]],
    ["exécutable ELF", [0x7f, 0x45, 0x4c, 0x46]],
    ["PDF", [0x25, 0x50, 0x44, 0x46]],
    ["image PNG", [0x89, 0x50, 0x4e, 0x47]],
    ["image GIF", [0x47, 0x49, 0x46, 0x38]],
    ["archive RAR", [0x52, 0x61, 0x72, 0x21]],
    ["archive gzip", [0x1f, 0x8b]],
  ];
  for (const [label, magic] of magics) {
    if (magic.every((byte, i) => head[i] === byte)) {
      return `Fichier ${label} refusé — une page enregistrée est attendue.`;
    }
  }

  // Un octet nul dans le premier kilo-octet trahit du binaire : les pages
  // HTML et les snapshots MHTML sont du texte.
  if (buffer.subarray(0, 1024).includes(0x00)) {
    return "Contenu binaire refusé — une page enregistrée est attendue.";
  }
  return null;
}
