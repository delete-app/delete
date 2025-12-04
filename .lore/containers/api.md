---
id: container:api:v1
type: api
technology: "Python 3.12 + FastAPI + SQLAlchemy"
updated: 2025-12-04
deployment:
  platform: Railway
  domain: api.trydelete.app
  builder: Railpack
---

# API - Backend Service

## Purpose

RESTful backend API for the Delete dating app. Handles authentication, user management, profile content, matching, compatibility scoring, and discovery. Built with Python/FastAPI for ML-native capabilities.

## Deployment

- **Platform**: Railway (always-on container, not serverless)
- **Domain**: https://api.trydelete.app
- **Database**: Railway managed PostgreSQL 16 with pgvector
- **Builder**: Railpack (Railway's native builder, replaces deprecated Nixpacks)

## Technology Stack

- **Runtime**: Python 3.12
- **Framework**: FastAPI 0.115+
- **ORM**: SQLAlchemy 2.0 (async with asyncpg driver)
- **Database**: PostgreSQL 16 with pgvector extension
- **Migrations**: Alembic
- **Auth**: JWT (python-jose) with bcrypt password hashing
- **Validation**: Pydantic 2.x with pydantic-settings

## API Design

### Versioning

All endpoints are prefixed with `/v1` for future versioning support. Note: We use `/v1` not `/api/v1` because the API lives on a dedicated subdomain (`api.trydelete.app`), making the `/api` prefix redundant. See [decision:0009:v1].

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/health` | Health check (returns status + version) |
| POST | `/v1/auth/signup` | User registration |
| POST | `/v1/auth/login` | User login (returns JWT tokens) |
| POST | `/v1/auth/refresh` | Refresh access token |
| GET | `/v1/users/me` | Get current user profile |
| PUT | `/v1/users/me` | Update current user profile |
| GET | `/v1/profile/photos` | Get user's photos |
| POST | `/v1/profile/photos` | Upload photo |
| DELETE | `/v1/profile/photos/{id}` | Delete photo |
| GET | `/v1/profile/prompts` | Get user's prompt answers |
| POST | `/v1/profile/prompts` | Create prompt answer |
| POST | `/v1/profile/quiz` | Submit behavioral quiz |
| GET | `/v1/profile/badges` | Get user's badges |
| GET | `/v1/discovery` | Get discovery queue |
| POST | `/v1/matching/like` | Send a like |
| POST | `/v1/matching/pass` | Pass on a profile |
| GET | `/v1/matching/matches` | Get user's matches |
| POST | `/v1/matching/unmatch` | End a match |
| POST | `/v1/matching/block` | Block a user |
| POST | `/v1/matching/report` | Report a user |

### Authentication

JWT-based authentication with two token types:
- **Access Token**: Short-lived (30 minutes default), used for API requests
- **Refresh Token**: Long-lived (7 days default), used to obtain new access tokens

Tokens include:
- `sub`: User UUID
- `type`: "access" or "refresh"
- `exp`: Expiration timestamp

## Components

### Core
Configuration, security utilities (JWT, password hashing)

### Services

- **[component:api.compatibility:v1]** - Trait derivation and compatibility scoring
- **[component:api.discovery:v1]** - Profile ranking and filtering
- **[component:api.matching:v1]** - Likes, passes, matches, blocks, reports
- **[component:api.profile:v1]** - Photos, prompts, quiz, badges

### Models

| Model | Description |
|-------|-------------|
| User | Core user account |
| Photo | Profile photos |
| Prompt | Profile Q&A |
| QuizResponse | Raw quiz answers |
| Badge | Auto-generated personality badges |
| UserTraitScore | Derived compatibility scores |
| Like | One-directional interest |
| Pass | Temporary rejection (30-day) |
| Match | Mutual like |
| Block | Permanent hiding |
| Report | User report |
| DailyLikeCount | Rate limiting tracker |

### Schemas
Pydantic request/response schemas for all models

### API Routers
FastAPI routers (auth, health, users, profile, matching)

## Database

PostgreSQL 16 with pgvector extension enabled from initial migration:
- Ready for AI-powered matching via vector similarity search
- Async connection via asyncpg driver
- Alembic manages schema migrations

### Migrations

| Migration | Description |
|-----------|-------------|
| 0001 | Create users table |
| 0002 | Add profile fields |
| 0003 | Add profile tables (photos, prompts, quiz, badges) |
| 0004 | Add matching tables (likes, passes, matches, blocks, reports, trait scores) |

## Key Features

### Trait-Based Compatibility
6-question quiz derives personality scores. Compatibility calculated as inverse of trait differences. See [decision:0011:v1].

### 30-Day Pass Cooldown
Passes expire after 30 days, reducing "regret churn". See [decision:0012:v1].

### Rate Limiting
- 10 likes per day
- First 5 likes require personalized comment
- Velocity and spam detection

See [decision:0013:v1].

### Match Lifecycle
5-state system: active, unmatched, archived, dating, deleted. See [decision:0014:v1].

## Dependencies

- [container:my:v1] - Consumes API for authenticated user features
- [container:shared:v1] - May share TypeScript types (generated from OpenAPI)

## Code Location

```
apps/api/
├── pyproject.toml           # Python dependencies and tooling config
├── package.json             # npm scripts for Turborepo integration
├── alembic/                 # Database migrations
│   ├── alembic.ini
│   ├── env.py
│   └── versions/
│       ├── 0001_create_users_table.py
│       ├── 0002_add_profile_fields.py
│       ├── 0003_add_profile_tables.py
│       └── 0004_add_matching_tables.py
├── src/app/
│   ├── main.py              # FastAPI application entry point
│   ├── core/
│   │   ├── config.py        # Settings (pydantic-settings)
│   │   └── security.py      # JWT creation, password hashing
│   ├── db/
│   │   ├── base.py          # SQLAlchemy declarative base
│   │   └── session.py       # Async session factory
│   ├── models/
│   │   ├── user.py          # User SQLAlchemy model
│   │   ├── profile.py       # Photo, Prompt, QuizResponse, Badge
│   │   └── matching.py      # Like, Pass, Match, Block, Report, etc.
│   ├── schemas/
│   │   ├── user.py          # Pydantic user schemas
│   │   ├── profile.py       # Pydantic profile schemas
│   │   └── matching.py      # Pydantic matching schemas
│   ├── services/
│   │   ├── user.py          # User CRUD and auth logic
│   │   ├── profile.py       # Photo, prompt, quiz, badge operations
│   │   ├── compatibility.py # Trait derivation, compatibility scoring
│   │   ├── discovery.py     # Profile ranking and filtering
│   │   └── matching.py      # Like, pass, match, block, report
│   └── api/v1/
│       ├── router.py        # Combines all v1 routers
│       ├── auth.py          # Auth endpoints
│       ├── health.py        # Health check endpoint
│       ├── users.py         # User profile endpoints
│       ├── profile.py       # Profile content endpoints
│       └── matching.py      # Matching endpoints
```

## Infrastructure

### Production (Railway)

- **Container**: Railpack-built Python container
- **Database**: Railway managed PostgreSQL 16 with pgvector extension
- **Config**: `railway.json` defines start command and health checks
- **Deploys**: Automatic on push to main branch

See [decision:0007:v1] for why Railway was chosen and [decision:0008:v1] for Railpack configuration.

### Development (Docker Compose)

Local database via Docker Compose:
```yaml
services:
  db:
    image: pgvector/pgvector:pg16
    ports: ["5432:5432"]
```

## CORS Configuration

Configured for:
- `http://localhost:3000` (landing dev)
- `http://localhost:5173` (my app dev)
- `https://trydelete.app` (production landing)
- `https://my.trydelete.app` (production my app)

## Running Locally

```bash
# Start database
docker compose up -d

# Install dependencies
cd apps/api && uv sync

# Run migrations
uv run alembic upgrade head

# Start dev server
uv run uvicorn app.main:app --reload
```

## Decisions

- [decision:0004:v1] - Why Python/FastAPI was chosen over Node.js
- [decision:0006:v1] - Python dependency fixes (bcrypt, pydantic[email], async SQLAlchemy)
- [decision:0007:v1] - Railway for API hosting with PostgreSQL
- [decision:0008:v1] - Railpack builder over deprecated Nixpacks
- [decision:0009:v1] - Simplified API paths (/v1/* instead of /api/v1/*)
- [decision:0011:v1] - Trait-based compatibility scoring
- [decision:0012:v1] - 30-day pass cooldown
- [decision:0013:v1] - Rate limiting and abuse prevention
- [decision:0014:v1] - Match lifecycle states
