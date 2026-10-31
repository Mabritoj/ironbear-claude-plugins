---
tags: [react-design-system]
max_turns: 60
timeout_seconds: 1500
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

we need a confirmation step before destructive actions like deleting a project. add a Modal primitive and a ConfirmDialog built on it to the component library (src/components/Modal.tsx and src/components/ConfirmDialog.tsx), with tests. don't wire it into any page yet.

Input files: the Taskboard app in the current directory
