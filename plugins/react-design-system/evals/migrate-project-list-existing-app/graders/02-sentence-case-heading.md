---
type: regex
pattern: '>\s*PROJECTS\s*<'
target: { source: file, path: src/features/projects/ProjectList.tsx }
match: not_contains
weight: 1
---

The heading text is no longer written in ALL CAPS in JSX (caps, if wanted, come from CSS).
