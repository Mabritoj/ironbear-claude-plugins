---
type: llm
focus: { source: file, path: src/components/Card.tsx }
weight: 1
---

PASS if Card accepts an `as` prop with generic typing so the chosen element's props are type-checked (props derived from the element type E, e.g. via ComponentPropsWithRef<E> or a PolymorphicProps helper) and it renders a div by default. FAIL if `as` is typed as string/any, or there is no `as` prop.
