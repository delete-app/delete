---
id: component:api.matching:v1
type: service
updated: 2025-12-04
---

# Matching Service

## Purpose

Handles the core matching workflow: likes, passes, match creation, unmatching, blocking, and reporting. Implements rate limiting and abuse prevention.

## Core Workflows

### Like Flow

```
User sends like
       │
       ▼
┌──────────────────┐
│ Check daily limit│  MAX_DAILY_LIKES = 10
└────────┬─────────┘
         │ OK
         ▼
┌──────────────────┐
│ Check comment    │  First 5 likes require message
│ requirement      │
└────────┬─────────┘
         │ OK
         ▼
┌──────────────────┐
│ Check abuse      │  Velocity + spam message detection
│ patterns         │
└────────┬─────────┘
         │ OK
         ▼
┌──────────────────┐
│ Check already    │  Prevent duplicate likes
│ liked            │
└────────┬─────────┘
         │ No
         ▼
┌──────────────────┐
│ Check if target  │  Silent success if they passed
│ passed user      │
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
 Passed    Not passed
    │         │
    │         ▼
    │    ┌──────────────────┐
    │    │ Check mutual like│
    │    └────────┬─────────┘
    │         ┌───┴───┐
    │         │       │
    │         ▼       ▼
    │      No like   Mutual!
    │         │       │
    │         │       ▼
    │         │  Create Match
    │         │       │
    └────┬────┴───────┘
         │
         ▼
    Like recorded
```

### Pass Flow

```
User passes on profile
         │
         ▼
┌──────────────────┐
│ Check existing   │  Update expires_at if exists
│ pass             │
└────────┬─────────┘
         │
         ▼
Create/Update Pass
expires_at = now + 30 days
```

### Block Flow

```
User blocks profile
         │
         ▼
┌──────────────────┐
│ Create Block     │
│ record           │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ End any active   │  Status → UNMATCHED
│ match            │
└────────┬─────────┘
         │
         ▼
    Done
```

### Report Flow

```
User reports profile
         │
         ▼
┌──────────────────┐
│ Create Report    │
│ record           │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Auto-block       │  Reporter protected immediately
│ reported user    │
└────────┬─────────┘
         │
         ▼
Report enters moderation queue
```

## Rate Limiting

### Daily Like Limit
- **Limit**: 10 likes per day
- **Reset**: Midnight UTC
- **Tracking**: `DailyLikeCount` table

### Required Comments
- **Rule**: First 5 likes require a message
- **Purpose**: Forces engagement, reduces spam
- **Check**: `requires_comment()` counts total likes ever sent

### Abuse Detection
- **Velocity**: 5+ likes in < 60 seconds = suspicious
- **Spam**: Same message 3+ times = spam warning
- **Check**: `check_abuse_patterns()` returns `AbuseCheck`

## Public Functions

### Like Operations

```python
send_like(db, from_user_id, to_user_id, message?, liked_item?) -> LikeResult
# Returns: success, is_match, match_id, error

get_pending_likes(db, user_id) -> Sequence[Like]
# Returns: likes received but not yet acted on

requires_comment(db, user_id) -> bool
# Returns: whether user must include message

get_daily_likes_remaining(db, user_id) -> int
# Returns: remaining likes for today (0-10)
```

### Pass Operations

```python
send_pass(db, from_user_id, to_user_id) -> bool
# Creates 30-day pass

undo_pass(db, from_user_id, to_user_id) -> bool
# Removes pass (limited usage)
```

### Match Operations

```python
unmatch(db, user_id, match_id, reason) -> bool
# Ends match with reason

get_user_matches(db, user_id, status?) -> Sequence[Match]
# Returns user's matches, optionally filtered by status

archive_stale_matches(db, days=7) -> int
# Background job: archives inactive matches
```

### Safety Operations

```python
block_user(db, blocker_id, blocked_id) -> bool
# Creates permanent bidirectional block

report_user(db, reporter_id, reported_id, reason, details?) -> uuid
# Creates report and auto-blocks
```

### Internal Helpers

```python
check_abuse_patterns(db, user_id, message?) -> AbuseCheck
increment_daily_like_count(db, user_id) -> None
check_already_passed_you(db, from_user_id, to_user_id) -> bool
```

## Data Structures

```python
@dataclass
class LikeResult:
    success: bool
    is_match: bool
    match_id: uuid | None
    error: str | None

@dataclass
class AbuseCheck:
    is_suspicious: bool
    reason: str | None
```

## Constants

```python
PASS_COOLDOWN_DAYS = 30
MAX_DAILY_LIKES = 10
REQUIRED_COMMENT_THRESHOLD = 5
RATE_LIMIT_WINDOW_SECONDS = 60
SPAM_MESSAGE_THRESHOLD = 3
```

## Code Location

- **File**: `apps/api/src/app/services/matching.py`
- **Models**: `models/matching.py` (Like, Pass, Match, Block, Report, etc.)

## Match ID Ordering

When creating matches, user IDs are sorted to ensure uniqueness:

```python
match = Match(
    user1_id=min(from_user_id, to_user_id, key=str),
    user2_id=max(from_user_id, to_user_id, key=str),
)
```

This guarantees one row per user pair regardless of who liked first.

## Decisions

- [decision:0012:v1] - 30-day pass cooldown
- [decision:0013:v1] - Rate limiting and abuse prevention
- [decision:0014:v1] - Match lifecycle states

## Related

- [entity:like:v1] - Like data model
- [entity:pass:v1] - Pass data model
- [entity:match:v1] - Match data model
- [entity:block:v1] - Block data model
- [entity:report:v1] - Report data model
- [entity:daily-like-count:v1] - Rate limiting
- [component:api.discovery:v1] - Consumes passes/blocks for filtering
