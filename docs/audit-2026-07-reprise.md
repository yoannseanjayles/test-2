# Audit complet — reprise du projet « chien et chat » (juillet 2026)

> **Mise à jour (même branche)** : les correctifs P0 et plusieurs P1 ont été
> appliqués à la suite de cet audit — voir la section « État des correctifs »
> en fin de document. Les constats ci-dessous décrivent l'état *avant* correctifs.

Audit métier, UX, cohérence, fonctionnalités et sécurité réalisé à la reprise du projet,
sur l'état de `main` après la PR #557. Chaque constat a été vérifié dans le code
(référence `fichier:ligne`). Vérifications d'ensemble : les **54 tests passent**,
le **build de production** a été relancé, mais **`pnpm typecheck` échoue sur un clone
frais** (voir T-1) et **aucune CI n'existe** (pas de `.github/workflows`).

## Synthèse exécutive

Le projet est une **excellente vitrine** : design system cohérent, accessibilité
travaillée, architecture propre (recalcul serveur des prix, rôles vérifiés en base,
webhook Stripe signé, DDL idempotent). Mais en l'état, **ce n'est pas une boutique
capable de vendre** :

1. **Le paiement Stripe n'encaisse jamais rien** — le Payment Element n'existe nulle
   part dans le code ; avec les clés posées, les commandes restent « En attente de
   paiement » pour toujours pendant que le client voit « commande confirmée ».
2. **Le stock n'est ni vérifié ni décrémenté à la commande** — survente structurelle.
3. **Plusieurs écrans présentés comme livrés sont factices** (contact, adresses,
   informations, création de compte post-achat, export RGPD) : ils affichent
   « (démonstration) » ou ne font rien.
4. **Faille de confidentialité** : sans vérification d'e-mail, n'importe qui peut créer
   un compte avec l'e-mail d'un client et consulter ses commandes (adresse postale
   comprise) et déclencher des retours.
5. **Avis clients fictifs affichés « Achat vérifié »** et exposés en JSON-LD —
   pratique commerciale trompeuse au sens du Code de la consommation.

Le document de passation décrit donc un état plus avancé que la réalité : les « 7 phases
livrées » incluent des maquettes non branchées, et plusieurs promesses des CGV/FAQ ne
correspondent à aucune logique implémentée.

---

## 1. Constats critiques (bloquants avant toute vente réelle)

### C-1 · Paiement : aucun encaissement possible
- `src/lib/orders.ts:68-81` crée un PaymentIntent et retourne `clientSecret` ;
  `src/app/(tunnel)/checkout/CheckoutFlow.tsx:114-118` **ignore ce `clientSecret`**,
  vide le panier et redirige vers la confirmation. Aucun `loadStripe` /
  `PaymentElement` / `confirmPayment` dans tout le dépôt (`@stripe/react-stripe-js`
  et `@stripe/stripe-js` sont installés mais jamais importés).
- L'étape 3 du checkout affiche encore : « L'iframe de paiement sécurisé […]
  s'affichera ici à la Phase 6 » (`CheckoutFlow.tsx:346-350`).
- Conséquence avec clés Stripe posées : commande enregistrée « En attente de
  paiement », client jamais débité, page et e-mail « commande confirmée » envoyés
  quand même (C-3). Le webhook (`payment_intent.succeeded`) ne se déclenchera
  jamais puisque personne ne saisit de carte.
- Sans clés : mode démonstration explicite — assumé, correct.

