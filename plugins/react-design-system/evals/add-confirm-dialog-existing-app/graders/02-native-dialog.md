---
type: regex
pattern: '<dialog[\s\S]*\.showModal\('
target: { source: file, path: src/components/Modal.tsx }
weight: 1
---

Modal renders a native <dialog> and opens it with showModal().
