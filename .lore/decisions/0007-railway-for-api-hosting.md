---
id: decision:0007:v1
title: "Railway for API hosting with PostgreSQL"
status: accepted
date: 2025-12-03
links:
  containers:
    - container:api:v1
  decisions:
    - decision:0004:v1
  commits:
    - git:8f3abcf
    - git:fe21a0d
---

# Railway for API hosting with PostgreSQL

## Context

With the FastAPI backend scaffolded and ready for deployment, we needed to choose a hosting platform. The primary requirements were:

1. **Python support**: Native Python deployment without serverless cold starts
2. **PostgreSQL with pgvector**: Our matching algorithm will use vector similarity search
3. **Simple deployment**: Git-push deployment with automatic builds
4. **Cost-effective**: Reasonable for pre-launch development phase
5. **Custom domains**: Support for api.trydelete.app subdomain

The landing page is already on Vercel, which works well for static/SSG sites. However, Vercel's serverless functions have limitations for our Python backend.

## Decision

Use **Railway** for hosting the FastAPI backend and managed PostgreSQL database.

- **API hosting**: api.trydelete.app on Railway
- **Database**: Railway managed PostgreSQL with pgvector extension
- **Landing/My apps**: Remain on Vercel (static/SSG)

## Alternatives Considered

### Vercel Serverless Python Functions

**Pros:**
- Single platform for everything
- Familiar deployment workflow
- Good free tier

**Cons:**
- Cold start latency for Python functions (2-5s)
- Serverless doesn't fit long-running connections (WebSockets, DB pools)
- Python support is second-class compared to Node.js
- No native PostgreSQL offering

**Rejected because:** Cold starts and serverless model don't suit our API needs.

### Render

**Pros:**
- Similar to Railway
- Good PostgreSQL support
- Native Docker support

**Cons:**
- Free tier sleeps after inactivity (cold starts)
- Slightly higher latency reported by users
- Less polished developer experience

**Rejected because:** Railway's developer experience and Railpack builder are superior.

### Fly.io

**Pros:**
- Edge deployment (low latency)
- Good PostgreSQL support
- More control over infrastructure

**Cons:**
- More complex setup (Dockerfiles, fly.toml)
- Learning curve higher than Railway
- Pricing model less predictable

**Rejected because:** Complexity not justified for early-stage project.

### Self-hosted (AWS/GCP/DigitalOcean)

**Rejected immediately:** Too much operational overhead for a two-person project.

## Consequences

### Positive

- **Zero cold starts**: Always-on container keeps API responsive
- **Managed database**: Railway handles PostgreSQL backups, scaling, and pgvector extension
- **Git push deploys**: Simple deployment workflow integrated with monorepo
- **Custom domains**: api.trydelete.app configured easily
- **Good free tier**: Sufficient for development and early users

### Negative

- **Two platforms**: API on Railway, frontend on Vercel (minor complexity)
- **Railway lock-in**: Some Railway-specific configuration (railway.json, Railpack)
- **Cost at scale**: Railway pricing may not be optimal at high scale (revisit later)

### Neutral

- **Monorepo deployment**: Railway deploys only the `apps/api` directory via root directory config
- **Environment variables**: Managed separately in Railway dashboard

## Implementation Notes

1. Railway auto-detects Python projects and uses Railpack builder
2. `railway.json` configures start command and health check
3. PostgreSQL provisioned via Railway dashboard with pgvector enabled
4. Custom domain api.trydelete.app configured with CNAME

## Related

- [decision:0004:v1] - Why Python/FastAPI was chosen (ML-native)
- [container:api:v1] - API container documentation
- [decision:0008:v1] - Railpack builder configuration
