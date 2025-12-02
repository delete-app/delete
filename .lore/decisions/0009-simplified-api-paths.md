---
id: decision:0009:v1
title: "Simplified API paths: /v1/* instead of /api/v1/*"
status: accepted
date: 2025-12-03
links:
  containers:
    - container:api:v1
  decisions:
    - decision:0007:v1
  commits:
    - git:fe21a0d
---

# Simplified API paths: /v1/* instead of /api/v1/*

## Context

When the API was initially scaffolded, endpoints were prefixed with `/api/v1/` following a common convention. However, since the API is deployed to its own subdomain (`api.trydelete.app`), the `/api` prefix is redundant.

Example of the redundancy:
- `https://api.trydelete.app/api/v1/health` - redundant "api" in both domain and path
- `https://api.trydelete.app/v1/health` - cleaner, no redundancy

## Decision

Simplify API paths from `/api/v1/*` to `/v1/*` since the API lives on a dedicated subdomain.

### Before
```
GET https://api.trydelete.app/api/v1/health
POST https://api.trydelete.app/api/v1/auth/signup
POST https://api.trydelete.app/api/v1/auth/login
```

### After
```
GET https://api.trydelete.app/v1/health
POST https://api.trydelete.app/v1/auth/signup
POST https://api.trydelete.app/v1/auth/login
```

## Alternatives Considered

### Keep /api/v1/* prefix

**Pros:**
- Common convention
- Clear that it's an API endpoint
- Allows non-API routes at the same domain (e.g., `/docs`)

**Cons:**
- Redundant with api.* subdomain
- Longer URLs
- `/api` doesn't add information when domain is already `api.trydelete.app`

**Rejected because:** The subdomain already signals "this is the API"; the prefix adds no value.

### Remove version prefix entirely (/auth/signup instead of /v1/auth/signup)

**Pros:**
- Shortest possible URLs
- Simple routing

**Cons:**
- No built-in versioning for future breaking changes
- Would require URL versioning or header versioning later

**Rejected because:** Version prefix is low-cost insurance for API evolution.

## Consequences

### Positive

- **Cleaner URLs**: `api.trydelete.app/v1/health` is more elegant
- **Shorter paths**: Less typing, shorter logs
- **Domain communicates purpose**: "api" subdomain makes path prefix unnecessary

### Negative

- **Convention deviation**: Some developers expect `/api/` prefix
- **Docs route consideration**: FastAPI's `/docs` and `/redoc` are at root level (not versioned), which is fine

### Neutral

- **Version prefix retained**: `/v1/` provides future upgrade path to `/v2/`
- **OpenAPI location**: Moved from `/api/v1/openapi.json` to `/v1/openapi.json`

## Implementation

Changed in `apps/api/src/app/api/v1/router.py`:

```python
# Before
api_router = APIRouter(prefix="/api/v1")

# After
api_router = APIRouter(prefix="/v1")
```

Updated OpenAPI URL in `apps/api/src/app/main.py`:

```python
app = FastAPI(
    title=settings.app_name,
    openapi_url="/v1/openapi.json",  # Changed from /api/v1/openapi.json
    docs_url="/docs",
    redoc_url="/redoc",
)
```

Updated health check in `railway.json`:

```json
{
  "deploy": {
    "healthcheckPath": "/v1/health"  // Changed from /api/v1/health
  }
}
```

## Related

- [decision:0007:v1] - Railway hosting decision (api.trydelete.app subdomain)
- [container:api:v1] - API container documentation
