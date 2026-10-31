---
type: regex
pattern: '#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\('
target: { source: file, path: src/components/Tabs.module.css }
match: not_contains
weight: 1
---

Tabs.module.css has no raw color literals.
