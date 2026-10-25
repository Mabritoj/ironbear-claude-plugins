---
name: react-design-system
description: How to build, audit, extend or align a React + TypeScript design system - design tokens in CSS custom properties, themeable [data-theme] scoping, primitive components (Button, Field, Card, Text, Modal, Menu, Popover...), polymorphism (`to`/`href` link-vs-button unions and `as` props), folder layout, accessibility, guardrail tests, and a code layout that converts cleanly into a Claude Design System artifact. Use this whenever the user is creating or changing a shared UI component, adding a token or theme, setting up styling for a new React app, migrating a page off hand-styled buttons/inputs/cards, auditing UI consistency or "drift", asking about polymorphic components, or wants their design system synced to Claude Design - even if they never say "design system".
---

# React design system

A design system here means: **one token file**, **a small set of primitive
components** that every feature builds from, and **tests that stop drift**.
The patterns below come from aligning a real React 19 + TypeScript + CSS
Modules app whose independently generated screens had drifted to 18 radii,
38 font size/weight pairs, 27 hand-styled buttons and no focus ring. They
are project-agnostic: use the project's own names, palette and domain.

The defaults assume React 18/19, TypeScript strict, CSS Modules, Vite,
Vitest + React Testing Library, react-router. If the project uses something
else, keep the principles and translate the mechanics (see "Other stacks").

## First: figure out which job this is

