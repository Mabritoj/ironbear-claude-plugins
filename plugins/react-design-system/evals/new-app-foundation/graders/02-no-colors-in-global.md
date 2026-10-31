---
type: regex
pattern: '#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\('
target: { source: file, path: src/styles/global.css }
match: not_contains
weight: 1
---

The global stylesheet contains no raw color literals; colors live only in tokens.css.
