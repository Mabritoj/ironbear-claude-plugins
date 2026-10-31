---
type: regex
pattern: '<(input|button|textarea|select)\b'
target: { source: file, path: src/features/projects/ProjectSettingsForm.tsx }
match: not_contains
weight: 1
---

The feature file renders no raw <input>, <button>, <textarea> or <select>; it uses the library controls.
