---
type: llm
focus: { source: file, path: src/components/Field.tsx }
weight: 1
---

PASS if Field connects its label to the control (htmlFor/id from useId or a context the control reads), and when an error is shown the control gets aria-invalid and aria-describedby pointing at the error (and hint) and the error has role="alert". FAIL if the label is not programmatically linked or the error is not connected to the control.
