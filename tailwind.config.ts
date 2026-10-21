import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#F2F4F3',
        surface: '#FFFFFF',
        line: '#DCE2DF',
        ink: '#14201D',
        muted: '#58675F',
        danger: '#B42318',
        brand: { DEFAULT: '#0F5C4D', hover: '#0B4A3E', soft: '#E2EFEB' },
        sidebar: { DEFAULT: '#0D2723', line: '#1D3B36' },
        status: {
          active: { DEFAULT: '#1E7B4F', bg: '#E3F3EA' },
          leave: { DEFAULT: '#8F5300', bg: '#FBEFD8' },
          inactive: { DEFAULT: '#505C58', bg: '#E8ECEA' },
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'sheet-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'drawer-in': {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 150ms ease-out',
        'sheet-up': 'sheet-up 180ms ease-out',
        'drawer-in': 'drawer-in 200ms ease-out',
      },
    },
  },
  plugins: [],
} satisfies Config;
