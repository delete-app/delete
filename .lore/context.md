---
id: context:system:v1
updated: 2025-12-03
---

# Delete - System Context

## Purpose

Delete is a dating app with an unusual premise: **it's designed to be deleted**. While traditional dating apps profit from keeping users single and engaged (more swipes = more ad revenue), Delete aligns its incentives with users by focusing on creating lasting relationships.

The core philosophy: "Dating apps profit when you stay single. We don't."

## The Problem We're Solving

Traditional dating apps have a fundamental conflict of interest:
- Their revenue depends on user engagement (time in app, swipes, messages)
- Users want to find a partner and leave the app
- This creates perverse incentives: features that maximize engagement often harm relationship outcomes

Delete flips this model by:
1. Educating users on relationship science (not just matching them)
2. Matching on compatibility factors that predict long-term success (not just surface attraction)
3. Building features that help relationships succeed (not features that keep people single)

## Users

- **Singles seeking long-term relationships**: Primary audience. People tired of the swipe-and-ghost cycle who want something more intentional.
- **Learners**: People interested in relationship psychology, even if not actively dating. The /learn content serves as top-of-funnel and brand-building.
- **Neurodivergent daters**: ADHD, autism, anxiety - dating works differently for these groups. Dedicated content acknowledges this reality.

## External Systems

- **Tally (tally.so)**: Waitlist form collection. Form ID: `rjD9ZL`. Prefills email and city from landing page.
- **Vercel**: Hosting for landing app (trydelete.app). Planned for my app as well.
- **Social**: Instagram (@trydelete.app), X/Twitter (@trydeleteapp)

## External Systems (Implemented)

- **PostgreSQL 16 + pgvector**: Database with vector search for AI-powered matching (Docker Compose for local dev)

## Planned External Systems (Future)

- **React Native**: Mobile apps (iOS/Android)
- **Production PostgreSQL**: Managed PostgreSQL instance for production

## Containers

- [container:landing:v1] - Astro landing page with Starlight educational content
- [container:my:v1] - React SPA for authenticated users (placeholder)
- [container:api:v1] - Python FastAPI backend with JWT auth and async SQLAlchemy
- [container:shared:v1] - Shared TypeScript types and utilities

## Planned Containers (Future)

- `container:mobile` - React Native app

## Key Decisions

- [decision:0001:v1] - Turborepo monorepo with pnpm workspaces
- [decision:0002:v1] - Astro + Starlight for educational content
- [decision:0003:v1] - React SPA over Next.js for authenticated app
- [decision:0004:v1] - Python FastAPI for backend (ML-native)
- [decision:0005:v1] - Wikipedia-style citations for credibility

## Product Timeline

- **Now**: Landing page + educational content (brand building, waitlist collection)
- **2026**: App launch (per landing page)

## Design Philosophy

1. **Dark mode only**: Matches the "Delete" brand aesthetic
2. **Research-backed content**: Every claim has citations, Wikipedia-style
3. **No engagement tricks**: Honest, direct communication
4. **"Zerodha Varsity" inspiration**: Educational content modeled on the popular Indian financial education platform - research-backed, jargon-free, genuinely helpful
