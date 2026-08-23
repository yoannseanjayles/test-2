# Audit de transformation — de « chien et chat » à un e-commerce de baskets

**Date** : 21 août 2026
**Branche auditée** : `securite/audit-2026-08` (commit `c032bf3`, arbre propre)
**Objet** : évaluer ce que coûte, et ce que rend possible, le remplacement du domaine
métier « accessoires premium pour animaux » par « baskets / sneakers ».
**Nature** : analyse statique du dépôt + exécution de la suite de tests.
Aucun code n'a été modifié par cet audit.

> Cet audit ne porte **pas** sur la sécurité ni sur la mise en production : ces deux
> sujets sont traités par `audit-2026-07-reprise.md` et
> `audit-2026-08-mise-en-production.md`, dont les constats restent entièrement
> valables. Les identifiants utilisés ici (`BL-`, `ST-`, `CO-`, `CF-`, `OU-`) sont
> distincts de ceux des audits de sécurité (`CR-`, `EL-`, `MO-`) pour qu'aucune
> confusion ne soit possible dans les tableaux de suivi.

---

## 1. Verdict

**Le pivot est réalisable, et il est très nettement moins cher maintenant qu'après
la mise en ligne.** Le socle transactionnel — paiement, autorité des prix serveur,
réservation de stock, authentification, back-office, en-têtes de sécurité, CI,
observabilité — ne connaît pas le domaine métier. Il ne bouge pas.

Ce qui connaît le domaine métier, ce sont quatre couches, et elles sont
inégalement coûteuses :

| Couche | État | Coût du pivot |
|---|---|---|
| Socle transactionnel et sécurité | Agnostique du métier | ~0 |
| Modèle de données et navigation | Typé « animal » de bout en bout | Modéré, mais **structurant** — 5 décisions à trancher avant tout code |
| Contenu, textes, médias, direction artistique | 100 % animalier | Élevé — c'est le vrai budget |
| Conformité | Indépendante du domaine, sauf deux points | Faible en code, **long en délai** |

Chiffres relevés : 139 fichiers TypeScript, 13 419 lignes dans `src/`. **62 fichiers
source** portent du vocabulaire animalier, plus 29 documents de `docs/`. Environ
1 200 lignes sont de la donnée métier pure, à jeter et à réécrire
(`catalog/data.ts`, `navigation.ts`, `guides.ts`, `media.ts`, l'espace « Mes
animaux »). 31 fichiers médias, 22 Mo, sont inutilisables tels quels.

Le point important n'est pas ce volume : c'est que **cinq blocages sont invisibles
à la lecture des fichiers de données**. Ils ne se trouvent qu'en suivant le chemin
d'une pointure, du formulaire d'admin jusqu'au filtre de la page de listing. Ils
sont détaillés en §3, et trois d'entre eux rendent aujourd'hui une boutique de
baskets littéralement inexploitable, sans qu'aucun test ni aucun build n'échoue.

### Pourquoi maintenant

Le site n'est pas en ligne. Cela veut dire, concrètement :

- **aucune dette de redirection SEO** — l'arborescence `/{animal}/{sous-categorie}/{produit}`
  peut être remplacée sans plan de redirections 301 ni perte de positions ;
- **aucune commande, aucun compte, aucune session en base** — la table `products` et
  ses tables liées peuvent être purgées sans migration de données réelles ;
- **les textes juridiques ne sont pas publiés** — et surtout, l'immatriculation de la
  société (CR-4, toujours ouvert) n'est pas faite. Le nom commercial, le SIRET, le
  contrat de médiation seront créés **une seule fois**, sous la bonne identité, au
  lieu d'être créés puis modifiés.

Chacun de ces trois points devient coûteux le jour du lancement. Le pivot est
aujourd'hui à son prix plancher.

---

## 2. Ce qui ne bouge pas

Recensé explicitement, parce que c'est la moitié utile d'un audit de pivot : savoir
ce qu'on n'a pas à refaire.

**Transactionnel et sécurité — aucun changement.**

- `lib/orders.ts` — autorité des prix serveur : le client n'envoie que `slug` et
  `quantity`, tout est relu et recalculé en base. Un catalogue de baskets ne change
  rien à cette garantie, qui est le point fort n°1 du dépôt.
- `api/webhooks/stripe/route.ts` — `constructEventAsync` sur le corps brut, rejet 400
  sans signature, transition idempotente depuis « En attente de paiement ».
- `lib/stock.ts` — décrément conditionnel robuste à la concurrence (jamais sous zéro,
  restitution en cas d'échec). Voir toutefois **BL-3** : ce n'est pas le mécanisme
  qui pose problème, c'est la **clé** sur laquelle il porte.
- `lib/auth.ts`, `lib/rate-limit.ts`, `lib/runtime-env.ts`, `lib/import-guard.ts`,
  `lib/observability.ts`, `next.config.ts` (6 en-têtes + CSP Report-Only),
  `.github/workflows/ci.yml` — entièrement agnostiques du domaine.
- `lib/jsonld.ts` — `jsonLdScript()` échappe `<`, `>` et `&`. La protection reste
  strictement nécessaire après le pivot : les fiches resteront pré-remplies depuis
  des pages fournisseur arbitraires.

**Fonctionnel commerce — réutilisable tel quel.**

- Tunnel de commande 3 étapes, panier persistant, checkout invité, preuve
  d'acceptation des CGV horodatée, retours self-service, statuts de commande,
  alertes de retour en stock, newsletter, export CSV anti-injection.
- Design System : l'architecture de tokens en trois couches (primitives →
  sémantiques → composants, D-045) est précisément ce qui rend un changement de
  direction artistique bon marché. Voir **CO-2** pour la seule exception.
