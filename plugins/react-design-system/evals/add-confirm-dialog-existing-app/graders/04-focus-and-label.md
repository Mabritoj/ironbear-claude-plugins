---
type: llm
focus: { source: file, path: src/components/Modal.tsx }
weight: 1
---

PASS if both hold: (1) when the dialog closes, focus returns to the element that had it before it opened; (2) the dialog is labelled by its title through aria-labelledby with an id from useId (or equivalent unique id), not a hardcoded id. FAIL if either is missing.
