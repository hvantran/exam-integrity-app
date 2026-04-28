import React from 'react';
import { Box, Typography } from '@mui/material';
import { colors } from '../../../design-system/tokens';

export type BadgeColor = 'primary' | 'secondary' | 'error' | 'neutral' | 'warning';

export interface BadgeProps {
  /** Numeric or short text count to display */
  count: number | string;
  color?: BadgeColor;
  /** Max value — displays "{max}+" when count exceeds it */
  max?: number;
  size?: 'sm' | 'md';
}

const colorMap: Record<BadgeColor, { bg: string; text: string }> = {
  primary: { bg: colors.primary.main, text: '#fff' },
  secondary: { bg: colors.secondary.main, text: '#fff' },
  error: { bg: colors.tertiary.main, text: '#fff' },
  warning: { bg: '#F59E0B', text: '#fff' },
  neutral: { bg: colors.surface.container.highest, text: colors.on.surface },
};

const sizeMap = {
  sm: { minWidth: 18, height: 18, fontSize: '10px', px: '4px' },
  md: { minWidth: 22, height: 22, fontSize: '12px', px: '6px' },
};

/**
 * Atom — Badge
 *
 * Compact circular/pill counter used on notification icons, flag counts,
 * and pending review tallies throughout the exam platform.
 */
const Badge: React.FC<BadgeProps> = ({ count, color = 'primary', max, size = 'md' }) => {
  const { bg, text } = colorMap[color];
  const { minWidth, height, fontSize, px } = sizeMap[size];

  const displayValue =
    max !== undefined && typeof count === 'number' && count > max ? `${max}+` : count;

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth,
        height,
        px,
        borderRadius: '9999px',
        backgroundColor: bg,
        color: text,
      }}
    >
      <Typography
        component="span"
        sx={{ fontSize, fontWeight: 600, lineHeight: 1, fontFamily: 'inherit' }}
      >
        {displayValue}
      </Typography>
    </Box>
  );
};

export default Badge;