### C-2 · Stock : ni contrôle ni décrément à la commande
- `placeOrder` (`src/lib/orders.ts:44-105`) ne lit jamais `productSizes` : une taille
  à stock 0 est commandable (le bouton fiche produit est désactivé, mais rien ne
  protège un article déjà en panier ni un appel direct de l'action serveur).
- Aucune écriture de stock nulle part hors admin ; le webhook le confirme :
  « le stock suivra (H39) » (`src/app/api/webhooks/stripe/route.ts:7`).
- Les indicateurs « Ruptures de stock » de l'admin mesurent donc un stock purement
  déclaratif, jamais consommé par les ventes.

### C-3 · E-mail et écran de confirmation mensongers en cas de paiement non abouti
- `src/lib/orders.ts:107-119` : l'e-mail « Commande confirmée » part
  systématiquement (fire-and-forget) dès l'enregistrement, y compris quand le
  statut est « En attente de paiement ».
- `ConfirmationContent.tsx:49-56` affiche « Votre commande est confirmée » sans
  connaître l'état du paiement.

### C-4 · Prise de compte / fuite de données via e-mail non vérifié
- `src/lib/auth.ts:26` : `emailAndPassword: { enabled: true }` sans
  `requireEmailVerification` ; `user.emailVerified` reste `false` sans conséquence.
- `listMyOrders` (`src/lib/orders.ts:158-171`) rattache les commandes **par simple
  égalité d'e-mail** ; `requestReturn` (`src/lib/admin-orders.ts:116-119`) accepte la
  propriété par e-mail également.
- Scénario : un attaquant s'inscrit avec `victime@gmail.com` (aucune vérification) →
  il voit l'historique de commandes de la victime (adresse postale, contenu, montants)
  et peut passer ses commandes en « Retour en cours ».
- Aggravant : `accountLinking` est activé (`auth.ts:31-33`). Si la victime se connecte
  ensuite « avec Google », sa session atterrit sur le compte pré-créé par l'attaquant,
  qui en connaît le mot de passe (prise de compte classique par pré-inscription).

### C-5 · Avis fictifs présentés comme vérifiés
- Les 24 produits du seed embarquent des avis inventés avec `verified: true`
  (`src/lib/catalog/data.ts`, seedés en base par `src/db/seed.ts:64-76`).
- `ReviewCard.tsx:18-21` affiche le badge « Achat vérifié » ; l'accueil agrège
  « X sur 5 — N avis » (`(boutique)/page.tsx:206-210`) ; le JSON-LD produit expose
  `aggregateRating` aux moteurs (`src/lib/jsonld.ts:67-70`).
- Aucun mécanisme de dépôt d'avis par de vrais clients n'existe. En France, c'est une
  pratique commerciale trompeuse (art. L.121-1 c. conso., renforcé par la directive
  Omnibus sur les avis). À retirer ou à remplacer avant tout lancement.

### C-6 · Écrans factices présentés comme des fonctionnalités livrées
- **Contact** : `ContactForm.tsx:29` — « Message envoyé (démonstration) —
  l'acheminement réel arrive avec la Phase 6 ». Or la FAQ et les CGV renvoient les
  clients (dont les invités pour leurs retours !) vers ce formulaire avec promesse de
  réponse sous 24 h. C'est un cul-de-sac client.
- **Création de compte post-achat** : `ConfirmationContent.tsx:106-124` — le
  formulaire fait `setAccountCreated(true)` et jette le mot de passe saisi.
- **Mes adresses** (`compte/adresses/page.tsx`) et **Mes informations**
  (`compte/informations/page.tsx`) : « enregistrée (démonstration) », aucune
  persistance ; l'export/suppression RGPD affiche « Opérationnel avec le back-end
  (Phase 6) ».
- **Notre histoire** : page « en construction » (`UnderConstruction`), liée depuis le
  site.

### C-7 · Configuration de production dangereuse par défaut
- Sans `DATABASE_URL` : base en mémoire (assumé), mais surtout **`bootstrapAdmin`
  redevient disponible à chaque redémarrage** (`src/lib/admin.ts:34-42`) — le premier
  visiteur qui s'inscrit peut devenir Admin d'une boutique publique.
- Sans `BETTER_AUTH_SECRET` : secret de session codé en dur
  (`auth.ts:35`, `"dev-only-secret-chien-et-chat"`) — sessions forgeables.
- Recommandation : refuser de démarrer en production (`NODE_ENV=production`) si ces
  variables manquent, plutôt qu'un repli silencieux.

---

## 2. Constats majeurs

### M-1 · Le panier vit sur un catalogue statique compilé, pas sur la base
- `cartSubtotal` (`src/lib/cart.ts:79-84`), `CartDrawer.tsx:128-129`,
  `CartPageContent.tsx:121-122`, le récapitulatif du checkout
  (`CheckoutFlow.tsx:366-368`) et la confirmation (`ConfirmationContent.tsx:63-64`)
  résolvent les lignes via `getProductBySlug` de `lib/catalog` — le **catalogue démo
  figé dans le bundle**, pas la base.
- Conséquences :
  - un **produit importé AliExpress publié est invisible dans le panier** (ligne
    rendue `null`) tout en étant compté dans le badge et dans le sous-total à 0 € ;
  - un **changement de prix en admin ne se reflète pas** dans le panier/checkout :
    le bouton « Payer X € » peut afficher un montant différent de celui réellement
    facturé côté serveur (`result.total`) — écart prix affiché / prix débité,
    juridiquement risqué ;
  - les mentions de stock du panier (`CartPageContent.tsx:124-125`) sont figées au
    build.
- Correctif : route API (ou server action de lecture) résolvant les lignes du panier
  depuis la base — c'était d'ailleurs annoncé dans le code (« Les lookups côté client
  (panier) migrent vers des routes API au jalon 3 », `src/lib/api.ts:12`) et jamais fait.

### M-2 · « Mes commandes » n'affiche que la dernière commande
- `compte/commandes/page.tsx:34` : `const order = ordersList[0]` — un client
  multi-commandes n'a **aucun historique** et ne peut demander un retour que sur la
  plus récente. La passation annonce « commandes avec timeline », au pluriel.

### M-3 · Alertes « retour en stock » : collectées puis lettre morte
- `subscribeRestock` (`src/lib/engagement.ts:8-23`) enregistre bien en base, la fiche
  promet « bientôt de retour », mais **aucun code n'envoie jamais l'e-mail** quand le
  stock est resaisi (rien dans `updateAdminProduct`, aucune vue admin, seule la
  suppression produit purge la table). Promesse client non tenue.

### M-4 · Politique de retours incohérente entre CGV et code
- CGV/FAQ/page livraison : « premier retour offert, les suivants facturés 4,90 € »,
  « 30 jours » — or `isReturnEligible` (`src/lib/account.ts:32-34`) n'impose **aucune
  limite de temps** (retour possible des années après) et **aucune facturation du
  2ᵉ retour** n'existe ; le remboursement Stripe est toujours **intégral**
  (`admin-orders.ts:66`), frais de livraison compris, sans notion de retour partiel
  par article.
- Le retour est possible dès « Expédiée » (avant réception) — choix à assumer ou
  corriger.

### M-5 · CGV non opposables et inexactes
- **Aucune case d'acceptation des CGV** au checkout (`CheckoutFlow.tsx`, étape 3) —
  elles ne sont pas opposables au sens e-commerce FR ; le bouton « Payer X € »
  couvre en revanche l'exigence « commande avec obligation de paiement » (loi Hamon).
- CGV : « carte bancaire ou PayPal » — PayPal n'existe pas (boutons « bientôt »
  désactivés au checkout).
