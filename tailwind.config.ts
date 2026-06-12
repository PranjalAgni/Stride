import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        lime: {
          400: '#d4ff3a',
          500: '#c5f02a',
          600: '#a8d418',
        },
        ice: {
          50:  '#eaf6ff',
          100: '#d6ecff',
          200: '#b6dcff',
          300: '#8fc8ff',
        },
        ink: {
          50:  '#f8fafc',
          100: '#e6e8ee',
          300: '#9ca3af',
          500: '#6b7280',
          700: '#1f2937',
          800: '#0f1115',
          900: '#08090c',
          950: '#050609',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'glow-lime': '0 0 24px rgba(212, 255, 58, 0.55), 0 0 48px rgba(212, 255, 58, 0.25)',
        'glow-lime-soft': '0 0 12px rgba(212, 255, 58, 0.35)',
      },
    },
  },
  plugins: [],
} satisfies Config;
