import React from 'react';
import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
  CircularProgress,
} from '@mui/material';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  /** Visual style variant */
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  /** Full-width block button */
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
}

const muiVariantMap: Record<ButtonVariant, MuiButtonProps['variant']> = {
  primary: 'contained',
  secondary: 'outlined',
  ghost: 'text',
  danger: 'contained',
};

const muiColorMap: Record<ButtonVariant, MuiButtonProps['color']> = {
  primary: 'primary',
  secondary: 'primary',
  ghost: 'primary',
  danger: 'error',
};

const muiSizeMap: Record<ButtonSize, MuiButtonProps['size']> = {
  sm: 'small',
  md: 'medium',
  lg: 'large',
};

/**
 * Atom — Button
 *
 * Four visual variants derived from the Zen Integrity System:
 * - primary  → filled Trust Blue
 * - secondary → outlined Trust Blue
 * - ghost    → text-only Trust Blue
 * - danger   → filled Warning Red (submit / destructive actions)
 */
const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  startIcon,
  endIcon,
  onClick,
  type = 'button',
  children,
}) => (
  <MuiButton
    variant={muiVariantMap[variant]}
    color={muiColorMap[variant]}
    size={muiSizeMap[size]}
    disabled={disabled || loading}
    fullWidth={fullWidth}
    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : startIcon}
    endIcon={endIcon}
    onClick={onClick}
    type={type}
    disableElevation
  >
    {children}
  </MuiButton>
);

export default Button;
