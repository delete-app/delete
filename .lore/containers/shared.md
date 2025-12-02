---
id: container:shared:v1
type: library
technology: "TypeScript"
package: "@delete/shared"
updated: 2025-12-03
status: minimal
---

# Shared Package

## Purpose

Internal package for shared TypeScript types, utilities, and constants used across the monorepo.

**Current state**: Minimal - just exports `APP_NAME` constant. Exists primarily to establish the pattern for shared code.

## Why a Shared Package?

Even though the apps are currently small, having a shared package from the start:
- Establishes the pattern for cross-app code sharing
- Prevents copy-paste of common types
- Will become essential when the API types are defined (shared between frontend and backend types)

## Key Files

| File | Purpose |
|------|---------|
| `packages/shared/src/index.ts` | Main exports |
| `packages/shared/package.json` | Package configuration |

## Current Exports

```typescript
export const APP_NAME = 'Delete'
```

## Planned Exports

As the system grows:
- API response types (User, Match, Message, etc.)
- Validation schemas (shared between frontend forms and backend)
- Constants (attachment styles, conflict styles, etc.)
- Utility functions

## Usage

```typescript
// In apps/my or apps/landing
import { APP_NAME } from '@delete/shared'
```

## Build

Currently no build step - TypeScript source is consumed directly. May add build step when:
- Package grows significantly
- Need to support non-TypeScript consumers
- Want to publish as npm package

## Code Location

- Root: `packages/shared/`
- Package name: `@delete/shared`
