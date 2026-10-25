---
type: llm
focus: trace
weight: 1
---

Button's props are a discriminated union on the navigation target: `to` renders a react-router Link, `href` renders an <a>, and otherwise a <button> that defaults to type="button"; button-only props such as disabled are not accepted on the link branches.
