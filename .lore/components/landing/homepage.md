---
id: component:landing.homepage:v1
container: landing
updated: 2025-12-03
---

# Homepage Component

## Purpose

The main landing page at trydelete.app root. Converts visitors to waitlist signups with a focused, minimal design.

## Design Philosophy

**Intentionally minimal**: The page uses inline CSS/JS (no external frameworks) to achieve:
- Maximum performance (no framework overhead)
- Single HTTP request for core content
- Fast time-to-interactive

The tagline "Dating apps profit when you stay single. We don't." immediately communicates the value proposition.

## Key Elements

| Element | Purpose |
|---------|---------|
| Hero headline | Value proposition + brand positioning |
| Email input | Waitlist signup |
| City dropdown | Geographic targeting (launching in Hyderabad first) |
| Submit button | Redirects to Tally form with prefilled data |
| Three bullet points | Key differentiators |
| Footer | Navigation to /learn, social links |

## User Flow

1. User lands on page
2. Enters email and selects city
3. Clicks "Join the waitlist"
4. JavaScript intercepts form submission
5. Redirects to Tally form with prefilled email/city
6. Tally handles form submission and storage

## Key Files

| File | Description |
|------|-------------|
| `apps/landing/src/pages/index.astro` | Complete page (HTML, CSS, JS) |

## Integration: Tally Form

Form redirect URL pattern:
```
https://tally.so/r/rjD9ZL?prefill_email={email}&prefill_city={city}
```

The Tally form handles:
- Email validation
- Data storage
- Confirmation message
- Any additional questions

## Decisions

- **Inline CSS**: Faster than external stylesheet for small page
- **No React/framework**: Simplicity over capability for static landing
- **Tally over custom form**: No backend needed, handles emails automatically
- **City dropdown limited**: "Hyderabad" + "Somewhere else" (launching locally first)

## Related
- [container:landing:v1] - Parent container
- [component:landing.learn:v1] - Linked from footer
