import React from 'react';
import {
  Button as LibButton,
  ButtonVariant as LibButtonVariant,
  ButtonSize as LibButtonSize,
} from '@hvantran/ui-component-library';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'outlined'
  | 'neutral'
  | 'accent'
  | 'warning';
export type ButtonSize = LibButtonSize;
export type ButtonIconPlacement = 'left' | 'right';
export type ButtonTextJustify = 'left' | 'center' | 'right';

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  /** Visual style variant */
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /** Full-width block button */
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPlacement?: ButtonIconPlacement;
  /** Controls inline-flex content justification; defaults to 'center' */
  textJustify?: ButtonTextJustify;
  children?: React.ReactNode;
}

const textJustifyClassMap: Record<ButtonTextJustify, string> = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
};

const customVariantClasses: Partial<Record<ButtonVariant, string>> = {
  neutral:
    'border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200',
  accent:
    'border border-accent-500 bg-accent-500 text-white hover:bg-accent-600 hover:border-accent-600',
  warning:
    'border border-warning-300 bg-warning-50 text-warning-700 hover:border-warning-400 hover:bg-warning-100',
};

/**
 * Atom — Button
 * Consumes published @hvantran/ui-component-library Button primitive
 * with Zen Integrity System backward-compatible variant mappings.
 */
const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  textJustify = 'center',
  className = '',
  children,
  ...rest
}) => {
  const isCustomVariant = variant === 'neutral' || variant === 'accent' || variant === 'warning';
  const resolvedVariant: LibButtonVariant = isCustomVariant ? 'outlined' : variant;
  const customClass = isCustomVariant ? customVariantClasses[variant] : '';
  const justifyClass = textJustifyClassMap[textJustify];

  return (
    <LibButton
      variant={resolvedVariant}
      size={size}
      className={[justifyClass, customClass, className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </LibButton>
  );
};

export default Button;
