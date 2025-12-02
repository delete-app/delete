---
id: container:api:v1
type: api
technology: "Python 3.12 + FastAPI + SQLAlchemy"
updated: 2025-12-03
---

# API - Backend Service

## Purpose

RESTful backend API for the Delete dating app. Handles authentication, user management, and will eventually power matching, messaging, and AI-driven features. Built with Python/FastAPI for ML-native capabilities.

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

All endpoints are prefixed with `/api/v1` for future versioning support.

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Health check (returns status + version) |
| POST | `/api/v1/auth/signup` | User registration |
| POST | `/api/v1/auth/login` | User login (returns JWT tokens) |
| POST | `/api/v1/auth/refresh` | Refresh access token |

### Authentication

JWT-based authentication with two token types:
- **Access Token**: Short-lived (30 minutes default), used for API requests
- **Refresh Token**: Long-lived (7 days default), used to obtain new access tokens

Tokens include:
- `sub`: User UUID
- `type`: "access" or "refresh"
- `exp`: Expiration timestamp

## Components

- **Core**: Configuration, security utilities (JWT, password hashing)
- **Models**: SQLAlchemy ORM models (User)
- **Schemas**: Pydantic request/response schemas
- **Services**: Business logic layer (user CRUD, authentication)
- **API**: FastAPI routers (auth, health)

## Database

PostgreSQL 16 with pgvector extension enabled from initial migration:
- Ready for AI-powered matching via vector similarity search
- Async connection via asyncpg driver
- Alembic manages schema migrations

Initial schema:
- `users` table with UUID primary key, email (unique), hashed_password, name, is_active, timestamps

## Dependencies

- [container:my:v1] - Consumes API for authenticated user features
- [container:shared:v1] - May share TypeScript types (future: generated from OpenAPI)

## Code Location

```
apps/api/
├── pyproject.toml           # Python dependencies and tooling config
├── package.json             # npm scripts for Turborepo integration
├── alembic/                 # Database migrations
│   ├── alembic.ini
│   ├── env.py
│   └── versions/
│       └── 001_create_users_table.py
├── src/app/
│   ├── main.py              # FastAPI application entry point
│   ├── core/
│   │   ├── config.py        # Settings (pydantic-settings)
│   │   └── security.py      # JWT creation, password hashing
│   ├── db/
│   │   ├── base.py          # SQLAlchemy declarative base
│   │   └── session.py       # Async session factory
│   ├── models/
│   │   └── user.py          # User SQLAlchemy model
│   ├── schemas/
│   │   └── user.py          # Pydantic schemas (UserCreate, Token, etc.)
│   ├── services/
│   │   └── user.py          # User CRUD and auth logic
│   └── api/v1/
│       ├── router.py        # Combines all v1 routers
│       ├── auth.py          # Auth endpoints
│       └── health.py        # Health check endpoint
```

## Infrastructure

Development database via Docker Compose:
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

## Local Development Gotchas

### Port 5432 Conflict (PostgreSQL)

If you have a local PostgreSQL installation (e.g., via Homebrew), it may be running on port 5432 and will conflict with the Docker container.

**Symptoms:**
- Docker container starts but API can't connect
- Connection refused errors
- API connects to wrong (empty) database

**Solution:**
```bash
# Check what's using port 5432
lsof -i :5432

# Stop Homebrew PostgreSQL
brew services stop postgresql@14  # or postgresql@15, postgresql@16

# Then restart Docker container
docker compose down && docker compose up -d
```

**Alternative:** Change the Docker port mapping in `docker-compose.yml`:
```yaml
ports:
  - "5433:5432"  # Map to different host port
```
Then update `DATABASE_URL` in `.env` to use port 5433.

### Password Hashing with bcrypt

We use `bcrypt` directly (not `passlib`) because passlib is incompatible with bcrypt 4.x. See [decision:0006:v1] for details.

### Pydantic Email Validation

Use `pydantic[email]` in dependencies to enable `EmailStr` validation. The base pydantic package doesn't include email validation.

## Decisions

- [decision:0004:v1] - Why Python/FastAPI was chosen over Node.js
- [decision:0006:v1] - Python dependency fixes (bcrypt, pydantic[email], async SQLAlchemy)
- Async SQLAlchemy for performance with I/O-bound workloads
- pgvector enabled from day one for future AI matching features
- JWT access + refresh token pattern for secure, scalable auth

## Future Plans

- User profile endpoints
- Matching algorithm (leveraging pgvector for similarity)
- Messaging system
- Assessment/questionnaire endpoints
- AI-powered features (embeddings, recommendations)