| The user wants... | Do this |
| --- | --- |
| A design system for a **new** app | Lay down the folder layout and foundation files below (copy `templates/`), then build primitives as features need them. |
| To **audit or align** an existing app | Follow `references/audit-and-migration.md`: measure drift with greps, write a phased plan, migrate page by page with before/after screenshots. |
| A **new primitive** or a change to one | Read `references/components.md` (and `references/polymorphism.md` if it's clickable or its tag varies, `references/overlays.md` if it floats). Add it to the catalog page and the barrel. |
| A **new token** or theme | Read `references/tokens.md`. |
| To **sync to / build a Claude Design System** | Read `references/claude-design-system.md`. |

Look at the project before deciding anything: an existing `tokens.css`,
`components/` folder, CLAUDE.md conventions or catalog page beats this skill's
defaults. Match what's there; propose changes to it explicitly rather than
silently introducing a second convention. When a task touches one part of a
drifted system (add a component, fix a page), do that task in the system's
best existing style, then list the drift you noticed (hardcoded colors,
missing focus ring, unnamed icon buttons, hue-named tokens) with a suggested
fix -- don't rewrite unrelated files unasked.

## Folder layout

```
src/
  styles/
    tokens.css              # every raw value; colors per [data-theme]
    global.css              # imports tokens; focus ring, body, .app-container
    typography.module.css   # named text roles (h1, body, label, eyebrow...)
    README.md               # brand rules: which token/primitive when (optional, feeds Claude Design)
  components/               # design-system primitives ONLY
    index.ts                # barrel: `export *` from each primitive
    polymorphic.ts          # PolymorphicProps<E, Own> for tag-only `as`
    ActionElement.tsx       # button | router link | anchor union
    fieldContext.ts         # Field -> control wiring (id, describedby, invalid)
    Button.tsx  Button.module.css  Button.test.tsx  [Button.md]
    ...
  hooks/                    # shared hooks (useRovingSelection, useDismissablePanel)
  utils/cx.ts               # class-name joiner
  utils/format.ts           # shared formatters -- never redefined per component
  routes/DesignCatalog.tsx  # dev-only page rendering every primitive in every theme
  test/
    cssGuardrails.ts(.test.ts)  # fails the build on raw colors/fonts/outline:none
    dialogShim.ts               # jsdom lacks HTMLDialogElement.showModal
  features/<feature>/       # feature code composes primitives; no hand-styled controls
```

Flat `components/Button.tsx` and per-folder `components/Button/Button.tsx`
both work; pick one per repo. App-specific composites (AppHeader,
ProfileMenu, route guards, ErrorBoundary) may live in `components/` but stay
**out of the barrel** -- the barrel is the list of what the design system is.

`templates/` holds working copies of the foundation files: `styles/tokens.css`,
`styles/global.css`, `styles/typography.module.css`,
`components/{polymorphic.ts,ActionElement.tsx,fieldContext.ts}`, `utils/cx.ts`,
`hooks/useRovingSelection.ts`, `test/{cssGuardrails.ts,cssGuardrails.test.ts,dialogShim.ts}`.
Copy them, then replace `TEMPLATE:`-marked values with the project's own.

## The rules, and why

1. **Every raw value lives in `tokens.css`.** Colors as `--color-*`
   redefined per theme; theme-independent scales `--text-*`, `--space-*`,
   `--radius-*`, `--shadow-*`, `--z-*`, `--font-*`, `--duration-*`. Name
   colors by role (`--color-warning` = needs attention, `--color-destructive`
   = errors and irreversible actions), not by hue, so a rename never ripples.
   A guardrail test fails on hex/rgb/hsl, font names and `outline: none`
   anywhere else -- without it, drift comes back within weeks.

2. **Themes key on `[data-theme]`, not `:root[data-theme]`.** Then a subtree
   can opt in (`<div data-theme="dark">` on an always-dark login page) instead
   of a page mutating the global theme on mount, or carrying a private palette.

3. **Reach for a primitive before writing a local control.** A hand-styled
   `<button>`, `<input>`, card or badge in a feature is how the drift starts.
   If no primitive fits, extend one (a prop) or add one -- don't fork it.

4. **Polymorphism comes in two shapes** (details: `references/polymorphism.md`):
   - The element changes **behavior** (button vs link) -> a discriminated
     union on the target: `to` renders a router `Link`, `href` an `<a>`,
     neither a `<button type="button">`. Each branch keeps its own element's
     props, so `disabled` only type-checks on the button.
   - Only the **tag** changes (`section`, `li`, `Link`) -> an `as` prop typed
     by `PolymorphicProps<E, OwnProps>`.
   Anything that navigates is a link, never a button calling `navigate()` --
   links get middle-click, open-in-new-tab and the right semantics.

5. **A `className` passed to a primitive sets layout only** (flex/grid
   placement, width, margin). Never padding, color, radius, font or display:
   a module class and the primitive's class have equal specificity, so the
   winner depends on CSS load order and flips between dev and prod builds.
   Offer a prop (`size`, `tone`, `padding`) instead; if an override is truly
   needed, scope it (`.parent .child`) so it wins deliberately.

6. **Props are variants, not styles.** Small closed unions: `variant`,
   `size: 'sm' | 'md' | 'lg'`, `tone`, `padding`. Defaults make the common
   case prop-free. Add a `loading` state to buttons instead of letting every
   caller hand-roll `disabled` + "Saving...".

7. **Accessibility is part of the component, not the caller.** `Field`
   wires label/hint/error to its control through context; `IconButton`
   requires `label`; errors use `role="alert"`; tabs and radio groups use
   roving tabindex; overlays manage focus. One global `:focus-visible` ring.

8. **Labels in sentence case; caps are a style.** JSX says `"Net weight"`,
   CSS applies `text-transform: uppercase`. Screen readers may spell out
   all-caps strings, and tests query the real text.

9. **Runtime data reaches CSS only as a custom property.** No inline
   styles, except `style={{ '--swatch': hex } as CSSProperties}` for values
   CSS can't know (a user-picked color, a progress percent), read by the
   module as `var(--swatch)`.

10. **Responsive by default.** Two breakpoints as documented literals (640px
    phone, 860px tablet -- `var()` can't go in `@media`). `min-width: 0` on
    grid/flex children; fluid media (`width: 100%; max-width: Npx`). Text
    inputs render at 16px on `pointer: coarse` so iOS doesn't zoom on focus.

11. **Every page renders the shared `.app-container`** for its width. A
    page-local `max-width` is how three pages ended up 1080/1120/1140px wide
    and the header jumped sideways between them.

## Component conventions (summary)

Functional components, named exports, `{Component}Props` interface,
props destructured in the signature, co-located `X.module.css` and
`X.test.tsx`. A JSDoc line on the component and on every non-obvious prop --
it becomes the guideline text in the catalog and in Claude Design. The full
checklist, the primitive inventory and the anatomy of `Button`/`Field`/`Card`
are in `references/components.md`.

## Verifying a change

- `typecheck`, `lint`, the test suite (guardrails included) -- all green.
- Look at it in a real browser, in **both themes**, at ~375px, 768px and
  desktop. jsdom can't show you top-layer dialogs, focus trapping, layout or
  specificity fights; `references/testing.md` lists what it can't emulate.
- Add or update the primitive on the catalog page (`/__design`, dev-only via
  `import.meta.env.DEV`) and in the barrel.
- When a control changes element (button -> link), update **negative**
  assertions too: `queryByRole('button', ...)` against what is now a link
  passes vacuously.

## Other stacks

- **Tailwind v4:** put the tokens in `@theme { --color-...: ...; }` (same
  naming, same literal-values rule), themes as `[data-theme=dark] { ... }`
  overrides; primitives still own their class lists, and the className rule
  becomes "callers pass layout utilities only" (use `tailwind-merge` only if
  the project already does).
- **No router:** `ActionElement` drops the `to` branch.
- **React 18:** refs aren't props -- wrap primitives in `forwardRef` and use
  `ComponentPropsWithoutRef` in `PolymorphicProps`.

## References

- `references/tokens.md` -- token naming, scales, themes, adding a token, the guardrail
- `references/components.md` -- primitive inventory, anatomy, prop conventions, checklist for a new primitive
- `references/polymorphism.md` -- both patterns with full typings, usage, pitfalls
- `references/overlays.md` -- Modal on native `<dialog>`, ConfirmDialog, Menu, Popover/bottom sheet, roving focus
- `references/testing.md` -- guardrail test, dialog shim, what to assert, catalog page
- `references/audit-and-migration.md` -- measuring drift, phased plan, migrating pages safely
- `references/claude-design-system.md` -- code layout that converts into a Claude Design System artifact, and how the conversion maps
