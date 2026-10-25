# Components

## Common primitives (reference, not a checklist)

These are the primitives most apps end up needing. Build only what the
app's features actually use, when they need it. The list exists so a feature
reuses or extends a primitive instead of hand-styling a local copy, not so
every app gets all of them. If the project already has components, its names,
variants and props win: the props below are examples of the shape, not the
required set. Domain-specific entries (`Stat`, `ColorInput`, a `unit` suffix)
show the kind of thing a product adds; swap them for the project's own.

| Group | Primitive | Key props / behavior |
| --- | --- | --- |
| Actions | `Button` | `variant: primary/secondary/ghost/destructive`, `size: sm/md/lg`, `loading`, `icon`; `to`/`href` union |
| | `IconButton` | `label` (required, becomes `aria-label`), `icon`, `size`, `variant: ghost/outline`; same union |
| | `icons.tsx` | One file of inline-SVG icon components, `size` prop, `currentColor`, `aria-hidden` |
| | `SubmitButton` | A Button that reads the enclosing form's pending state with `useFormStatus` (React 19); see "Forms and React 19 actions" |
| Forms | `Field` | `label`, `hint`, `error`; provides id/describedby/invalid to its child via context |
| | `TextInput`, `NumberInput` (`unit` suffix), `Select`, `ColorInput` | Read Field context with `useFieldControlProps`; `size: sm/md`; 16px on touch |
| | `Checkbox`, `Switch` | Native `<input type="checkbox">` underneath (`role="switch"` for Switch) |
| | `SegmentedControl` | One-of-many, `radiogroup` + roving tabindex; generic `<T extends string>` |
| | `Chip` | Toggle filter: a `<button aria-pressed>` |
| Display | `Text` | `variant` (typography role), `tone`, `as` |
| | `Card` | `padding: none/sm/md/lg`, `tone: default/sunken/accent/destructive`, `interactive`, `as` |
| | `Stat` | `label`, `value`, `unit`, `size`, `tone` |
| | `Badge` | `variant: tag/status`, `tone`, `size` -- static; a toggle is a Chip |
| | `ProgressBar` | `value`/`max`, `tone`; width via a custom property; `role="progressbar"` + aria values |
| | `Alert` / `ErrorMessage` | `tone`; errors `role="alert"`, info `role="status"` |
| | `EmptyState` | `title`, `description`, `action` |
| | `Pagination`, `Tabs`/`TabPanel` | Keyboard support built in; tabs wired with `aria-controls` |
| | `BrandMark` | The logo, one source, `size` prop |
| | `Spinner` | Indeterminate progress; `size`; `role="status"` + a visually hidden label when it stands alone, `aria-hidden` inside a Button that already sets `aria-busy` |
| | `Skeleton` | Placeholder block while content loads; `aria-hidden`, with the loading state announced once by the container (`aria-busy`) |
| | `Disclosure` / `Accordion` | Native `<details>`/`<summary>` first; style the marker, don't rebuild the toggle |
| | `Table` | Real `<table>` with `<th scope>`; wrap in a scroll container with `tabIndex={0}` and a label when it can overflow on phones |
| | `VisuallyHidden` | Text for screen readers only (the standard clip pattern); also how a Spinner or icon-only control gets a name |
| Overlays | `Modal`, `ConfirmDialog`, `Menu`/`MenuGroup`/`MenuItem`, `Popover`, `Tooltip`, `Toast` | See `overlays.md` |

Comboboxes/autocomplete, date pickers and multi-selects have the hardest
keyboard and screen-reader contracts of any widget. Before hand-building one,
check whether the project already uses a headless library (React Aria,
Base UI, Radix) and wrap that in the project's tokens; if it doesn't, raise
adding one with the user rather than writing the widget from scratch.

App composites (`AppHeader`, `ProfileMenu`, `PageShell`, route guards,
`ErrorBoundary`) are built *from* primitives and stay out of the barrel.

## Anatomy of a primitive

```tsx
import type { ReactNode } from 'react';
import { cx } from '../utils/cx';
import styles from './Badge.module.css';

export type BadgeTone = 'neutral' | 'brand' | 'warning' | 'success' | 'destructive';

export interface BadgeProps {
  /**
   * `tag` (mono caps, square) names what something is -- a category.
   * `status` (pill, leading dot) says what state it's in.
   */
  variant?: 'tag' | 'status';
  tone?: BadgeTone;
  size?: 'sm' | 'md';
  children: ReactNode;
  className?: string;
}

/** Static label. For a toggleable filter, use a Chip. */
export function Badge({ variant = 'tag', tone = 'neutral', size = 'md', children, className }: BadgeProps) {
  return (
    <span className={cx(styles.badge, styles[variant], styles[size], styles[tone], className)}>
      {variant === 'status' && <span className={styles.dot} aria-hidden="true" />}
      {children}
    </span>
  );
}
```

What to copy from it:

- **Named export, `{Name}Props` interface, props destructured with
  defaults in the signature.** Exported union types (`BadgeTone`) so callers
  can type their own mappings.
- **JSDoc on the component and on any prop whose meaning isn't obvious** --
  say *when* to choose each value, not what the type already says. This text
  is the component's guideline in the catalog and in Claude Design.
- **Variant props map 1:1 to module classes** (`styles[variant]`), so the
  CSS reads as a list of variants and adding one is a union member plus a
  class.
- **`className` is appended last** and is for layout only (see SKILL.md rule 5).
- **Class composition with `cx`** -- no template-string ternaries.
- **No hand-written `useMemo`/`useCallback`/`memo` in primitives** when the
  project runs React Compiler (React recommends it for all apps since
  Compiler 1.0). Without the compiler, add them only where a profiler shows
  a cost, not by default.

## Forms: Field + controls via context

`Field` renders `label` -> control -> hint or error and provides
`{ id, describedBy, invalid }` through `FieldContext`. Each control calls
`useFieldControlProps(rest)` (`templates/components/fieldContext.ts`),
which merges the control's explicit `id`/`aria-*` with the Field's (the
control's explicit props win; describedby ids are combined). So callers
write:

```tsx
<Field label="Low-stock alert below" hint="Units left in stock" error={errors.threshold}>
  <NumberInput unit="g" value={threshold} onChange={...} />
</Field>
```

and get `<label for>`, `aria-describedby` and `aria-invalid` without
threading ids. Controls extend the native element's props
(`Omit<ComponentPropsWithRef<'input'>, 'size'>` -- `size` clashes with the
native attribute) so everything else passes through.

The shared text-control look lives in one module (`TextInput.module.css`
`.control`); `Select` and `NumberInput` compose from it. It includes:

```css
@media (pointer: coarse) {
  .control { font-size: 16px; } /* iOS zooms into any focused input under 16px */
}
```

## Forms and React 19 actions

When forms use actions (`<form action={...}>`, `useActionState`), keep
pending and error state flowing through the primitives instead of each form:

```tsx
/** Submit button that shows the enclosing form's pending state. Must render inside the <form>. */
export interface SubmitButtonProps { variant?: ButtonVariant; size?: ButtonSize; disabled?: boolean; children: ReactNode }

export function SubmitButton({ disabled, ...rest }: SubmitButtonProps) {
  const { pending } = useFormStatus(); // from 'react-dom'
  return <Button type="submit" loading={pending} disabled={disabled} {...rest} />;
}

const [state, formAction] = useActionState(saveProject, { errors: {} });
<form action={formAction}>
  <Field label="Name" error={state.errors.name}><TextInput name="name" /></Field>
  <SubmitButton>Save</SubmitButton>
</form>
```

`SubmitButtonProps` is its own small interface rather than `Omit<ButtonProps, ...>`:
`ButtonProps` is a union, and `Omit` over a union keeps only the keys
every branch shares. `useFormStatus` only sees a `<form>` *above* the
component that calls it,
which is why it lives in `SubmitButton` rather than in the form's own
component. Field-level errors come back from the action as data and go into
`Field`'s `error` prop, so `aria-invalid`/`aria-describedby` stay wired.
Projects on React 18, or using a form library (React Hook Form), keep the
`loading` prop on Button and pass the library's state into it.

## Sizes, tones and states -- consistent vocabulary

- `size`: `sm | md | lg` everywhere it exists, `md` default. Only add `lg`
  where there's a real use (marketing CTAs).
- `tone` for color meaning: `default | muted | brand | warning | success | destructive`.
- `variant` for structural/visual kind: Button's `primary/secondary/ghost/destructive`,
  Badge's `tag/status`.
- Interactive states in CSS: `:hover:not(:disabled)`, `:disabled` *and*
  `[aria-disabled='true']`, `:focus-visible` handled globally,
  `[aria-invalid='true']`, `[aria-pressed='true']`, `[aria-selected='true']`.
  Styling off ARIA state keeps visuals and semantics from disagreeing.

## Controlled and uncontrolled state

Every stateful primitive works both ways, with the same prop names
everywhere, so callers never have to guess:

| State | Controlled | Uncontrolled | Change callback |
| --- | --- | --- | --- |
| Selected value (Tabs, SegmentedControl, Select-like) | `value` | `defaultValue` | `onValueChange(value)` |
| Open (Menu, Popover, Disclosure, Tooltip) | `open` | `defaultOpen` | `onOpenChange(open)` |
| On/off (Switch, Chip, checkbox-like customs) | `checked` / `pressed` | `defaultChecked` / `defaultPressed` | `onCheckedChange(checked)` / `onPressedChange(pressed)` |

- **Uncontrolled is the default.** `<Tabs defaultValue="details">` just
  works; the parent passes `value` + the callback only when it needs to read
  or drive the state (sync with the URL, reset after save).
- **Callbacks receive the value, not an event** (`onValueChange('archived')`),
  and fire in both modes.
- **Native-element wrappers don't reinvent this.** `TextInput`, `Checkbox`
  and `Select` on a real `<select>` pass `value`/`defaultValue`/`onChange`
  straight through, because they extend the native element's props.
- `templates/hooks/useControllableState.ts` implements the pattern; a
  controlled "nothing selected" is `null`, because `undefined` means
  uncontrolled.
- **Modal is the exception:** it's open while mounted (`overlays.md`), so
  the parent's conditional render *is* the controlled state, and there's no
  `open` prop to fall out of sync with it.

## Composition: props, slots, compound components, render props

Pick the lightest shape that fits:

| The caller needs to... | Use | Examples |
| --- | --- | --- |
| Pass simple content to one fixed place | A plain prop | `Field label hint error`, `Button icon`, `EmptyState title description` |
| Put arbitrary content in a fixed region | A `ReactNode` slot prop | `Modal footer`, `EmptyState action`, `Card` children |
| Arrange several related parts that share state | Compound components over a context | `Tabs` > `TabList` > `Tab` + `TabPanel`; `Menu` > `MenuGroup` > `MenuItem`; `Accordion` > `AccordionItem` |
| Render its own element but receive the component's props/state | A render prop | `Menu trigger={(props) => <IconButton {...props} label="Options" />}` |

- **Compound parts find each other through context, not child inspection.**
  `React.Children.map` / `cloneElement` over children breaks as soon as a
  caller wraps a part in a fragment or their own component. The parent
  provides state through context; each part reads it with a hook that throws
  a clear error outside its parent (`useTabsContext must be used inside <Tabs>`).
- **Export the parts as named exports** (`Tabs`, `TabList`, `Tab`,
  `TabPanel`), not as static properties (`Tabs.List`): named exports
  tree-shake, show up in the barrel, and map to one component each in a
  design-system sync.
- **Render props hand over props to spread** (handlers, `aria-*`, `ref`),
  so the caller's element -- often another primitive -- stays the real DOM
  node. A single-child wrapper that clones its child (`Tooltip`) is fine when
  the child is a primitive that spreads unknown props onto its element;
  say so in its JSDoc.
- **Don't add a slot or compound API for one use.** A prop is easier to
  read, type and document; move to compound components when callers need to
  reorder or repeat parts.

## States that survive forced colors and reduced motion

Windows High Contrast (`forced-colors: active`) replaces every color with a
small system palette and drops backgrounds and box-shadows. Anything shown
*only* by a background or shadow disappears: the selected tab, a pressed
Chip, a hovered card, a control with no border. So:

- Give controls a border even when it's invisible normally
  (`border: 1px solid transparent`) -- forced colors draws it.
- Show selected/pressed/current state with something besides fill: a border,
  an underline, a check icon, or a forced-colors rule using system colors:

  ```css
  @media (forced-colors: active) {
    .segment[aria-checked='true'] { outline: 2px solid Highlight; }
  }
  ```
- Icons use `currentColor` so they follow the forced text color.
- `forced-color-adjust: none` only on things that must keep their real color
  (a color swatch), never on text.

System color keywords (`Highlight`, `CanvasText`, `ButtonText`) aren't
literals the guardrail flags, and they belong only inside that media query.

Animation: use the `--duration-*` tokens for every transition so
`global.css` can zero them under `prefers-reduced-motion: reduce`. A
`@keyframes` animation needs its own reduced-motion rule; for a Spinner,
slow it down rather than stop it, so it still reads as "working".

## Checklist for a new primitive

1. Is it really new? Search `components/` -- maybe it's a prop on an existing one.
2. Element choice: native element first (`<dialog>`, `<input type="checkbox">`,
   `<button>`); ARIA roles only when nothing native fits.
3. Polymorphism: clickable -> `ActionProps`; tag varies -> `PolymorphicProps`; else fixed.
4. Props: closed unions with defaults; `className` for layout; no style props.
   Stateful? Support the controlled/uncontrolled pair with the shared names.
   Several parts? Compound components over context (see "Composition").
5. Module CSS on tokens only; both themes looked at; 16px touch rule for text inputs.
6. Accessibility: name (label/aria-label), role, state attributes, keyboard;
   state visible in forced colors; transitions on duration tokens; pointer
   targets at least 24x24px (WCAG 2.2), 44px is better on touch-first UI.
7. Test: smoke render + behavior (role queries, keyboard, aria state), and
   it shows up in the catalog's axe check (`testing.md`).
8. Add it to the catalog page and the barrel; a one-line JSDoc summary first.
9. Update the project's CLAUDE.md design-system list if it keeps one.

## Formatting helpers

Formatters (`humanizeEnum`, `formatDate`, `formatRelativeTime`,
`formatDuration`, unit conversion) live in `utils/` once. Duplicated
`formatTag`-style functions per component are drift too.
