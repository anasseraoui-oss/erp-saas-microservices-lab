/** @type {import('tailwindcss').Config} */
module.exports = {
  // Support both class-based and attribute-based dark mode selectors.
  // Many components/third-party libs toggle the `dark` class; others use [data-theme="dark"].
  darkMode: ['class', '[data-theme="dark"]'],
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