- Composants `ui/` (Button, Badge, Accordion, FormField) et l'essentiel de
  `commerce/` : `ProductCard`, `Breadcrumb`, `CartDrawer`, `FreeShippingBar`,
  `SectionHeading`, `RatingStars`. Aucun ne connaît le métier.

**Tests conservés sans modification** : `jsonld.test.ts`, `import-guard.test.ts`,
`import-fields.test.ts`, `guide-content.test.ts`, `account.test.ts`,
`aliexpress.test.ts`, et les trois tests de composants `ui/`. Ce sont ceux qui
couvrent EL-3, MO-4 et C-2 — ils doivent rester verts de bout en bout du chantier.

**Baseline vérifiée le 21/08/2026, avant tout changement** : `70/70 tests, 14 fichiers,
sortie 0` (`node ./node_modules/vitest/vitest.mjs run`, 16,9 s).

---

## 3. Constats bloquants — à trancher avant la première ligne de code

### BL-1 — Aucune pointure n'est filtrable : la facette « Taille » est une liste blanche

`src/components/commerce/ListingExplorer/ListingExplorer.tsx:33`

```ts
const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "Taille unique"];
```

Les valeurs de la facette sont construites par `SIZE_ORDER.filter(...)`
(ligne 107) : **une taille absente de cette constante n'apparaît jamais dans le
filtre**, quel que soit le catalogue. Sur une boutique de baskets, la facette
« Taille » afficherait donc zéro valeur exploitable — alors que filtrer par sa
propre pointure est le premier geste de tout acheteur de chaussures.

Ce qui rend ce constat dangereux n'est pas sa difficulté : c'est son silence.
Aucun test n'échoue, le build passe, la page s'affiche, la facette est simplement
vide. Le même verrou existe pour `GABARIT_ORDER` (ligne 32).

**Correctif** : remplacer par un référentiel de pointures ordonné (EU 35 → 48,
demi-pointures comprises) exposé depuis `lib/catalog`, et non plus par une
constante locale au composant. Le tri doit être numérique : `["40", "41", "9"]`
trié alphabétiquement place `9` après `41`.

### BL-2 — Le back-office ne sait pas créer une grille de pointures

Trois faits qui se combinent :

1. `lib/admin.ts:444` — à la publication d'un brouillon d'import,
   **une seule ligne de taille est créée** :
   `db.insert(productSizes).values({ productSlug, name: "Taille unique", stock: 0 })`.
2. `lib/admin.ts:231-235` — `updateProduct` ne fait que des `UPDATE` sur
   `(product_slug, name)`. **Aucun `INSERT`, aucun `DELETE`** : la grille de tailles
   d'un produit est figée à sa création.
