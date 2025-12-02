---
id: decision:0008:v1
title: "Railpack builder over deprecated Nixpacks"
status: accepted
date: 2025-12-03
links:
  containers:
    - container:api:v1
  decisions:
    - decision:0007:v1
  commits:
    - git:8f3abcf
---

# Railpack builder over deprecated Nixpacks

## Context

Railway historically used Nixpacks as their build system, which auto-detected project types and built appropriate container images. However, Railway announced that Nixpacks is deprecated in favor of their new **Railpack** builder.

When deploying the FastAPI backend to Railway, we needed to configure the build and deployment settings.

## Decision

Use **Railpack** (Railway's new default builder) with configuration via `railway.json`.

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "deploy": {
    "startCommand": "cd src && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}",
    "healthcheckPath": "/v1/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

## Alternatives Considered

### Nixpacks (Legacy)

**Pros:**
- Well-documented
- Lots of community examples

**Cons:**
- Deprecated by Railway
- No longer receiving updates
- Future support uncertain

**Rejected because:** Using deprecated technology for a new project is poor long-term planning.

### Custom Dockerfile

**Pros:**
- Maximum control
- Portable to other platforms

**Cons:**
- More maintenance
- Slower builds (no caching benefits of Railpack)
- Overkill for standard Python project

**Rejected because:** Railpack auto-detection works well; no need for custom Dockerfile complexity.

## Consequences

### Positive

- **Future-proof**: Using Railway's current recommended approach
- **Simpler config**: Just `railway.json`, no Procfile or Dockerfile needed
- **Auto-detection**: Railpack detects Python, installs dependencies from pyproject.toml
- **Health checks**: Native health check configuration for zero-downtime deploys

### Negative

- **Railway-specific**: `railway.json` doesn't transfer to other platforms
- **Less documentation**: Railpack is newer, fewer community examples

### Neutral

- **uv support**: Railpack auto-detects and uses uv when uv.lock is present

## Configuration Details

### railway.json Location

Place at `apps/api/railway.json` - Railway is configured to use `apps/api` as the root directory.

### Key Settings

| Setting | Value | Purpose |
|---------|-------|---------|
| `startCommand` | `cd src && uvicorn ...` | Navigate to src dir, start uvicorn |
| `healthcheckPath` | `/v1/health` | Railway verifies deployment success |
| `healthcheckTimeout` | 100 | Seconds before health check fails |
| `restartPolicyType` | `ON_FAILURE` | Auto-restart on crashes |
| `restartPolicyMaxRetries` | 3 | Limit restart attempts |

### Why `cd src`?

The project structure has code in `apps/api/src/app/`. Railpack runs from `apps/api/`, so we need to `cd src` before starting uvicorn to ensure correct import paths.

## Related

- [decision:0007:v1] - Why Railway was chosen for hosting
- [container:api:v1] - API container documentation
