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
