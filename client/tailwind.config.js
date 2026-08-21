/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Russo One"', 'sans-serif'],
        body: ['"Chakra Petch"', 'sans-serif'],
      },
      colors: {
        brand: {
          background: '#0F0F23',
          card: '#1E1C35',
          primary: '#7C3AED',
          secondary: '#A78BFA',
          accent: '#F43F5E',
          foreground: '#E2E8F0',
          dark: '#0f172a',
          pink: '#ec4899',
          cyan: '#06b6d4',
          yellow: '#eab308'
        }
      }
    },
  },
  plugins: [],
}
