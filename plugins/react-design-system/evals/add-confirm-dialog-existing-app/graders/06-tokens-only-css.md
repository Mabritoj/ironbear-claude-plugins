---
type: regex
pattern: '#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\('
target: { source: file, path: src/components/Modal.module.css }
match: not_contains
weight: 1
---

Modal.module.css has no raw color literals (the backdrop uses a token too).