3. Il n'existe aucune autre écriture dans `product_sizes` en dehors du seed
   (vérifié : une seule occurrence d'`insert` sur cette table dans tout `src/lib`).

Conséquence : **tout produit créé via le back-office naît avec une unique
« Taille unique » à 0, et il n'existe aucun chemin d'interface pour lui ajouter la
pointure 42.** `isOutOfStock()` le déclare en rupture, la fiche affiche le
formulaire d'alerte de retour en stock, et le produit ne peut jamais être vendu.

Pour un catalogue d'accessoires seedé depuis `data.ts` avec 2 à 3 tailles fixes,
cette limite ne se voyait pas. Pour des baskets, c'est le cœur du métier : jusqu'à
20 lignes de stock par modèle, réapprovisionnées et retirées en permanence.

**Correctif** : ajouter la gestion des lignes de taille (ajout, suppression) dans
`updateProduct` et dans le formulaire de publication. Attention en supprimant :
`product_sizes` porte le stock, et `reserveStock()` s'appuie sur l'existence de la
ligne — supprimer une taille dont des commandes sont en cours de paiement ferait
échouer la restitution silencieusement. Interdire la suppression d'une taille dont
le stock est non nul, ou la tracer.

### BL-3 — Un coloris n'a pas de stock propre

`src/db/schema.ts` — `product_sizes` a pour clé primaire `(product_slug, name)`.
`src/lib/stock.ts` le dit explicitement :

> « Quantités agrégées par (produit, taille) — **deux coloris partagent le même stock**. »

C'était une simplification assumée (D-026, H14 : deux axes de variantes maximum,
pas d'URL propre par variante) et elle tenait pour un collier décliné en caramel et
brou de noix. Pour une basket, **le coloris est le SKU** : une paire en 42
« triple black » et la même en 42 « white/red » sont deux articles, avec deux stocks,
souvent deux prix, et chacun mérite son URL pour le référencement et pour un flux
Google Shopping.

En l'état, le panier et la ligne de commande enregistrent bien un coloris
(`order_lines.color`), mais `reserveStock()` ne réserve que sur `(slug, taille)` :
on vend deux fois le même stock physique sous deux coloris, et la commande
enregistre une couleur qui n'a jamais été réservée.

**Deux options, à trancher explicitement (cela mérite une entrée `D-xxx`) :**

- **(a) Un produit = un coloris.** Slug `air-max-90-triple-black`, le champ `colors`
  redevient une information d'affichage, les autres coloris sont reliés par
  `pairsWith`. **Coût : zéro ligne de code sur le stock, les commandes et le
  webhook.** C'est de la discipline de catalogue. *Recommandé.*
- **(b) Une vraie table de variantes** clé `(slug, coloris, taille)`. Touche
  `stock.ts`, `orders.ts`, `cart.ts`, `ProductView`, le back-office, la DDL et le
  chemin du webhook — c'est-à-dire qu'elle rouvre le correctif C-2 (le décrément
  conditionnel robuste à la concurrence), aujourd'hui un des points forts du dépôt.

L'option (a) préserve tous les invariants audités. L'option (b) est un chantier de
plusieurs semaines qui remet en jeu du code éprouvé, pour un bénéfice qui se limite
à une page produit unique par modèle.

### BL-4 — L'axe de taxonomie primaire doit être remplacé, pas supprimé

`Animal = "chien" | "chat" | "nac"` n'est pas une simple étiquette. Il est porteur
en huit points :

| Point d'ancrage | Emplacement |
|---|---|
| Segment de route | `src/app/(boutique)/[animal]/…` (3 niveaux) |
| Colonne + index | `products.animal`, `idx_products_animal_subcategory` |
| Clé primaire composite | `categories(animal, slug)` |
| Colonne éditoriale | `guides.animal` (+ valeur `"tous"`) |
| Colonne compte | `pets.species` |
| Facette de listing | `filters.animals`, paramètre d'URL `univers` |
| Génération statique | `generateStaticParams()`, `sitemap.ts` |
| Construction d'URL | `productPath()`, fil d'Ariane, JSON-LD |

**Recommandation** : conserver la forme `/{axe}/{catégorie}/{produit}` et renommer
l'axe en **`genre`** (`homme` / `femme` / `enfant`). C'est la taxonomie de tous les
distributeurs de sneakers, et elle préserve D-002 (≤ 3 niveaux, catégories parentes
cliquables, ≥ 10 produits par feuille).

**Ne pas prendre la marque comme axe primaire** : un même modèle existe en plusieurs
genres, la marque est une facette (**ST-2**) et, si une navigation par marque est
souhaitée, elle relève des pages d'atterrissage éditorialisées (H16), pas de la
route. Même raisonnement pour l'usage (running / lifestyle / basketball), qui est la
reconversion naturelle de la facette gabarit (**ST-1**).

⚠️ **Piège de migration** : les valeurs de `Animal` sont stockées en `text` sans
contrainte `CHECK`. Le renommage ne fera donc échouer aucune requête — il produira
des lignes orphelines invisibles. La bascule doit s'accompagner d'une purge du
catalogue (voir **OU-2** pour l'ordre imposé par les clés étrangères).

### BL-5 — Import AliExpress et baskets de marque : à trancher avant, pas après

Tout le pipeline d'import (D-052/H41 — `lib/aliexpress.ts`, table `import_drafts`,
`remotePatterns` verrouillés sur `alicdn.com` et `aliexpress-media.com`, CSP
`img-src` alignée) est conçu pour pré-remplir des fiches depuis des pages
fournisseur AliExpress. Appliqué à des accessoires de fabricants sans marque, c'est
du sourcing ordinaire. Appliqué à des baskets estampillées Nike, Adidas ou
New Balance approvisionnées par cette voie, cela relève de la contrefaçon
(art. L.716-9 et L.716-10 du code de la propriété intellectuelle), avec un risque
opérationnel immédiat : les prestataires de paiement gèlent un compte à la première
notification d'un ayant droit.

Le dépôt aggrave le sujet sur un point précis : `brand` est un **champ texte libre**,
pré-rempli depuis le `og:title` ou le nom de boutique du fournisseur
(`lib/aliexpress.ts`), publié sans contrôle sur la fiche publique **et dans le
JSON-LD `Brand`** (`lib/jsonld.ts`). Rien dans le code ne distingue une marque
revendiquée d'une marque réelle.

Ce constat n'est pas corrigeable en code : c'est une décision de sourcing. Deux
chemins propres :

1. **Marque propre ou marque blanche**, ou grossiste authentique avec factures :
   l'outil d'import reste utile pour la partie non estampillée du catalogue ;
2. **Revente de marques authentiques** : l'importateur AliExpress doit être retiré
   ou restreint, et remplacé par des flux fournisseur (CSV/EDI).

**Dans les deux cas** : `brand` doit devenir une liste contrôlée (table de
référentiel) plutôt qu'un texte libre. C'est aussi ce dont la facette Marque a
besoin (**ST-2**) — le même travail sert deux objectifs.

---

## 4. Constats structurels

### ST-1 — La facette « Gabarit animal » : à reconvertir, pas à supprimer

`Gabarit` (XS → XL, exprimé en kilos) est la « facette signature » présente sur
toutes les sous-catégories (D-027). Elle est câblée dans : `catalog/types.ts`
(type + `gabaritLabels`), `products.gabarits` (jsonb), `pets.gabarit`,
`filters.gabarits` + paramètre d'URL `gabarit`, `ListingExplorer` (constante d'ordre,
titre, puces de filtres actifs), `admin.publishDraft` (qui écrit en dur
`["XS","S","M","L","XL"]`), et le tableau du guide des tailles.

