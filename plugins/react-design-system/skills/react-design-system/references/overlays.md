# Overlays

Overlays carry the most behavior risk. Build on the platform where it exists
(`<dialog>`), and verify every overlay in a real browser -- jsdom can't show
top-layer rendering, focus trapping or inertness.

## Modal on native `<dialog>`

Open while mounted: mount to show, unmount to close. `showModal()` gives the
top layer (no z-index war), an inert page, and focus kept inside.

```tsx
export function Modal({ title, children, footer, onCancel, closeOnEscape = true, closeOnBackdropClick = false, size = 'sm' }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  // React 19.2+: reads the latest onCancel without making it an effect dependency.
  // Before 19.2: `const onCancelRef = useRef(onCancel); onCancelRef.current = onCancel;`
  const cancelFromNativeClose = useEffectEvent(() => onCancel());

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    let closingOnUnmount = false;
    // A native close we didn't ask for (Chrome lets a repeated Escape through).
    // `close` fires ASYNCHRONOUSLY: under StrictMode's double effects, the first
    // cleanup's close lands after the reopen -- only count it if the dialog is shut.
    function handleClose() {
      if (!closingOnUnmount && !dialog?.open) cancelFromNativeClose();
    }
    dialog.addEventListener('close', handleClose);
    if (!dialog.open) dialog.showModal();
    return () => {
      closingOnUnmount = true;
      dialog.removeEventListener('close', handleClose);
      dialog.close();
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className={cx(styles.dialog, styles[size])}
      aria-labelledby={titleId}
      onCancel={(e) => { e.preventDefault(); if (closeOnEscape) onCancel(); }}
      onClick={(e) => { if (closeOnBackdropClick && e.target === e.currentTarget) onCancel(); }}
    >
      <div className={styles.content}>{/* padding lives here so backdrop clicks hit only the dialog box edge */}
        <h2 id={titleId} className={styles.title}>{title}</h2>
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </dialog>
  );
}
```

Decisions baked in, and why:

- **Escape closes by default** -- the standard dialog key, always deliberate.
  Turn it off only while closing would be wrong (a request in flight).
- **Backdrop clicks don't close by default** -- on phones and tablets a stray
  tap is easy and shouldn't throw away a decision in progress. Opt in with
  `closeOnBackdropClick` for lightweight info dialogs.
- **Escape goes through `onCancel`** (prevent the native close), so every
  close path unmounts the same way and parent state never disagrees with
  the screen.
- **Focus returns** to whatever had it before opening.
- `useId` for the title -- a hardcoded `id="modal-title"` collides when two exist.
- Global CSS: `html:has(dialog:modal) { overflow: hidden; }` stops the page
  scrolling behind it. Style `::backdrop` with `var(--color-overlay)`.

## ConfirmDialog

Modal + a Cancel button (`secondary`) + a confirm button (`destructive` or
`primary`, `loading` while pending), plus `confirmDisabled` and an `error`
slot. While the action is pending, Cancel is disabled and `closeOnEscape` is
off. This replaces every hand-built confirm footer -- callers otherwise
disagree on button order, variants and spacing.

## Menu (dropdown)

`role="menu"` panel opened from a trigger the caller renders via a render
prop (so the trigger can be a `Button` or `IconButton`):

```tsx
<Menu label="Project options" trigger={(props) => <IconButton {...props} label="Project options" icon={<MoreIcon />} />}>
  <MenuGroup>
    <MenuItem onClick={startEdit}>Edit project</MenuItem>
    <MenuItem to={`/projects/${id}/history`}>Activity</MenuItem>
    <MenuItem tone="destructive" onClick={askDelete}>Delete project</MenuItem>
  </MenuGroup>
</Menu>
```

Keyboard contract: Enter/Space/click opens on the first item, ArrowDown/Up on
the trigger opens on first/last; inside, arrows + Home/End move (wrapping);
Escape closes and refocuses the trigger; Tab closes (synchronously, via
`flushSync`, so the items are gone before focus moves) and continues from
the trigger; an outside press closes. Choosing an item closes it, except a
checkbox item (`checked` prop -> `menuitemcheckbox`). `MenuItem` uses the
same `ActionProps` union as Button, so navigation items are real links.
Only refocus the trigger if it's still connected -- a choice may unmount it.

