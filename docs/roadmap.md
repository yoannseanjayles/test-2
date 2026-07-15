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
| | 7.1 Développement | Back-office fonctionnel | 🟡 En cours — jalons 1-2/4 ✅ validés et mergés en prod (socle admin, import AliExpress + photos) ; jalons 3-4 à venir |

## Phase en cours

**Phase 7 — Administration** (dernière phase). Recherche 7.0 validée (D-052). Jalons 7.1 :

1. ✅ **Jalon 1 — Socle admin** : validé HITL — rôles en base (H42 : Admin/Ops/Catalogue/Éditorial, amorçage du 1ᵉʳ admin en démo), `/admin` protégé par rôle, catalogue éditable (note de curation ≥ 20 caractères D-025, alertes stock faible/rupture), révalidation SSG après édition.
2. ✅ **Jalon 2 — Import AliExpress** : validé HITL — import hors ligne par pages téléchargées depuis le navigateur (`.html`/`.mhtml` en glisser-déposer, D-052/H41), parseur MHTML défensif (titre, prix fournisseur, photos des deux CDN remontées en 960x960), brouillons systématiques puis publication avec curation obligatoire (prix pré-rempli ×2,5, stock 0 → alerte restock) ; photos fournisseur affichées sur la fiche, les cartes et les brouillons. Parcours upload→brouillon→publication→fiche vérifié au navigateur, parseur couvert par tests unitaires.
3. ⬜ **Jalon 3 — Commandes & Ops** : transitions de statuts de commande (D-016) + notifications client, retours et remboursement Stripe.
4. ⬜ **Jalon 4 — Éditorial & réglages** : guides en base, configuration livraison, export newsletter.

Bilan Phase 6 (clôturée) :

1. ✅ **Jalon 1 — Socle données** : validé HITL (bascule mock→base, parité testée).
2. ✅ **Jalon 2 — Auth réelle** : validé HITL — Better Auth (inscription/connexion e-mail, sessions en base, déconnexion), « Mes animaux » persistés par compte via server actions (max 5 H24), singletons base/auth partagés entre bundles. Parcours inscription→session→animal vérifié au navigateur.
3. ✅ **Jalon 3 — Paiement + commandes** : validé HITL — tables orders/order_lines, placeOrder en server action avec recalcul serveur intégral des prix (D-033), rattachement compte/invité (D-014), Stripe PaymentIntent + webhook signé pilotant les statuts (D-016) quand les clés sont posées, mode démonstration explicite sinon ; commandes du compte et suivi invité lus depuis la base. Parcours achat→base→suivi vérifié au navigateur.
4. ✅ **Jalon 4 — Engagement + recherche** : validé HITL — alertes restock persistées (H15), inscriptions newsletter en base (consentement horodaté), e-mail de confirmation de commande via Resend (RESEND_API_KEY), page recherche réelle interrogeant la base (produits + guides, non indexée).

## Prochaines étapes

1. **Jalon 3 — Commandes & Ops** : transitions de statuts (D-016) + notifications, retours + remboursement Stripe.
2. **Jalon 4 — Éditorial & réglages** : guides en base, config livraison, export newsletter — clôture de la Phase 7 et du projet.
3. Finitions en réserve : relance panier (H40), export RGPD serveur, médias restants (~40 prompts dans l'artefact), écran d'attribution des rôles admin.