L'équivalent naturel pour des baskets est l'**usage** (running / lifestyle /
basketball / training / skate) : une facette transverse, présente sur toutes les
sous-catégories, qui joue exactement le rôle structurel du gabarit. Conserver
l'emplacement en renommant coûte bien moins cher que supprimer la facette puis en
recréer une.

⚠️ **Piège de renommage** : dans ce dépôt, « gabarit » désigne **aussi** un gabarit
de page, dans la prose des commentaires — « Gabarit A » (page animal), « Gabarit B »
(listing à facettes), « gabarit article », « gabarit des pages juridiques ». Un
`sed s/gabarit/usage/g` aveugle corrompt la documentation de huit fichiers. Renommer
les **identifiants** (`Gabarit`, `gabaritLabels`, `gabarits`, paramètre `gabarit`),
jamais la prose.

### ST-2 — Il n'existe pas de facette Marque, alors que le champ existe

`Filters` = `gabarits`, `sizes`, `materials`, `colors`, `animals`, `priceMin/Max`.
`brand` est présent sur le produit, affiché sur la fiche, indexé dans la recherche
admin — mais n'est ni facette, ni axe de navigation.

Pour des baskets, la marque est le premier filtre utilisé et souvent le point
d'entrée du parcours. À ajouter dans `Filters`, `matchesFilters`, `countActiveFilters`,
`filtersToSearchParams` / `filtersFromSearchParams` (paramètre `marque`) et
`ListingExplorer`. Les fonctions sont pures et testées — l'ajout est mécanique.

En contrepartie, la facette **« Matière »** (« Cuir », « Textile technique »,
« Chanvre »…) perd l'essentiel de sa valeur discriminante sur des chaussures : elle
est la candidate naturelle au remplacement, à nombre de facettes constant.

### ST-3 — Le guide des tailles est un tableau de poids canins écrit en dur

`ProductView.tsx:367-390` : le guide des tailles en overlay affiche une
correspondance `Taille / Gabarit / Poids` avec cinq lignes en dur, de « moins de
5 kg » à « plus de 40 kg », suivie d'un lien vers le guide
`/guides/comment-mesurer-votre-animal` et de la consigne « mesurez votre animal au
repos, ajoutez deux doigts d'aisance ».

Rien n'est réutilisable, mais **l'emplacement doit rester** : D-024 justifie le guide
des tailles par la réduction de la cause n°1 de retour. Cet argument est plus fort
encore pour la chaussure. Le remplacement attendu : correspondance EU / US / UK,
indication de chaussant (« taille petit / grand »), longueur en centimètres.

### ST-4 — « Mes animaux » n'a pas d'équivalent, mais il a une place

La table `pets`, la route `/compte/animaux`, les actions `listPets` / `addPet` /
`removePet`, l'illustration `M-ILL-05` et la personnalisation de l'accueil
(D-023, « Pour {animal} ») sont entièrement animaliers.

L'équivalent direct est un **profil de pointure** (« ma pointure », éventuellement
une par membre du foyer) : même finalité — pré-filtrer le listing d'un clic —, même
forme de table (`id, user_id, name, <axe>, <taille>`), et c'est la personnalisation
la plus rentable du secteur. Le CRUD, la limite à 5 (H24), l'écran de compte et la
décision D-015 (« optionnel et différé, jamais bloquant ») se transposent tels
quels. Reconvertir plutôt que supprimer.

### ST-5 — Le seuil de livraison offerte devient inopérant

`FREE_SHIPPING_CENTS = 7900`, pour un catalogue d'accessoires à 19–74 €. D-029 en
fait explicitement « le levier n°1 de l'objectif panier ≥ 70 € ».

Avec des baskets à 90–200 €, **toute commande franchit le seuil** : la livraison est
toujours offerte, la `FreeShippingBar` toujours pleine, le levier est mort et la
marge dépensée sans contrepartie.

Bonne nouvelle : c'est un réglage, pas du code (table `settings`, clé `shipping`,
éditable en back-office). Mais il doit être **re-décidé**, ainsi que la politique de
retours (D-040 : premier retour offert, suivants 4,90 €) — voir **CF-3**.

---

## 5. Contenu et direction artistique

### CO-1 — Les 31 médias sont intégralement à reprendre

