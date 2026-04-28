import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { colors, borderRadius } from '../../../design-system/tokens';

export interface NavMenuItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
}

/**
 * Molecule — TeacherManNavMenuItem
 *
 * Sidebar navigation item used in the Teacher/Admin dashboard.
 * Shows icon + label; collapses to icon-only when `collapsed` is true.
 * Active item gets a Trust Blue left border accent + bg tint.
 */
const TeacherManNavMenuItem: React.FC<NavMenuItemProps> = ({
  icon,
  label,
  active = false,
  collapsed = false,
  onClick,
}) => (
  <Tooltip title={collapsed ? label : ''} placement="right">
    <Box
      component="button"
      onClick={onClick}
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        px: collapsed ? '12px' : '16px',
        py: '10px',
        borderRadius: borderRadius.default,
        border: 'none',
        backgroundColor: active ? colors.surface.container.low : 'transparent',
        color: active ? colors.primary.main : colors.on.surfaceVariant,
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'inherit',
        transition: 'all 0.15s ease',
        borderLeft: active ? `3px solid ${colors.primary.main}` : '3px solid transparent',
        '&:hover': {
          backgroundColor: colors.surface.container.low,
          color: colors.primary.main,
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: 'inherit',
          '& svg': { fontSize: 20 },
        }}
      >
        {icon}
      </Box>
      {!collapsed && (
        <Typography
          component="span"
          sx={{
            fontSize: '14px',
            fontWeight: active ? 600 : 400,
            lineHeight: '20px',
            color: 'inherit',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </Typography>
      )}
    </Box>
  </Tooltip>
);

export default TeacherManNavMenuItem;
