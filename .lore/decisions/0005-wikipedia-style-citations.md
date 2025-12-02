---
id: decision:0005:v1
title: "Wikipedia-style superscript citations for credibility"
status: accepted
date: 2024-12-03
links:
  containers:
    - container:landing:v1
  commits:
    - git:0002929
    - git:169ab32
---

# Wikipedia-style superscript citations for credibility

## Context

Delete Learn content makes claims about relationship psychology, attachment theory, and neuroscience. To differentiate from typical dating advice content (often unfounded opinions), we need to establish credibility.

Problem: How do we cite research without making the content feel academic and unapproachable?

## Decision

Adopt **Wikipedia-style superscript citations** with:
1. Superscript numbers linking to DOIs: `<sup>[[1]](https://doi.org/...)</sup>`
2. Full references section at the bottom of each article
3. Scientific caveats where appropriate (e.g., "percentages are approximations")

Example in content:
```markdown
Hazan & Shaver's 1987 study first applied attachment theory to adult romantic love.<sup>[[1]](https://doi.org/10.1037/0022-3514.52.3.511)</sup>
```

Example references section:
```markdown
## References

1. Hazan, C., & Shaver, P. (1987). Romantic love conceptualized as an attachment process. *Journal of Personality and Social Psychology, 52*(3), 511-524. [doi:10.1037/0022-3514.52.3.511](https://doi.org/10.1037/0022-3514.52.3.511)
```

## Alternatives Considered

### Inline parenthetical citations (APA style)
- Pro: Academic standard
- Con: Interrupts reading flow
- Con: Feels like a textbook
- Rejected: Too academic for casual reading

### Footnotes at page bottom
- Pro: Clean main text
- Con: Harder to implement in Markdown/web
- Con: Readers lose context jumping to bottom
- Rejected: Superscripts with links work better on web

### No citations (trust us)
- Pro: Cleaner content
- Con: No different from other dating advice
- Con: Misses opportunity to educate
- Rejected: Citations are a brand differentiator

### Link to sources inline
- Pro: Direct access to sources
- Con: Blue links everywhere distract
- Con: Doesn't feel as credible
- Rejected: Superscripts are cleaner

## Consequences

### Positive
- Establishes credibility immediately
- Readers can verify claims
- Differentiates from typical dating content
- Educational value (people learn to check sources)
- SEO benefit from authoritative content

### Negative
- Content takes longer to write (need to find sources)
- Need to maintain reference accuracy
- Some readers may find it intimidating

### Neutral
- Authors need to use specific citation format
- Need editorial process to verify citations

## Implementation Notes

### Citation format in Markdown
```markdown
Text with claim.<sup>[[1]](https://doi.org/...)</sup>
```

### References section template
```markdown
## References

1. Author, A. B. (Year). Article title. *Journal Name, Volume*(Issue), Pages. [doi:...](https://doi.org/...)
```

### Scientific caveats
When citing statistics that vary by study:
```markdown
*Note: Attachment percentages (50% secure, 20% anxious, etc.) are approximations based on multiple studies and vary by population and measurement method.*
```

## Related
- [decision:0002:v1] - Astro + Starlight hosts this content
- [container:landing:v1] - Learn section uses this pattern
