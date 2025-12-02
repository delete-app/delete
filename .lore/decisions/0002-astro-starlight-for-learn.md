---
id: decision:0002:v1
title: "Astro + Starlight for educational content"
status: accepted
date: 2024-12-03
links:
  containers:
    - container:landing:v1
  commits:
    - git:43e2e64
    - git:a474dce
---

# Astro + Starlight for educational content

## Context

Delete's "Learn" section is a core part of the brand strategy: providing research-backed relationship education inspired by Zerodha Varsity. This content needs to:

1. Be **SEO-friendly** for organic discovery
2. Support **rich formatting** (citations, callouts, diagrams)
3. Be **easy to author** in Markdown
4. Load **fast** (content sites need performance)
5. Support a **documentation-style sidebar** for modules

## Decision

Use **Astro** with **Starlight** (Astro's documentation theme) for the landing site and Learn content.

Key configuration choices:
- Force dark mode only (brand consistency)
- Custom theme components to hide light mode toggle
- Sidebar organized by learning modules
- MDX support for rich components when needed

## Alternatives Considered

### Next.js + MDX
- Pro: Familiar React ecosystem, flexible routing
- Con: Overkill for static content, slower builds, more complex MDX setup
- Rejected: Documentation isn't Next.js's strength

### Docusaurus
- Pro: Purpose-built for docs, React-based
- Con: Heavier, Facebook ecosystem, less flexible theming
- Rejected: Starlight is lighter and more customizable

### VitePress
- Pro: Fast, Vue-based, good DX
- Con: Vue when rest of stack is React
- Rejected: Mixing Vue and React adds complexity

### Hugo/Jekyll
- Pro: Fast static generation
- Con: Go/Ruby templates, less modern DX
- Rejected: Astro offers better DX with modern tooling

### Plain Astro (no Starlight)
- Pro: Maximum flexibility
- Con: Would need to build docs features from scratch
- Rejected: Starlight provides excellent defaults for our use case

## Consequences

### Positive
- Beautiful documentation UI out of the box
- Pagefind search included automatically
- Sidebar navigation with auto-generation
- Fast static builds
- Easy content authoring in Markdown
- Can add custom components when needed

### Negative
- Learning Astro's component syntax
- Starlight customization has limits (had to override theme components for dark mode)
- Less flexibility than building from scratch

### Neutral
- Content lives in `src/content/docs/` by Starlight convention
- Need to follow Starlight's frontmatter schema

## Implementation Notes

### Dark mode enforcement
Starlight doesn't have a "dark only" option, so we override components:
- `ForceDarkTheme.astro` - Replaces ThemeProvider
- `EmptyComponent.astro` - Hides theme selector

### Content organization
Modules map to directories with numbered files for ordering:
```
learn/
├── module-1-know-yourself/
│   ├── 1-why-self-awareness-matters.md
│   └── 2-your-attachment-style.md
```

### Citation style
Adopted Wikipedia-style superscript citations for credibility:
```markdown
Research shows X.<sup>[[1]](https://doi.org/...)</sup>

## References
1. Author (Year). Title. *Journal*. [doi:...](link)
```

## Related
- [container:landing:v1] - Uses this decision
- [decision:0005:v1] - Wikipedia-style citations
