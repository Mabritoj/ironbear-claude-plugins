---
type: regex
pattern: '^(?=[\s\S]*role=["\x27]tablist)(?=[\s\S]*role=["\x27]tab["\x27])(?=[\s\S]*role=["\x27]tabpanel)(?=[\s\S]*aria-selected)(?=[\s\S]*aria-controls)'
target: { source: file, path: src/components/Tabs.tsx }
weight: 1
---

Tabs.tsx uses the tablist/tab/tabpanel roles with aria-selected and aria-controls.
