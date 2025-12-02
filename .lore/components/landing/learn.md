---
id: component:landing.learn:v1
container: landing
updated: 2025-12-03
---

# Learn Component (Delete Learn)

## Purpose

Research-backed relationship education content at /learn/*. Modeled on Zerodha Varsity - the popular Indian financial education platform known for making complex topics accessible.

## Content Philosophy

> "No fluff. No dating advice cliches. Just honest, research-backed insights - like a smart friend who happens to have read all the studies."

Each article follows a consistent structure:
1. **Hook** - A relatable scenario
2. **The science** - Research explanation with citations
3. **Examples** - Indian-context stories (Meera, Rahul, Vikram, Ananya)
4. **Self-assessment** - Quick reflection questions
5. **One thing to know** - Actionable takeaway

## Content Structure

```
src/content/docs/learn/
├── index.mdx                      # Welcome page with CardGrid
├── module-1-know-yourself/        # Self-awareness (5 chapters)
├── module-2-attraction/           # Attraction science (1 chapter)
└── module-4-neurodivergent/       # ADHD/autism focus (1 chapter)
```

Note: Module 3 doesn't exist yet (content in progress).

## Current Modules

### Module 1: Know Yourself First
- Why self-awareness matters
- Your attachment style
- How you handle conflict
- Your emotional needs
- Your relationship with yourself

### Module 2: The Science of Attraction
- Limerence vs love

### Module 4: The Neurodivergent Lens
- ADHD in relationships

## Key Files

| File | Description |
|------|-------------|
| `astro.config.mjs` | Starlight configuration, sidebar |
| `src/content/docs/learn/index.mdx` | Welcome page |
| `src/content/docs/learn/**/*.md` | Content pages |
| `src/components/ForceDarkTheme.astro` | Dark mode enforcement |
| `src/styles/custom.css` | Theme customizations |

## Starlight Features Used

- **Sidebar autogeneration**: Directories auto-generate sidebar sections
- **Pagefind search**: Built-in full-text search
- **CardGrid**: Used on welcome page for module overview
- **Dark mode only**: Custom component overrides

## Citation Style

Wikipedia-style superscript citations:
```markdown
Research shows X.<sup>[[1]](https://doi.org/...)</sup>

## References
1. Author (Year). Title. *Journal*. [doi:...](link)
```

See [decision:0005:v1] for rationale.

## Content Guidelines

When adding new content:
1. Start with a relatable hook (2nd person, conversational)
2. Cite peer-reviewed research (DOI links)
3. Use Indian names/contexts in examples
4. Include self-assessment questions
5. End with one actionable takeaway
6. Add scientific caveats where statistics vary

## Related
- [container:landing:v1] - Parent container
- [decision:0002:v1] - Why Astro + Starlight
- [decision:0005:v1] - Citation style
- [component:landing.homepage:v1] - Links here from footer
