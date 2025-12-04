---
id: component:api.profile:v1
type: service
updated: 2025-12-04
---

# Profile Service

## Purpose

Manages user profile content: photos, prompts, quiz responses, and badges. Calculates profile completion status for discovery eligibility.

## Profile Completion

A profile is considered complete when:

1. **Basic info**: name, birth_date, gender, looking_for all set
2. **Photos**: At least 2 photos uploaded
3. **Prompts**: At least 1 prompt answered
4. **Quiz**: All 6 quiz questions answered

Completion percentage is displayed to users and affects discovery ranking.

## Photo Management

### Operations

```python
get_user_photos(db, user_id) -> Sequence[Photo]
# Returns photos ordered by order field

create_photo(db, user_id, photo_in) -> Photo
# Auto-assigns next order number

delete_photo(db, photo_id, user_id) -> bool
# Removes photo (doesn't reorder others)

reorder_photos(db, user_id, photo_ids) -> Sequence[Photo]
# Updates order based on list position
```

### Constraints
- Minimum 2 photos for profile completion
- Maximum 6 photos (implicit via UI)
- order=0 is primary photo shown in discovery

## Prompt Management

### Operations

```python
get_user_prompts(db, user_id) -> Sequence[Prompt]
# Returns prompts ordered by order field

create_prompt(db, user_id, prompt_in) -> Prompt
# Validates question is in AVAILABLE_PROMPTS

update_prompt(db, prompt_id, user_id, answer) -> Prompt | None
# Updates answer text only

delete_prompt(db, prompt_id, user_id) -> bool
# Removes prompt answer
```

### Validation
- Question must be in `AVAILABLE_PROMPTS` list
- User cannot answer same question twice
- Answer text is free-form

## Quiz & Badge System

### Quiz Submission

```python
submit_quiz(db, user_id, answers: list[QuizAnswer]) -> list[Badge]
```

Flow:
1. Clear existing quiz responses and badges
2. Save new quiz responses
3. Generate badges from strong answers (1-2 or 4-5)
4. Derive trait scores (calls compatibility service)
5. Return generated badges

### Badge Generation

Only strong opinions generate badges:

| Answer Value | Badge Generated |
|--------------|-----------------|
| 1 or 2 | Yes (left-side trait) |
| 3 | No (neutral) |
| 4 or 5 | Yes (right-side trait) |

### Badge Retrieval

```python
get_user_badges(db, user_id) -> Sequence[Badge]
get_user_quiz_responses(db, user_id) -> Sequence[QuizResponse]
```

## Profile Completion Calculation

```python
calculate_profile_completion(db, user_id, user) -> ProfileCompletion
```

Returns:
- `percentage`: 0-100 int
- `has_photos`: bool
- `photo_count`: int
- `has_prompts`: bool
- `prompt_count`: int
- `has_quiz`: bool
- `has_basic_info`: bool
- `missing`: list[str] of completion suggestions

Calculation:
```
total_items = 4  # basic info, photos, prompts, quiz
completed = sum([has_basic_info, has_photos, has_prompts, has_quiz])
percentage = (completed / total_items) * 100
```

## Available Prompts

Stored in `schemas/profile.py` as `AVAILABLE_PROMPTS`:

- "A perfect day for me looks like..."
- "I'm looking for someone who..."
- "My most controversial opinion is..."
- "I geek out about..."
- "You should NOT date me if..."
- (and more)

## Integration Points

- **Discovery Service**: Uses profile completion in ranking
- **Compatibility Service**: Called after quiz submission for trait derivation
- **API Routes**: `api/v1/profile.py` exposes HTTP endpoints

## Code Location

- **Service**: `apps/api/src/app/services/profile.py`
- **Models**: `models/profile.py` (Photo, Prompt, QuizResponse, Badge)
- **Schemas**: `schemas/profile.py` (AVAILABLE_PROMPTS, Pydantic models)
- **Routes**: `api/v1/profile.py`
- **Migration**: `alembic/versions/0003_add_profile_tables.py`

## Constants

```python
BADGE_DEFINITIONS = {
    "introvert_extrovert": {
        1: ("introvert", "Introvert", "Recharges with alone time"),
        # ...
    },
    # ...
}
```

## Related

- [entity:photo:v1] - Photo data model
- [entity:prompt:v1] - Prompt data model
- [entity:quiz-response:v1] - Quiz answer storage
- [entity:badge:v1] - Badge data model
- [component:api.compatibility:v1] - Trait derivation on quiz submit
- [component:api.discovery:v1] - Uses completion for ranking
