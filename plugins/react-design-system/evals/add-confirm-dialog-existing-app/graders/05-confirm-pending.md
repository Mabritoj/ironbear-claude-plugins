---
type: llm
focus: { source: file, path: src/components/ConfirmDialog.tsx }
weight: 1
---

PASS if the confirm button can show a pending/loading state for an async action, and while pending the Cancel button is disabled and Escape does not close the dialog; the confirm button supports a destructive variant. FAIL if there is no pending state, or Cancel/Escape still work while pending.
