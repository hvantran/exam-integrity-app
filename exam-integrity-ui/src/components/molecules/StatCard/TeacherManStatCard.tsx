import React from 'react';
import { Box, Typography } from '@mui/material';
import { colors, borderRadius, shadow } from '../../../design-system/tokens';

export interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  /** Optional sub-label below value */
  sublabel?: string;
  variant?: 'default' | 'warning' | 'success';
}

const variantColor: Record<NonNullable<StatCardProps['variant']>, string> = {
  default: colors.primary.main,
  warning: colors.tertiary.main,
  success: colors.secondary.main,
};

/**
 * Molecule — TeacherManStatCard
 *
 * Dashboard metric card used in the Teacher Command Center.
 * Shows icon + large numeric value + descriptive label.
 * E.g.: "42 / 45 Students Active", "00:45:12 Time Remaining".
 */
const TeacherManStatCard: React.FC<StatCardProps> = ({
  icon,
  value,
  label,
  sublabel,
  variant = 'default',
}) => {
  const accentColor = variantColor[variant];

  return (
    <Box
      sx={{
        backgroundColor: colors.surface.container.lowest,
        border: `1px solid ${colors.outlineVariant}`,
        borderRadius: borderRadius.lg,
        boxShadow: shadow.cardActive,
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        minWidth: 160,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', color: accentColor }}>
        {icon}
        <Typography
          variant="caption"
          sx={{ fontWeight: 600, fontSize: '11px', letterSpacing: '0.06em', color: colors.on.surfaceVariant, textTransform: 'uppercase' }}
        >
          {label}
        </Typography>
      </Box>
      <Typography
        sx={{
          fontSize: '28px',
          fontWeight: 700,
          lineHeight: 1.1,
          color: accentColor,
          fontFamily: '"Space Grotesk", monospace',
        }}
      >
        {value}
      </Typography>
      {sublabel && (
        <Typography sx={{ fontSize: '12px', color: colors.on.surfaceVariant }}>
          {sublabel}
        </Typography>
      )}
    </Box>
  );
};

export default TeacherManStatCard;
