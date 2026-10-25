---
type: llm
focus: { source: file, path: src/features/projects/ProjectSettingsForm.tsx }
weight: 1
---

PASS if the submit button shows a pending state while the action runs -- via useFormStatus in a submit-button component it imports (e.g. SubmitButton), or the isPending value from useActionState passed to a loading/disabled prop. FAIL if there is no pending state.
