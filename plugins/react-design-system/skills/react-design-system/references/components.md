# Components

## The primitive inventory

A typical app needs about 25. Build them as features need them, but know
the set so a feature never invents a local copy of one.

| Group | Primitive | Key props / behavior |
| --- | --- | --- |
| Actions | `Button` | `variant: primary/secondary/ghost/destructive`, `size: sm/md/lg`, `loading`, `icon`; `to`/`href` union |
| | `IconButton` | `label` (required, becomes `aria-label`), `icon`, `size`, `variant: ghost/outline`; same union |
| | `icons.tsx` | One file of inline-SVG icon components, `size` prop, `currentColor`, `aria-hidden` |
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
| Overlays | `Modal`, `ConfirmDialog`, `Menu`/`MenuGroup`/`MenuItem`, `Popover` | See `overlays.md` |

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
   * `tag` (mono caps, square) names what something is -- a material.
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

## Checklist for a new primitive

1. Is it really new? Search `components/` -- maybe it's a prop on an existing one.
2. Element choice: native element first (`<dialog>`, `<input type="checkbox">`,
   `<button>`); ARIA roles only when nothing native fits.
3. Polymorphism: clickable -> `ActionProps`; tag varies -> `PolymorphicProps`; else fixed.
4. Props: closed unions with defaults; `className` for layout; no style props.
5. Module CSS on tokens only; both themes looked at; 16px touch rule for text inputs.
6. Accessibility: name (label/aria-label), role, state attributes, keyboard.
7. Test: smoke render + behavior (role queries, keyboard, aria state).
8. Add it to the catalog page and the barrel; a one-line JSDoc summary first.
9. Update the project's CLAUDE.md design-system list if it keeps one.

## Formatting helpers

Formatters (`humanizeEnum`, `formatDate`, `formatRelativeTime`,
`formatDuration`, unit conversion) live in `utils/` once. Duplicated
`formatTag`-style functions per component are drift too.
