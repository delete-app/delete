---
id: decision:0004:v1
title: "Python FastAPI for backend (ML-native)"
status: accepted
date: 2024-12-03
links:
  containers: []  # Backend not yet built
  external:
    - "GitHub issue #32"
---

# Python FastAPI for backend (ML-native)

## Context

Delete's matching algorithm will rely heavily on AI/ML:
- **Embeddings** for semantic understanding of profiles
- **Vector search** for similarity matching
- **ML models** for compatibility prediction
- **Future NLP** for conversation insights

Need to choose a backend stack that supports these requirements.

## Decision

Use **Python FastAPI** as the backend framework, with **PostgreSQL + pgvector** for data storage.

This was documented in GitHub issue #32 as part of tech stack decisions.

## Alternatives Considered

### Node.js/Express or Fastify
- Pro: JavaScript everywhere, easy frontend-backend code sharing
- Con: ML/AI ecosystem is Python-centric
- Con: Would need to call Python services for any ML work
- Rejected: Swimming upstream for ML features

### Go
- Pro: Performance, simple deployment (single binary)
- Con: ML ecosystem is weak
- Con: Would need Python sidecar services anyway
- Rejected: Performance isn't the bottleneck; ML integration is

### Django
- Pro: Batteries included, mature ecosystem
- Con: Heavier, more opinionated
- Con: REST framework is good but FastAPI is more modern
- Rejected: FastAPI is lighter and async-native

### Flask
- Pro: Simple, flexible
- Con: Less built-in features than FastAPI
- Con: No native async support
- Rejected: FastAPI is essentially "modern Flask"

## Why FastAPI Specifically

1. **Async-native**: Built on ASGI, handles concurrent requests well
2. **Type hints**: Automatic validation and documentation
3. **OpenAPI/Swagger**: Auto-generated API docs
4. **Pydantic**: Strong data validation
5. **ML ecosystem**: Direct access to NumPy, scikit-learn, PyTorch, etc.

## Why PostgreSQL + pgvector

1. **pgvector extension**: Native vector similarity search in PostgreSQL
2. **Embeddings storage**: Store profile embeddings alongside structured data
3. **No separate vector DB**: Avoid operational complexity of Pinecone/Weaviate
4. **Familiar**: PostgreSQL is well-understood and supported

## Consequences

### Positive
- First-class ML/AI support
- Strong typing with Pydantic
- Auto-generated API documentation
- Can use any Python ML library directly
- pgvector keeps architecture simple (one database)

### Negative
- Frontend team needs to work across language boundary
- No shared types between frontend and backend (need OpenAPI codegen)
- Python deployment is more complex than Node.js

### Neutral
- Need separate API and frontend repos/packages
- Will generate TypeScript types from OpenAPI spec

## Implementation Notes (Future)

When building the backend:
- Use `sqlalchemy` with async support
- Use `alembic` for migrations
- Consider `pgvector` with `sqlalchemy-pgvector`
- Generate TypeScript client from OpenAPI spec

## Related
- [decision:0003:v1] - React SPA will consume this API
- [container:my:v1] - Will integrate with this backend
