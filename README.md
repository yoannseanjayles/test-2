# snikerz

E-commerce de baskets et sneakers — 13 modèles, 5 marques (On, Nike, Saucony, ASICS, Salomon).
Projet conçu et documenté par phases avec validation humaine (HITL) à chaque livrable.

Depuis août 2026, le front-end est habillé d'après le thème **Azeno** (Shopify OS 2.0, sportswear) :
voir [`docs/phase-4-design-system/4.2-refonte-azeno.md`](docs/phase-4-design-system/4.2-refonte-azeno.md).

## Documentation

Tout le projet est documenté dans [`docs/`](docs/) :

- [`docs/project-overview.md`](docs/project-overview.md) — vision, périmètre, état d'avancement
- [`docs/roadmap.md`](docs/roadmap.md) — phases et jalons
- [`docs/decision-log.md`](docs/decision-log.md) — toutes les décisions (D-001 → …) et leur justification
- `docs/phase-1` → `phase-5` — architecture, spécifications de pages, médias, design system, front-end
- [`docs/phase-4-design-system/4.2-refonte-azeno.md`](docs/phase-4-design-system/4.2-refonte-azeno.md) — la refonte Azeno (tokens, typographie, composants)
- [`docs/phase-3-medias/3.3-prompts-visuels-azeno.md`](docs/phase-3-medias/3.3-prompts-visuels-azeno.md) — prompts Google Flow pour les visuels manquants

## Front-end (Phase 5)

Stack (D-048) : **Next.js 15** (App Router, RSC) · **TypeScript strict** · **Tailwind CSS v4**
(tokens `@theme` — Design Guidelines 4.1, valeurs repointées par la refonte 4.2) · **Storybook** ·
Vitest + Testing Library + jest-axe.

```bash
pnpm install
pnpm dev            # http://localhost:3000
pnpm test           # tests unitaires + accessibilité (axe)
pnpm build          # build de production
pnpm storybook      # documentation des composants
```

### Structure

```
src/
├── app/            # App Router — routes = sitemap 1.2
├── components/
│   ├── ui/         # primitives (Button, FormField, Badge, Accordion…)
│   └── layout/     # AnnouncementBar, Header/MegaMenu, PageHero, MobileNav, Footer
├── lib/            # navigation (sitemap), utils
├── styles/         # theme.css (tokens 4.1 repointés 4.2), fonts
└── fonts/          # Bebas Neue + Jost (woff2, subset latin)
```