`src/media/` : 31 fichiers JPEG, 22 Mo, tous animaliers. Ils sont référencés **par
nom** dans `lib/media.ts` (`universeCards`, `universeBanners`,
`productImages["collier-cuir-ambre"]`, `categoryImages["chien/colliers-harnais"]`,
`illustrations`) et dans `lib/guides.ts` (4 couvertures).

La **structure du registre** est réutilisable telle quelle — c'est un bon point de
conception. Les **fichiers** ne le sont pas. Et il ne s'agit pas d'un remplacement à
l'unité : D-042/D-043/D-044 verrouillent une direction artistique média complète
(4 registres de prise de vue, formats normés, palette crème/greige/caramel/sauge/
terracotta, lumière naturelle dorée, style « quiet luxury »), avec une Media Prompt
Library de ~60 gabarits en `docs/phase-3-medias/`. Le pivot rejoue les phases 3
et 4, pas un « chercher-remplacer ».

### CO-2 — La direction artistique est celle d'un univers animalier chaleureux

`src/styles/theme.css` : six gammes (cream, bark, caramel, sage, terracotta, pine),
couleur d'action vert pin `#2F5D50`, accent terracotta, display en **Fraunces**
(serif), corps en **Nunito Sans** (arrondi). C'est un registre délibéré
(D-044/D-046/D-047 : « chaleureux arrondi »). Les codes du retail sneakers sont à
l'opposé : contraste élevé, grilles denses, sans-serif technique.

L'architecture de tokens rend l'échange peu coûteux : remplacer les primitives et
les trois familles typographiques change tout le site sans toucher un seul
composant, et les contrastes sont validés AA au niveau **sémantique** (D-045) — donc
une seule revue d'accessibilité à refaire, pas 139.

**Une exception**, et elle est en base : `tone: "cream" | "sage" | "caramel" | "terracotta"`
est une **colonne de `products`**, un type TypeScript, une prop de `Placeholder`, une
valeur écrite en dur par `admin.publishDraft` et une valeur portée par les
24 produits du seed. Changer la palette impose donc une migration de données, pas
seulement une édition de tokens.

### CO-3 — 62 fichiers source portent le vocabulaire ; il n'existe aucun catalogue de textes

Les textes ne sont pas externalisés : ils sont **en JSX, dans les pages**. Notamment
les intros par univers (`[animal]/page.tsx`), les sections de l'accueil, les réponses
de la FAQ, les pages légales, les objets et corps d'e-mails, le slogan du JSON-LD,
les `title`/`description` de `layout.tsx`, le bandeau cookies, le pied de page, la
page 404 et `global-error.tsx`. Chacun est une réécriture manuelle — il n'y a pas de
fichier de locale à échanger.

Le nom de marque « chien et chat » est écrit en dur en huit endroits :
`jsonld.ts` (`SITE_NAME`), `layout.tsx`, `email.ts` (6 occurrences),
`admin/page.tsx` (logo + nom du CSV exporté), `company.ts` (`tradeName`),
`package.json` (`name` + `description`), et deux qui ne sont **pas cosmétiques** :

- `db/index.ts` — `globalThis.__chienEtChatDb` est la **clé du singleton de base par
  processus**. Les bundles Next chargent chacun leur copie du module ; sans clé
  partagée, chaque copie ouvrirait sa propre PGlite en mémoire. Renommer est sans
  risque, mais doit être fait **en une seule édition**, partout à la fois.
- `checkout.ts:45` — `name: "chien-et-chat-order"` est la clé de persistance
  `localStorage` de la dernière commande. La renommer orpheline l'état des visiteurs
  qui l'auraient déjà. Sans conséquence avant le lancement ; à faire maintenant.

### CO-4 — Le contenu éditorial est à réécrire intégralement, sans en inventer l'expertise

`lib/guides.ts` porte des articles complets avec leur appareil E-E-A-T : auteur
nommé, « relu par Marc Delorme, éducateur canin diplômé », dates de mise à jour,
sommaire ancré, sous-catégories liées, ≤ 3 cartes produit marquées comme sélection
(D-037). La **machinerie** se transpose intégralement. Le **texte**, non : le cluster
équivalent pour des baskets tourne autour du chaussant et des pointures, de
l'entretien, de l'authentification et des guides d'achat par usage.

⚠️ Le champ `reviewedBy` n'a pas d'équivalent automatique. **Ne pas y inscrire un
expert fictif pour « remplir » l'interface** : c'est exactement le piège de MO-7
(14 avis fictifs retirés au titre de l'art. L.121-4 — pratique commerciale
trompeuse). Soit un relecteur réel est identifié, soit le champ reste vide — la mise
en page le supporte déjà.

---

## 6. Conformité

### CF-1 — CR-4 reste ouvert, et le pivot ne le décale pas

Tous les champs de `lib/company.ts` valent littéralement `"À COMPLÉTER"` et sont
affichés tels quels sur `/mentions-legales`, `/cgv` et `/confidentialite`. Manquent
en outre une adresse e-mail de contact direct (LCEN art. 6-III-1), un numéro de
téléphone, et l'adhésion à un médiateur de la consommation agréé — obligatoire en
B2C français, plusieurs semaines de délai, **chemin critique du planning**.

