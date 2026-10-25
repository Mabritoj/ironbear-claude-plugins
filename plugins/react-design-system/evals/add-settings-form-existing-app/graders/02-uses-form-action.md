---
type: regex
pattern: 'useActionState|action=\{'
target: { source: file, path: src/features/projects/ProjectSettingsForm.tsx }
weight: 1
---

The form uses React 19 actions (useActionState and/or <form action={...}>).
