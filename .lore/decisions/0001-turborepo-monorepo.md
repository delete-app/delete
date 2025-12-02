---
id: decision:0001:v1
title: "Turborepo monorepo with pnpm workspaces"
status: accepted
date: 2024-12-03
links:
  containers:
    - container:landing:v1
    - container:my:v1
    - container:shared:v1
  commits:
    - git:6bf190a
---

# Turborepo monorepo with pnpm workspaces

## Context

The project started as a single landing page but is evolving into multiple applications:
- Landing page (public marketing + educational content)
- User app (authenticated dating app)
- Shared utilities
- Future: API server, mobile apps

Managing these as separate repositories would create:
- Duplicate configuration (ESLint, TypeScript, etc.)
- Complex cross-repo dependencies
- Difficult local development experience
- Inconsistent tooling across projects

## Decision

Adopt a **monorepo structure** using:
- **Turborepo** for task orchestration and caching
- **pnpm workspaces** for package management

Structure:
```
/
├── apps/
│   ├── landing/    # @delete/landing - Astro site
│   └── my/         # @delete/my - React SPA
├── packages/
│   └── shared/     # @delete/shared - Shared types
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## Alternatives Considered

### Separate repositories
- Pro: Simpler CI/CD per repo, clear ownership
- Con: Dependency hell, duplicate config, harder to share code
- Rejected: Too much overhead for a small team

### Nx
- Pro: More features (affected detection, computation caching)
- Con: Steeper learning curve, heavier tooling
- Rejected: Turborepo is simpler and sufficient for current needs

### Yarn workspaces + Lerna
- Pro: Mature ecosystem
- Con: Lerna is in maintenance mode, pnpm is faster
- Rejected: pnpm + Turborepo is the modern standard

### npm workspaces
- Pro: No additional package manager
- Con: Slower than pnpm, less strict about dependencies
- Rejected: pnpm's strictness prevents dependency issues

## Consequences

### Positive
- Single `pnpm dev` starts all apps
- Shared TypeScript config and types
- Turborepo caching speeds up builds
- Easy to add new packages (future API types, UI library, etc.)
- Consistent tooling and linting across all code

### Negative
- Slightly more complex initial setup
- Need to understand workspace protocols
- CI/CD needs to handle monorepo (Vercel does this well)

### Neutral
- All team members need to learn pnpm commands
- Version management happens at workspace level

## Related
- [container:landing:v1] - First app migrated to monorepo
- [container:my:v1] - Second app added to monorepo
- [container:shared:v1] - Shared package pattern established
