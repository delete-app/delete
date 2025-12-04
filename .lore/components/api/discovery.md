---
id: component:api.discovery:v1
type: service
updated: 2025-12-04
---

# Discovery Service

## Purpose

Generates the daily discovery queue of profiles for users to browse. Handles eligibility filtering, multi-factor ranking, diversity rules, and graceful scarcity handling.

## Discovery Pipeline

```
User Request
    │
    ▼
┌───────────────────┐
│ Get Exclusion IDs │  Blocked, already interacted, active passes
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Filter Eligible   │  Active users, complete profiles, preference match
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Rank Profiles     │  Compatibility + completeness + activity + new boost
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Apply Diversity   │  Include at least one complementary opposite
└─────────┬─────────┘
          │
          ▼
DiscoveryResult
```

## Exclusion Filters

Users are excluded from discovery if:

1. **Blocked**: Either user blocked the other (bidirectional)
2. **Already liked**: User already sent a like
3. **Active match**: Already matched (active or dating status)
4. **Active pass**: User passed recently (within 30 days)
5. **They passed on user**: Their pass prevents futile likes
6. **Self**: User's own profile

## Eligibility Filters

Profiles must meet:

1. `is_active = True`
2. `profile_complete = True`
3. Matches user's `looking_for` preference (gender filter)
4. Reciprocal interest (they're looking for user's gender)

## Ranking Algorithm

Profiles are ranked by weighted score:

| Factor | Weight | Max Points |
|--------|--------|------------|
| Compatibility score | 50% | 50 |
| Profile completeness | 20% | 20 |
| Activity recency | 10% | 10 |
| New user boost | 20 | 20 |

### Completeness Scoring
- 3 points per photo (up to 6 photos = 18 points)
- 2 points per prompt (up to 3 prompts = 6 points)
- Normalized to 20 point max

### Activity Scoring
- Updated in last 1 day: 10 points
- Updated in last 7 days: 7 points
- Updated in last 30 days: 4 points

### New User Boost
- Joined in last 7 days: +20 points
- Helps new users get initial visibility

## Diversity Rules

To prevent echo chamber matching:

1. Include at least one "complementary opposite" (compatibility < 50%) if available
2. Future: Max 3 profiles with same profession (profession field TBD)

## Scarcity Handling

When pool is small, provide helpful suggestions:

| Scenario | Suggestions |
|----------|-------------|
| 0 profiles | "You've seen everyone nearby", "Expand distance preference", "Check back tomorrow" |
| < 5 profiles | "Only N profiles available", "Consider adjusting preferences" |

## Public Functions

### `get_discovery_queue(db, user_id, limit=10) -> DiscoveryResult`

Main entry point. Returns daily discovery queue.

Returns:
- `profiles`: List of DiscoveryProfile with photos, prompts, compatibility
- `total_available`: Count before ranking (for scarcity detection)
- `exhausted_pool`: Boolean indicating pool exhaustion
- `suggestions`: List of helpful suggestions

### `get_eligible_profiles(db, user_id, user, limit) -> (profiles, count)`

Gets profiles matching user preferences, excluding already-interacted.

### `rank_profiles(db, user_id, profiles) -> list[(User, score, compat)]`

Ranks profiles by weighted score.

### `apply_diversity_rules(ranked, limit) -> list[(User, score, compat)]`

Ensures diversity in final selection.

### Exclusion Helpers

- `get_blocked_user_ids(db, user_id)` - Bidirectional block list
- `get_already_interacted_ids(db, user_id)` - Liked or matched
- `get_active_pass_ids(db, user_id)` - Non-expired passes
- `get_users_who_passed_me(db, user_id)` - Prevents futile likes

## Data Structures

```python
@dataclass
class DiscoveryProfile:
    user: User
    photos: list[Photo]
    prompts: list[Prompt]
    compatibility: CompatibilityResult | None
    ranking_score: float
    is_new_user: bool

@dataclass
class DiscoveryResult:
    profiles: list[DiscoveryProfile]
    total_available: int
    exhausted_pool: bool
    suggestions: list[str]
```

## Constants

```python
PASS_COOLDOWN_DAYS = 30
MAX_DAILY_PROFILES = 10
NEW_USER_BOOST_DAYS = 7
NEW_USER_BOOST_SCORE = 20
MAX_SAME_PROFESSION = 3  # Future
```

## Code Location

- **File**: `apps/api/src/app/services/discovery.py`

## Performance Considerations

- Fetch 3x limit for ranking, then trim to limit
- Index on `passes.expires_at` for efficient pass filtering
- Consider caching daily queues (future optimization)

## Decisions

- [decision:0011:v1] - Compatibility in ranking (50% weight)
- [decision:0012:v1] - Pass cooldown affects filtering

## Related

- [component:api.compatibility:v1] - Compatibility calculation
- [component:api.matching:v1] - Like/pass actions
- [entity:pass:v1] - Pass filtering
- [entity:block:v1] - Block filtering
