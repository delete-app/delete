---
id: decision:0010:v1
title: "Typed API Client with openapi-fetch and openapi-react-query"
status: accepted
date: 2025-12-03
links:
  containers:
    - container:my:v1
    - container:api:v1
  decisions:
    - decision:0004:v1
    - decision:0009:v1
  commits:
    - git:7816112
---

# Typed API Client with openapi-fetch and openapi-react-query

## Context

The `my` app (React SPA) needs to communicate with the FastAPI backend. Initially, a simple untyped `fetch` wrapper was created in `apps/my/src/lib/api.ts`. However, as the app grows, this approach has limitations:

1. **No type safety**: Request/response types must be manually defined and kept in sync with backend
2. **No autocomplete**: Developers don't get IDE hints for available endpoints or parameters
3. **Manual caching**: Each component manages its own loading/error states
4. **Drift risk**: Frontend types can easily drift from actual API contract

The FastAPI backend automatically generates an OpenAPI specification at `/openapi.json`, which describes all endpoints, request bodies, and response schemas.

## Decision

Adopt a fully typed API client stack using:

1. **openapi-typescript**: Generates TypeScript types from OpenAPI spec
2. **openapi-fetch**: Type-safe fetch wrapper that uses generated types
3. **openapi-react-query**: React Query integration with full type inference

### Implementation

```
apps/my/src/lib/api/
├── schema.d.ts     # Auto-generated types from OpenAPI
├── openapi.json    # Local copy of OpenAPI spec (committed)
├── client.ts       # Base openapi-fetch client
└── hooks.ts        # $api React Query hooks export
```

**Key files:**

`hooks.ts` - The primary export used by components:
```typescript
import createFetchClient from 'openapi-fetch'
import createClient from 'openapi-react-query'
import type { paths } from './schema'

const fetchClient = createFetchClient<paths>({
  baseUrl: API_URL,
})

export const $api = createClient(fetchClient)
```

**Usage in components:**
```typescript
// Mutations with full type inference
const loginMutation = $api.useMutation('post', '/v1/auth/login', {
  onSuccess: (data) => {
    // data is typed as TokenResponse
    localStorage.setItem('access_token', data.access_token)
  },
  onError: (err) => {
    // err is typed with validation error structure
    const detail = err.detail?.[0]?.msg
  },
})

// Type-safe mutation call
loginMutation.mutate({
  body: { email, password }, // body is typed as LoginRequest
})
```

### Type Generation Workflow

```bash
# Download fresh OpenAPI spec from running API
curl http://localhost:8000/openapi.json > apps/my/src/lib/api/openapi.json

# Generate TypeScript types
pnpm --filter @delete/my generate:api
# Runs: openapi-typescript src/lib/api/openapi.json -o src/lib/api/schema.d.ts
```

The generated `schema.d.ts` is committed to source control for CI/CD builds without API dependency.

### QueryClientProvider Setup

`main.tsx` wraps the app with React Query provider:
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
    },
  },
})

<QueryClientProvider client={queryClient}>
  <BrowserRouter>
    <App />
  </BrowserRouter>
</QueryClientProvider>
```

## Alternatives Considered

### 1. Manual fetch wrapper (original approach)

```typescript
// Old api.ts
async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/v1/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  return res.json() as TokenResponse // Hope types match!
}
```

**Rejected because:**
- Types must be manually synced with backend changes
- No compile-time validation of endpoint paths
- No automatic query caching/deduplication
- Repetitive error handling boilerplate

### 2. tRPC

**Rejected because:**
- Requires Node.js backend (we use Python FastAPI)
- Would need a separate BFF layer
- Over-engineering for our API structure

### 3. GraphQL with codegen

**Rejected because:**
- Backend is REST-based, not GraphQL
- Would require significant backend changes
- OpenAPI already provides schema we can leverage

### 4. Orval

Similar to our chosen approach but:
- Generates actual client code vs type-only approach
- More opinionated about query key structure
- openapi-fetch is lighter weight and more flexible

## Consequences

### Positive

- **Full type safety**: Endpoints, request bodies, responses all typed
- **IDE autocomplete**: Discover available endpoints via IntelliSense
- **Compile-time validation**: TypeScript catches API contract mismatches
- **React Query benefits**: Automatic caching, deduplication, background refetch
- **Standardized patterns**: Consistent loading/error handling across app
- **Schema as documentation**: Types serve as living API documentation

### Negative

- **Build step required**: Must regenerate types when API changes
- **Additional dependencies**: Three new packages to maintain
- **OpenAPI spec must be accurate**: Relies on FastAPI generating correct spec
- **Local spec copy**: Need to remember to update when API changes

### Neutral

- **Learning curve**: Team needs to understand openapi-fetch patterns
- **Vendor lock-in**: Tied to openapi-typescript ecosystem (but well-maintained)

## Migration Notes

The old `apps/my/src/lib/api.ts` was deleted. All API calls now use:

```typescript
import { $api } from '../lib/api/hooks'

// Queries
const { data, isLoading } = $api.useQuery('get', '/v1/users/me')

// Mutations
const mutation = $api.useMutation('post', '/v1/auth/login')
```

## Related

- [container:my:v1] - React SPA where client is used
- [container:api:v1] - FastAPI backend providing OpenAPI spec
- [decision:0004:v1] - FastAPI choice enables automatic OpenAPI generation
- [decision:0009:v1] - Simplified paths (/v1/*) used in client
