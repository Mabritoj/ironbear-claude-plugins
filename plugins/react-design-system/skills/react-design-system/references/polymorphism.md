# Polymorphism

Two patterns. Choose by asking: **does the element change what the control
*does*, or only what it's *called* in the DOM?**

| Situation | Pattern | Examples |
| --- | --- | --- |
| Button vs router link vs external/in-page link | Discriminated union on the target (`ActionProps`) | `Button`, `IconButton`, `MenuItem` |
| Same behavior, different tag for semantics or layout | `as` prop (`PolymorphicProps`) | `Card as="section"`, `Card as={Link}`, `Text as="h2"`, `Text as="label"` |
| Neither -- the element is fixed | Plain props extending `ComponentPropsWithRef<'input'>` | `TextInput`, `Select`, `Checkbox` |

Why not one generic `as` everywhere? A button and a link need *different
required props* (`onClick`/`type`/`disabled` vs `to`/`href`) and different
semantics. A union makes `<Button to="/x" disabled>` a type error and lets
the component add button-only behavior (`loading` -> `disabled` +
`aria-busy`) without casting. `as` is right when props are a pass-through.

## Pattern 1: target union (`templates/components/ActionElement.tsx`)

```tsx
type ButtonElementProps = ComponentPropsWithRef<'button'>;
type RouterLinkElementProps = LinkProps & { ref?: Ref<HTMLAnchorElement> };
type AnchorElementProps = ComponentPropsWithRef<'a'>;

export type ActionProps<Own = object, ButtonOnly = object> =
  | (Own & ButtonOnly &
      Omit<ButtonElementProps, keyof Own | keyof ButtonOnly> & { to?: never; href?: never })
  | (Own & Omit<RouterLinkElementProps, keyof Own> & { href?: never })
  | (Own & Omit<AnchorElementProps, keyof Own> & { href: string; to?: never });

export function ActionElement(props: ActionProps) {
  if (props.to !== undefined) return <Link {...(props as RouterLinkElementProps)} />;
  if (props.href !== undefined) return <a {...(props as AnchorElementProps)} />;
  const { type = 'button', ...rest } = props as ButtonElementProps;
  return <button type={type} {...rest} />;
}
```

A component built on it:

```tsx
interface ButtonOwnProps { variant?: ButtonVariant; size?: ButtonSize; icon?: ReactNode; className?: string; children?: ReactNode }
interface ButtonOnlyProps { /** Spinner + disabled + aria-busy. Keep the label meaningful ("Saving..."). */ loading?: boolean }
export type ButtonProps = ActionProps<ButtonOwnProps, ButtonOnlyProps>;

export function Button({ variant = 'primary', size = 'md', icon, className, children, ...rest }: ButtonProps) {
  const classes = cx(styles.button, styles[size], styles[variant], className);
  if (rest.to === undefined && rest.href === undefined) {
    const { loading, disabled, ...buttonProps } = rest as ButtonOnlyProps & { disabled?: boolean };
    return (
      <ActionElement {...buttonProps} className={classes} disabled={disabled || loading} aria-busy={loading || undefined}>
        {loading ? <Spinner /> : icon}
        {children}
      </ActionElement>
    );
  }
  return <ActionElement {...rest} className={classes}>{icon}{children}</ActionElement>;
}
```

Usage:

```tsx
<Button onClick={save} loading={mutation.isPending}>Save</Button>
<Button to="/projects/new" icon={<PlusIcon />}>Add project</Button>
<Button href="#how-it-works" variant="ghost">How it works</Button>
<IconButton label="Close" icon={<CloseIcon />} onClick={onClose} />
```

Details that matter:

- `type="button"` by default -- a bare `<button>` inside a form submits it.
  Pass `type="submit"` explicitly for the one submit button.
- The CSS must style the link and button branches identically, including
  `:hover` color (otherwise the global `a:hover` color wins on the link
  branch), `text-decoration: none`, and disabled via both `:disabled` and
  `[aria-disabled='true']`.
- Links can't be disabled. If a navigation must be unavailable, render the
  button branch disabled, or don't render it.

## Pattern 2: `as` prop (`templates/components/polymorphic.ts`)

```ts
export type PolymorphicProps<E extends ElementType, OwnProps = object> = OwnProps & {
  as?: E;
} & Omit<ComponentPropsWithRef<E>, keyof OwnProps | 'as'>;
```

```tsx
export type CardProps<E extends ElementType = 'div'> = PolymorphicProps<E, CardOwnProps>;

export function Card<E extends ElementType = 'div'>({ as, padding = 'md', tone = 'default', interactive = false, className, ...rest }: CardProps<E>) {
  const Component: ElementType = as ?? 'div';
  return <Component className={cx(styles.card, styles[padding], styles[tone], interactive && styles.interactive, className)} {...rest} />;
}
```

Usage -- the element's own props are typed from `as`:

```tsx
<Card as="section" aria-labelledby={headingId}>...</Card>
<Card as={Link} to={`/projects/${project.id}`} interactive>...</Card>   {/* whole-card link */}
<Text variant="title" as="h2">Print settings</Text>
<Text as="label" variant="eyebrow" htmlFor={id}>Name</Text>
```

Details:

- Own props win (`Omit<..., keyof OwnProps>`), so a component's `tone` never
  collides with some element's attribute.
- Give a sensible default element per variant where it helps (`Text`:
  `h1` -> `<h1>`, `body` -> `<p>`, `meta` -> `<span>`), and use `as` only
  when the document outline needs something else.
- An `interactive` flag on a card adds hover affordance and resets
  button/link styles -- use it with `as={Link}` or `as="button"`.
- Whole-card links: put only phrasing content and nested `<div>`s inside an
  `<a>`, never another link or button (invalid, and unclickable on touch).
  A `<button>` may only contain phrasing content -- a card full of `<div>`s
  must be a link or a plain container, not a button.
- React 19: `ref` is a regular prop, so no `forwardRef`. On React 18 use
  `forwardRef` and `ComponentPropsWithoutRef` + a typed `ref`.

## Testing polymorphic components

- Assert the role: `getByRole('link', { name: 'Add project' })` and
  `toHaveAttribute('href', '/projects/new')`.
- When migrating a control from button to link, update the **negative**
  assertions: `expect(queryByRole('button', { name: 'Add project' })).toBeNull()`
  now passes for the wrong reason. Re-point it at the link and prove the test
  fails when the behavior breaks (e.g. remove the permission gate and watch
  it go red).
- Type-level checks are worth a test file of `// @ts-expect-error` lines:
  `<Button to="/x" disabled />`, `<Button href="#" to="/x" />`, `<IconButton icon={...} />` (no label).