## Popover (and bottom sheet)

A non-modal `role="dialog"` anchored to its trigger (`aria-haspopup="dialog"`,
`aria-expanded`, `aria-controls`). Focus moves into it on open, back to the
trigger on Escape or an inside close. At <=640px it becomes a bottom sheet:
full width, pinned to the viewport bottom, over a backdrop that closes it on
tap. Use for filter panels and pickers -- not for confirmations (Modal).

## Tooltip

A short text hint for a control, shown on hover **and** keyboard focus,
hidden on Escape, blur, or when the pointer leaves both the trigger and the
tooltip (users must be able to move onto it, e.g. to magnify it). Never put interactive content or
anything the user must read to complete a task in one: touch users can't
hover, so the same information must be reachable another way.

Wiring depends on what the tooltip says:

- **It repeats the control's name** (the usual case for an `IconButton`):
  the control already has its accessible name from `label`, so mark the
  tooltip `aria-hidden="true"` -- otherwise screen readers announce it twice.
- **It adds information** ("Last synced 2 min ago"): `role="tooltip"` with
  an id from `useId`, referenced by the trigger's `aria-describedby`.

Behavior: a short open delay on hover (~300-500ms, a token), none on focus;
once one tooltip is open, moving to a neighbour shows the next instantly;
Escape hides it without moving focus (WCAG 1.4.13: dismissable, hoverable,
persistent). Render it in the top layer (`popover="manual"` + `showPopover()`)
so no ancestor's `overflow` or z-index clips it, and position it with CSS
anchor positioning (in all major browsers since early 2026) with a
`position-try-fallbacks` flip; keep a sensible default position for older
browsers. Several tooltips on a page need distinct anchor names: pass one
per instance as a custom property (`anchor-name: var(--tooltip-anchor)`),
built from `useId` with the characters that aren't valid in a CSS ident
stripped. `popover="hint"` + `interestfor` can do hover/focus with no
JavaScript but are Chromium-only so far -- treat them as an enhancement.

Wrap the trigger rather than asking callers to wire ids: `<Tooltip
content="Project settings"><IconButton ... /></Tooltip>`, with the Tooltip
merging its handlers onto the child (plus `aria-describedby` for a
describing tooltip).

## Toast

Transient confirmation of something that already happened ("Project
saved"). One `ToastProvider` near the root owns a single live region; a
`useToast()` hook pushes messages into it.

- The live region (`role="status"`, `aria-live="polite"`) exists in the DOM
  **before** any message is added -- a region inserted together with its text
  often isn't announced.
- Success/info auto-dismiss (~5s, a token), and the timer pauses on hover
  and focus. Errors don't auto-dismiss and use `role="alert"`; better still,
  show errors inline where they happened (Field, Alert) and keep toasts for
  confirmations.
- An action in a toast ("Undo") must also be reachable without the toast;
  a toast can vanish before a keyboard or screen-reader user gets to it.
- Stack at the viewport edge, above content but below a modal; respect
  reduced motion for the slide-in.

## Dismissal on touch

Outside-press detection listens to `pointerdown`, not `mousedown` -- iPad
Safari's mouse events lag and fire after scroll gestures. A shared
`useDismissablePanel(open, onDismiss)` hook returns the root ref.

## Roving focus for groups

Tabs and radio-style groups (`SegmentedControl`): only the selected item is a
tab stop; arrows (+ Home/End) move selection and focus together, wrapping.
`templates/hooks/useRovingSelection.ts` implements it; tabs pass
`axis: 'horizontal'` so Up/Down still scroll the page. Tabs also need
`id`/`aria-controls` <-> `aria-labelledby` wiring to their `TabPanel`s.

## Verifying overlays in a browser (Playwright is fine)

- Dialog: `matches(':modal')`, focus starts inside, Tab stays inside, page
  doesn't scroll, backdrop click ignored (unless opted in), Escape cancels,
  focus returns to the opener. Also run it in dev (StrictMode) -- that's
  where the async-close bug shows.
- Menu: full keyboard flow, including Tab out.
- Popover: phone viewport -> sheet hugs the bottom at full width; backdrop tap closes.
