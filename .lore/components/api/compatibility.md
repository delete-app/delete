---
id: component:api.compatibility:v1
type: service
updated: 2025-12-04
---

# Compatibility Service

## Purpose

Derives personality trait scores from quiz responses and calculates compatibility between users. This is the foundation of Delete's differentiated matching - matching on behavioral compatibility rather than just appearance or demographics.

## Key Concepts

### Trait Derivation

Quiz answers (1-5 scale) map directly to six personality trait dimensions:

| Quiz Question | Trait | Scale Meaning |
|---------------|-------|---------------|
| introvert_extrovert | Social energy | 1=introvert, 5=extrovert |
| planner_spontaneous | Planning style | 1=planner, 5=spontaneous |
| conflict_style | Conflict handling | 1=talk now, 5=need space |
| alone_time | Together vs alone | 1=together, 5=alone |
| decision_speed | Decision making | 1=slow, 5=quick |
| novelty_needs | Lifestyle | 1=routine, 5=novelty |

### Compatibility Calculation

Overall compatibility score (0-100) is calculated as:

```
total_difference = sum(abs(user_score - other_score) for each trait)
max_difference = 4 * 6 = 24  # max diff per trait * num traits
overall_score = 100 - (total_difference / max_difference * 100)
```

### Compatibility Labels

Per-trait differences get human-readable labels:
- **aligned** (diff=0): "You're exactly aligned"
- **similar** (diff=1): "Very similar"
- **different** (diff=2): "Some differences"
- **opposite** (diff=3-4): "Opposite - may complement or clash"

### "Why You Might Click" Highlights

For aligned/similar traits, generate conversation-starter highlights:
- "Both introverts"
- "Similar planning style"
- Max 3 highlights per match

## Public Functions

### `derive_trait_scores(db, user_id, quiz_responses) -> UserTraitScore`

Converts quiz responses to trait scores. Called after quiz submission.

- Deletes existing trait scores for user (idempotent)
- Creates new UserTraitScore record
- Defaults missing traits to 3 (neutral)

### `get_user_trait_scores(db, user_id) -> UserTraitScore | None`

Retrieves user's trait scores.

### `calculate_compatibility(user_traits, other_traits) -> CompatibilityResult`

Pure function calculating compatibility between two UserTraitScore objects.

Returns:
- `overall_score`: 0-100 integer
- `trait_comparisons`: List of per-trait comparisons
- `summary`: Human-readable summary text
- `highlights`: List of "why you might click" items

### `get_compatibility_between_users(db, user1_id, user2_id) -> CompatibilityResult | None`

Convenience wrapper that fetches trait scores and calculates compatibility.

## Data Structures

```python
@dataclass
class TraitComparison:
    trait_name: str      # "Social energy"
    user_score: int      # 1-5
    other_score: int     # 1-5
    difference: int      # 0-4
    compatibility: str   # "aligned", "similar", etc.
    description: str     # "You're exactly aligned"

@dataclass
class CompatibilityResult:
    overall_score: int          # 0-100
    trait_comparisons: list[TraitComparison]
    summary: str               # Overall compatibility summary
    highlights: list[str]      # "Why you might click" items
```

## Integration Points

- **Profile Service**: Calls `derive_trait_scores()` after quiz submission
- **Discovery Service**: Uses `calculate_compatibility()` for profile ranking
- **Match API**: Returns compatibility data for matched users

## Code Location

- **File**: `apps/api/src/app/services/compatibility.py`
- **Constants**: `TRAIT_MAPPING`, `TRAIT_LABELS`
- **Model**: `UserTraitScore` in `models/matching.py`

## Decisions

- [decision:0011:v1] - Trait-based compatibility scoring design

## Related

- [entity:user-trait-score:v1] - Stored trait scores
- [entity:quiz-response:v1] - Raw quiz input
- [component:api.discovery:v1] - Uses compatibility for ranking
- [component:api.profile:v1] - Triggers trait derivation
