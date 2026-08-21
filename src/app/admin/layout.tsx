import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { getSessionUser } from "@/lib/auth";

/**
 * Garde serveur du back-office (audit 2026-08, MO-8).
 *
 * `/admin` est un composant client : la page était prérendue et servie à
 * tout le monde, bouton « Devenir administrateur » compris. Aucune donnée ne
 * fuyait — les quatorze actions d'administration appellent toutes
 * `requireRole` — mais le back-office offrait la carte du terrain à qui
 * voulait exploiter l'amorçage (CR-2).
 *
 * Le contrôle est volontairement posé au niveau de la session, pas du rôle :
 * un utilisateur connecté sans rôle doit encore pouvoir atteindre l'écran
 * d'amorçage. Le rôle, lui, reste vérifié dans chaque Server Action.
 *
 * `notFound()` plutôt qu'une redirection : rien n'indique à un visiteur
 * anonyme qu'un back-office existe à cette adresse.
 *
 * ⚠️ Cette garde empêche le rendu de la page, pas le téléchargement du
 * bundle JavaScript, qui reste accessible à son URL de chunk — limite
 * inhérente aux composants client. Elle vaut comme défense en profondeur.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const sessionUser = await getSessionUser(await headers());
  if (!sessionUser) notFound();
  return <>{children}</>;
}
