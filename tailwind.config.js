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
          primary: '#DA291C', // Hiscox Red
          secondary: '#721C24', // Dark Red
          dark: '#1e293b', // Slate 800
          light: '#ffffff', // White
          gray: '#f8fafc', // Slate 50
        },
        accent: {
          500: '#3b82f6',
          600: '#2563eb',
        }
      }
    },
  },
  plugins: [],
}
