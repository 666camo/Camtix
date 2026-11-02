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
        sans: ['"DM Sans"', '"Source Sans 3"', 'system-ui', 'sans-serif'],
        display: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#effcf6',
          100: '#c6f7e2',
          200: '#8eedc7',
          300: '#65d6ad',
          400: '#3ebd93',
          500: '#27ab83',
          600: '#199473',
          700: '#147d64',
          800: '#0c6b58',
          900: '#014d40',
          950: '#003833',
        },
        accent: {
          50: '#fff8f0',
          100: '#ffe4c4',
          200: '#ffc78a',
          300: '#ffab5c',
          400: '#f59e42',
          500: '#e88c30',
          600: '#d47820',
          700: '#b85c14',
          800: '#8a4210',
          900: '#5c2d0e',
        },
      },
    },
  },
  plugins: [],
}
