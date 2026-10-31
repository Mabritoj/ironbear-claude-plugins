import { useState } from 'react';

/**
 * State a component owns unless the caller controls it. Pass the caller's
 * `value` (controlled when not undefined), `defaultValue` (the starting value
 * when uncontrolled) and `onChange` (called on every change, either way):
 *
 *   const [selected, setSelected] = useControllableState({ value, defaultValue: 'all', onChange: onValueChange });
 *
 * `undefined` means "uncontrolled", so a controlled "nothing selected" must be
 * `null`, not `undefined`. A component shouldn't switch between the two modes
 * during its lifetime -- the same rule React applies to native inputs.
 */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: {
  value?: T;
  defaultValue: T;
  onChange?: (next: T) => void;
}): [T, (next: T) => void] {
  const [internal, setInternal] = useState(defaultValue);
  const isControlled = value !== undefined;

  function setValue(next: T) {
    if (!isControlled) setInternal(next);
    onChange?.(next);
  }

  return [isControlled ? value : internal, setValue];
}
