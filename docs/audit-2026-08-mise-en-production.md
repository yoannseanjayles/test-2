# Audit de mise en production — « chien et chat » (août 2026)

**Périmètre** : dépôt `yoannseanjayles/test-2`, branche `main`, commit `003dbab` (PR #567).
**Référentiel appliqué** : *Audit de Mise en Production des Applications Vibe-Codées* — 27 vérifications, 5 piliers.
**Méthode** : analyse statique exhaustive du code et de la configuration, scan de la totalité de l'historique Git, audit de la chaîne de dépendances (`pnpm audit` sur le lockfile), **build de production réel puis inspection du bundle client**, revue de conformité documentaire.

## Verdict

**NO-GO en l'état.** Trois points bloquants techniques et un point bloquant juridique.

Le code est nettement au-dessus de la moyenne des applications vibe-codées. Les deux pièges les plus mortels du référentiel — **autorité des prix côté serveur** (Check 13) et **signature de webhook Stripe** (Check 8/9) — sont correctement traités, ce qui n'est le cas ni dans les 70 % d'applications Lovable citées en introduction du référentiel, ni dans la majorité des intégrations Stripe générées par LLM. Un audit interne antérieur (`docs/audit-2026-07-reprise.md`) avait déjà refermé une grande partie de la surface.

Ce qui reste tient en trois familles : **une régression d'authentification introduite le 18/07/2026**, **une escalade de privilèges dans l'amorçage administrateur**, et **une couche d'infrastructure jamais posée** (en-têtes HTTP, isolation d'environnement, monitoring).

| Verdict | Nombre |
|---|---|
| 🔴 Critique — bloque le lancement | 4 |
| 🟠 Élevé — avant la première vente réelle | 7 |
| 🟡 Moyen — sous 30 jours | 8 |
| ✅ Conforme | 8 |

---

## Tableau de synthèse des 27 checks

| N° | Domaine | Verdict | Constat |
|---|---|---|---|
| 1 | Sécurité BDD (RLS) | ✅ N/A | Pas de BaaS : Neon n'est joignable que côté serveur, aucune clé publique exposée. Isolation assurée au niveau applicatif (voir Check 2). |
| 2 | Contrôle d'accès (IDOR) | 🟠 | `claimOrder` ne vérifie pas `emailVerified`, contrairement à `listMyOrders` et `requestReturn`. |
| 3 | Gestion des secrets | ✅ | **Vérifié sur le bundle compilé** : aucune clé privée. Seuls `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` et les URL d'auth sont inlinés — corrects. |
| 4 | Historique Git | ✅ | Scan des 90 commits : aucun `.env` commité, aucun motif de secret (`sk_live_`, `whsec_`, `re_`, DSN Postgres, `AIza`, `ghp_`). |
| 5 | Isolation environnements | 🟠 | Aucun `.env.example`. Sans `DATABASE_URL`, la production bascule **silencieusement** sur une base en mémoire. |
| 6 | Authentification & session | 🔴 | Secret de session de repli **codé en dur et public**. Régression du correctif C-7 de juillet. |
| 7 | Routes d'administration | 🔴 | `bootstrapAdmin` permet au premier visiteur inscrit de devenir Admin sur une base neuve. |
| 8 | Signature webhook | ✅ | `constructEventAsync` + rejet 400 sur signature absente ou invalide. |
| 9 | Webhook raw body | ✅ | `await request.text()` avant tout parsing JSON. |
| 10 | Traitement asynchrone | 🟡 | Traitement synchrone sans file d'attente ; e-mails lancés en `void` (perdus sur serverless). |
| 11 | Interception JWT webhook | ✅ | Aucun middleware global — le webhook n'est pas interceptable. *Piège si vous en ajoutez un : voir EL-2.* |
| 12 | Clés & métadonnées Stripe | 🟡 | Aucun garde-fou contre une clé `sk_test_` en production ; `metadata` sans `userId`. |
| 13 | Autorité des prix | ✅ | Le client n'envoie que `slug` + `quantity` ; prix relus en base, total recalculé serveur. |
| 14 | Validation du panier | 🟡 | Quantités bien bornées (entier, 1–20). Champs d'adresse sans longueur maximale. |
| 15 | Injections SQL / XSS | 🟠 | SQL : ✅ (Drizzle paramétré, zéro concaténation). XSS : vecteur stocké via JSON-LD. |
| 16 | Upload de fichiers | 🟡 | Limite de taille ✅, admin-only ✅, jamais servi ✅. Pas de contrôle MIME / magic bytes. |
| 17 | Limitation de débit | 🟠 | Compteur en mémoire, par instance, remis à zéro à froid. Endpoints d'authentification non couverts. |
| 18 | Masquage des erreurs | 🟠 | Pas de fuite de stack trace (Next.js masque en prod) — mais **aucune** error boundary ni monitoring. |
| 19 | Sécurité dépendances | 🔴 | **19 vulnérabilités** (11 hautes, 8 moyennes), dont SSRF Next.js via Server Actions. |
| 20 | Configuration CORS | ✅ | Aucune politique permissive ; pas de wildcard, pas d'API cross-origin. |
| 21 | En-têtes HTTP sécurité | 🟠 | **Aucun** en-tête : ni CSP, ni HSTS, ni X-Frame-Options, ni nosniff. |
| 22 | Pipeline CI/CD & MFA | 🟡 | CI présente mais sans audit de sécurité ni lint ; pas de Dependabot ; déploiement non conditionné à la CI. |
| 23 | Mentions légales | 🔴 | **Toutes** les données d'identification valent « À COMPLÉTER ». Ni e-mail direct, ni téléphone, ni médiateur. |
| 24 | Opposabilité CGV | 🟠 | Case à cocher présente et non pré-cochée ✅, mais consentement **jamais transmis ni stocké serveur**. Libellé du bouton non conforme. |
| 25 | Droit de rétractation | 🟡 | Délai correct dans les CGV. **Formulaire type de rétractation absent.** |
| 26 | RGPD & cookies | ✅ | CMP conforme CNIL, aucun traceur tiers, politique de confidentialité complète. |
| 27 | Directive Omnibus | 🟡 | Aucune promotion active → Omnibus non déclenchée. Mais 14 avis fictifs affichés et un champ « code promo » inerte. |

