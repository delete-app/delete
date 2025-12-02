---
id: decision:0006:v1
title: "Python dependency fixes for FastAPI backend"
status: accepted
date: 2025-12-03
links:
  containers:
    - container:api:v1
  commits:
    - git:3012485
---

# Python dependency fixes for FastAPI backend

## Context

During initial development of the FastAPI backend, several dependency and configuration issues were discovered that prevented the application from running:

1. **pyproject.toml referenced a non-existent README.md** - Build would fail
2. **Hatch package discovery was broken** - The `src/app` package wasn't being found
3. **Pydantic's EmailStr validator was missing** - `pydantic` core doesn't include email validation
4. **SQLAlchemy async support was incomplete** - Missing `asyncio` extras and `greenlet` dependency
5. **passlib was incompatible with bcrypt 4.x** - Caused runtime errors during password hashing
6. **Alembic env.py used wrong engine creation pattern** - `async_engine_from_config` didn't use our settings URL

## Decision

Apply the following fixes to make the FastAPI backend operational:

### 1. pyproject.toml fixes

```toml
# Removed: readme = "README.md" (file didn't exist)

# Added for proper package discovery:
[tool.hatch.build.targets.wheel]
packages = ["src/app"]

# Changed for EmailStr support:
"pydantic[email]>=2.10.0"  # was: "pydantic>=2.10.0"

# Added for async SQLAlchemy:
"sqlalchemy[asyncio]>=2.0.36"  # was: "sqlalchemy>=2.0.36"
"greenlet>=3.1.0"  # new dependency

# Changed for bcrypt compatibility:
"bcrypt>=4.2.0"  # was: "passlib[bcrypt]>=1.7.4"
```

### 2. alembic/env.py fix

Changed from `async_engine_from_config()` to `create_async_engine(settings.database_url)`:

```python
# Before (broken):
connectable = async_engine_from_config(
    config.get_section(config.config_ini_section, {}),
    prefix="sqlalchemy.",
    poolclass=pool.NullPool,
)

# After (working):
from sqlalchemy.ext.asyncio import create_async_engine
connectable = create_async_engine(settings.database_url, poolclass=pool.NullPool)
```

### 3. core/security.py fix

Replaced passlib with direct bcrypt usage:

```python
# Before (broken with bcrypt 4.x):
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
def verify_password(plain, hashed): return pwd_context.verify(plain, hashed)
def get_password_hash(password): return pwd_context.hash(password)

# After (working):
import bcrypt
def verify_password(plain, hashed):
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
def get_password_hash(password):
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
```

## Alternatives Considered

### Keep passlib with older bcrypt

- Could pin `bcrypt<4.0.0` to maintain passlib compatibility
- Rejected: Better to use bcrypt directly, simpler dependency tree, and avoids future conflicts

### Use argon2 instead of bcrypt

- Could switch to `argon2-cffi` which is considered more modern
- Rejected: bcrypt is still secure and widely used; unnecessary migration

## Consequences

### Positive
- Application now starts and runs correctly
- Simpler dependency tree (no passlib wrapper)
- Direct bcrypt usage is more explicit and debuggable
- Email validation works with `pydantic[email]`
- Async SQLAlchemy works correctly with greenlet

### Negative
- If migrating from a passlib-based system, password hash format needs verification (bcrypt format is same, so OK here)
- Developers familiar with passlib's API need to learn bcrypt's direct API

### Neutral
- bcrypt password hashes remain compatible (same format)
- No changes to database schema or existing data

## Lessons Learned

1. **Always test `pip install .` or `uv sync`** early - pyproject.toml issues show up immediately
2. **Check Pydantic extras** - Core pydantic doesn't include all validators (email, URL, etc.)
3. **Test async database operations** - SQLAlchemy async requires `[asyncio]` extras
4. **Check library compatibility** - passlib hasn't kept up with bcrypt 4.x changes
5. **Alembic async needs manual engine creation** - The config-based approach doesn't work well with custom URLs

## Related
- [container:api:v1] - All fixes applied to the API backend
- [decision:0004:v1] - Original decision to use Python/FastAPI
