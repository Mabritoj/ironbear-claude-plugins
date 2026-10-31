---
type: regex
pattern: '^(?=[\s\S]*src/components/Modal\.tsx$)(?=[\s\S]*src/components/ConfirmDialog\.tsx$)(?=[\s\S]*src/components/(Modal|ConfirmDialog)\.test\.tsx$)'
target: files
flags: m
weight: 1
---

Modal.tsx, ConfirmDialog.tsx and at least one of their test files were created in src/components.
