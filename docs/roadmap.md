# Roadmap

## Avancement

| Phase | Sous-étape | Livrable | Statut |
|---|---|---|---|
| **1 — Architecture** | 1.0 Recherche | Best Practices Summary | ✅ Validé |
| | 1.1 Vision produit | Vision Produit | ✅ Validé |
| | 1.2 Sitemap | Sitemap | ✅ Validé |
| | 1.3 Parcours utilisateurs | User Flows | ✅ Validé |
| **2 — Définition des pages** | 2.0 Recherche (page Accueil) | Best Practices Summary | ✅ Validé |
| | 2.1 Spécification — Accueil | Spécification de page | ✅ Validé |
| | 2.0/2.1 — Fiche produit | Recherche + spécification | ✅ Validé |
| | 2.0/2.1 — Listing/catégorie | Recherche + spécification | ✅ Validé |
| | 2.0/2.1 — Panier | Recherche + spécification | ✅ Validé |
| | 2.0/2.1 — Checkout | Recherche + spécification | ✅ Validé |
| | 2.0/2.1 — Compte client | Recherche + spécification | ✅ Validé |
| | 2.0/2.1 — Guides & contenus | Recherche + spécification | ✅ Validé |
| | 2.0/2.1 — Confiance & légal (dernier groupe) | Recherche + spécification | ✅ Validé — **Phase 2 clôturée** |
| **3 — Génération des médias** | 3.0 Recherche | Best Practices Summary | ✅ Validé |
| | 3.1 Inventaire des médias | Media Inventory | ✅ Validé |
| | 3.2 Bibliothèque de prompts | Media Prompt Library | ✅ Validé — **Phase 3 clôturée** |
| **4 — Design System** | 4.0 Recherche | Best Practices Summary | ✅ Validé |
| | 4.1 Design System | Design Guidelines | ✅ Validé — **Phase 4 clôturée** |
| **5 — Front-end** | 5.0 Recherche | Best Practices Summary | ✅ Validé (D-048) |
| | 5.1 Développement | Front-end documenté | ✅ Validé — **Phase 5 clôturée** (4 jalons HITL) |
| **6 — Back-end** | 6.0 Recherche | Best Practices Summary | ✅ Validé (D-051) |
| | 6.1 Développement | Documentation technique | ✅ Validé — **Phase 6 clôturée** (4 jalons HITL) |
| **7 — Administration** | 7.0 Recherche | Best Practices Summary | ✅ Validé (D-052) |
| | 7.1 Développement | Back-office fonctionnel | 🟡 En cours — jalon 1/4 (socle + catalogue) |
| | 7.1 Développement | Back-office fonctionnel | ⬜ À venir |

## Phase en cours

**Phase 6 — Back-end.** Recherche 6.0 rédigée, en attente de validation HITL. Bilan Phase 5 (clôturée) :

1. ✅ **Jalon 1 — Socle + layout** : validé HITL (captures rendues) — projet Next.js 15, tokens 4.1 en `@theme`, 3 polices variables self-hostées, primitives UI + stories Storybook, layout boutique complet.
2. ✅ **Jalon 2 — Cœur catalogue** : validé HITL — mock API typée (catalogue démo 24 produits H33, contrats H37), Accueil complet (spec 2.1, JSON-LD Organization/WebSite), pages animal (gabarit A), listings à facettes avec état en query-string et canonique nue (gabarit B, D-027/D-028), nouveautés, fiche produit complète (variantes, guide des tailles, restock H15, curation D-025, avis, JSON-LD Product), panier minimal (badge header), placeholders pour les routes des jalons 3/4.
3. ✅ **Jalon 3 — Tunnel** : validé HITL — mini-panier drawer à chaque ajout + FreeShippingBar (D-029), page panier (quantités, code promo replié D-030, alerte stock faible, état vide illustré), layout tunnel épuré (D-032), checkout 3 étapes sur une URL (invité par défaut D-014, express en tête, stepper éditable, validation à la sortie du champ D-033, React Hook Form + Zod), 3 modes de livraison (H21), paiement simulé (PSP Phase 6, H20), confirmation avec création de compte post-achat (D-014). Parcours vérifié de bout en bout au navigateur.
4. ✅ **Jalon 4 — Compte + contenus** : validé HITL — espace client complet, gabarit article E-E-A-T, confiance & légal, CMP cookies. **Phase 5 clôturée.**

## Prochaines étapes

1. ✅ Jalon 1 — Socle données : validé HITL (bascule mock→base, parité testée).
2. ✅ Jalon 2 — Auth réelle : validé HITL — Better Auth (inscription/connexion e-mail, sessions en base, déconnexion), « Mes animaux » persistés par compte via server actions (max 5 H24), singletons base/auth partagés entre bundles. Parcours inscription→session→animal vérifié au navigateur.
3. ✅ Jalon 3 — Paiement + commandes : validé HITL — tables orders/order_lines, placeOrder en server action avec recalcul serveur intégral des prix (D-033), rattachement compte/invité (D-014), Stripe PaymentIntent + webhook signé pilotant les statuts (D-016) quand les clés sont posées, mode démonstration explicite sinon ; commandes du compte et suivi invité lus depuis la base. Parcours achat→base→suivi vérifié au navigateur.
4. ✅ Jalon 4 — Engagement + recherche : validé HITL — alertes restock persistées (H15), inscriptions newsletter en base (consentement horodaté), e-mail de confirmation de commande via Resend (RESEND_API_KEY), page recherche réelle interrogeant la base (produits + guides, non indexée). Restent en finitions post-6.1 : relance panier (H40), export RGPD serveur, guides en base (repris en Phase 7 avec l'admin).
