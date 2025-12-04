---
id: decision:0014:v1
title: "Match lifecycle states and transitions"
status: accepted
date: 2025-12-04
links:
  entities:
    - entity:match:v1
    - entity:like:v1
  components:
    - component:api.matching:v1
  commits:
    - git:471238b
---

# Match Lifecycle States and Transitions

## Context

When two users mutually like each other, they form a "match" - the core outcome of a dating app. But matches have complex lifecycles:
- What happens when someone loses interest?
- How do we handle inactive matches?
- What about couples who successfully start dating?

Delete needs a state machine that handles all these cases while supporting analytics, safety features, and the app's unique "delete when you find love" philosophy.

## Decision

Implement a 5-state match lifecycle with explicit transitions:

### States

```python
class MatchStatus(str, Enum):
    ACTIVE = "active"          # Both users can message
    UNMATCHED = "unmatched"    # One user unmatched
    ARCHIVED = "archived"      # Stale (no messages in 7 days)
    DATING = "dating"          # Users marked as dating
    DELETED = "deleted"        # Account deletion
```

### State Diagram

```
                    ┌─────────────────────────────────────────┐
                    │                                         │
                    v                                         │
[Mutual Like] ──> ACTIVE ──┬──> UNMATCHED ──> (end state)   │
                    │      │                                  │
                    │      └──> ARCHIVED ──> ACTIVE ──────────┘
                    │                          (reactivation)
                    │
                    └──> DATING ──> (ideally: delete app!)
                                    or
                                ──> ARCHIVED (didn't work out)
```

### State Transitions

| From | To | Trigger | Notes |
|------|-----|---------|-------|
| (none) | ACTIVE | Mutual like | Match created when second user likes |
| ACTIVE | UNMATCHED | User unmatches | Records who unmatched and why |
| ACTIVE | ARCHIVED | No messages for 7 days | Automatic via scheduled job |
| ACTIVE | DATING | Both users confirm | Celebratory moment! |
| ACTIVE | DELETED | Account deletion | User deletes their account |
| ARCHIVED | ACTIVE | New message sent | Re-engagement restores match |
| DATING | ARCHIVED | Relationship ends | Soft transition back to archived |

### Match Data Model

```python
class Match(Base):
    __tablename__ = "matches"

    id: Mapped[uuid.UUID]
    user1_id: Mapped[uuid.UUID]  # Sorted by UUID for consistency
    user2_id: Mapped[uuid.UUID]
    matched_at: Mapped[datetime]
    status: Mapped[str]  # MatchStatus value
    last_message_at: Mapped[datetime | None]
    unmatched_by: Mapped[uuid.UUID | None]  # Who initiated unmatch
    unmatch_reason: Mapped[str | None]  # UnmatchReason value
```

### User ID Ordering

To ensure uniqueness and consistent lookups, `user1_id` and `user2_id` are sorted:

```python
# When creating a match
match = Match(
    user1_id=min(from_user_id, to_user_id, key=str),
    user2_id=max(from_user_id, to_user_id, key=str),
    status=MatchStatus.ACTIVE.value
)
```

This guarantees that for any pair of users (A, B), there's only one possible row in the matches table.

### Unmatch Reasons

```python
class UnmatchReason(str, Enum):
    NOT_INTERESTED = "not_interested"
    NO_RESPONSE = "no_response"
    INAPPROPRIATE = "inappropriate"
    MET_OFFLINE = "met_offline"
    OTHER = "other"
```

Recording unmatch reasons enables:
- Product analytics (why do matches fail?)
- Safety patterns (many "inappropriate" unmatches = flag account)
- User feedback without forcing explanation

## Alternatives Considered

### Simple Boolean (matched: true/false)
Binary match state without lifecycle tracking.

**Rejected because:**
- Can't distinguish active vs archived matches
- No analytics on match outcomes
- Can't support "we're dating" feature

### Soft Delete Pattern (deleted_at timestamp)
Use nullable timestamp instead of status enum.

**Rejected because:**
- Only handles one end state (deleted)
- Can't represent UNMATCHED vs ARCHIVED vs DELETED
- Loses information about who ended the match

### Separate Tables per State
Different tables for active_matches, archived_matches, etc.

**Rejected because:**
- Complex queries across states
- Data migration when state changes
- Violates "single source of truth" for match data

### No DATING State
Skip the "dating" celebration state.

**Rejected because:**
- Misses Delete's core differentiator (designed to be deleted)
- Loses ability to celebrate successful matches
- Can't track success rate (key metric)

## Consequences

### Positive
- **Complete lifecycle**: Handles all real-world match scenarios
- **Analytics-friendly**: Can track match outcomes, duration, reactivations
- **Safety integration**: Unmatch reasons feed into abuse detection
- **Delete philosophy**: DATING state celebrates the goal

### Negative
- **Complexity**: More states = more code paths to test
- **Archival job**: Need scheduled task to archive stale matches
- **Edge cases**: What if both users try to transition simultaneously?

### Neutral
- **Storage**: All states in one table (simple) vs optimized for hot data (complex)
- **Notifications**: State changes should trigger user notifications (future work)

## Implementation Details

### Archival Job

```python
async def archive_stale_matches(db, days=7):
    """Archive matches with no messages in N days."""
    cutoff = datetime.now(UTC) - timedelta(days=days)

    result = await db.execute(
        select(Match).where(
            Match.status == MatchStatus.ACTIVE.value,
            or_(
                Match.last_message_at < cutoff,
                and_(Match.last_message_at.is_(None), Match.matched_at < cutoff)
            )
        )
    )
    matches = result.scalars().all()

    for match in matches:
        match.status = MatchStatus.ARCHIVED.value

    await db.commit()
    return len(matches)
```

### Unmatch Flow

```python
async def unmatch(db, user_id, match_id, reason):
    result = await db.execute(
        select(Match).where(
            Match.id == match_id,
            or_(Match.user1_id == user_id, Match.user2_id == user_id),
            Match.status == MatchStatus.ACTIVE.value
        )
    )
    match = result.scalars().first()

    if match:
        match.status = MatchStatus.UNMATCHED.value
        match.unmatched_by = user_id
        match.unmatch_reason = reason.value
        await db.commit()
        return True
    return False
```

### Code Locations

- **Model**: `Match`, `MatchStatus`, `UnmatchReason` in `models/matching.py`
- **Service**: `unmatch()`, `archive_stale_matches()` in `services/matching.py`
- **Query**: `get_user_matches()` filters by status

## Future Considerations

1. **DATING confirmation flow**: Both users must confirm to enter DATING state
2. **Match messaging**: Messages table with match_id foreign key
3. **Reactivation notifications**: Ping users when archived match becomes active
4. **Success stories**: Opt-in sharing of DATING outcomes
5. **Match expiration**: Auto-delete very old ARCHIVED matches for GDPR

## Related

- [entity:match:v1] - Match data model
- [entity:like:v1] - Likes that create matches
- [component:api.matching:v1] - Match lifecycle logic
- [decision:0013:v1] - Rate limiting (affects match creation)
- [decision:0012:v1] - Pass system (prevents match creation)
