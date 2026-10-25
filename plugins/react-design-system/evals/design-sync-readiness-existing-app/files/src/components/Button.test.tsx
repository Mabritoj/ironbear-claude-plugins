import { fireEvent, render, screen } from '@testing-library/react';
import { Button } from './Button';

test('calls onClick', () => {
  const onClick = vi.fn();
  render(<Button onClick={onClick}>Save</Button>);
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(onClick).toHaveBeenCalled();
});
