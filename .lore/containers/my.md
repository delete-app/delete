---
id: container:my:v1
type: web-app
technology: "React 18 + Vite 6"
package: "@delete/my"
updated: 2025-12-03
status: placeholder
---

# My App (User Dashboard)

## Purpose

Authenticated user application for my.trydelete.app. This is where the actual dating app will live once launched.

**Current state**: Placeholder with "coming soon" message. The infrastructure is set up but no features are implemented yet.

## Why React + Vite (not Next.js)?

Key decision: This is a **Single Page Application (SPA)**, not a server-rendered app.

Reasoning:
- All routes require authentication (no public SEO needs)
- Real-time features planned (chat, notifications) work better with SPA
- Simpler deployment and hosting
- No need for SSR complexity when content isn't crawlable anyway

See [decision:0003:v1] for full rationale (documented in GitHub issue #32).

## Planned Features

- User profiles and onboarding
- Matching algorithm interface
- Messaging/chat
- Relationship tools and insights
- Progress tracking

## Key Files

| File | Purpose |
|------|---------|
| `apps/my/src/App.tsx` | Root component (currently placeholder) |
| `apps/my/src/main.tsx` | React entry point |
| `apps/my/vite.config.ts` | Vite configuration (port 5174) |
| `apps/my/index.html` | HTML shell |

## Dependencies

- Internal: `@delete/shared` (planned - for shared types)
- External: Will connect to FastAPI backend (not yet built)

## Deployment

- Platform: Vercel (planned)
- Domain: my.trydelete.app (planned)
- Build: `tsc -b && vite build` via Turborepo pipeline
- Output: Static SPA in `dist/`

## Code Location

- Root: `apps/my/`
- Package name: `@delete/my`

## Development

```bash
# From monorepo root
pnpm dev:my

# Runs on http://localhost:5174
```

## Future Architecture

When the app is built out, expected structure:

```
apps/my/src/
├── components/     # Reusable UI components
├── pages/          # Route-level components
├── hooks/          # Custom React hooks
├── api/            # API client (FastAPI integration)
├── store/          # State management
└── types/          # TypeScript types (may move to shared)
```
