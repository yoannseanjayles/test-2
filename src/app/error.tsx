"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Frontière d'erreur applicative (audit 2026-08, EL-6) — il n'en existait
 * aucune : une exception non gérée dans une Server Action affichait l'écran
 * d'erreur brut de Next.
 *
 * Le `digest` est l'identifiant que Next attribue à l'erreur côté serveur ;
 * il est affiché au visiteur pour qu'il puisse le citer au support, et il
 * permet de retrouver la ligne correspondante dans les logs.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // La trace complète reste côté serveur : ici on ne dispose que du digest.
    console.error("[ui] Erreur de rendu", error.digest ?? "");
  }, [error]);

  return (
    <main id="contenu" className="mx-auto max-w-page px-4 py-20 lg:px-6">
      <div className="mx-auto max-w-lg">
        <p className="text-label text-bark-700">Erreur inattendue</p>
        <h1 className="font-display mt-2 text-h1 text-bark-900">
          Quelque chose n'a pas fonctionné.
        </h1>
        <p className="mt-4 text-body text-bark-700">
          L'incident a été enregistré de notre côté. Vous pouvez réessayer —
          votre panier est conservé.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="text-label inline-flex min-h-11 items-center bg-action px-6 py-3 text-white transition duration-150 hover:bg-action-hover"
          >
            Réessayer
          </button>
          <Link
            href="/"
            className="text-label inline-flex min-h-11 items-center border-[1.5px] border-action px-5 py-3 text-action transition duration-150 hover:bg-pine-50"
          >
            Revenir à l'accueil
          </Link>
          <Link
            href="/contact"
            className="text-label inline-flex min-h-11 items-center border-[1.5px] border-action px-5 py-3 text-action transition duration-150 hover:bg-pine-50"
          >
            Contacter le support
          </Link>
        </div>
        {error.digest && (
          <p className="text-caption mt-6 text-bark-700">
            Référence à communiquer au support : <code>{error.digest}</code>
          </p>
        )}
      </div>
    </main>
  );
}
