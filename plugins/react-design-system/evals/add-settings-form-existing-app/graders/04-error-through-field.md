---
type: llm
focus: { source: file, path: src/features/projects/ProjectSettingsForm.tsx }
weight: 1
---

PASS if submitting without a name shows the error through the Field error prop, using error data returned from the action state (not alert(), not only the browser's native required tooltip). FAIL otherwise.
