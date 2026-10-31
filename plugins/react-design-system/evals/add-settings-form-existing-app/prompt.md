---
tags: [react-design-system]
max_turns: 60
timeout_seconds: 1500
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

add a project settings form to the project page: a required name and an optional description, plus a save button. use react 19 form actions; saving can just update the zustand store (add an action there). put reusable form pieces in the component library under src/components/ (e.g. Field.tsx for label/hint/error, plus the controls) and the form itself in src/features/projects/ProjectSettingsForm.tsx. don't change the header.

Input files: the Taskboard app in the current directory
