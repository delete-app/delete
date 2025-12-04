---
id: decision:0011:v1
title: "Trait-based compatibility scoring from quiz responses"
status: accepted
date: 2025-12-04
links:
  entities:
    - entity:user-trait-score:v1
    - entity:quiz-response:v1
  components:
    - component:api.compatibility:v1
    - component:api.discovery:v1
  commits:
    - git:471238b
---

# Trait-based Compatibility Scoring

## Context

Delete needs a matching system that goes beyond superficial attraction to predict long-term compatibility. Traditional dating apps match on demographics and photos, leading to high match rates but low relationship success. Delete's philosophy is to match on behavioral traits that research shows predict relationship satisfaction.

The challenge was: how do we derive meaningful compatibility scores from user inputs without requiring lengthy psychological assessments that would hurt onboarding conversion?

## Decision

Implement a lightweight quiz (6 questions, 1-5 scale each) that maps directly to personality trait scores. These scores power compatibility calculations between users.

### Quiz Question to Trait Mapping

| Quiz Question | Trait Column | Scale |
|---------------|--------------|-------|
| introvert_extrovert | introvert_extrovert | 1=introvert, 5=extrovert |
| planner_spontaneous | planner_spontaneous | 1=planner, 5=spontaneous |
| conflict_style | conflict_talk_space | 1=talk immediately, 5=need space |
| alone_time | together_alone_time | 1=together, 5=alone |
| decision_speed | slow_quick_decisions | 1=slow, 5=quick |
| novelty_needs | routine_novelty | 1=routine, 5=novelty |

### Compatibility Calculation

1. **Per-trait difference**: `abs(user_score - other_score)` (0-4 range)
2. **Total difference**: Sum of all trait differences (0-24 range)
3. **Overall score**: `100 - (total_difference / 24 * 100)` (0-100 range)

### Compatibility Labels

| Difference | Label | Description |
|------------|-------|-------------|
| 0 | aligned | "You're exactly aligned" |
| 1 | similar | "Very similar" |
| 2 | different | "Some differences" |
| 3-4 | opposite | "Opposite - may complement or clash" |

### Score Interpretation

| Score Range | Summary |
|-------------|---------|
| 80-100 | "Strong compatibility - you're well aligned on most traits" |
| 60-79 | "Good compatibility - similar in key areas with some differences" |
| 40-59 | "Moderate compatibility - some alignment, some contrast" |
| 0-39 | "Complementary opposites - could balance each other out" |

### "Why You Might Click" Highlights

For well-aligned traits (difference <= 1), generate human-readable highlights:
- Difference 0: "Both {label}" (e.g., "Both introverts")
- Difference 1: "Similar {trait name}" (e.g., "Similar planning style")

Maximum 3 highlights shown to avoid overwhelming users.

## Alternatives Considered

### Big Five Personality Assessment
Full psychological personality assessment (OCEAN model).

**Rejected because:**
- Too long for onboarding (40+ questions typical)
- Requires professional interpretation
- Overly academic for dating context

### Attachment Style Only
Match primarily on attachment style compatibility.

**Rejected because:**
- Attachment style alone doesn't predict daily compatibility
- Many users don't know their attachment style
- Limited to 4 categories, too coarse-grained

### AI/Embedding-Based Matching
Use LLM embeddings of bio text for similarity.

**Not rejected, but deferred:**
- Still planned for future (pgvector ready)
- Current approach provides interpretable, explainable compatibility
- Can layer AI matching on top of trait scores later

## Consequences

### Positive
- Fast onboarding: 6 questions vs 40+ for psychological assessments
- Interpretable: Users understand WHY they're compatible
- Research-backed: Traits chosen based on relationship psychology literature
- Deterministic: No black-box AI, scores are reproducible

### Negative
- Simplified: Real compatibility is more nuanced than 6 dimensions
- Self-reported: Users may answer aspirationally vs accurately
- Static: Doesn't capture how traits change over time/context

### Neutral
- Stored as derived scores, not raw answers (allows algorithm evolution)
- Can add more traits later without changing score calculation approach

## Implementation Details

- **Service**: `apps/api/src/app/services/compatibility.py`
- **Model**: `UserTraitScore` in `apps/api/src/app/models/matching.py`
- **Quiz Model**: `QuizResponse` in `apps/api/src/app/models/profile.py`
- **Derivation**: `derive_trait_scores()` converts quiz answers to trait scores
- **Calculation**: `calculate_compatibility()` compares two users' trait scores

## Related

- [entity:user-trait-score:v1] - Stores derived trait scores
- [entity:quiz-response:v1] - Stores raw quiz answers
- [component:api.compatibility:v1] - Compatibility calculation logic
- [component:api.discovery:v1] - Uses compatibility in profile ranking
- [decision:0004:v1] - Python/FastAPI chosen partly for ML capabilities
