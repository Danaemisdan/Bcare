/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Figtree"', '"Plus Jakarta Sans"', '"Outfit"', '"Inter"', '"Geist"', '-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', 'sans-serif'],
        display: ['"Figtree"', '"Plus Jakarta Sans"', '"Outfit"', '"Inter"', '"Geist"', '-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        brand: {
          50: '#f4fbf7',
          100: '#e6f7ef',
          200: '#c4edd9',
          300: '#94ddba',
          400: '#5dc397',
          500: '#34a87a',
          600: '#238760',
          700: '#1e6c4e',
          800: '#1b563f',
          900: '#174735',
          950: '#0b281d',
        }
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 1px -1px rgba(0, 0, 0, 0.02)',
        'elevated': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
        'card': '0 0 0 1px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 0 0 1px rgba(0, 0, 0, 0.1), 0 4px 14px -2px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}
