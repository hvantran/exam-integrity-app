import React from 'react';
import { colors, borderRadius } from '../../design-system/tokens';

export type ChipVariant = 'filled' | 'outlined';
export type ChipSize = 'small' | 'medium';
export type ChipColor = 'primary' | 'secondary' | 'warning' | 'error' | 'success' | 'default';

export interface ChipProps {
  label: React.ReactNode;
  variant?: ChipVariant;
  size?: ChipSize;
  color?: ChipColor;
  icon?: React.ReactNode;
  onDelete?: () => void;
  deleteIcon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

/**
 * Atom — Chip
 *
 * Flexible chip component for tags, status indicators, filters, and removable items.
 * Supports design-system color tokens and semantic variants.
 *
 * Usage:
 * - Tag chip: <Chip label="Science" />
 * - Status: <Chip label="Active" color="success" />
 * - Removable: <Chip label="Tag" onDelete={() => {}} />
 * - Warning: <Chip label="Unreviewed" color="warning" variant="outlined" />
 */
const Chip: React.FC<ChipProps> = ({
  label,
  variant = 'filled',
  size = 'small',
  color = 'default',
  icon,
  onDelete,
  deleteIcon,
  onClick,
  disabled = false,
  style,
  className,
}) => {
  const colorMap: Record<ChipColor, { bg: string; text: string; border?: string }> = {
    default: {
      bg: colors.surface.container.low,
      text: colors.primary.container,
      border: variant === 'outlined' ? colors.outlineVariant : undefined,
    },
    primary: {
      bg: variant === 'outlined' ? colors.surface.container.lowest : colors.primary.main,
      text: variant === 'outlined' ? colors.primary.main : colors.primary.on,
      border: variant === 'outlined' ? colors.primary.main : undefined,
    },
    secondary: {
      bg: variant === 'outlined' ? colors.surface.container.lowest : colors.secondary.main,
      text: variant === 'outlined' ? colors.secondary.main : colors.secondary.on,
      border: variant === 'outlined' ? colors.secondary.main : undefined,
    },
    warning: {
      bg: variant === 'outlined' ? colors.surface.container.lowest : '#fbbf2426',
      text: variant === 'outlined' ? '#f59e0b' : '#92400e',
      border: variant === 'outlined' ? '#f59e0b' : undefined,
    },
    error: {
      bg: variant === 'outlined' ? colors.surface.container.lowest : colors.tertiary.main,
      text: variant === 'outlined' ? colors.tertiary.main : colors.tertiary.on,
      border: variant === 'outlined' ? colors.tertiary.main : undefined,
    },
    success: {
      bg: variant === 'outlined' ? colors.surface.container.lowest : colors.secondary.main,
      text: variant === 'outlined' ? colors.secondary.main : colors.secondary.on,
      border: variant === 'outlined' ? colors.secondary.main : undefined,
    },
  };

  const selectedColor = colorMap[color];

  const rootStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    height: size === 'small' ? 20 : 32,
    fontSize: size === 'small' ? '11px' : '13px',
    fontWeight: 600,
    letterSpacing: '0.05em',
    borderRadius: borderRadius.sm,
    backgroundColor: selectedColor.bg,
    color: selectedColor.text,
    border: selectedColor.border ? `1px solid ${selectedColor.border}` : 'none',
    paddingLeft: size === 'small' ? 6 : 8,
    paddingRight: size === 'small' ? 6 : 8,
    opacity: disabled ? 0.5 : 1,
    cursor: onClick && !disabled ? 'pointer' : 'default',
    userSelect: 'none',
    ...style,
  };

  const deleteButtonStyle: React.CSSProperties = {
    border: 'none',
    background: 'transparent',
    padding: 0,
    marginLeft: 2,
    cursor: disabled ? 'default' : 'pointer',
    color: 'inherit',
    lineHeight: 1,
    display: 'inline-flex',
    alignItems: 'center',
  };

  return (
    <span
      className={className}
      style={rootStyle}
      onClick={disabled ? undefined : onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      onKeyDown={
        onClick && !disabled
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      aria-disabled={disabled}
    >
      {icon && (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            fontSize: size === 'small' ? 16 : 20,
          }}
          aria-hidden="true"
        >
          {icon}
        </span>
      )}
      <span>{label}</span>
      {onDelete && (
        <button
          type="button"
          aria-label="Remove chip"
          style={deleteButtonStyle}
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) {
              onDelete();
            }
          }}
          disabled={disabled}
        >
          {deleteIcon ?? <span aria-hidden="true">×</span>}
        </button>
      )}
    </span>
  );
};

export default Chip;