Le pivot ne change rien à ce constat, avec un point favorable et un point de
vigilance :

- favorable : le nom commercial se change **en un seul endroit**
  (`company.tradeName`), qui est déjà la source unique des trois pages légales ;
- vigilance : la dénomination sociale, le SIRET et le contrat de médiation seront
  déposés sous la nouvelle identité. **Trancher le nom avant d'immatriculer**, sinon
  le délai de plusieurs semaines est payé deux fois.

### CF-2 — La directive Omnibus passe d'évolution à sujet de lancement

D-013 écarte toute page « Promotions » au lancement, par cohérence premium. Le
marché de la sneaker est structurellement promotionnel : la probabilité d'afficher
un prix barré est élevée dès les premiers mois.

Or, dès qu'un prix barré s'affiche, le prix de référence doit être **le plus bas
pratiqué au cours des 30 derniers jours**, et **il n'existe aucun historique de prix
en base** (le schéma n'a pas de table `product_price_history`). Ce n'est pas
rattrapable après coup : sans historique, il n'existe aucun prix de référence licite
pendant les 30 premiers jours.

**Si des promotions sont au plan, construire l'historique de prix avant la première
promotion**, pas après. Le coût est faible aujourd'hui (une table, une écriture dans
`updateProduct`), élevé plus tard.

### CF-3 — Le taux de retour d'une chaussure change l'économie de D-040

D-040 (premier retour offert, suivants 4,90 €) et D-009 (objectif panier ≥ 70 €) ont
été dimensionnés pour des accessoires. La chaussure a un taux de retour très
supérieur, essentiellement lié au chaussant — c'est la raison même pour laquelle
D-024 impose un guide des tailles. Le colis retour est également plus volumineux et
plus cher.

La **machinerie** de retour (retour self-service, `return_reason`, statuts D-016)
est saine et ne change pas. L'**économie** et la **rédaction des CGV**, si : la
condition d'état (article non porté, semelle non marquée) doit être écrite
explicitement, faute de quoi les litiges se tranchent en défaveur du vendeur.
À faire valider par le juriste (H30) en même temps que CR-4 — c'est la même
prestation, autant ne la commander qu'une fois.

---

## 7. Outillage, tests et données

### OU-1 — Quatre fichiers de test tombent avec le catalogue ; à porter, pas à supprimer

| Fichier | Ce qui casse |
|---|---|
| `lib/api.test.ts` | Assertions sur `collier-cuir-ambre`, `("chien","colliers-harnais")` = 6 produits, `("chat","couchages-cocons","cocon-feutre-alcove")` |
| `lib/catalog/filters.test.ts` | Construit ses cas sur les données du catalogue |
| `lib/cart.test.ts` | Idem, via `getProductBySlug` |
| `components/layout/Header/MegaMenu.test.tsx` | Liens `/chien`, `/chien/colliers-harnais`, libellé « Afficher les sous-catégories Chien » |

Ces tests sont **structurels**, pas décoratifs : `api.test.ts` garantit la bascule
mock → base à l'identique (H37), `filters.test.ts` couvre la logique de facettes (OU
au sein d'une facette, ET entre facettes), `MegaMenu.test.tsx` couvre D-002 et
l'accessibilité clavier du méga-menu. Un pivot qui se termine avec une suite verte
parce que les assertions ont été retirées perd ces garanties sans que rien ne le
signale.

Deux fixtures (`jsonld.test.ts`, `stock.test.ts`) contiennent des valeurs
animalières, mais ce sont de simples données de test : mise à jour triviale, la
couverture ne change pas.

### OU-2 — Le seed est verrouillé en idempotence : changer `data.ts` ne suffira pas

`db/seed.ts` — `seedIfEmpty` sort immédiatement si `products` contient déjà des
lignes. Sur Neon, dont la base **persiste entre les déploiements**, remplacer
`catalog/data.ts` par un catalogue de baskets ne produira **aucun effet** : le
catalogue animalier reste en place. En PGlite (dev, CI, build) le problème ne se
voit pas — la base est reconstruite à chaque démarrage. C'est exactement le genre
d'écart qui se découvre en production.

La bascule sur une base existante impose une purge **dans l'ordre des clés
étrangères** : `reviews` → `product_sizes` → `products` → `categories`
(`product_sizes.product_slug` et `reviews.product_slug` référencent
`products.slug`). Rien dans le dépôt ne fait ce travail aujourd'hui.

**Recommandation** : ne pas purger la base de production à la main. Créer une
branche Neon neuve pour le catalogue baskets et basculer `DATABASE_URL`. Noter que
la garde des guides est **indépendante** de celle des produits (`seedIfEmpty` teste
les deux séparément) : purger les produits ne réinjecte pas les guides.

### OU-3 — Les pièges du dépôt restent intégralement valables pendant le chantier

Aucun ne disparaît avec le changement de métier, et plusieurs sont directement sur
le chemin du pivot :

- `NODE_ENV === "production"` est vrai pendant `next build` → utiliser
  `isServingProduction()` de `lib/runtime-env.ts`. C'est ce qui a rouvert une faille
  pendant un mois en juillet (annulation en urgence, commit `4a2d8dc`).
