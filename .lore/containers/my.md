---
id: container:my:v1
type: web-app
technology: "React 18 + Vite 6 + React Query"
package: "@delete/my"
updated: 2025-12-03
status: active
---

# My App (User Dashboard)

## Purpose

Authenticated user application for my.trydelete.app. This is where the actual dating app will live once launched.

**Current state**: Login/Signup flows implemented with typed API client. Dashboard placeholder.

## Why React + Vite (not Next.js)?

Key decision: This is a **Single Page Application (SPA)**, not a server-rendered app.

Reasoning:
- All routes require authentication (no public SEO needs)
- Real-time features planned (chat, notifications) work better with SPA
- Simpler deployment and hosting
- No need for SSR complexity when content isn't crawlable anyway

See [decision:0003:v1] for full rationale (documented in GitHub issue #32).

## API Client Architecture

The app uses a fully typed API client stack. See [decision:0010:v1] for rationale.

**Stack:**
- `openapi-typescript` - Generates TypeScript types from OpenAPI spec
- `openapi-fetch` - Type-safe fetch wrapper
- `openapi-react-query` - React Query integration with type inference

**Usage:**
```typescript
import { $api } from '../lib/api/hooks'

// Queries with full type safety
const { data, isLoading } = $api.useQuery('get', '/v1/users/me')

// Mutations with typed request/response
const login = $api.useMutation('post', '/v1/auth/login')
login.mutate({ body: { email, password } })
```

**Type generation:**
```bash
# Regenerate types when API changes
curl http://localhost:8000/openapi.json > apps/my/src/lib/api/openapi.json
pnpm --filter @delete/my generate:api
```

## Planned Features

- User profiles and onboarding
- Matching algorithm interface
- Messaging/chat
- Relationship tools and insights
- Progress tracking

## Key Files

| File | Purpose |
|------|---------|
| `apps/my/src/App.tsx` | Root component with routing |
| `apps/my/src/main.tsx` | React entry point with QueryClientProvider |
| `apps/my/src/lib/api/hooks.ts` | `$api` React Query hooks export |
| `apps/my/src/lib/api/client.ts` | Base openapi-fetch client |
| `apps/my/src/lib/api/schema.d.ts` | Auto-generated TypeScript types |
| `apps/my/src/lib/api/openapi.json` | Local OpenAPI spec copy |
| `apps/my/src/pages/Login.tsx` | Login page with typed mutation |
| `apps/my/src/pages/Signup.tsx` | Signup page with typed mutation |
| `apps/my/vite.config.ts` | Vite configuration (port 5174) |

## Dependencies

- Internal: `@delete/shared` (planned - for shared types)
- External: FastAPI backend at `api.trydelete.app`

**Key packages:**
- `@tanstack/react-query` - Server state management
- `openapi-fetch` - Type-safe API client
- `openapi-react-query` - React Query + openapi-fetch integration

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
