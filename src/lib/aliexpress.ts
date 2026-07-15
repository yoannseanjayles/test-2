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
  /** Nom de la boutique/marque vendeuse. */
  brand: string | null;
  /** Caractéristiques produit (module « Caractéristiques » / attributs SKU). */
  specifications: { label: string; value: string }[];
  /** Noms de variantes (alt des vignettes SKU) — pré-remplissent les coloris. */
  variantNames: string[];
  /** Note fournisseur telle qu'affichée (« 4,7 (1 234 avis) ») — usage interne. */
  supplierRating: string | null;
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

  const clean = (s: string) =>
    s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'")
      .replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

  // Champs texte : recherchés dans le HTML décodé uniquement — le flux MHTML
  // brut est encore en quoted-printable (accents illisibles), on ne l'utilise
  // que pour les URLs d'images (ASCII).
  const textHay = html.replace(/\\u002F/gi, "/").replace(/\\\//g, "/");

  // Marque / boutique vendeuse — JSON des scripts (storeName) sinon texte du
  // lien boutique (/store/<id>) dans le DOM rendu.
  const brand =
    (textHay.match(/"storeName"\s*:\s*"([^"]{2,60})"/)?.[1] ??
      textHay.match(/"sellerShopName"\s*:\s*"([^"]{2,60})"/)?.[1] ??
      html.match(/href="[^"]*\/store\/\d+[^"]*"[^>]*>\s*(?:<[^>]+>\s*)*([^<]{2,60})</)?.[1] ??
      null)?.trim() ?? null;

  // Caractéristiques — attributs produit du JSON (attrName/attrValue) sinon
  // paires libellé/valeur du module « Caractéristiques » rendu.
  const specifications: { label: string; value: string }[] = [];
  const pushSpec = (label: string, value: string) => {
    const l = clean(label);
    const v = clean(value);
    if (l.length >= 2 && l.length <= 60 && v.length >= 1 && v.length <= 200 &&
        l !== v && !specifications.some((s) => s.label === l)) {
      specifications.push({ label: l, value: v });
    }
  };
  for (const m of textHay.matchAll(/"attrName"\s*:\s*"([^"]+)"\s*,\s*"attrValue"\s*:\s*"([^"]+)"/g)) {
    pushSpec(m[1]!, m[2]!);
  }
  if (specifications.length === 0) {
    // DOM rendu (snapshots mobiles) : lignes à deux cellules successives.
    for (const m of html.matchAll(/<(?:span|div|td)[^>]*>([^<>{}]{2,40})<\/(?:span|div|td)>\s*<(?:span|div|td)[^>]*>([^<>{}]{1,120})<\/(?:span|div|td)>/g)) {
      if (/[:：]$/.test(m[1]!.trim()) || /^(Marque|Matière|Matériau|Couleur|Taille|Type|Origine|Poids|Dimension|Modèle|Numéro|Caractéristique|Certification|Usage|Animaux?)/i.test(m[1]!.trim())) {
        pushSpec(m[1]!.replace(/[:：]\s*$/, ""), m[2]!);
      }
    }
  }
  specifications.splice(15);

  // Variantes — alt des vignettes SKU (miniatures produit avec libellé court,
  // distinct du titre) : pré-remplissent les coloris, à ajuster à la main.
  const variantNames = [...new Set(
    [...html.matchAll(/<img[^>]+alt="([^"]{2,40})"[^>]+src="https:\/\/(?:ae0[0-9]\.alicdn\.com|ae-pic-[a-z0-9]+\.aliexpress-media\.com)\/kf\/[^"]+"|<img[^>]+src="https:\/\/(?:ae0[0-9]\.alicdn\.com|ae-pic-[a-z0-9]+\.aliexpress-media\.com)\/kf\/[^"]+"[^>]+alt="([^"]{2,40})"/g)]
      .map((m) => clean(m[1] ?? m[2] ?? ""))
      .filter((alt) => alt.length >= 2 && !title.startsWith(alt) && !alt.startsWith(title.slice(0, 20))),
  )].slice(0, 12);

  // Note fournisseur affichée — « 4.7 » + nombre d'avis (usage interne D-042 :
  // jamais publiée sur notre fiche, aide seulement à la curation).
  const star =
    textHay.match(/"averageStar(?:Rate)?"\s*:\s*"?([0-9][.,][0-9])"?/)?.[1] ??
    html.match(/>([0-9][.,][0-9])\s*<[^>]*>?\s*(?:sur 5|\/\s*5|★)/)?.[1] ??
    null;
  const reviews =
    textHay.match(/"totalValidNum"\s*:\s*"?(\d{1,7})"?/)?.[1] ??
    html.match(/(\d{1,6})\s*avis/i)?.[1] ??
    null;
  const supplierRating = star ? `${star.replace(".", ",")}/5${reviews ? ` (${reviews} avis)` : ""}` : null;

  return {
    title: title.trim().slice(0, 300),
    supplierPrice,
    images,
    sourceUrl,
    supplierRef,
    description,
    brand,
    specifications,
    variantNames,
    supplierRating,
  };
}
