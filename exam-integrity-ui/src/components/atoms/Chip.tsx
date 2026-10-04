import React from 'react';
import {
  Chip as LibChip,
  ChipVariant as LibChipVariant,
  ChipColor as LibChipColor,
  ChipSize as LibChipSize,
} from '@hvantran/ui-component-library';

export type ChipVariant = LibChipVariant;
export type ChipSize = 'small' | 'medium' | 'sm' | 'md';
export type ChipColor = LibChipColor;

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

const sizeMap: Record<ChipSize, LibChipSize> = {
  small: 'sm',
  medium: 'md',
  sm: 'sm',
  md: 'md',
};

/**
 * Atom — Chip
 * Consumes published @hvantran/ui-component-library Chip primitive.
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
  className = '',
}) => {
  return (
    <LibChip
      label={label}
      variant={variant}
      size={sizeMap[size]}
      color={color}
      icon={icon}
      onDelete={onDelete}
      deleteIcon={deleteIcon}
      onClick={onClick}
      disabled={disabled}
      style={style}
      className={className}
    />
  );
};

export default Chip;