---

## 🔴 Constats critiques

### CR-1 · Secret de session de repli, public et exploitable — Check 6

**`src/lib/auth.ts:65`**

```ts
secret: process.env.BETTER_AUTH_SECRET ?? "dev-only-secret-chien-et-chat",
```

Si `BETTER_AUTH_SECRET` n'est pas posée sur Vercel, Better Auth signe **tous** les cookies de session avec une chaîne littérale lisible dans un dépôt GitHub public. Quiconque lit `auth.ts` peut forger un cookie de session valide pour n'importe quel `userId` — y compris un compte portant le rôle `Admin`. Toutes les gardes serveur (`requireRole`, `getSessionUser`) s'effondrent d'un coup, puisqu'elles font toutes confiance à cette signature.

Le code **documente lui-même la faille** (lignes 22-28) : un `console.error` est émis en production, puis l'exécution continue.

**Il s'agit d'une régression.** Le constat C-7 de l'audit de juillet avait été corrigé par un `throw`. Ce `throw` a été retiré le 18/07/2026 (commit `4a2d8dc`, « Correctif urgent : connexion et inscription cassées par le durcissement BETTER_AUTH_SECRET ») parce qu'il cassait `signup` et `login` pour tous les visiteurs. La cause réelle n'était pas le durcissement : c'est que **la variable n'est pas posée sur Vercel**. Le correctif a traité le symptôme et rouvert la faille.

**Correction :**

1. Poser `BETTER_AUTH_SECRET` sur Vercel (`openssl rand -base64 32`), scopes Production **et** Preview, valeurs distinctes.
2. Rétablir l'échec dur, en le maintenant hors du chemin de build statique — c'était le vrai défaut du premier correctif :

```ts
if (process.env.NODE_ENV === "production" && !process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET manquant — refus de démarrer l'authentification.");
}
```

`createAuth()` est déjà paresseux (appelé depuis `getAuth()`, jamais au chargement du module) : le `throw` ne s'exécute qu'à la première requête réelle. Confirmer ce point par un `pnpm build` avant de le rétablir.

3. Considérer toutes les sessions actuellement ouvertes comme compromises : purger la table `session` après la mise en place.

---

### CR-2 · Escalade de privilèges via l'amorçage administrateur — Check 7

**`src/lib/admin.ts:35-62`**

```ts
if (process.env.NODE_ENV === "production" && !process.env.DATABASE_URL
    && process.env.ALLOW_ADMIN_BOOTSTRAP !== "1") {
  return { ok: false, error: "Amorçage désactivé…" };
}
```

Le garde ne se déclenche **que si `DATABASE_URL` est absente**. Or `DATABASE_URL` est précisément ce que l'on pose pour une vraie production. En production correctement configurée, la condition est donc fausse et l'amorçage est **actif**.

Conséquence : sur une base Neon neuve, tant qu'aucune ligne `user.role = 'Admin'` n'existe, **le premier visiteur qui s'inscrit et appelle `bootstrapAdmin` devient administrateur**.

