/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        blue: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        dark: {
          primary: '#121212',
          secondary: '#1e1e1e',
          accent: '#242424',
          text: '#e2e2e2',
          muted: '#a0a0a0'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, rgb(28, 28, 42), rgb(12, 12, 24))',
        'gradient-dark-purple': 'linear-gradient(135deg, rgb(34, 28, 50), rgb(15, 12, 30))',
        'gradient-dark-blue': 'linear-gradient(135deg, rgb(20, 30, 48), rgb(10, 15, 30))',
      },
      typography: {
        DEFAULT: {
          css: {
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
          },
        },
      },
    },
  },
  plugins: [],
}