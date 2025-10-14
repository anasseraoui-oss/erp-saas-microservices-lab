/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['attr', 'data-theme'],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}