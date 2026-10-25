---
type: regex
pattern: '#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\('
target: { source: file, path: src/components/Tooltip.module.css }
match: not_contains
weight: 1
---

Tooltip.module.css contains no hex/rgb/hsl color literals; colors come from custom properties.
