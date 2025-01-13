/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ffd6ff',
        secondary: '#e7c6ff',
        accent: {
          100: '#c8b6ff',
          200: '#b8c0ff',
          300: '#bbd0ff',
        }
      },
      fontFamily: {
        jersey: ['Jersey M54', 'sans-serif'],
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