- **Jamais de `middleware.ts`** sans exclure `/api/webhooks/stripe` — le webhook
  n'envoie aucun cookie de session et recevrait des 401. C'est pourquoi les en-têtes
  de sécurité vivent dans `headers()` de `next.config.ts`.
- **Jamais de `JSON.stringify` nu dans `dangerouslySetInnerHTML`** → `jsonLdScript()`.
  Le pivot ajoute des points d'injection JSON-LD (marque, pointures, disponibilité
  par variante) : chacun doit passer par cette fonction.
- Dans un module `"use server"`, tout export doit être une fonction `async`.
- `lib/stock.ts` est `server-only`, **pas** une Server Action — et contient un octet
  NUL comme séparateur de clé : `grep -a` obligatoire.
- Sur Vercel, `void maPromesse()` est tué dès la réponse envoyée → `after()` de
  `next/server`.
- Outillage : toujours `npx pnpm@10` (le pnpm global de la machine est en 11.5.2 et
  migrerait le lockfile v9.0 attendu par la CI). En local :
  `node ./node_modules/typescript/bin/tsc --noEmit` et
  `node ./node_modules/vitest/vitest.mjs run`. Dans la CI, **le build précède le
  typecheck** — `next build` génère `next-env.d.ts` : ne pas réordonner.

---

## 8. Ordre de chantier recommandé

L'ordre n'est pas indifférent : trois décisions conditionnent tout le reste, et deux
travaux longs ne sont pas du code.

**Jalon 0 — Décisions (aucun code).** Trancher BL-3 (un produit = un coloris, ou
table de variantes), BL-4 (axe `genre`), BL-5 (sourcing), et le nom commercial.
Consigner en `D-053` et suivants dans `docs/decision-log.md`. **Lancer en parallèle
CF-1** : immatriculation et adhésion au médiateur, qui prennent des semaines et ne
dépendent d'aucun développement.

