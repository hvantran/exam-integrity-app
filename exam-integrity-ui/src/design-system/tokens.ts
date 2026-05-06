/**
 * Design System Tokens
 * Source: Stitch project "Integrity Exam Architect" – Zen Integrity System
 * Brand personality: Modern Minimalism — cognitive clarity, Zen-mode focus.
 */

export const colors = {
  primary: {
    deep: '#00288E',
    main: '#1E40AF',
    container: '#1E40AF',
    on: '#FFFFFF',
    onContainer: '#A8B8FF',
    fixed: '#DDE1FF',
    fixedDim: '#B8C4FF',
    inversePrimary: '#B8C4FF',
  },
  secondary: {
    main: '#006C4A',
    container: '#82F5C1',
    on: '#FFFFFF',
    onContainer: '#00714E',
    fixed: '#85F8C4',
    fixedDim: '#68DBA9',
  },
  tertiary: {
    deep: '#700006',
    main: '#DC2626',
    container: '#9B000D',
    on: '#FFFFFF',
    onContainer: '#FFA399',
    fixed: '#FFDAD6',
    fixedDim: '#FFB4AB',
  },
  surface: {
    default: '#F9F9FF',
    dim: '#D3DAEA',
    bright: '#F9F9FF',
    tint: '#3755C3',
    container: {
      lowest: '#FFFFFF',
      low: '#F0F3FF',
      default: '#E7EEFE',
      high: '#E2E8F8',
      highest: '#DCE2F3',
    },
  },
  on: {
    surface: '#151C27',
    surfaceVariant: '#444653',
    background: '#151C27',
    inverseSurface: '#EBF1FF',
  },
  inverseSurface: '#2A313D',
  outline: '#757684',
  outlineVariant: '#C4C5D5',
  background: '#F9F9FF',
  error: '#BA1A1A',
  onError: '#FFFFFF',
  errorContainer: '#FFDAD6',
  onErrorContainer: '#93000A',
};

export const typography = {
  fontFamily: {
    sans: '"Public Sans", system-ui, sans-serif',
    mono: '"Space Grotesk", monospace',
  },
  scale: {
    h1: { fontSize: '40px', fontWeight: 700, lineHeight: '48px', letterSpacing: '-0.02em' },
    h2: { fontSize: '32px', fontWeight: 600, lineHeight: '40px', letterSpacing: '-0.01em' },
    h3: { fontSize: '24px', fontWeight: 600, lineHeight: '32px' },
    bodyLg: { fontSize: '18px', fontWeight: 400, lineHeight: '28px' },
    bodyMd: { fontSize: '16px', fontWeight: 400, lineHeight: '24px' },
    labelCaps: { fontSize: '12px', fontWeight: 600, lineHeight: '16px', letterSpacing: '0.05em' },
    uiLabel: { fontSize: '14px', fontWeight: 500, lineHeight: '20px' },
    mathDisplay: {
      fontSize: '18px',
      fontWeight: 500,
      lineHeight: '26px',
      fontFamily: '"Space Grotesk", monospace',
    },
  },
};

export const spacing = {
  unit: 4,
  containerMax: '1280px',
  paperWidth: '800px',
  gutter: 24,
  margin: 32,
  stackSm: 8,
  stackMd: 16,
  stackLg: 32,
};

export const borderRadius = {
  sm: '2px',
  default: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  full: '9999px',
};

export const shadow = {
  /** Active question card — very subtle lift */
  cardActive: '0px 4px 20px rgba(0, 0, 0, 0.03)',
  none: 'none',
};

export const zIndex = {
  examHeader: 100,
  examProgressBar: 200,
  modal: 1300,
};