L'inspection du bundle compilé confirme que la cible est parfaitement découvrable : le chunk public `.next/static/chunks/app/admin/page-003f1f6cb98c9439.js` contient l'intégralité de l'interface du back-office, bouton « Devenir administrateur » compris, et 32 identifiants de Server Actions sont exposés au client.

L'attaque est une course : quiconque découvre le site avant que le propriétaire ne configure son compte prend le back-office — catalogue, commandes, adresses et e-mails clients, export CSV de la newsletter, remboursements Stripe.

La condition `NOT EXISTS` en SQL (ligne 57) est correcte et empêche bien deux admins concurrents. Elle ne protège en rien contre le fait que le *mauvais* utilisateur gagne la course.

**Correction :** retirer `bootstrapAdmin` du chemin de production et amorcer par SQL sur Neon :

```sql
UPDATE "user" SET role = 'Admin' WHERE email = 'votre@adresse.fr';
```

Si un amorçage en ligne reste souhaité, le restreindre à une adresse posée en variable d'environnement (`ADMIN_BOOTSTRAP_EMAIL`) comparée à `sessionUser.email`, et exiger que cette adresse soit vérifiée.

---

### CR-3 · 19 vulnérabilités de dépendances, dont SSRF sur les Server Actions — Check 19

`pnpm audit` sur `pnpm-lock.yaml` : **11 hautes, 8 moyennes.**

| Sévérité | Paquet | Version verrouillée | Correctif | Nature |
|---|---|---|---|---|
| HIGH | `next` | **15.5.20** | ≥ 15.5.21 | **SSRF via Server Actions** ; SSRF via rewrites ; DoS App Router |
| MODERATE | `next` | 15.5.20 | ≥ 15.5.21 | **Divulgation non authentifiée des identifiants de Server Functions** ; cache confusion ; payload non borné |
| HIGH | `sharp` | 0.34.5 | ≥ 0.35.0 | CVE libvips héritées |
| HIGH | `postcss` | 8.5.19 | ≥ 8.5.23 | Lecture de fichier arbitraire, path traversal |
| HIGH | `nanoid` | 3.3.16 | ≥ 3.3.18 | Boucle infinie |
| HIGH | `image-size` | 2.0.2 | ≥ 2.0.3 | DoS parsers ICNS / JXL / HEIF |
| HIGH | `brace-expansion` | 5.0.7 | ≥ 5.0.9 | DoS |
| MODERATE | `esbuild` | 0.18.20 | ≥ 0.24.3 | Serveur de développement ouvert |

