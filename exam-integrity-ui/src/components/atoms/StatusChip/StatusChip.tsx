import React from 'react';
import { Chip as MuiChip, ChipProps as MuiChipProps } from '@mui/material';
import { colors } from '../../../design-system/tokens';

export type StatusChipVariant =
  | 'proctoring'
  | 'pending'
  | 'draft'
  | 'published'
  | 'active'
  | 'neutral';

export interface StatusChipProps {
  label: string;
  variant?: StatusChipVariant;
  icon?: React.ReactElement;
  onDelete?: () => void;
  size?: 'small' | 'medium';
}

const variantStyle: Record<StatusChipVariant, { backgroundColor: string; color: string }> = {
  proctoring: { backgroundColor: '#DCFCE7', color: colors.secondary.main },
  pending: { backgroundColor: '#FEF3C7', color: '#92400E' },
  draft: { backgroundColor: colors.surface.container.highest, color: colors.on.surfaceVariant },
  published: { backgroundColor: colors.primary.fixed, color: colors.primary.deep },
  active: { backgroundColor: '#DCFCE7', color: colors.secondary.main },
  neutral: { backgroundColor: colors.surface.container.highest, color: colors.on.surface },
};

/**
 * Atom — StatusChip
 *
 * Pill-shaped status indicator used for exam states (Draft, Published),
 * proctoring status (Proctoring Active), and pending review counts.
 */
const StatusChip: React.FC<StatusChipProps> = ({
  label,
  variant = 'neutral',
  icon,
  onDelete,
  size = 'small',
}) => {
  const style = variantStyle[variant];

  return (
    <MuiChip
      label={label}
      icon={icon}
      onDelete={onDelete}
      size={size}
      sx={{
        ...style,
        fontWeight: 600,
        fontSize: size === 'small' ? '11px' : '12px',
        '& .MuiChip-icon': { color: style.color },
      }}
    />
  );
};

export default StatusChip;
