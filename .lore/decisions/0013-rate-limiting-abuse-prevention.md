---
id: decision:0013:v1
title: "Rate limiting and abuse prevention strategy"
status: accepted
date: 2025-12-04
links:
  entities:
    - entity:like:v1
    - entity:daily-like-count:v1
    - entity:report:v1
    - entity:block:v1
  components:
    - component:api.matching:v1
  commits:
    - git:471238b
---

# Rate Limiting and Abuse Prevention Strategy

## Context

Dating apps are frequent targets for spam, scams, and harassment. Without proper safeguards:
- Bots can mass-like to farm matches
- Scammers can send copy-paste messages to hundreds of users
- Harassers can create throwaway accounts
- Legitimate users have poor experiences drowning in spam

Delete needs to prevent abuse while not frustrating genuine users. The key insight: **real users looking for relationships behave differently than bad actors**.

## Decision

Implement a multi-layered abuse prevention system:

### 1. Daily Like Limit (10 likes/day)

Generous enough for active daters, restrictive enough to prevent mass-liking.

```python
MAX_DAILY_LIKES = 10
```

**Rationale**: 10 likes/day forces thoughtfulness. A user who sends 10 genuine likes has a much higher match rate than one sending 100 spray-and-pray likes.

### 2. Required Comments for First 5 Likes

New users must include a personalized comment with their first 5 likes.

```python
REQUIRED_COMMENT_THRESHOLD = 5

async def requires_comment(db, user_id):
    like_count = await get_user_like_count(db, user_id)
    return like_count < REQUIRED_COMMENT_THRESHOLD
```

**Rationale**:
- Forces engagement with the profile before liking
- Creates friction for bots (must generate unique text)
- After 5 likes, established users get the option (but it's still encouraged)

### 3. Spam Message Detection

Same message used 3+ times flags as spam.

```python
SPAM_MESSAGE_THRESHOLD = 3

# Check for repeated messages
result = await db.execute(
    select(func.count()).where(
        Like.from_user_id == user_id,
        Like.message == message
    )
)
if same_message_count >= SPAM_MESSAGE_THRESHOLD:
    return AbuseCheck(is_suspicious=True, reason="Please personalize your messages")
```

**Rationale**: Legitimate users don't send the same opener to everyone. Copy-paste openers are a strong spam signal.

### 4. Rate Velocity Check

5+ likes in under 60 seconds triggers a slowdown warning.

```python
RATE_LIMIT_WINDOW_SECONDS = 60

# If all likes in < 60 seconds, suspicious
if daily_record.like_count >= 5 and time_span < RATE_LIMIT_WINDOW_SECONDS:
    return AbuseCheck(is_suspicious=True, reason="Likes sent too quickly")
```

**Rationale**: Humans can't genuinely evaluate 5 profiles in 60 seconds. Rapid-fire likes indicate mindless swiping or bot behavior.

### 5. Report System with Auto-Block

When a user reports another:
1. Report is logged for admin review
2. Reporter automatically blocks the reported user
3. No further interaction possible

```python
async def report_user(db, reporter_id, reported_id, reason, details):
    report = Report(...)
    db.add(report)
    await block_user(db, reporter_id, reported_id)  # Auto-block
```

**Report Reasons**:
- `fake_profile` - Suspected fake/catfish
- `inappropriate_content` - Explicit or offensive content
- `harassment` - Unwanted persistent contact
- `spam` - Promotional or scam content
- `underage` - Appears to be under 18
- `other` - Free-text explanation

### 6. Block System (Permanent, Bidirectional)

Unlike passes (30-day cooldown), blocks are permanent and bidirectional:
- Blocker never sees blocked user
- Blocked user never sees blocker
- Any active match is immediately ended

```python
async def block_user(db, blocker_id, blocked_id):
    block = Block(blocker_id=blocker_id, blocked_id=blocked_id)
    db.add(block)
    # Also end any active match
    ...
```

## Alternatives Considered

### Captcha on Every Like
Require captcha verification for each like.

**Rejected because:**
- Terrible UX for legitimate users
- Captchas are increasingly solvable by bots
- Breaks mobile app flow

### Machine Learning Spam Detection
Use ML model to classify spam messages.

**Not rejected, but deferred:**
- Requires training data we don't have yet
- Current heuristics handle most cases
- Can layer ML on top of rule-based system later

### No Limits for Verified Users
Phone/ID verification bypasses rate limits.

**Not rejected, but deferred:**
- Verification infrastructure not built yet
- Some markets have privacy concerns with ID verification
- Can add as trust tier system later

### Stricter Limits (5 likes/day)
Even more restrictive daily limit.

**Rejected because:**
- Too frustrating for active users
- Could drive users to competitors
- 10/day achieves goal without over-restricting

## Consequences

### Positive
- **Spam prevention**: Multiple layers catch different abuse patterns
- **Quality over quantity**: Forces thoughtful engagement
- **User safety**: Reports and blocks provide protection
- **Bot resistance**: Comment requirements and velocity checks stop simple bots
- **Graceful degradation**: Each layer is independent; system degrades gracefully

### Negative
- **Friction**: Legitimate power users may hit limits
- **Gaming**: Sophisticated actors could work around heuristics
- **False positives**: Some legitimate messages might look like spam
- **Complexity**: More code paths, more testing needed

### Neutral
- **Tracking overhead**: Daily like counts require storage
- **Admin queue**: Reports need human review (future feature)

## Implementation Details

### Database Tables

```sql
-- Daily like tracking
CREATE TABLE daily_like_counts (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    date TIMESTAMPTZ,
    like_count INT DEFAULT 0,
    first_like_at TIMESTAMPTZ,
    last_like_at TIMESTAMPTZ,
    UNIQUE(user_id, date)
);

-- Reports
CREATE TABLE reports (
    id UUID PRIMARY KEY,
    reporter_id UUID REFERENCES users(id),
    reported_id UUID REFERENCES users(id),
    reason VARCHAR(30),
    details TEXT,
    created_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,  -- Admin review
    reviewed_by UUID,
    action_taken VARCHAR(50)
);

-- Blocks
CREATE TABLE blocks (
    id UUID PRIMARY KEY,
    blocker_id UUID REFERENCES users(id),
    blocked_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ,
    UNIQUE(blocker_id, blocked_id)
);
```

### Code Locations

- **Abuse check**: `check_abuse_patterns()` in `services/matching.py`
- **Daily count**: `DailyLikeCount` model, `increment_daily_like_count()`
- **Report flow**: `report_user()` in `services/matching.py`
- **Block flow**: `block_user()` in `services/matching.py`
- **Discovery filter**: `get_blocked_user_ids()` in `services/discovery.py`

## Future Considerations

1. **Trust tiers**: Verified users get higher limits
2. **Shadow banning**: Reported users' messages go to spam folder
3. **ML enhancement**: Train model on reported messages
4. **Appeal system**: Let users contest reports
5. **IP/device tracking**: Cross-account abuse detection

## Related

- [entity:like:v1] - Like data model with message field
- [entity:daily-like-count:v1] - Tracking for rate limiting
- [entity:report:v1] - User reports
- [entity:block:v1] - Permanent user blocks
- [component:api.matching:v1] - Abuse prevention logic
- [decision:0012:v1] - Pass system (different from block)
