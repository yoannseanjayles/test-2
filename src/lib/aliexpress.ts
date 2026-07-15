/**
 * Parseur de pages produit AliExpress téléchargées (D-052/H41) — hors ligne,
 * défensif : Chrome retire les scripts des snapshots MHTML, on lit donc le
 * DOM rendu (og:title, prix affichés, images alicdn, URL d'origine).
 */

export type ParsedProduct = {
  title: string;
  /** Prix fournisseur affiché (centimes) — le plus bas trouvé (promo). */
  supplierPrice: number | null;
  images: string[];
  sourceUrl: string | null;
  /** Référence article AliExpress — l'identifiant des URLs `/item/<réf>.html`. */
  supplierRef: string | null;
  /** Description fournisseur (og:description) — à réécrire avant publication. */
  description: string | null;
};

function decodeQuotedPrintable(text: string): string {
  // Décodage en octets puis UTF-8 : les snapshots Chrome encodent les
  // multi-octets (€, accents) en =E2=82=AC… — un fromCharCode par octet
  // produirait du mojibake et casserait la détection du prix.
  const cleaned = text.replace(/=\r?\n/g, "");
  const bytes: number[] = [];
  for (let i = 0; i < cleaned.length; i++) {
    if (cleaned[i] === "=" && /^[0-9A-Fa-f]{2}$/.test(cleaned.slice(i + 1, i + 3))) {
      bytes.push(parseInt(cleaned.slice(i + 1, i + 3), 16));
      i += 2;
    } else {
      bytes.push(cleaned.charCodeAt(i) & 0xff);
    }
  }
  return Buffer.from(bytes).toString("utf-8");
}

/** Extrait la partie HTML d'un fichier .mht/.mhtml, ou renvoie le HTML tel quel. */
export function extractHtml(raw: string): { html: string; sourceUrl: string | null } {
  const location = raw.match(/^Snapshot-Content-Location:\s*(\S+)/m);
  const sourceUrl = location?.[1] ?? null;
  if (!/^(From|MIME-Version|Subject|Snapshot-Content-Location):/m.test(raw.slice(0, 2000))) {
    return { html: raw, sourceUrl };
  }
  const boundaryMatch = raw.match(/boundary="?([^"\r\n]+)"?/);
  if (!boundaryMatch) return { html: raw, sourceUrl };
  for (const part of raw.split(`--${boundaryMatch[1]}`)) {
    if (!/Content-Type:\s*text\/html/i.test(part)) continue;
    const bodyStart = part.search(/\r?\n\r?\n/);
    if (bodyStart === -1) continue;
    let body = part.slice(bodyStart).trim();
    if (/Content-Transfer-Encoding:\s*quoted-printable/i.test(part)) {
      body = decodeQuotedPrintable(body);
    } else if (/Content-Transfer-Encoding:\s*base64/i.test(part)) {
      try { body = Buffer.from(body, "base64").toString("utf-8"); } catch { /* brut */ }
    }
    return { html: body, sourceUrl };
  }
  return { html: raw, sourceUrl };
}

export function parseAliexpressPage(raw: string): ParsedProduct | null {
  const { html, sourceUrl: snapshotUrl } = extractHtml(raw);
  const title =
    html.match(/property="og:title"\s+content="([^"]+)"/)?.[1] ??
    html.match(/<title[^>]*>([^<]+)</)?.[1]?.replace(/\s*[|-]\s*AliExpress.*$/i, "") ??
    null;
  if (!title) return null;

  // URL d'origine : en-tête du snapshot, sinon og:url / canonical de la page.
  const sourceUrl =
    snapshotUrl ??
    html.match(/property="og:url"\s+content="([^"]+)"/)?.[1] ??
    html.match(/rel="canonical"\s+href="([^"]+)"/)?.[1] ??
    null;
  const supplierRef =
    sourceUrl?.match(/\/item\/(\d{6,20})/)?.[1] ??
    html.match(/\/item\/(\d{6,20})/)?.[1] ??
    null;
  const description =
    html.match(/(?:property|name)="og:description"\s+content="([^"]+)"/)?.[1]?.trim().slice(0, 400) ??
    null;

  // Prix : premier montant « 11,99 € » rencontré dans l'ordre du document —
  // le bloc prix précède coupons et frais sur les pages AliExpress.
  const priceMatches = [...html.matchAll(/([0-9]{1,4})[,.]([0-9]{2})\s*€|€\s*([0-9]{1,4})[.,]([0-9]{2})/g)]
    .map((m) => parseInt(m[1] ?? m[3]!, 10) * 100 + parseInt(m[2] ?? m[4]!, 10))
    .filter((cents) => cents >= 200 && cents <= 100_000);
  const supplierPrice = priceMatches[0] ?? null;

  // Photos produit — recherchées sur tout le document, pas seulement les
  // <img src> : selon la page et le mode d'enregistrement, elles vivent dans
  // src, data-src (lazy loading), srcset, le JSON des <script>, ou les
  // en-têtes Content-Location des parties MHTML (d'où le scan de `raw`).
  // Échappements JSON (/, \/) normalisés avant la recherche.
  // Icônes carrées minuscules exclues (52x48…) ; toute variante
  // redimensionnée (_220x220, _720x720…) remontée vers la 960x960 du CDN.
  const haystack = `${html}\n${raw}`.replace(/\\u002F/gi, "/").replace(/\\\//g, "/");
  const images = [...new Set(
    [...haystack.matchAll(/https:\/\/(?:ae0[0-9]\.alicdn\.com|ae-pic-[a-z0-9]+\.aliexpress-media\.com)\/kf\/[^"'\\\s<>(),;&]+/g)]
      .map((m) => m[0])
      .filter((url) => /\.(?:jpg|jpeg|png|webp|avif)/i.test(url))
      .filter((url) => !/\/\d{2,3}x\d{2,3}[._]/i.test(url))
      .map((url) => url.replace(/_\d{2,3}x\d{2,3}q?\d*\./, "_960x960q75.")),
  )].slice(0, 12);

  return {
    title: title.trim().slice(0, 300),
    supplierPrice,
    images,
    sourceUrl,
    supplierRef,
    description,
  };
}
