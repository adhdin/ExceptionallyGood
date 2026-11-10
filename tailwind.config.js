/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        accent: {
          50: '#ecfdf8',
          100: '#d1faec',
          200: '#a7f3da',
          300: '#6ee7c2',
          400: '#34d3a5',
          500: '#10b98a',
          600: '#059670',
          700: '#04785c',
          800: '#065f4a',
          900: '#064e3e',
        },
        ink: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d5d9e2',
          300: '#b0b8c7',
          400: '#8591a6',
          500: '#66728a',
          600: '#515b71',
          700: '#2a3040',
          800: '#1a1e29',
          850: '#151821',
          900: '#10131a',
          950: '#0b0d12',
        },
      },
      keyframes: {
        'fade-in': { from: { opacity: '0', transform: 'translateY(4px)' }, to: { opacity: '1', transform: 'none' } },
      },
      animation: { 'fade-in': 'fade-in 160ms ease-out' },
    },
  },
  plugins: [],
};
