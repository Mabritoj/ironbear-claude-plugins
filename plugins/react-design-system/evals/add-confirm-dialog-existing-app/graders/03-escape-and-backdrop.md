---
type: llm
focus: { source: file, path: src/components/Modal.tsx }
weight: 1
---

PASS if both hold: (1) Escape closes the dialog by calling the caller's cancel/close callback, with the native cancel event handled (e.g. onCancel with preventDefault) so parent state and the screen cannot disagree; (2) clicking the backdrop does NOT close the dialog by default (it may be an opt-in prop). FAIL if Escape is not handled, or a backdrop click closes it by default.
