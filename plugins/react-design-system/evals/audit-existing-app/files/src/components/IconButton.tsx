import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './IconButton.module.css';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label?: string;
}

export function IconButton({ icon, label, ...rest }: IconButtonProps) {
  return (
    <button className={styles.iconButton} aria-label={label} {...rest}>
      {icon}
    </button>
  );
}
