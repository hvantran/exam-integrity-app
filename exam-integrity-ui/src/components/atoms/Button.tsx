import React from 'react';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'outlined'
  | 'neutral'
  | 'accent'
  | 'warning';
export type ButtonSize = 'sm' | 'md' | 'lg';
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
  children: React.ReactNode;
}

const sizeClassMap: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
};

const variantClassMap: Record<ButtonVariant, string> = {
  primary:
    'border border-primary-600 bg-primary-600 text-white hover:bg-primary-700 hover:border-primary-700',
  secondary:
    'border border-primary-500 bg-white text-primary-700 hover:bg-primary-50 hover:border-primary-600',
  ghost: 'border border-transparent bg-transparent text-primary-700 hover:bg-primary-50',
  danger:
    'border border-danger-500 bg-danger-500 text-white hover:bg-danger-600 hover:border-danger-600',
  outlined: 'border border-outlineVariant bg-white text-on-surface hover:bg-surface-100',
  neutral:
    'border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50',
  accent:
    'border border-accent-500 bg-accent-500 text-white hover:bg-accent-600 hover:border-accent-600',
  warning:
    'border border-warning-300 bg-warning-50 text-warning-700 hover:border-warning-400 hover:bg-warning-100',
};

/**
 * Atom — Button
 *
 * Visual variants derived from the Zen Integrity System:
 * - primary  → filled Trust Blue
 * - secondary → outlined Trust Blue
 * - ghost    → text-only Trust Blue
 * - neutral  → low-emphasis outlined slate action
 * - accent   → high-emphasis filled action blue
 * - warning  → soft caution action for review flows
 * - danger   → filled Warning Red (submit / destructive actions)
 */
const textJustifyClassMap: Record<ButtonTextJustify, string> = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
};

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPlacement = 'left',
  textJustify = 'center',
  onClick,
  type = 'button',
  children,
  className = '',
  ...rest
}) => {
  const baseClass = `inline-flex items-center ${textJustifyClassMap[textJustify]} gap-2 rounded-md font-semibold transition duration-150 text-center disabled:opacity-45 disabled:cursor-not-allowed`;
  const widthClass = fullWidth ? 'w-full' : '';
  const resolvedIcon = loading ? (
    <span
      className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-hidden="true"
    />
  ) : (
    icon
  );

  const content = (
    <>
      {iconPlacement === 'left' && resolvedIcon}
      <span>{children}</span>
      {iconPlacement === 'right' && resolvedIcon}
    </>
  );

  return React.createElement(
    'button',
    {
      type,
      onClick,
      disabled: disabled || loading,
      className:
        `${baseClass} ${sizeClassMap[size]} ${variantClassMap[variant]} ${widthClass} ${className}`.trim(),
      ...rest,
    },
    content,
  );
};

export default Button;