- Mentions légales : « société en cours d'immatriculation … à compléter » ; médiateur
  absent (connu de la passation) — bloquant légal au lancement.

### M-6 · Aucune récupération de mot de passe
- Aucun `forgetPassword`/`resetPassword` dans le dépôt ; l'écran de connexion
  (`AccountShell.tsx`) ne propose pas de « mot de passe oublié ». Un client qui perd
  son mot de passe perd son compte — et le formulaire de contact étant factice (C-6),
  il n'a aucun recours.

### M-7 · Livraison : promesses opérationnellement incomplètes
- Mode « point relais » **sans sélection du point relais** ni intégration
  transporteur ; adresse sans **téléphone** (exigé par les transporteurs, surtout en
  relais et express) ; livraison **Suisse** proposée (`checkout-schemas.ts:13`) sans
  gestion douane/TVA hors UE ; code postal validé `4-5 chiffres` uniquement.
- Étiquettes de retour : l'e-mail promet « l'étiquette prépayée arrive par e-mail »
  (`email.ts:55`) — aucune génération d'étiquette n'existe (connu de la passation).

### M-8 · Numéros de commande : collision probable à l'échelle
- `CC-` + 6 hex du UUID (`orders.ts:62`) = 16,7 M de combinaisons ; par paradoxe des
  anniversaires, ~50 % de collision vers ~4 800 commandes. La contrainte UNIQUE fera
  alors **échouer l'insert après création du PaymentIntent** (client potentiellement
  débité plus tard pour une commande jamais enregistrée). Allonger le numéro ou
  réessayer sur collision.

