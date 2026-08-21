import { describe, expect, it } from "vitest";
import { rejectNonPageFile } from "./import-guard";

/** Contrôle du contenu des fichiers d'import (audit 2026-08, MO-4). */

const html = (body = "<html><head><title>Produit</title></head></html>") =>
  Buffer.from(body, "utf-8");

describe("rejectNonPageFile", () => {
  it("accepte une page HTML enregistrée", () => {
    expect(rejectNonPageFile("produit.html", "text/html", html())).toBeNull();
  });

  it("accepte un snapshot MHTML, y compris sans type MIME", () => {
    const mhtml = Buffer.from("From: <Saved by Blink>\r\nSnapshot-Content-Location: https://…", "utf-8");
    expect(rejectNonPageFile("produit.mhtml", "", mhtml)).toBeNull();
    expect(rejectNonPageFile("produit.mht", "message/rfc822", mhtml)).toBeNull();
  });

  it("refuse une extension inattendue", () => {
    expect(rejectNonPageFile("charge.js", "text/html", html())).toMatch(/Format inattendu/);
    expect(rejectNonPageFile("archive.zip", "text/html", html())).toMatch(/Format inattendu/);
  });

  it("refuse un type MIME non textuel", () => {
    expect(rejectNonPageFile("produit.html", "application/octet-stream", html()))
      .toMatch(/Type de fichier refusé/);
  });

  it("refuse un binaire déguisé en .html (magic bytes)", () => {
    const cases: [string, number[]][] = [
      ["archive ZIP/Office", [0x50, 0x4b, 0x03, 0x04]],
      ["exécutable Windows", [0x4d, 0x5a, 0x90, 0x00]],
      ["exécutable ELF", [0x7f, 0x45, 0x4c, 0x46]],
      ["PDF", [0x25, 0x50, 0x44, 0x46]],
      ["image PNG", [0x89, 0x50, 0x4e, 0x47]],
      ["archive gzip", [0x1f, 0x8b, 0x08, 0x00]],
    ];
    for (const [label, magic] of cases) {
      const buffer = Buffer.concat([Buffer.from(magic), Buffer.alloc(64, 0x41)]);
      expect(rejectNonPageFile("piege.html", "text/html", buffer), label).toMatch(/refusé/);
    }
  });

  it("refuse du binaire sans signature connue via l'octet nul", () => {
    const buffer = Buffer.concat([Buffer.from("<html>", "utf-8"), Buffer.alloc(32, 0x00)]);
    expect(rejectNonPageFile("piege.html", "text/html", buffer)).toMatch(/binaire/);
  });

  it("laisse passer une page contenant des accents et des emoji", () => {
    expect(rejectNonPageFile("produit.html", "text/html", html("<h1>Collier — 49,90 € 🐕</h1>")))
      .toBeNull();
  });
});
