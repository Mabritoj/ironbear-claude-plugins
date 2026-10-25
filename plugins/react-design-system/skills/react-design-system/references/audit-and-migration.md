# Auditing and aligning an existing app

Drift is measurable. Measure first, so the plan is grounded in counts and
progress is visible.

## 1. Measure (run from `src/`, adjust globs)

On a large app (roughly more than 30 stylesheet files or 3,000 lines of
CSS), the `design-drift-auditor` agent runs this section and the "Also
read" list and returns only the findings; spawn it instead of running the
greps inline, then write the plan from its report. On a smaller app, read
the files and run the greps yourself.

```bash
# Color literals outside the token file
grep -rnoE "#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(" --include=*.css . | grep -v styles/tokens.css | wc -l
# Font families written out (and how many times)
grep -rhoE "'[A-Z][A-Za-z ]+'" --include=*.css . | sort | uniq -c | sort -rn
# Distinct radii / font sizes / shadows / z-indexes
grep -rhoE "border-radius:\s*[^;]+" --include=*.css . | sort | uniq -c | sort -rn
grep -rhoE "font(-size)?:\s*[^;]+" --include=*.css . | sort | uniq -c | sort -rn | head -40
grep -rhoE "box-shadow:\s*[^;]+" --include=*.css . | sort | uniq -c
grep -rhoE "z-index:\s*[^;]+" --include=*.css . | sort | uniq -c
# Focus: suppressions vs. replacements
grep -rn "outline:\s*\(none\|0\)" --include=*.css . ; grep -rc ":focus-visible" --include=*.css . | grep -v ":0"
# Raw controls in feature code
grep -rn "<button" --include=*.tsx features routes | grep -v test | wc -l
grep -rn "<input\|<select" --include=*.tsx features routes | grep -v test | wc -l
# Navigation done with buttons
grep -rn "navigate(" --include=*.tsx . | grep -v test
# Inline styles and ALL-CAPS label strings
grep -rn "style={{" --include=*.tsx . | grep -v test
grep -rnE "['\"][A-Z]{2,}( [A-Z]{2,})+['\"]" --include=*.tsx . | grep -v test
# Duplicated look-alike classes
grep -rhoE "^\.[a-zA-Z]*(Card|Label|Input|Badge|Button)[a-zA-Z]*" --include=*.module.css . | sort | uniq -c | sort -rn
```

Also read: the existing token file (is theme scoping `:root[data-theme]`?
are there private palettes in page modules?), the existing components (do
they have keyboard support, `role="alert"`, focus handling?), and page
containers (different `max-width`s?).

## 2. Write the plan (a doc in the repo)

Sections: summary; findings (tables: area -> current state -> problem, with
counts and file names); target architecture (token list, primitive
inventory, polymorphism typing); phased plan with checkboxes; risks and
decisions needed; rough effort with stated confidence. Record each phase's
outcome in the doc as it lands, including corrections to the findings.

The phase order that worked, least to most risky:

| Phase | Content | Why this order |
| --- | --- | --- |
| 0 Baseline + guardrails | Green typecheck/tests; global `:focus-visible`; guardrail test with an allowlist of today's offenders; design-system lint rules at `warn` | Can't measure regressions from a red baseline; the allowlist turns cleanup into a number |
| 1 Tokens | Token file with scales and `[data-theme]` scoping; codemod modules onto it; kill private palettes | Mostly mechanical, visible change <= 2px; everything later depends on it |
| 2 Primitives | Foundations (`cx`, polymorphic types, typography) -> actions -> display -> forms; catalog page | Build before migrating so pages have something to move to |
| 3 Overlays | Modal on `<dialog>`, ConfirmDialog, Menu, Popover | Highest behavior risk; isolate it and verify in a browser |
| 4 Migrate features | One page/feature per step, least custom first | Each step reviewable; learnings from simple pages harden primitives before the hard ones |
| 5 Lock in | Docs (CLAUDE.md design-system section), empty allowlist, PR | Rules nobody reads don't hold |

## 3. Migrate a page safely

1. Screenshot every state of the page *before* (both themes; 375/768/1440).
2. Replace local controls with primitives; delete the now-dead module classes.
3. Remove className overrides that fight a primitive's padding/color/radius;
   use a prop or a scoped override instead.
4. Convert navigating buttons to links; fix ALL-CAPS strings to sentence
   case (update tests that queried the caps text).
5. Typecheck, lint, tests (fix vacuous negatives -- see `testing.md`).
6. Screenshot *after* and diff. Every difference should be intended; write
   down the intended ones in the plan.
7. Commit per page with a conventional message.

## Lessons from a real migration

- Mockups generated screen-by-screen aren't consistent with each other:
  treat their container widths, header sizes and spacing as reference only,
  and use the shared tokens and `.app-container`.
- A "pinned by tests" behavior is a product decision, not a bug -- e.g. a
  confirm dialog that ignores backdrop clicks. Confirm with the owner before
  "fixing" it.
- Shrinking a control's size to match a mockup can make the real UI worse
  (a chat composer, a nav CTA); check sizes in context, not in isolation.
- Specificity ties (a page passing `className` that sets padding on a
  primitive) render differently depending on CSS chunk order -- the bug
  appears in production but not in dev. Grep for them during migration.
- Error boundaries around routed pages turn a crashed lazy chunk into a
  message + reload instead of a blank screen; a chunk-load error deserves one
  automatic reload (guard it with a sessionStorage timestamp).
