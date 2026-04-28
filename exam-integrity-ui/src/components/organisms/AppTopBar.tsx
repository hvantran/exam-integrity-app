import React from 'react';
import { Box, InputBase, IconButton, Tooltip, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import { colors, typography, spacing, borderRadius } from '../../design-system/tokens';

export const APP_BAR_HEIGHT = 64;

export interface AppTopBarProps {
  appTitle?: string;
  userName?: string;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
  onNotifications?: () => void;
  onHelp?: () => void;
  onLogout?: () => void;
}

const AppTopBar: React.FC<AppTopBarProps> = ({
  appTitle = 'Academic Management',
  userName,
  showSearch = true,
  onSearch,
  onNotifications,
  onHelp,
  onLogout,
}) => {
  const initials = userName
    ? userName.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <Box
      component="header"
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: APP_BAR_HEIGHT,
        zIndex: 90,
        backgroundColor: colors.surface.container.lowest,
        borderBottom: `1px solid ${colors.surface.container.high}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: `${spacing.margin}px`,
      }}
    >
      <Typography
        sx={{
          fontFamily: typography.fontFamily.sans,
          fontSize: typography.scale.h3.fontSize,
          fontWeight: 700,
          color: colors.primary.deep,
          letterSpacing: '-0.02em',
          userSelect: 'none',
        }}
      >
        {appTitle}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: `${spacing.stackMd}px` }}>
        {showSearch && (
          <Box
            sx={{
              position: 'relative',
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              width: 256,
              height: 40,
              backgroundColor: colors.surface.default,
              border: `1px solid ${colors.outlineVariant}`,
              borderRadius: borderRadius.default,
              flexShrink: 0,
              '&:focus-within': {
                borderColor: colors.primary.main,
                boxShadow: `0 0 0 2px ${colors.primary.fixedDim}`,
              },
            }}
          >
            <SearchIcon
              sx={{
                position: 'absolute',
                left: 12,
                color: colors.outline,
                fontSize: 20,
                pointerEvents: 'none',
              }}
            />
            <InputBase
              placeholder="Search..."
              onChange={(e) => onSearch?.(e.target.value)}
              sx={{
                pl: '40px',
                pr: '16px',
                width: '100%',
                fontFamily: typography.fontFamily.sans,
                fontSize: typography.scale.uiLabel.fontSize,
                color: colors.on.surface,
                '& input::placeholder': { color: colors.outline, opacity: 1 },
              }}
            />
          </Box>
        )}

        <IconButton
          onClick={onNotifications}
          aria-label="Thong bao"
          sx={{
            width: 40,
            height: 40,
            color: colors.outline,
            '&:hover': { backgroundColor: colors.surface.container.default },
          }}
        >
          <NotificationsOutlinedIcon />
        </IconButton>

        <IconButton
          onClick={onHelp}
          aria-label="Tro giup"
          sx={{
            width: 40,
            height: 40,
            color: colors.outline,
            '&:hover': { backgroundColor: colors.surface.container.default },
          }}
        >
          <HelpOutlineIcon />
        </IconButton>

        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: colors.primary.fixed,
            border: `1px solid ${colors.outlineVariant}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            cursor: 'pointer',
            ml: `${spacing.stackSm}px`,
          }}
        >
          <Typography
            sx={{
              fontFamily: typography.fontFamily.sans,
              fontSize: '11px',
              fontWeight: 700,
              color: colors.primary.deep,
              lineHeight: 1,
              userSelect: 'none',
            }}
          >
            {initials}
          </Typography>
        </Box>

        {onLogout && (
          <Tooltip title="Sign out" placement="bottom">
            <IconButton
              onClick={onLogout}
              aria-label="Sign out"
              size="small"
              sx={{
                color: colors.outline,
                '&:hover': { backgroundColor: colors.surface.container.default, color: colors.tertiary.main },
              }}
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
};

export default AppTopBar;
