/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0f172a',
          card: '#1e293b',
          accent: '#8b5cf6',
          pink: '#ec4899',
          yellow: '#eab308',
          cyan: '#06b6d4'
        }
      }
    },
  },
  plugins: [],
}
