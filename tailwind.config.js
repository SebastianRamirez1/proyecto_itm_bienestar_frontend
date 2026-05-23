/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#003087',
          light: '#1a4a9f',
          50: '#e6edf8',
        },
        accent: '#00843D',
        surface: '#F8FAFC',
      },
    },
  },
  plugins: [],
}
