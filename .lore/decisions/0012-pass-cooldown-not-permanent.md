---
id: decision:0012:v1
title: "30-day pass cooldown instead of permanent rejection"
status: accepted
date: 2025-12-04
links:
  entities:
    - entity:pass:v1
  components:
    - component:api.matching:v1
    - component:api.discovery:v1
  commits:
    - git:471238b
---

# 30-Day Pass Cooldown Instead of Permanent Rejection

## Context

When a user sees a profile they're not interested in, they need a way to remove it from their feed. The traditional approach in dating apps is a permanent "swipe left" that hides the profile forever.

However, Delete's user research and industry analysis revealed a problem: **regret churn**. Users who permanently reject someone often:
1. Change their mind later (preferences evolve, photos updated, etc.)
2. Accidentally swipe left while rapid-swiping
3. Feel frustrated when they remember rejecting someone they now want to see

This leads to users deleting and re-creating accounts just to see profiles they previously rejected - a significant source of churn and account instability.

## Decision

Implement a **30-day cooldown** for passes instead of permanent rejection:

1. When a user passes on a profile, the passed profile is hidden for 30 days
2. After 30 days, the passed profile can appear again in discovery
3. Users can undo a pass (with rate limiting) if they change their mind immediately

### Database Schema

```sql
CREATE TABLE passes (
    id UUID PRIMARY KEY,
    from_user_id UUID NOT NULL REFERENCES users(id),
    to_user_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL  -- created_at + 30 days
);

CREATE INDEX ix_passes_expires ON passes(expires_at);
```

### Discovery Filtering Logic

```python
# In discovery service
async def get_active_pass_ids(db, user_id):
    now = datetime.now(UTC)
    result = await db.execute(
        select(Pass.to_user_id).where(
            Pass.from_user_id == user_id,
            Pass.expires_at > now  # Only non-expired passes
        )
    )
    return {row[0] for row in result.fetchall()}
```

### Bidirectional Pass Handling

When User A passes on User B:
- User B is hidden from User A for 30 days
- If User B likes User A during that window, the like is recorded but no match is created (User A's pass takes precedence)
- This prevents wasted effort - User B's like goes into a "pending" state until User A's pass expires

## Alternatives Considered

### Permanent Rejection (Traditional)
Standard "swipe left" that permanently hides a profile.

**Rejected because:**
- Causes regret churn (users deleting/recreating accounts)
- No recovery from accidental swipes
- Doesn't account for profile updates (new photos, bio changes)

### 7-Day Cooldown (Shorter)
Shorter cooldown period.

**Rejected because:**
- Too short to feel meaningful
- Could feel like "nagging" if same profiles keep appearing
- Doesn't provide enough breathing room for users who truly aren't interested

### 90-Day Cooldown (Longer)
Longer cooldown period.

**Rejected because:**
- Too close to "permanent" - most users won't remember passing 90 days ago
- Reduces pool size too aggressively for smaller markets
- Dating preferences can change significantly in 90 days

### User-Configurable Cooldown
Let users choose their own pass duration.

**Rejected because:**
- Adds complexity to UX
- Most users don't want to make this decision
- Creates inconsistent behavior that's hard to explain

## Consequences

### Positive
- **Reduces regret churn**: Users can see previously-passed profiles without account recreation
- **Accounts for change**: Both users may have updated profiles or changed preferences
- **Reduces pool exhaustion**: In smaller markets, users don't run out of profiles as quickly
- **Undo-friendly**: Accidental passes are recoverable without support tickets
- **Respects both users**: Target doesn't waste a like on someone actively passing

### Negative
- **Some profiles reappear**: Users who truly aren't interested will see them again (mitigated by 30-day gap)
- **Storage**: Passes table doesn't auto-clean (need periodic job to delete expired passes)
- **Complexity**: More complex than binary like/reject

### Neutral
- **Different from competitors**: May need UX education that "pass" isn't permanent
- **Index requirement**: Need index on expires_at for efficient filtering

## Implementation Details

- **Model**: `Pass` in `apps/api/src/app/models/matching.py`
- **Service**: `send_pass()`, `undo_pass()` in `apps/api/src/app/services/matching.py`
- **Discovery filter**: `get_active_pass_ids()` in `apps/api/src/app/services/discovery.py`
- **Bidirectional check**: `get_users_who_passed_me()` prevents futile likes
- **Cooldown constant**: `PASS_COOLDOWN_DAYS = 30`

## Future Considerations

1. **Cleanup job**: Implement periodic deletion of expired passes (GDPR compliance)
2. **Analytics**: Track how often re-appearing profiles lead to matches
3. **Smart cooldown**: Potentially extend cooldown if user passes same profile multiple times
4. **Premium feature**: "Extend pass to 90 days" could be a subscription feature

## Related

- [entity:pass:v1] - Pass data model
- [component:api.matching:v1] - Pass creation and undo logic
- [component:api.discovery:v1] - Pass filtering in profile discovery
- [decision:0011:v1] - Compatibility scoring (passed profiles may become compatible)
