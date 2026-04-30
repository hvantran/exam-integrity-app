/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          100: '#E7EEFE', // surface.container.default
          200: '#DCE2F3', // surface.container.highest
          300: '#B8C4FF', // primary.fixedDim
          400: '#A8B8FF', // primary.onContainer
          500: '#1E40AF', // primary.main
          600: '#00288E', // primary.deep
          700: '#3755C3', // surface.tint
          800: '#151C27', // on.surface
          900: '#0A1120', // custom dark (not in tokens, fallback)
          DEFAULT: 'var(--color-primary)',
          deep: 'var(--color-primary-deep)',
          container: 'var(--color-primary-container)',
          on: 'var(--color-primary-on)',
          onContainer: 'var(--color-primary-on-container)',
        },
        secondary: {
          100: '#E7FFF3', // lightest, custom (not in tokens)
          200: '#C6F7E2', // custom
          300: '#82F5C1', // container
          400: '#68DBA9', // fixedDim
          500: '#006C4A', // main
          600: '#00714E', // onContainer
          700: '#004C34', // custom deep
          800: '#003322', // custom darker
          900: '#001A11', // custom darkest
          DEFAULT: 'var(--color-secondary)',
          container: 'var(--color-secondary-container)',
          on: 'var(--color-secondary-on)',
          onContainer: 'var(--color-secondary-on-container)',
        },
        surface: {
          100: '#FFFFFF', // lowest
          200: '#F0F3FF', // low
          300: '#E7EEFE', // default
          400: '#E2E8F8', // high
          500: '#DCE2F3', // highest
          600: '#D3DAEA', // dim
          700: '#F9F9FF', // bright
          800: '#3755C3', // tint
          900: '#151C27', // on.surface (for contrast)
          DEFAULT: 'var(--color-surface)',
          dim: 'var(--color-surface-dim)',
          bright: 'var(--color-surface-bright)',
          tint: 'var(--color-surface-tint)',
          lowest: 'var(--color-surface-lowest)',
          low: 'var(--color-surface-low)',
          high: 'var(--color-surface-high)',
          highest: 'var(--color-surface-highest)',
        },
        error: {
          100: '#FFDAD6', // errorContainer
          200: '#FFB4AB', // primary.fixedDim (used for error highlight)
          300: '#FFB4AB', // repeat for scale
          400: '#FFB4AB',
          500: '#BA1A1A', // error
          600: '#93000A', // onErrorContainer
          700: '#7A0010', // custom deep
          800: '#5A0008', // custom darker
          900: '#2D0004', // custom darkest
          DEFAULT: 'var(--color-error)',
          container: 'var(--color-error-container)',
          on: 'var(--color-on-error)',
          onContainer: 'var(--color-on-error-container)',
        },
        background: 'var(--color-background)',
        outline: 'var(--color-outline)',
        outlineVariant: 'var(--color-outline-variant)',
        on: {
          surface: 'var(--color-on-surface)',
          surfaceVariant: 'var(--color-on-surface-variant)',
          background: 'var(--color-on-background)',
        },
      },
    },
  },
  plugins: [],
};
