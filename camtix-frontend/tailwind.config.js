/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Barlow Condensed"', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#edf6f1',
          100: '#d2e9dd',
          200: '#a8d4bf',
          300: '#75b99b',
          400: '#3f9775',
          500: '#176f56',
          600: '#105a45',
          700: '#0d4939',
          800: '#0b3b30',
          900: '#092f27',
          950: '#061e19',
        },
        accent: {
          50: '#fff3ef',
          100: '#ffe0d7',
          200: '#ffc0af',
          300: '#f99a80',
          400: '#e66b52',
          500: '#d6533c',
          600: '#b9422f',
          700: '#96372a',
          800: '#7b3229',
          900: '#662d27',
        },
      },
    },
  },
  plugins: [],
}
