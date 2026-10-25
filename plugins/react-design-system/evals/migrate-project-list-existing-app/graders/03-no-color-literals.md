---
type: regex
pattern: '#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\('
target: { source: file, path: src/features/projects/ProjectList.module.css }
match: not_contains
weight: 1
---

ProjectList.module.css has no raw color literals.
