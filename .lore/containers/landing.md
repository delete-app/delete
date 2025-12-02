---
id: container:landing:v1
type: web-app
technology: "Astro 5 + Starlight"
package: "@delete/landing"
updated: 2025-12-03
---

# Landing App

## Purpose

Public-facing website at trydelete.app. Serves two key functions:

1. **Landing page** (`/`): Convert visitors to waitlist signups
2. **Learn section** (`/learn/*`): Educational content on relationship psychology

The Learn section is inspired by Zerodha Varsity - research-backed, jargon-free educational content that builds brand trust before the app even launches.

## Why Astro + Starlight?

- **Static generation**: Maximum performance for content-heavy site
- **Starlight**: Purpose-built for documentation/educational content
- **MDX support**: Rich content with React components where needed
- **SEO-first**: Meta tags, sitemap, structured data out of the box
- **Dark mode customization**: Overrode theme components to force dark mode only

See [decision:0002:v1] for full rationale.

## Components

- [component:landing.homepage:v1] - Main landing page with waitlist form
- [component:landing.learn:v1] - Starlight-powered educational modules

## Key Files

| File | Purpose |
|------|---------|
| `apps/landing/src/pages/index.astro` | Landing page with inline CSS/JS (intentionally minimal) |
| `apps/landing/astro.config.mjs` | Starlight configuration, sidebar, theme overrides |
| `apps/landing/src/content/docs/learn/**/*.md` | Educational content in Markdown |
| `apps/landing/src/components/ForceDarkTheme.astro` | Theme override to disable light mode |
| `apps/landing/vercel.json` | Vercel deployment configuration |

## Content Structure

```
src/content/docs/learn/
├── index.mdx                      # Welcome/overview page
├── module-1-know-yourself/        # Self-awareness module
│   ├── 1-why-self-awareness-matters.md
│   ├── 2-your-attachment-style.md
│   ├── 3-how-you-handle-conflict.md
│   ├── 4-your-emotional-needs.md
│   └── 5-your-relationship-with-yourself.md
├── module-2-attraction/
│   └── limerence-vs-love.md
└── module-4-neurodivergent/
    └── adhd-in-relationships.md
```

## Content Patterns

Each educational page follows a consistent structure:
1. **Hook** - Relatable scenario ("Why do you keep texting them...")
2. **The science** - Research explanation with citations
3. **Examples** - Indian names/contexts (Meera, Rahul, Vikram, Ananya)
4. **Self-assessment** - Quick reflection questions
5. **One thing to know** - Actionable takeaway

Citations use Wikipedia-style superscript notation: `<sup>[[1]](doi-link)</sup>` with a References section at the bottom.

## Dependencies

- External: Tally form (waitlist collection via redirect)
- Internal: None (standalone container)

## Deployment

- Platform: Vercel
- Domain: trydelete.app
- Build: `astro build` via Turborepo pipeline
- Output: Static HTML in `dist/`

## Code Location

- Root: `apps/landing/`
- Package name: `@delete/landing`