**Jalon 1 — Modèle.** BL-4 (renommage de l'axe, DDL additive et purge), ST-1
(gabarit → usage), ST-2 (facette marque, référentiel de marques), ST-4 (pets →
profil pointure). Porter `api.test.ts` et `filters.test.ts` **en même temps**, pas
après.

**Jalon 2 — Pointures.** BL-1 (référentiel de pointures ordonné, tri numérique),
BL-2 (création et suppression de lignes de taille en back-office), ST-3 (guide des
tailles EU/US/UK). C'est le jalon qui rend la boutique vendable.

**Jalon 3 — Catalogue.** OU-2 (branche Neon neuve), nouveau `catalog/data.ts`,
`navigation.ts`, sous-catégories. Le catalogue démo actuel compte 24 produits
(H33/D-043) : viser un ordre de grandeur comparable pour ne pas fausser les
facettes.

**Jalon 4 — Contenu et direction artistique.** CO-1 à CO-4, plus ST-5 (seuil franco
et politique de retours). C'est le poste le plus lourd en volume, mais le moins
risqué techniquement — et il peut démarrer dès le jalon 0 côté rédaction et
production d'images.

**Jalon 5 — Conformité et clôture.** CF-2 (historique de prix, si des promotions
sont au plan — **avant** la première), CF-3 (CGV retours), reprise de la baseline :
`tsc` propre, tests verts, build sans variable d'environnement, `pnpm audit --prod`
en sortie 0.

**Rappel de mise en production, inchangé** : `BETTER_AUTH_SECRET` et `DATABASE_URL`
doivent être posées sur Vercel (scopes Production et Preview, valeurs distinctes)
**avant** toute fusion — les deux gardes échouent fermé. Après mise en ligne, purger
les sessions signées avec l'ancien secret public : `DELETE FROM "session";`.

---

## 9. État des constats

Même convention que `docs/audit-2026-07-reprise.md` §6 et
`docs/audit-2026-08-mise-en-production.md`. Aucun code n'ayant été modifié par cet
audit, tous les constats sont ouverts.

| Constat | Gravité pour le pivot | État | Détail |
|---|---|---|---|
| BL-1 Facette taille en liste blanche | Bloquant | ✅ Corrigé | `SIZE_ORDER`/`GABARIT_ORDER` supprimées ; valeurs déduites du périmètre, ordre donné par `catalog/sizes` (tri numérique) |
| BL-2 Grille de pointures incréable en admin | Bloquant | ✅ Corrigé | `updateAdminProduct` fait INSERT/UPDATE/DELETE ; suppression refusée si stock ≠ 0 ; `publishDraft` crée la grille complète de la marque |
| BL-3 Stock non ventilé par coloris | Bloquant | ✅ Corrigé | **D-054** : `product_variants (produit, coloris, pointure)` ; `stock.ts`, `orders.ts`, `cart.ts`, `ProductView`, admin et webhook portés |
| BL-4 Axe `[animal]` à remplacer | Bloquant | ✅ Corrigé | **D-055** : axe = marque, `/{marque}/{usage}/{produit}` ; garde de schéma qui refuse de démarrer sur l'ancienne base |
| BL-5 Import AliExpress et marques | Bloquant | ⏳ Ouvert | **D-058** : sourcing non tranché. `brand` est désormais un référentiel fermé, validé à l'écriture et jusqu'au JSON-LD — mais la décision reste requise avant lancement |
| ST-1 Facette gabarit → usage | Structurel | ✅ Corrigé | **D-056** : l'usage est passé au niveau sous-catégorie ; la facette signature est le genre. Prose « gabarit de page » non touchée |
| ST-2 Facette Marque absente | Structurel | ✅ Corrigé | `brands` ajoutée à `Filters`, paramètre `marque`, affichée sur les listings transverses |
| ST-3 Guide des tailles animalier | Structurel | ✅ Corrigé | Grille EU/UK/US + longueur de la marque du produit, avec sa **mention d'origine** ; conseil de chaussant du modèle |
| ST-4 « Mes animaux » → profil pointure | Structurel | ✅ Corrigé | **D-060** : table `shoe_profiles`, route `/compte/pointures`, sélecteur alimenté par le référentiel |
| ST-5 Seuil franco 79 € inopérant | Structurel | ℹ️ Sans objet en l'état | Le catalogue est à 49,99–69,99 € : le seuil de 79 € **redevient opérant** (l'audit supposait 90–200 €). À re-décider avec D-040 au jalon 4 (D-061) |
| CO-1 31 médias inutilisables | Contenu | ◐ Partiel | 22 Mo de visuels animaliers supprimés ; **93 photos produit réelles** intégrées (`public/produits/`, une série par coloris). Restent les visuels éditoriaux (hero, illustrations d'état) — registre en place, entrées vides |
| CO-2 Direction artistique animalière | Contenu | ◐ Partiel | `tone` migré vers `chalk`/`graphite`/`sand`/`signal` (une seule migration de données) ; primitives et typographies restent à remplacer — jalon 4 |
| CO-3 62 fichiers + 8 occurrences du nom | Contenu | ◐ Partiel | Vocabulaire animalier résiduel ramené de 62 à 0 fichier hors nom de marque. Le nom est **centralisé dans `company.tradeName`** : D-059 devient une édition d'une ligne. Clés de persistance dissociées (`STORAGE_PREFIX`), `__chienEtChatDb` inchangé |
| CO-4 Guides à réécrire | Contenu | ✅ Corrigé | 4 guides réécrits (2 piliers, 2 satellites) à partir des consignes officielles des marques. `author`/`reviewedBy` laissés **vides** — aucun relecteur fictif (piège MO-7) |
| CF-1 Mentions légales (= CR-4) | Conformité | ⏳ Ouvert | Inchangé. Le nom commercial est reporté (D-059) : l'immatriculation reste sur le chemin critique |
| CF-2 Omnibus / historique de prix | Conformité | ⏳ Ouvert | Toujours aucune table d'historique. À construire **avant** la première promotion |
| CF-3 Économie des retours | Conformité | ⏳ Ouvert | La condition d'état (non porté, semelle non marquée) est annoncée sur l'accueil mais **pas encore dans les CGV** — à faire valider (H30) |
| OU-1 4 fichiers de test à porter | Outillage | ✅ Corrigé | `api.test.ts`, `filters.test.ts`, `cart.test.ts`, `MegaMenu.test.tsx` **portés, pas vidés** ; `stock.test.ts` gagne le test qui verrouille D-054 (un coloris n'entame pas le stock d'un autre). 72/72 verts |
| OU-2 Seed verrouillé en idempotence | Outillage | ✅ Corrigé | `assertNotLegacySchema()` refuse de démarrer si `products.animal` existe encore, en nommant le remède (branche Neon neuve, pas de purge manuelle) |
| OU-3 Pièges du dépôt | Outillage | ℹ️ Rappel | Tous valables. Un piège en moins : l'octet NUL littéral de `lib/stock.ts` est devenu une séquence d'échappement — `grep` ordinaire suffit désormais |

**Baseline après jalons 1 à 3** : `tsc --noEmit` propre, `next build` réussi
(13 fiches, 6 listings et 5 pages marque prérendus), **72/72 tests sur
14 fichiers**.

**Non traité par cet audit** : le positionnement commercial, le sourcing, la
politique de prix et le plan média. Ce sont des décisions de commanditaire, pas des
constats de code — mais BL-3, BL-4, BL-5 et CF-1 en dépendent directement, ce qui en
fait le point de départ du chantier.

---

## 10. Limites

Analyse **statique** du dépôt à l'état du commit `c032bf3`, complétée par une
exécution de la suite de tests (70/70, 14 fichiers). N'ont **pas** été vérifiés :

- le comportement en conditions réelles sur Neon — le constat **OU-2** est déduit du
  code de `seedIfEmpty`, pas observé sur une base persistante ;
- le rendu visuel des facettes avec un catalogue de pointures — **BL-1** est déduit
  de la lecture de `SIZE_ORDER` et de la construction de `facetValues` ;
- toute considération de faisabilité commerciale : volumes, marges, disponibilité
  fournisseur, concurrence.

Aucun fichier du dépôt n'a été modifié par cet audit.
