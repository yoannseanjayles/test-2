"use client";

import { company } from "@/lib/company";

/**
 * Dernier filet (audit 2026-08, EL-6) : erreur survenue dans le layout
 * racine lui-même, avant que `error.tsx` ne puisse s'appliquer. Ce composant
 * remplace `<html>` et `<body>` — il ne peut donc s'appuyer ni sur les
 * polices ni sur la feuille de styles du layout, d'où les styles en ligne.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          background: "#FAF7F2",
          color: "#2B2622",
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          lineHeight: 1.6,
        }}
      >
        <div style={{ maxWidth: "34rem" }}>
          <p style={{ margin: 0, fontSize: ".8rem", letterSpacing: ".08em", textTransform: "uppercase", color: "#6B615A" }}>
            {company.tradeName}
          </p>
          <h1 style={{ margin: ".5rem 0 0", fontSize: "1.9rem", lineHeight: 1.15 }}>
            Le site est momentanément indisponible.
          </h1>
          <p style={{ margin: "1rem 0 0", color: "#4A423C" }}>
            L'incident a été enregistré. Merci de réessayer dans un instant.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.75rem",
              minHeight: "2.75rem",
              padding: ".75rem 1.5rem",
              border: 0,
              borderRadius: ".375rem",
              background: "#2F5D3F",
              color: "#fff",
              fontSize: ".95rem",
              cursor: "pointer",
            }}
          >
            Réessayer
          </button>
          {error.digest && (
            <p style={{ marginTop: "1.5rem", fontSize: ".8rem", color: "#6B615A" }}>
              Référence : <code>{error.digest}</code>
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
