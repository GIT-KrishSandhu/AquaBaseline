/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sky: {
          50: '#F0F9FF',
          100: '#E0F2FE',
        },
        ink: {
          DEFAULT: '#0B2E3B',
          muted: '#4F6B78',
        },
        primary: {
          DEFAULT: '#0D9488',
          dark: '#0F766E',
          soft: '#E6FFFA',
        },
        cyan: {
          DEFAULT: '#06B6D4',
          soft: '#CFFAFE',
        },
        normal: {
          DEFAULT: '#16A34A',
          soft: '#DCFCE7',
        },
        watch: {
          DEFAULT: '#B45309',
          soft: '#FEF3C7',
        },
        alert: {
          DEFAULT: '#DC2626',
          soft: '#FEE2E2',
        },
        surface: '#FFFFFF',
        hairline: '#D8E9F0',
      },
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 8px 24px rgba(13, 148, 136, 0.08)',
        'card-hover': '0 12px 32px rgba(13, 148, 136, 0.14)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
