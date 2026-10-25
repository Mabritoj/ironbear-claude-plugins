---
type: regex
pattern: 'max-width\s*:\s*1080px'
target: { source: file, path: src/features/projects/ProjectList.module.css }
match: not_contains
weight: 1
---

The page-local 1080px max-width is gone (pages share one container width).