### M-9 · Incohérences du seuil « livraison offerte » configurable
- Le seuil est modifiable en admin, mais restent codés en dur : `CartPageContent.tsx:72`
  (`subtotal >= 7900`), la métadescription du layout (`layout.tsx:13`, « dès 79 € »),
  la page livraison-retours (`livraison-retours/page.tsx:11`) et
  `freeShippingRemaining` (`cart.ts:91-93`, non utilisé par la barre mais exporté).
  Changer le seuil en admin créerait des messages contradictoires. La barre de
  progression et le checkout, eux, lisent bien la config (`use-shipping-config.ts`).

### M-10 · Import AliExpress : angles morts
- **Photos hotlinkées** depuis le CDN AliExpress (`aliexpress.ts:104-111`,
  `next.config.ts` autorise `**.alicdn.com`) : droits d'auteur des fournisseurs,
  dépendance à un CDN tiers qui peut casser ou bloquer le hotlinking. Rapatrier les
  images (blob storage) avant lancement.
- Produit publié avec **stock 0** (`admin.ts:332`) → immédiatement « rupture » en
  boutique ; `gabarits` par défaut `XS…XL` incohérents avec l'unique taille
  « Taille unique » ; toutes les couleurs reçoivent le même hex `#C9BFAC`
  (pastilles identiques, `admin.ts:313-315`).
- `publishDraft` ne valide pas `subcategory` côté serveur (seule l'UI restreint,
  `admin/page.tsx:1112-1118`) — un produit orphelin (invisible en navigation) est
  possible.
- La suppression de produit est **définitive sans corbeille** (simple
  `window.confirm`), avis et alertes restock compris.

