/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        tec: {
          blue: '#003087',
          'blue-light': '#0051a8',
          accent: '#00A3E0',
        }
      }
    },
  },
  plugins: [],
};
