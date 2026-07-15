// @vitest-environment node
import { describe, expect, it } from "vitest";
import { extractHtml, parseAliexpressPage } from "./aliexpress";

/**
 * Fixture reproduisant la structure d'un snapshot MHTML Chrome d'une page
 * produit AliExpress (vérifiée sur un fichier réel, 7.1 jalon 2) :
 * quoted-printable, photos sur ae-pic-*.aliexpress-media.com en _220x220,
 * icônes NxN à exclure, coupon « 1,00 € » précédé du prix réel.
 */
const HTML_BODY = `<html><head>
<meta property="og:title" content="Fontaine a eau pour chat 1200ml sans fil"/>
<meta property="og:url" content="https://fr.aliexpress.com/item/1005006576542.html"/>
<meta property="og:description" content="Fontaine silencieuse 1200 ml, pompe basse consommation, filtration triple couche."/>
<title>Fontaine a eau pour chat | AliExpress</title>
</head><body>
<span>11,99 €</span>
<span>Coupon 1,00 €</span>
<span>Prix barre 39,99 €</span>
<img src="https://ae-pic-a1.aliexpress-media.com/kf/S111.jpg_220x220q75.jpg_.avif" alt="vue 1">
<img src="https://ae-pic-a1.aliexpress-media.com/kf/S222.jpg_960x960q75.jpg_.avif" alt="vue 2">
<img src="https://ae-pic-a1.aliexpress-media.com/kf/S222.jpg_220x220q75.jpg_.avif" alt="doublon miniature">
<img data-src="https://ae-pic-a1.aliexpress-media.com/kf/S444.jpg_720x720q75.jpg_.avif" alt="lazy loading">
<script>window.runParams={"imagePathList":["https:\\u002F\\u002Fae-pic-a1.aliexpress-media.com\\u002Fkf\\u002FS555.jpg_960x960q75.jpg_.avif"]}</script>
<img src="https://ae01.alicdn.com/kf/S333.jpg" alt="notice">
<img src="https://ae01.alicdn.com/kf/Sicone/79x79.png" alt="">
<img src="https://example.com/pub.jpg" alt="hors CDN produit">
</body></html>`;

function toMhtml(body: string): string {
  // Chrome encode les multi-octets UTF-8 (€ → =E2=82=AC) en quoted-printable.
  const quoted = body.replace(/=/g, "=3D").replace(/€/g, "=E2=82=AC");
  return [
    "From: <Saved by Blink>",
    "Snapshot-Content-Location: https://fr.aliexpress.com/item/1005006576542.html",
    "Subject: Fontaine",
    "MIME-Version: 1.0",
    'Content-Type: multipart/related; type="text/html"; boundary="----MultipartBoundary--abc----"',
    "",
    "------MultipartBoundary--abc----",
    "Content-Type: text/html",
    "Content-Transfer-Encoding: quoted-printable",
    "Content-Location: https://fr.aliexpress.com/item/1005006576542.html",
    "",
    quoted,
    "------MultipartBoundary--abc------",
  ].join("\r\n");
}

describe("extractHtml", () => {
  it("décode la partie HTML quoted-printable d'un .mht et lit l'URL d'origine", () => {
    const { html, sourceUrl } = extractHtml(toMhtml(HTML_BODY));
    expect(sourceUrl).toBe("https://fr.aliexpress.com/item/1005006576542.html");
    expect(html).toContain('property="og:title"');
  });

  it("laisse passer un .html brut tel quel", () => {
    expect(extractHtml(HTML_BODY).html).toBe(HTML_BODY);
  });
});

describe("parseAliexpressPage", () => {
  const parsed = parseAliexpressPage(toMhtml(HTML_BODY))!;

  it("lit le titre depuis og:title", () => {
    expect(parsed.title).toBe("Fontaine a eau pour chat 1200ml sans fil");
  });

  it("prend le premier prix du document ≥ 2 € (le bloc prix précède les coupons)", () => {
    expect(parsed.supplierPrice).toBe(1199);
  });

  it("extrait les photos des deux CDN — src, data-src et JSON échappé des scripts — en 960x960, sans icônes ni doublons", () => {
    expect(parsed.images).toEqual([
      "https://ae-pic-a1.aliexpress-media.com/kf/S111.jpg_960x960q75.jpg_.avif",
      "https://ae-pic-a1.aliexpress-media.com/kf/S222.jpg_960x960q75.jpg_.avif",
      "https://ae-pic-a1.aliexpress-media.com/kf/S444.jpg_960x960q75.jpg_.avif",
      "https://ae-pic-a1.aliexpress-media.com/kf/S555.jpg_960x960q75.jpg_.avif",
      "https://ae01.alicdn.com/kf/S333.jpg",
    ]);
  });

  it("lit la référence article et la description fournisseur", () => {
    expect(parsed.supplierRef).toBe("1005006576542");
    expect(parsed.description).toBe(
      "Fontaine silencieuse 1200 ml, pompe basse consommation, filtration triple couche.",
    );
  });

  it("retrouve l'URL d'origine via og:url sur un .html brut (sans en-tête de snapshot)", () => {
    const parsedHtml = parseAliexpressPage(HTML_BODY)!;
    expect(parsedHtml.sourceUrl).toBe("https://fr.aliexpress.com/item/1005006576542.html");
    expect(parsedHtml.supplierRef).toBe("1005006576542");
  });

  it("renvoie null sans titre exploitable", () => {
    expect(parseAliexpressPage("<html><body>rien</body></html>")).toBeNull();
  });
});
