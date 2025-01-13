/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        jersey: ['Jersey', 'sans-serif'],
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        primary: '#3B82F6',
        secondary: '#1E40AF',
        accent: {
          100: '#c8b6ff',
          200: '#b8c0ff',
          300: '#bbd0ff',
        }
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
