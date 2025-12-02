---
id: decision:0003:v1
title: "React SPA over Next.js for authenticated app"
status: accepted
date: 2024-12-03
links:
  containers:
    - container:my:v1
  external:
    - "GitHub issue #32"
---

# React SPA over Next.js for authenticated app

## Context

The "my" app (my.trydelete.app) will be the authenticated user dashboard - where actual dating app features live. Need to choose the right frontend architecture.

Key characteristics of this app:
- **All routes require authentication** (no public pages)
- **Real-time features** planned (messaging, notifications)
- **Heavy client-side state** (matches, conversations, profiles)
- **No SEO requirements** (content isn't public/crawlable)

## Decision

Use **React + Vite** as a Single Page Application (SPA), not Next.js with SSR.

This was documented in GitHub issue #32 as part of tech stack decisions.

## Alternatives Considered

### Next.js with SSR
- Pro: Unified React ecosystem, potential for SSR if needed
- Con: SSR complexity for authenticated routes (session handling, hydration)
- Con: Overkill when there's no SEO benefit
- Rejected: Adds complexity without corresponding benefit

### Next.js with static export
- Pro: Still get Next.js DX without SSR
- Con: Still brings Next.js opinions and constraints
- Rejected: If not using SSR, simpler to use Vite directly

### Remix
- Pro: Better data loading patterns
- Con: Server-focused when we want pure SPA
- Rejected: Good for content sites, overkill for authenticated SPA

### Create React App
- Pro: Simple, well-known
- Con: Deprecated, slower than Vite
- Rejected: Vite is the modern standard

## Consequences

### Positive
- Simpler mental model (pure client-side React)
- Faster development builds with Vite
- Easier deployment (just static files)
- No server-side session management complexity
- Better aligned with real-time features

### Negative
- No SSR fallback if requirements change
- Need to handle loading states carefully (no server-side data)
- Initial JavaScript bundle needs attention as app grows

### Neutral
- Will need client-side routing (React Router or similar)
- API calls happen entirely client-side

## Future Considerations

If we ever need:
- **Public profiles**: Could add a separate lightweight SSR service
- **SEO for some pages**: Landing site (Astro) already handles this
- **Better initial load**: Consider lazy loading and code splitting

## Related
- [container:my:v1] - Implements this decision
- [decision:0004:v1] - Python FastAPI backend (API consumed by this SPA)
