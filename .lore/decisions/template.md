---
id: decision:{number}:v1
title: "{Decision Title}"
status: proposed | accepted | deprecated | superseded
date: {ISO-8601-date}
supersedes: decision:{number}:v1  # optional
superseded_by: decision:{number}:v1  # optional
links:
  entities:
    - entity:{name}:v1
  components:
    - component:{path}:v1
  commits:
    - git:{short-hash}
---

# {Decision Title}

## Context

{What is the issue that we're seeing that is motivating this decision?}

## Decision

{What is the change that we're proposing and/or doing?}

## Alternatives Considered

### {Alternative 1}
{Description and why rejected}

### {Alternative 2}
{Description and why rejected}

## Consequences

### Positive
- {consequence}

### Negative
- {consequence}

### Neutral
- {consequence}

## Related
- [entity:{name}:v1] - {how affected}
- [component:{path}:v1] - {how affected}
- [decision:{number}:v1] - {relationship}
