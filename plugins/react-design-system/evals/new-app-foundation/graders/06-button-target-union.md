---
type: llm
focus: { source: file, path: src/components/Button.tsx }
weight: 1
---

PASS if Button's props form a discriminated union on the navigation target -- `to` renders a router Link, `href` renders an <a>, otherwise a <button> defaulting to type="button" -- either defined in this file or built from an imported target-union type/component (e.g. ActionProps / ActionElement) that this file clearly uses for those branches. FAIL if Button only renders a <button>, uses a single untyped `as` prop for links, or the link branches accept disabled.