Les deux advisories Next.js sont **directement dans la ligne de tir** : cette application est intégralement bâtie sur des Server Actions (9 modules `"use server"`, 32 identifiants d'actions exposés). « Unauthenticated disclosure of internal Server Function IDs » signifie qu'un attaquant peut énumérer les actions serveur — première étape de l'exploitation du reste.

Point positif : **aucun paquet halluciné ou inexistant.** Les 17 dépendances de production sont toutes légitimes et maintenues, et le lockfile est présent et versionné ✅ — les deux antipatterns du Check 19 sont évités.

**Correction :** `pnpm update next@^15.5.21 postcss sharp`, puis relancer `pnpm audit`. Le saut Next.js est **une seule version patch** — aucune migration attendue.

---

### CR-4 · Mentions légales inexistantes — Check 23

**`src/lib/company.ts:14-38`** — chaque champ vaut littéralement `"À COMPLÉTER"` :

`legalName`, `legalForm`, `rcs`, `siret`, `vat`, `address`, `publicationDirector`, ainsi que les trois champs `mediator`.

Ces valeurs sont interpolées telles quelles dans les pages publiques `/mentions-legales`, `/cgv` et `/confidentialite`. Le site affiche donc aujourd'hui : *« édité par À COMPLÉTER — raison sociale, À COMPLÉTER — forme juridique… »*.

S'y ajoutent trois manques de fond :

- **Aucune adresse e-mail de contact direct.** `/mentions-legales` renvoie au seul formulaire de contact (`page.tsx:20`). L'article 6-III-1 de la LCEN exige une adresse e-mail permettant une communication directe et effective.
- **Aucun numéro de téléphone** nulle part dans le code.
- **Médiateur de la consommation non désigné** — obligatoire pour tout e-commerçant B2C français (art. L.612-1 c. conso.). L'adhésion à un dispositif agréé (CM2C, Médicys, CNPM Médiation) prend plusieurs semaines : **c'est le chemin critique du planning, à lancer immédiatement.**

Sanctions encourues : jusqu'à 75 000 € (LCEN, personne physique) ou 375 000 € (personne morale) ; 15 000 € pour l'absence de médiateur.

---

## 🟠 Constats élevés

### EL-1 · `claimOrder` accepte une adresse non vérifiée — Check 2

**`src/lib/orders.ts:228-238`**

`listMyOrders` (ligne 211) et `requestReturn` (`admin-orders.ts:139-141`) exigent tous deux `account.emailVerified` avant tout rattachement par e-mail. `claimOrder` ne le fait pas :

```ts
if (row.email.toLowerCase() !== sessionUser.email.toLowerCase()) return { ok: false };
await db.update(orders).set({ userId: sessionUser.id })…
```

Quand `RESEND_API_KEY` est absente, `requireEmailVerification` vaut `false` (`auth.ts:45`) : n'importe qui peut s'inscrire avec l'adresse d'un tiers et, s'il connaît un numéro de commande invité (`CC-XXXXXXXXXX`), se l'approprier définitivement — avec l'adresse de livraison et le détail des articles. C'est le constat C-4 de juillet, resté ouvert sur ce chemin précis.

**Correction :** aligner sur les deux autres appels — charger la ligne `user` et exiger `emailVerified`.

### EL-2 · Aucun en-tête de sécurité HTTP — Check 21

**`next.config.ts`** ne comporte aucune fonction `headers()`. Le site est servi sans CSP, sans HSTS, sans `X-Frame-Options`, sans `X-Content-Type-Options`, sans `Referrer-Policy`, sans `Permissions-Policy`. La page de paiement est donc *iframable* — clickjacking sur le tunnel de commande.

**Correction :**

```ts
async headers() {
  return [{
    source: "/:path*",
    headers: [
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ],
  }];
}
```

Pour la CSP, prévoir `frame-src https://js.stripe.com` et `script-src https://js.stripe.com` (Stripe Elements), et démarrer en `Content-Security-Policy-Report-Only`.

> ⚠️ **Si vous implémentez la CSP via un `middleware.ts`** — le réflexe habituel pour générer un nonce — vous créez exactement le piège du Check 11. Le middleware Next.js intercepte **toutes** les routes, y compris `/api/webhooks/stripe`, qui n'envoie aucun cookie de session : Stripe recevrait des 401 et vos paiements ne seraient jamais confirmés. Excluez-la explicitement dans le `matcher`. Aujourd'hui l'absence de middleware protège le webhook par accident ; ajoutez-en un et cette protection disparaît.

### EL-3 · XSS stocké potentiel via JSON-LD — Check 15

**`src/lib/jsonld.ts:49-51`**, injecté dans `[produit]/page.tsx:101`, `[sousCategorie]/page.tsx:65`, `nouveautes/page.tsx:29`, etc.

```tsx
<script type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product)) }} />
```

`JSON.stringify` n'échappe pas le caractère `<`. Un `product.name`, `product.brand` ou `product.shortDescription` contenant `</script><script>…</script>` sort du bloc JSON-LD et s'exécute dans le contexte de la page.

Ces champs sont alimentés depuis le back-office (`updateAdminProduct`, `publishDraft`) et **pré-remplis par le parseur AliExpress** (`aliexpress.ts:71`, `og:title` d'une page fournisseur arbitraire). Aucun filtrage HTML n'est appliqué — uniquement des `slice()` de longueur. Le vecteur suppose un compte Catalogue, mais devient trivial si CR-1 ou CR-2 est exploité, et une CSP (EL-2) le neutraliserait.

**Correction :** échapper à la sérialisation.

```ts
const safeJsonLd = (data: unknown) =>
  JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
```

### EL-4 · La production peut démarrer sur une base en mémoire — Check 5

**`src/db/index.ts:147-153`**

```ts
const client = new PGlite(); // en mémoire : reconstruit à chaque build/boot
```

Le repli est **silencieux** : aucun garde `NODE_ENV === "production"`. Sans `DATABASE_URL`, une production Vercel tourne sur une base PGlite en mémoire, effacée à chaque démarrage à froid — commandes, comptes et sessions disparaissent, et chaque instance serverless a sa propre copie. `seedIfEmpty` réinjecte alors le catalogue de démonstration en production.

C'est aussi ce qui rend CR-2 doublement dangereux : la table `user` étant vidée à chaque cold start, la course à l'amorçage administrateur se rejoue indéfiniment.

**Correction :** refuser de démarrer en production sans `DATABASE_URL`, et ajouter un `.env.example` (absent du dépôt) documentant les 12 variables réellement lues :

`DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL`, `RESEND_API_KEY`, `EMAIL_FROM`, `CONTACT_EMAIL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.

Vérifier également que les bases Preview et Production de Vercel sont **deux branches Neon distinctes** — rien dans le dépôt ne le documente aujourd'hui.

### EL-5 · Limitation de débit en mémoire, authentification non couverte — Check 17

**`src/lib/rate-limit.ts:11`** — `const buckets = new Map<string, number[]>()`.

Le compteur vit dans le processus. Sur Vercel, chaque instance serverless a le sien et il est perdu à chaque démarrage à froid : la limite effective est `max × nombre d'instances`, et un attaquant obtient un quota neuf en espaçant ses requêtes. Le commentaire du fichier assume ce compromis, mais l'échéance « si besoin » est arrivée.

Surtout : **les endpoints d'authentification ne passent pas par ce module.** `/api/auth/*` est servi par Better Auth (`app/api/auth/[...all]/route.ts`) sans configuration `rateLimit` explicite dans `auth.ts` — on hérite des seuls défauts de la bibliothèque, eux aussi en mémoire. Connexion, inscription et réinitialisation de mot de passe sont donc les cibles les moins protégées du site, alors que ce sont celles que le Check 17 nomme en premier.

**Correction :** `@upstash/ratelimit` avec Upstash Redis (l'offre gratuite suffit à cette échelle), et configuration explicite du `rateLimit` de Better Auth sur le même stockage.

### EL-6 · Aucune error boundary, aucun monitoring — Check 18

Aucun fichier `error.tsx` ni `global-error.tsx` dans `src/app/`. Seul `not-found.tsx` existe.

Next.js masque bien les messages d'erreur serveur en production (remplacés par un digest) : **il n'y a pas de fuite de stack trace**, et le Check 18 est satisfait sur ce point précis. Le vrai problème est ailleurs — une erreur non gérée dans une Server Action affiche l'écran d'erreur brut de Next, et **personne n'est prévenu**. Aucun Sentry, aucun agrégateur. Les trois seuls `console.error` du code (`auth.ts:23`, `email.ts:33`, `orders.ts:158`) partent dans les logs Vercel, dont la rétention est d'une heure en offre Hobby.

Concrètement : l'échec d'envoi d'un e-mail de confirmation de commande est aujourd'hui invisible. Le `console.error` d'alerte sur `BETTER_AUTH_SECRET` (CR-1) l'est tout autant.

### EL-7 · Consentement CGV jamais vérifié côté serveur — Check 24

**`src/app/(tunnel)/checkout/CheckoutFlow.tsx:57,105,382-392`**

La case à cocher existe, n'est pas pré-cochée (`useState(false)`) et pointe vers `/cgv` — trois points conformes au référentiel. Mais le contrôle est **exclusivement côté client** : `placeOrder` (`orders.ts:34`) ne reçoit aucun champ de consentement, ne le vérifie pas, et **rien n'est horodaté en base**. La table `orders` n'a aucune colonne de consentement.

Un appel direct à la Server Action crée donc une commande sans acceptation. Plus gênant en cas de litige : vous n'avez **aucune preuve** que le client a accepté les CGV — ce qui est précisément l'objet de l'opposabilité recherchée.

**Correction :** transmettre `cgvAccepted` à `placeOrder`, rejeter la commande s'il est faux, et persister `cgv_accepted_at` ainsi que la version des CGV dans `orders`.

Second point : le bouton final affiche `Payer 49,90 €` (`CheckoutFlow.tsx:488`). L'article L.221-5 du Code de la consommation impose une mention **non ambiguë** quant à l'obligation de paiement — la formulation sûre reste « Commande avec obligation de paiement ».

---

## 🟡 Constats moyens

| Réf | Check | Constat | Emplacement |
|---|---|---|---|
| MO-1 | 10 | Webhook synchrone sans file d'attente, et e-mails lancés en `void` : sur Vercel, l'instance gèle dès la réponse renvoyée — les promesses non attendues sont tuées. Des e-mails de confirmation sont perdus silencieusement. Utiliser `waitUntil()` de `@vercel/functions`, ou une file (Inngest / QStash). | `api/webhooks/stripe/route.ts:49`, `orders.ts:140`, `admin-orders.ts:121,154` |
| MO-2 | 12 | Aucun garde-fou contre une clé `sk_test_` déployée en production. `metadata` ne contient que `orderNumber` — y ajouter `userId` faciliterait réconciliation et litiges. | `orders.ts:100-106` |
| MO-3 | 14 | `firstName`, `lastName`, `address`, `city` n'ont qu'un `min()`, aucun `max()`. Un champ de plusieurs Mo est accepté et stocké. | `checkout-schemas.ts:15-28` |
| MO-4 | 16 | `importAliexpressFiles` ne contrôle ni le type MIME ni les magic bytes. Risque réel faible (admin-only, fichier jamais stocké ni servi, URLs d'images verrouillées par regex sur les seuls CDN AliExpress), mais 15 Mo × N fichiers passés en regex dans une Server Action peuvent faire expirer la fonction. | `admin.ts:293-325` |
| MO-5 | 22 | La CI enchaîne `build → typecheck → test`. Manquent : `pnpm audit --audit-level high`, `pnpm lint` (le script existe mais n'est jamais appelé), Dependabot ou Renovate, et le scan de secrets. Le déploiement Vercel n'est pas conditionné au succès de la CI. MFA sur GitHub / Vercel / Neon / Stripe : à vérifier hors dépôt. | `.github/workflows/ci.yml` |
| MO-6 | 25 | Le délai de 14 jours est correctement annoncé et étendu à 30 jours commercialement, mais le **formulaire type de rétractation** (annexe I de la directive 2011/83, art. R.221-1 c. conso.) est absent. Son omission prolonge de plein droit le délai de rétractation de 12 mois. | `(boutique)/cgv/page.tsx:20` |
| MO-7 | 27 | Aucune promotion ni prix barré n'est implémenté : **la directive Omnibus n'est pas déclenchée aujourd'hui**, et aucun historique de prix n'existe pour le jour où elle le sera. Deux réserves : (a) 14 avis fictifs sont affichés comme des avis clients — le badge « Achat vérifié » a bien été retiré (`verified: false` partout, correctif C-5 vérifié), mais publier de faux avis reste une pratique commerciale trompeuse (art. L.121-4 c. conso.) ; (b) le champ « Code promo » du panier est purement décoratif. | `catalog/data.ts` (14 occurrences), `panier/CartPageContent.tsx:100` |
| MO-8 | 7 | `/admin` et `/compte/*` sont des composants client sans garde serveur au niveau de la page : le squelette HTML et tout le JS du back-office sont servis publiquement (confirmé sur le build). **Aucune donnée ne fuit** — les 14 actions d'administration appellent toutes `requireRole` ✅. C'est de la défense en profondeur manquante, pas une faille — mais elle offre la carte du terrain à qui veut exploiter CR-2. | `app/admin/page.tsx:1`, `(boutique)/compte/*/page.tsx` |

---

## ✅ Points conformes — à préserver

- **Check 13 — Autorité des prix.** Le client n'envoie que `slug`, `size`, `color`, `quantity`. Prix relus en base, sous-total, frais de port et total recalculés serveur (`orders.ts:61-76`). Les produits archivés sont exclus de la commande. C'est le point que la majorité des applications vibe-codées ratent.
- **Check 8/9 — Webhook Stripe.** `constructEventAsync` sur `await request.text()`, rejet 400 sans signature, transition idempotente conditionnée à l'état `« En attente de paiement »` : les relances Stripe ne produisent ni double e-mail ni double restitution de stock (`route.ts:22-44`).
- **Check 15 (SQL) — Zéro injection.** Deux usages de SQL brut seulement, tous deux sur chaînes statiques (`db/index.ts:134`, DDL constant ; `admin.ts:57`, littéral). Tout le reste passe par Drizzle paramétré.
- **Check 3/4 — Secrets.** Aucune clé privée dans le bundle compilé (vérifié après `next build`), historique Git propre sur 90 commits.
- **Check 26 — RGPD.** CMP interne avec « Tout accepter » / « Tout refuser » d'égale visibilité, conforme aux lignes directrices CNIL ; aucun traceur posé avant consentement — et de fait **aucun traceur tiers du tout**. Politique de confidentialité complète : responsable de traitement, finalités, bases légales, durées de conservation, droits, sous-traitants nommés.
- **Réservation de stock.** Décrément conditionnel `gte(stock, quantity)` en une requête, restitution sur échec de paiement, annulation ou erreur d'enregistrement (`stock.ts:33-58`). Robuste à la concurrence.
- **Anti-injection tableur** sur l'export CSV newsletter (`admin-editorial.ts:100`) et **échappement HTML systématique** dans tous les e-mails (`email.ts:11`).
- **Verrouillage des sources d'images** : les URLs importées sont filtrées par regex sur les seuls CDN AliExpress (`aliexpress.ts:106`), et `next.config.ts` restreint `remotePatterns` aux mêmes domaines — double barrière.

---

## Plan d'action

### Avant tout déploiement public

1. **CR-1** — Poser `BETTER_AUTH_SECRET` sur Vercel, rétablir l'échec dur, purger la table `session`.
2. **CR-2** — Neutraliser `bootstrapAdmin`, amorcer l'administrateur par SQL.
3. **EL-4** — Poser `DATABASE_URL` (Neon), refuser le démarrage en production sans elle, créer `.env.example`.
4. **CR-3** — `pnpm update next@^15.5.21 postcss sharp`, relancer `pnpm audit`.
5. **EL-2** — En-têtes de sécurité dans `next.config.ts` (sans middleware, ou avec exclusion explicite du webhook).

### Avant la première vente réelle

6. **CR-4** — Immatriculation, mentions légales complètes, e-mail et téléphone directs. **Lancer l'adhésion au médiateur dès aujourd'hui.**
7. **EL-7** — Consentement CGV vérifié serveur et horodaté ; libellé du bouton « Commande avec obligation de paiement ».
8. **EL-1** — `emailVerified` exigé dans `claimOrder`.
9. **EL-3** — Échappement `<` du JSON-LD.
10. **EL-5** — Rate limiting Upstash, y compris sur Better Auth.
11. **MO-6** — Formulaire type de rétractation.
12. **MO-7** — Retirer les 14 avis fictifs et le champ « code promo » inerte.
13. **Vérification dynamique** (hors de portée d'une analyse statique) : rejouer les Checks 2, 7, 8, 11 et 13 sur l'environnement déployé — mutation d'identifiants dans les Server Actions, `POST` anonyme sur le webhook, `stripe listen` en local, altération du panier au proxy.

### Sous 30 jours

14. **EL-6** — Sentry + `error.tsx` / `global-error.tsx`.
15. **MO-1** — `waitUntil()` ou file d'attente pour les e-mails et le post-traitement du webhook.
16. **MO-5** — `pnpm audit` et `pnpm lint` dans la CI, Dependabot, déploiement conditionné à la CI.
17. **MO-2, MO-3, MO-4** — Garde-fou clé de test, bornes maximales des champs d'adresse, contrôle MIME à l'import.
18. **MFA** sur GitHub, Vercel, Neon, Stripe et Resend ; jetons de déploiement au privilège minimal.

---

---

## État des correctifs (branche `securite/audit-2026-08`)

Même convention que `docs/audit-2026-07-reprise.md` §6.

| Constat | État | Détail |
|---|---|---|
| CR-1 Secret de session de repli | ✅ Corrigé | Échec dur rétabli (`auth.ts`), placé avant l'ouverture de la base. Nouveau `lib/runtime-env.ts` : `isServingProduction()` exclut `NEXT_PHASE=phase-production-build`, ce qui évite la régression du 18/07. **Reste à poser `BETTER_AUTH_SECRET` sur Vercel et à purger la table `session`.** |
| CR-2 Escalade via `bootstrapAdmin` | ✅ Corrigé | Amorçage réservé à `ADMIN_BOOTSTRAP_EMAIL`, adresse vérifiée exigée, message identique que la variable soit posée ou non. |
| CR-3 19 vulnérabilités | ✅ Corrigé | `next` 15.5.20 → 15.5.23, `postcss` → 8.5.26, overrides `nanoid` / `brace-expansion` / `sharp`. 19 → 3, les 3 restantes en devDependencies (storybook, drizzle-kit). Lockfile régénéré avec pnpm 10. |
| CR-4 Mentions légales | ⏳ Ouvert | Hors code : immatriculation, e-mail et téléphone directs, adhésion à un médiateur agréé. Chemin critique du planning. |
| EL-1 `claimOrder` sans e-mail vérifié | ✅ Corrigé | `emailVerified` exigé, aligné sur `listMyOrders` et `requestReturn`. |
| EL-2 En-têtes de sécurité | ✅ Corrigé | 6 en-têtes + CSP en Report-Only dans `next.config.ts`, hors middleware pour ne pas intercepter le webhook. Vérifiés sur `next start`. |
| EL-3 XSS via JSON-LD | ✅ Corrigé | `jsonLdScript()` échappe `<`, `>` et `&` sur les 10 sites d'injection. Couvert par `src/lib/jsonld.test.ts`. |
| EL-4 Base mémoire en production | ✅ Corrigé | Démarrage refusé sans `DATABASE_URL` hors phase de compilation. `.env.example` ajouté (12 variables). |
| EL-5 Rate limiting en mémoire | ✅ Corrigé | Compteur déplacé en base (`rate_limit_hits`, purge à la volée, repli mémoire si la base tombe) — aucun service tiers à provisionner. Surtout : `/api/auth/*` est désormais couvert (10 connexions / 10 min, 5 inscriptions ou réinitialisations / h), contrôle posé dans le route handler et non dans un middleware. Vérifié : 429 à la 11ᵉ tentative, `get-session` non limité. |
| EL-6 Aucun monitoring | ✅ Corrigé (avec réserve) | `error.tsx` et `global-error.tsx` ajoutées, digest affiché au visiteur pour le support. `lib/observability.ts` émet une ligne JSON par incident. **Sentry n'est pas installé** (compte et DSN requis) : le point de branchement est marqué dans `reportError()`, tout le code applicatif y passe déjà. |
| EL-7 Consentement CGV | ✅ Corrigé | `placeOrder` reçoit, vérifie et horodate `cgvAccepted` ; colonnes `cgv_accepted_at` / `cgv_version`. Bouton final : « Commander avec obligation de paiement ». |
| MO-1 Traitement asynchrone | ✅ Corrigé | Les quatre `void send…` deviennent `after(() => …)` (`next/server`, stable en 15.5) : sur Vercel l'instance gèle dès la réponse et tuait les promesses non attendues. Aucune dépendance ajoutée. |
| MO-2 Clés & métadonnées Stripe | ✅ Corrigé | Une `sk_test_` en production fait refuser la commande, restituer le stock et journaliser l'incident. `metadata` porte `userId` et `customerEmail`. |
| MO-3 Bornes des champs d'adresse | ✅ Corrigé | `.max()` sur prénom (60), nom (60), adresse (200), ville (80), e-mail (254, RFC 5321). |
| MO-4 Contrôle MIME à l'import | ✅ Corrigé | Extension, type MIME, huit signatures binaires (ZIP, MZ, ELF, PDF, PNG, GIF, RAR, gzip) et détection d'octet nul. Extrait dans `lib/import-guard.ts` pour être testable hors module `"use server"` — 7 cas. |
| MO-5 CI sans audit de sécurité | ✅ Corrigé | Second job `securite` : audit bloquant sur les dépendances de production, audit complet informatif, scan de secrets sur tout l'historique, refus de tout `.env` versionné — sans action tierce. `.github/dependabot.yml` ajouté. `pnpm lint` écarté : le projet n'a aucune configuration ESLint. Le gating du déploiement se règle côté Vercel, pas dans le dépôt. |
| MO-6 Formulaire de rétractation | ✅ Corrigé | Annexe ajoutée aux CGV (`lib/legal.ts`), section « Rétractation » complétée. `LegalPage` accepte un `appendix`. |
| MO-7 Avis fictifs & code promo | ✅ Corrigé | 14 avis retirés, section « Ils nous font confiance » masquée si vide, « N avis vérifiés » → « N avis », champ « code promo » supprimé. `filters.test.ts` réécrit sur des avis injectés. |
| MO-8 Pages admin/compte côté client | ✅ Corrigé | Layout serveur sur `/admin` : `notFound()` pour un visiteur anonyme (plutôt qu'une redirection, qui révélerait le back-office). La garde porte sur la session et non sur le rôle, pour que l'écran d'amorçage reste atteignable. `/admin` passe de ○ à ƒ. `/compte/*` volontairement non gardé : la page porte le formulaire de connexion. Limite assumée : le chunk JS reste téléchargeable à son URL. |

**Vérifications** : `tsc --noEmit` propre · 70/70 tests (12 → 14 fichiers) · build de 78 pages **sans aucune variable d'environnement** · en conditions réelles : `/admin` en 404 anonyme, `/` et `/compte` en 200, 6 en-têtes de sécurité émis, 429 à la 11ᵉ tentative de connexion.

**Reste ouvert : CR-4 seul** — mentions légales, e-mail et téléphone directs, adhésion à un médiateur agréé. Écarté de ce chantier à la demande du commanditaire ; c'est du travail juridique, pas du code, et l'adhésion au médiateur reste le chemin critique du planning.

⚠️ **Avant de fusionner** : CR-1 et EL-4 échouent désormais *fermé*. Poser `BETTER_AUTH_SECRET` et `DATABASE_URL` sur Vercel (scopes Production et Preview, valeurs distinctes) **avant** la fusion, sinon l'authentification et la base refuseront de démarrer.

## Limites de cet audit

Analyse **statique** du dépôt à l'état du commit `003dbab`, complétée par un build de production et l'inspection du bundle client. N'ont **pas** pu être vérifiés, faute d'accès :

- **La configuration réelle des variables d'environnement sur Vercel.** CR-1, CR-2 et EL-4 sont des risques **conditionnels** à cette configuration. Ils peuvent être déjà neutralisés, ou pleinement actifs : rien dans le dépôt ne permet de trancher. C'est le premier point à lever.
- L'activation de la MFA sur les comptes d'infrastructure (Check 22).
- La séparation effective des bases Preview / Production sur Neon (Check 5).
- Le comportement runtime : tests d'IDOR par mutation d'identifiants, `POST` non signé sur le webhook, altération de requêtes au proxy (Checks 2, 7, 8, 11, 13) — à rejouer sur l'environnement déployé.
