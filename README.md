# Pelage

E-commerce premium d'accessoires pour animaux (chiens, chats, NAC) — projet conçu et documenté par phases avec validation humaine (HITL) à chaque livrable.

## Documentation

Tout le projet est documenté dans [`docs/`](docs/) :

- [`docs/project-overview.md`](docs/project-overview.md) — vision, périmètre, état d'avancement
- [`docs/roadmap.md`](docs/roadmap.md) — phases et jalons
- [`docs/decision-log.md`](docs/decision-log.md) — toutes les décisions (D-001 → …) et leur justification
- `docs/phase-1` → `phase-5` — architecture, spécifications de pages, médias, design system, front-end

## Front-end (Phase 5)

Stack (D-048) : **Next.js 15** (App Router, RSC) · **TypeScript strict** · **Tailwind CSS v4** (tokens `@theme` issus des Design Guidelines 4.1) · **Storybook** · Vitest + Testing Library + jest-axe.

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
│   └── layout/     # AnnouncementBar, Header/MegaMenu, MobileNav, Footer
├── lib/            # navigation (sitemap), utils
├── styles/         # theme.css (tokens 4.1), fonts (3 variables self-hostées)
└── fonts/          # Fraunces, Work Sans, Nunito Sans (woff2, subset latin)
```