### M-11 · Aucune CI, typecheck cassé sur clone frais
- Pas de `.github/workflows` : les « 54 tests » ne tournent que sur le poste du dev.
- `pnpm typecheck` échoue avant un premier `next build`/`dev` (le `next-env.d.ts`
  généré, qui déclare les imports d'images, est gitignoré) — les erreurs TS2307 sur
  `src/lib/media.ts` le prouvent. Ajouter une CI (typecheck + tests + build) est le
  garde-fou minimal.
- Les zones les plus risquées (placeOrder, webhook, transitions admin, remboursements)
  n'ont **aucun test**.

---

## 3. Constats mineurs / suggestions

- **S-1** `placeOrder` sans rate-limiting : spam de commandes, de PaymentIntents et
  d'e-mails vers des adresses arbitraires possibles ; `findOrder` (suivi invité) sans
  rate-limiting non plus (force brute numéro+e-mail improbable mais gratuite).
- **S-2** Quantité : le panier permet d'incrémenter sans plafond ; au-delà de 20,
  `placeOrder` répond « Un article du panier n'est plus disponible » — message
  trompeur (`orders.ts:51-53`).
- **S-3** E-mails : contenu HTML construit par interpolation (`email.ts:26-31`) —
  un nom de produit importé contenant du HTML serait injecté tel quel dans l'e-mail.
  Échecs d'envoi silencieux par design (`catch(() => {})`) : au minimum, les journaliser.
- **S-4** Recherche : ILIKE paramétré (sain), mais insensible aux accents non gérée
  (« echarpe » ne trouve pas « écharpe ») ; guides filtrés en mémoire.
- **S-5** Pas de `sitemap.ts` ni `robots.ts` alors que la doc interne y fait
  référence (« sitemap 1.2 ») — SEO de base manquant.
- **S-6** Admin : pas de pagination (toutes les commandes chargées en une requête,
  `listAdminOrders` charge aussi **toutes** les lignes de commande de la base) ;
  `getAdminSummary` charge toutes les commandes pour compter. Acceptable au
  démarrage, à surveiller.
- **S-7** `bootstrapAdmin` : course possible entre deux inscriptions simultanées
  (deux admins) — improbable mais gratuit à corriger (contrainte/transaction).
- **S-8** Export CSV newsletter : e-mails validés par Zod donc risque d'injection CSV
  faible, mais préfixer les valeurs commençant par `=`, `+`, `-`, `@` reste une bonne
  pratique.
- **S-9** Cookies : bannière conforme (refus aussi visible qu'accepter, aucun traceur
  posé) — mais le consentement vit en `localStorage` et **rien ne consomme jamais**
  `consent.analytics` : si un jour un traceur est ajouté, le lien avec la CMP devra
  être réellement câblé.
- **S-10** `docs/` référence un dossier `src/media/a-trier/` embarqué dans le dépôt
  (fichiers `REJET-…`, `DOUTE-…`) — à sortir du dépôt de prod.
- **S-11** Identité : nom du site « chien et chat » cohérent partout, mais le projet
  Vercel s'appelle `comptoir-store` et l'e-mail par défaut part de
  `commandes@resend.dev` — à aligner avant lancement (domaine, EMAIL_FROM).
- **S-12** Timeline de commande : `statusIndex` traite « Payée (démonstration) »
  comme payée — cohérent ; les statuts hors parcours s'affichent en badge — bien vu.

---

## 4. Points forts (à préserver)

1. **Recalcul serveur systématique des prix** (`orders.ts:46-58`) et lignes de
   commande dénormalisées (historique client intact après suppression produit).
2. **Sécurité du back-office réellement côté serveur** : chaque action vérifie le rôle
   en base (`requireRole`), machine à états des statuts stricte, remboursement bloqué
   si Stripe refuse, webhook à signature vérifiée.
3. **Qualité front** : accessibilité soignée (aria-live, focus-trap, jest-axe),
   design system cohérent, textes FR de très bonne tenue, parseur d'import défensif
   et testé, bootstrap DB idempotent (Neon/PGlite) astucieux.
4. **Documentation projet** exceptionnelle (roadmap, 52 décisions journalisées) —
   même si l'écart doc/code doit maintenant être résorbé.

---

## 5. Plan d'action recommandé

**P0 — avant le premier euro encaissé**
1. Intégrer le Payment Element Stripe (utiliser le `clientSecret`), ne confirmer la
   commande qu'après `payment_intent.succeeded` ; réserver l'e-mail de confirmation
   au paiement validé (C-1/C-3).
2. Contrôle + décrément de stock transactionnel dans `placeOrder` (C-2).
3. Vérification d'e-mail obligatoire (Better Auth `requireEmailVerification`) et/ou
   rattachement des commandes uniquement par `userId` vérifié (C-4).
4. Retirer les avis fictifs (ou les marquer explicitement fictifs hors prod) et le
   `aggregateRating` JSON-LD associé (C-5).
5. Brancher le formulaire de contact (Resend) ; brancher ou retirer : adresses,
   informations, création de compte post-achat, boutons RGPD (C-6).
6. Case d'acceptation des CGV au checkout ; corriger CGV (PayPal), compléter mentions
   légales + médiateur (M-5).
7. Verrouiller la prod : exiger `DATABASE_URL` et `BETTER_AUTH_SECRET`, désactiver
   `bootstrapAdmin` hors démo (C-7).

**P1 — avant montée en charge**
8. Panier branché sur la base (M-1) ; historique complet des commandes (M-2).
9. Politique de retours : fenêtre de 30 jours, frais du 2ᵉ retour ou CGV corrigées (M-4).
10. Téléphone + sélection de point relais ; trancher le cas Suisse (M-7).
11. Numéros de commande robustes (M-8) ; e-mails restock (M-3) ; seuil livraison
    unifié (M-9).
12. CI GitHub Actions : typecheck (après génération `next-env.d.ts`), tests, build ;
    tests sur placeOrder/webhook/transitions (M-11).

**P2 — dette et confort**
13. Rapatrier les images AliExpress ; corbeille produit ; pagination admin ;
    rate-limiting ; recherche insensible aux accents ; sitemap/robots ;
    réinitialisation de mot de passe (M-6) ; sortir `src/media/a-trier/`.

---

## 6. État des correctifs (appliqués sur cette branche)

| Constat | État | Détail |
|---|---|---|
| C-1 Paiement jamais encaissé | ✅ Corrigé | Payment Element intégré au checkout (`CheckoutFlow.tsx`) : le `clientSecret` alimente `Elements`/`confirmPayment`, retour sur `/checkout/confirmation` avec gestion de `redirect_status` (succès / en cours / échec avec panier conservé). Nécessite `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` sur Vercel en plus des clés existantes. |
| C-2 Stock non géré | ✅ Corrigé | Nouveau module `src/lib/stock.ts` : réservation conditionnelle (jamais sous zéro, agrégée par taille) à `placeOrder`, restitution sur échec de paiement (webhook), annulation admin et échec d'enregistrement. Testé (`stock.test.ts`, 5 tests). |
| C-3 Confirmation avant paiement | ✅ Corrigé | Avec Stripe, statut « Payée » + e-mail de confirmation partent du webhook (idempotent : transition depuis « En attente de paiement » uniquement). Le mode démo reste confirmé immédiatement. |
| C-4 Fuite de données par e-mail non vérifié | ✅ Corrigé | Rattachement des commandes et retours par e-mail réservé aux adresses **vérifiées** ; vérification d'e-mail Better Auth activée (envoi via Resend) avec `requireEmailVerification` dès que `RESEND_API_KEY` est posée. |
| C-5 Avis fictifs « vérifiés » | ✅ Corrigé | Avis du seed passés en non vérifiés (badge masqué), `aggregateRating` retiré du JSON-LD, allégation « avis vérifiés » retirée de l'accueil. Les avis de démonstration restent affichés : à remplacer par de vrais avis avant lancement. |
| C-6 Écrans factices | ✅ Corrigé | Contact branché (action serveur + Resend, `CONTACT_EMAIL` optionnelle) ; création de compte post-achat réelle (inscription + rattachement de la commande) ; « Mes adresses » supprimée ; « Mes informations » en lecture seule honnête avec procédure RGPD via contact. |
| C-7 Prod dangereuse par défaut | ✅ Corrigé | `BETTER_AUTH_SECRET` exigé à l'exécution en production (build SSG toléré) ; « Devenir administrateur » refusé en production sans `DATABASE_URL` (échappatoire explicite `ALLOW_ADMIN_BOOTSTRAP=1`). |
| M-2 Historique limité à 1 commande | ✅ Corrigé | « Mes commandes » liste toutes les commandes (timeline + retour par commande). |
| M-5 CGV non opposables / PayPal | ✅ Corrigé | Case d'acceptation CGV + confidentialité obligatoire avant paiement ; CGV corrigées (Stripe, acceptation au checkout). Mentions légales/médiateur : toujours à compléter (juridique, pas code). |
| M-8 Collision numéros de commande | ✅ Corrigé | Numéros sur 10 hexadécimaux (`CC-XXXXXXXXXX`). |
| M-9 Seuil livraison en dur | ✅ Partiel | Page panier branchée sur la config ; restent la métadescription du layout et la page livraison-retours (textes statiques). |
| M-11 Aucune CI | ✅ Corrigé | `.github/workflows/ci.yml` : install → build → typecheck → test ; test de bascule PGlite fiabilisé (timeout). |
| S-2 Message quantité trompeur | ✅ Corrigé | Message explicite « Maximum 20 exemplaires par article ». |
| S-3 Injection HTML e-mails | ✅ Corrigé | Échappement systématique du contenu variable + journalisation des échecs d'envoi. |

**Restent ouverts** (par ordre de priorité) : M-1 (panier branché sur la base —
refonte des lookups client), M-3 (envoi des alertes restock), M-4 (fenêtre de
30 jours et frais du 2ᵉ retour), M-6 (réinitialisation de mot de passe), M-7
(téléphone, choix du point relais, cas Suisse), M-10 (rapatriement des images
AliExpress, validation de sous-catégorie), mentions légales/médiateur, et les
points P2.
