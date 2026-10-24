import { createTheme } from '@mui/material/styles';
import { colors, typography, borderRadius } from './tokens';

/**
 * MUI theme derived from the Stitch "Zen Integrity System" design tokens.
 * Primary   = Trust Blue (#1E40AF)
 * Secondary = Integrity Green (#006C4A)
 * Error     = Warning Red (#DC2626)
 * Supports dynamic light / dark modes based on resolvedTheme.
 */
export const getTheme = (mode: 'light' | 'dark' = 'light') => {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? '#3B82F6' : colors.primary.main,
        dark: isDark ? '#1D4ED8' : colors.primary.deep,
        light: isDark ? '#93C5FD' : colors.primary.fixed,
        contrastText: colors.primary.on,
      },
      secondary: {
        main: isDark ? '#10B981' : colors.secondary.main,
        light: isDark ? '#6EE7B7' : colors.secondary.fixed,
        contrastText: colors.secondary.on,
      },
      error: {
        main: isDark ? '#EF4444' : colors.tertiary.main,
        dark: isDark ? '#DC2626' : colors.tertiary.deep,
        light: isDark ? '#FCA5A5' : colors.tertiary.fixed,
        contrastText: colors.tertiary.on,
      },
      warning: {
        main: colors.tertiary.main,
        contrastText: colors.tertiary.on,
      },
      success: {
        main: isDark ? '#10B981' : colors.secondary.main,
        contrastText: colors.secondary.on,
      },
      background: {
        default: isDark ? '#0B0F19' : colors.background,
        paper: isDark ? '#1E293B' : colors.surface.container.lowest,
      },
      text: {
        primary: isDark ? '#F8FAFC' : colors.on.surface,
        secondary: isDark ? '#94A3B8' : colors.on.surfaceVariant,
        disabled: isDark ? '#64748B' : colors.outline,
      },
      divider: isDark ? '#334155' : colors.outlineVariant,
    },
    typography: {
      fontFamily: typography.fontFamily.sans,
      h1: {
        ...typography.scale.h1,
        fontFamily: typography.fontFamily.sans,
      },
      h2: {
        ...typography.scale.h2,
        fontFamily: typography.fontFamily.sans,
      },
      h3: {
        ...typography.scale.h3,
        fontFamily: typography.fontFamily.sans,
      },
      h4: {
        fontSize: '20px',
        fontWeight: 600,
        lineHeight: '28px',
        fontFamily: typography.fontFamily.sans,
      },
      body1: {
        ...typography.scale.bodyMd,
        fontFamily: typography.fontFamily.sans,
      },
      body2: {
        ...typography.scale.bodyLg,
        fontFamily: typography.fontFamily.sans,
      },
      caption: {
        ...typography.scale.labelCaps,
        fontFamily: typography.fontFamily.sans,
      },
      button: {
        ...typography.scale.uiLabel,
        textTransform: 'none' as const,
        fontFamily: typography.fontFamily.sans,
      },
      overline: {
        ...typography.scale.labelCaps,
        fontFamily: typography.fontFamily.sans,
      },
    },
    shape: {
      borderRadius: 4,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: `
          @import url('https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500&display=swap');
          * { box-sizing: border-box; }
          body {
            background-color: ${isDark ? '#0B0F19' : colors.background};
            color: ${isDark ? '#F8FAFC' : colors.on.surface};
          }
        `,
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: borderRadius.default,
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '14px',
            lineHeight: '20px',
            padding: '8px 16px',
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none' },
          },
          contained: {
            '&:hover': {
              boxShadow: 'none',
              filter: 'brightness(0.92)',
            },
          },
          outlined: {
            borderColor: isDark ? '#334155' : colors.outlineVariant,
            '&:hover': {
              borderColor: isDark ? '#3B82F6' : colors.primary.main,
              backgroundColor: isDark ? '#1E293B' : colors.surface.container.low,
            },
          },
          text: {
            color: isDark ? '#3B82F6' : colors.primary.main,
            '&:hover': {
              backgroundColor: isDark ? '#1E293B' : colors.surface.container.low,
            },
          },
          sizeLarge: {
            padding: '12px 24px',
            fontSize: '16px',
          },
          sizeSmall: {
            padding: '4px 12px',
            fontSize: '12px',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: borderRadius.lg,
            border: `1px solid ${isDark ? '#334155' : colors.outlineVariant}`,
            boxShadow: isDark
              ? '0px 4px 20px rgba(0, 0, 0, 0.25)'
              : '0px 4px 20px rgba(0, 0, 0, 0.03)',
            backgroundColor: isDark ? '#1E293B' : colors.surface.container.lowest,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: borderRadius.full,
            fontWeight: 500,
            fontSize: '12px',
            height: '24px',
          },
          label: {
            paddingLeft: '10px',
            paddingRight: '10px',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiInputLabel-root': {
              color: isDark ? '#94A3B8' : colors.on.surfaceVariant,
            },
            '& .MuiOutlinedInput-root': {
              borderRadius: borderRadius.default,
              backgroundColor: isDark ? '#1E293B' : colors.surface.container.lowest,
              '& fieldset': {
                borderColor: isDark ? '#334155' : colors.outlineVariant,
              },
              '&:hover fieldset': {
                borderColor: isDark ? '#3B82F6' : colors.primary.main,
              },
              '&.Mui-focused fieldset': {
                borderColor: isDark ? '#3B82F6' : colors.primary.main,
                borderWidth: 2,
                boxShadow: `0 0 0 3px ${isDark ? 'rgba(59, 130, 246, 0.25)' : colors.primary.fixed}`,
              },
            },
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            height: 4,
            borderRadius: 0,
            backgroundColor: isDark ? '#334155' : colors.outlineVariant,
          },
          bar: {
            borderRadius: 0,
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: isDark ? '#334155' : colors.outlineVariant,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: isDark ? '#EBF1FF' : colors.inverseSurface,
            color: isDark ? '#151C27' : colors.on.inverseSurface,
            fontSize: '12px',
            borderRadius: borderRadius.default,
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: borderRadius.default,
            '&:hover': {
              backgroundColor: isDark ? '#1E293B' : colors.surface.container.low,
            },
          },
        },
      },
    },
  });
};

const defaultTheme = getTheme('light');
export default defaultTheme;
