/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        zinc: {
          950: '#09090b',
          900: '#121215',
          850: '#18181b',
          800: '#27272a',
        },
        emerald: {
          400: '#34d399',
          500: '#10b981',
        },
        amber: {
          500: '#f59e0b',
        },
        rose: {
          500: '#f43f5e',
          600: '#e11d48',
        }
      }
    },
  },
  plugins: [],
}
