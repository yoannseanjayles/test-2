# Decision Log

Historique des décisions importantes, avec justification. Les décisions sont numérotées `D-xxx` et ne sont jamais supprimées (une décision annulée est marquée *remplacée par*).

| ID | Date | Décision | Justification | Statut |
|---|---|---|---|---|
| D-001 | 2026-07-14 | Taxonomie primaire **par animal** (Chien / Chat / NAC), secondaire par usage | Correspond au modèle mental du client (« pour mon chien → une laisse ») ; pratique des leaders (Chewy, Zooplus) ; recherche Baymard sur les taxonomies | ✅ Validée (HITL 1.0) |
| D-002 | 2026-07-14 | Architecture plate ≤ 3 niveaux, catégories parentes cliquables, ≥ 10 produits par catégorie feuille | Guidelines Baymard ; évite les catégories vides qui cassent la perception premium | ✅ Validée (HITL 1.0) |
| D-003 | 2026-07-14 | Mobile-first (catégories en 1ᵉʳ niveau du menu mobile, checkout une colonne) | ~73 % du revenu pet e-commerce est mobile | ✅ Validée (HITL 1.0) |
| D-004 | 2026-07-14 | Checkout invité + transparence des coûts + paiements express dès la conception | ~70 % d'abandon panier, causes majoritairement UX (comptes forcés : 24 %, frais surprises : ~40 %) | ✅ Validée (HITL 1.0) |
| D-005 | 2026-07-14 | H1 : NAC = cible secondaire (taxonomie moins profonde au lancement) | Hypothèse de volume marché, validée avec le porteur de projet | ✅ Validée (HITL 1.0) |
| D-006 | 2026-07-14 | H2 : catalogue accessoires uniquement ; abonnement/réassort en évolution, pas au lancement | Les accessoires sont des achats moins récurrents que l'alimentation ; le socle technique reste prêt pour l'abonnement | ✅ Validée (HITL 1.0) |
| D-007 | 2026-07-14 | H3 : marché francophone au lancement (FR, EUR) ; i18n en évolution | Focalisation du lancement ; l'architecture n'interdit pas l'i18n | ✅ Validée (HITL 1.0) |
| D-008 | 2026-07-14 | Positionnement **premium accessible** : curation, conseil, expérience — pas le volume ni le luxe ostentatoire | Différenciation face aux généralistes (Amazon, Zooplus) ; cohérent avec la cible « pet parent » CSP+ | ✅ Validée (HITL 1.1) |
| D-009 | 2026-07-14 | Objectifs 12 mois : conversion ≥ 2,5 %, panier ≥ 70 €, réachat 6 mois ≥ 25 %, abandon checkout ≤ 55 %, CWV 100 % Good, WCAG 2.2 AA | Objectifs mesurables pour arbitrer les choix produit/design/tech des phases suivantes | ✅ Validée (HITL 1.1) |
| D-010 | 2026-07-14 | H4 : nom de code projet « Pelage » ; naming réel traité en Phase 4 (DA) | Permet d'avancer sans bloquer sur le naming | ✅ Validée (HITL 1.1) |
| D-011 | 2026-07-14 | H5 : livraison FR/BE/CH/LU au lancement ; H6 : avis clients natifs (pas de solution tierce) | Périmètre de lancement resserré, coûts maîtrisés | ✅ Validée (HITL 1.1) |
| D-012 | 2026-07-14 | Sitemap : 8 sous-catégories chien, 7 chat, 3 NAC ; URLs `/{animal}/{sous-categorie}/{produit}` ; profondeur ≤ 3 | Applique D-001/D-002 ; noms affinables avec le catalogue réel (H7) | ✅ Validée (HITL 1.2) |
| D-013 | 2026-07-14 | Pas de page « Promotions » au lancement ; pas d'arborescence transverse « par usage » (`/colliers`) | Cohérence premium (D-008) ; évite le contenu dupliqué SEO — l'entrée par usage est servie par les facettes | ✅ Validée (HITL 1.2) |
| D-014 | 2026-07-14 | Création de compte proposée uniquement *après* l'achat (checkout invité par défaut) | 24 % d'abandon quand le compte est forcé (D-004) | ✅ Validée (HITL 1.2) |
| D-015 | 2026-07-14 | Onboarding « profil animal » optionnel et différé, jamais bloquant | Levier de personnalisation clé du secteur sans friction à l'inscription | ✅ Validée (HITL 1.3) |
| D-016 | 2026-07-14 | Statuts de commande : Payée → En préparation → Expédiée → Livrée → Clôturée (+ retour/remboursée/annulée) ; chaque transition notifie le client | Transparence client ; structure les flux admin (Phase 7) et le modèle de données (Phase 6) | ✅ Validée (HITL 1.3) |
| D-017 | 2026-07-14 | 4 rôles back-office : Admin, Ops, Catalogue, Éditorial | Séparation des responsabilités simple et suffisante au lancement | ✅ Validée (HITL 1.3) |
| D-018 | 2026-07-14 | H9 : relance panier abandonné au lancement ; H10 : 3PL unique ; H11 : mono-entrepôt | Simplicité opérationnelle du lancement ; H10 à confirmer en Phase 6 | ✅ Validée (HITL 1.3) |
| D-019 | 2026-07-14 | Ordre de conception des pages (Phase 2) : Accueil → Fiche produit → Listing/catégorie → Panier → Checkout → Compte → Guides → Confiance/légal | Ordonné par impact business et par dépendances de composants | ✅ Validée (HITL 2.0) |
| D-020 | 2026-07-14 | Hero d'accueil statique (pas de carrousel auto-défilant), une proposition de valeur, un CTA primaire | Sliders auto = charge cognitive, message dilué (Nielsen, Baymard) | ✅ Validée (HITL 2.0) |
| D-021 | 2026-07-14 | Pas de pop-up newsletter à l'arrivée ; capture e-mail en pied de page ou après engagement | Friction contraire au positionnement premium | ✅ Validée (HITL 2.0) |
| D-022 | 2026-07-14 | Spec Accueil : 10 sections (réassurance, header, hero statique, univers, sélection curée, marque, guide phare, avis, newsletter, footer) ; 1 seul CTA primaire par page | Recherche 2.0 ; hiérarchie visuelle premium | ✅ Validée (HITL 2.1 Accueil) |
| D-023 | 2026-07-14 | Accueil personnalisé pour clients connectés (hero + sélection « Pour {animal} ») | Différenciateur sectoriel identifié en 1.0 ; s'appuie sur D-015 | ✅ Validée (HITL 2.1 Accueil) |
| D-024 | 2026-07-14 | Fiche produit : tailles en boutons avec stock visible, guide des tailles en overlay, image « à l'échelle » obligatoire, caractéristiques en accordéons (pas d'onglets) | Recherche Baymard ; réduit la cause n°1 de retour (taille) | ✅ Validée (HITL 2.1 PDP) |
| D-025 | 2026-07-14 | Bloc curation « Pourquoi nous l'avons choisi » sur chaque fiche ; avis avec photos + contexte animal, réservés aux acheteurs | Incarne la curation (D-008) ; photos clients = preuve la plus fiable | ✅ Validée (HITL 2.1 PDP) |
| D-026 | 2026-07-14 | H14 : 2 axes de variantes max (taille × couleur) ; H15 : alerte restock e-mail au lancement ; canonique produit unique (variantes sans URL propre) | Simplicité du modèle de données ; hygiène SEO | ✅ Validée (HITL 2.1 PDP) |
