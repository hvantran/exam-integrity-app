import { createTheme } from '@mui/material/styles';
import { colors, typography, borderRadius } from './tokens';

/**
 * MUI theme derived from the Stitch "Zen Integrity System" design tokens.
 * Primary  = Trust Blue  (#1E40AF)
 * Secondary = Integrity Green (#006C4A)
 * Error    = Warning Red  (#DC2626)
 */
const theme = createTheme({
  palette: {
    primary: {
      main: colors.primary.main,
      dark: colors.primary.deep,
      light: colors.primary.fixed,
      contrastText: colors.primary.on,
    },
    secondary: {
      main: colors.secondary.main,
      light: colors.secondary.fixed,
      contrastText: colors.secondary.on,
    },
    error: {
      main: colors.tertiary.main,
      dark: colors.tertiary.deep,
      light: colors.tertiary.fixed,
      contrastText: colors.tertiary.on,
    },
    warning: {
      main: colors.tertiary.main,
      contrastText: colors.tertiary.on,
    },
    success: {
      main: colors.secondary.main,
      contrastText: colors.secondary.on,
    },
    background: {
      default: colors.background,
      paper: colors.surface.container.lowest,
    },
    text: {
      primary: colors.on.surface,
      secondary: colors.on.surfaceVariant,
      disabled: colors.outline,
    },
    divider: colors.outlineVariant,
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
        body { background-color: ${colors.background}; color: ${colors.on.surface}; }
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
          borderColor: colors.outlineVariant,
          '&:hover': {
            borderColor: colors.primary.main,
            backgroundColor: colors.surface.container.low,
          },
        },
        text: {
          color: colors.primary.main,
          '&:hover': {
            backgroundColor: colors.surface.container.low,
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
          border: `1px solid ${colors.outlineVariant}`,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)',
          backgroundColor: colors.surface.container.lowest,
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
            color: colors.on.surfaceVariant,
          },
          '& .MuiOutlinedInput-root': {
            borderRadius: borderRadius.default,
            backgroundColor: colors.surface.container.lowest,
            '& fieldset': {
              borderColor: colors.outlineVariant,
            },
            '&:hover fieldset': {
              borderColor: colors.primary.main,
            },
            '&.Mui-focused fieldset': {
              borderColor: colors.primary.main,
              borderWidth: 2,
              boxShadow: `0 0 0 3px ${colors.primary.fixed}`,
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
          backgroundColor: colors.outlineVariant,
        },
        bar: {
          borderRadius: 0,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: colors.outlineVariant,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: colors.inverseSurface,
          color: colors.on.inverseSurface,
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
            backgroundColor: colors.surface.container.low,
          },
        },
      },
    },
  },
});

export default theme;
