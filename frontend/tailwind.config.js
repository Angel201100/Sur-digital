/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1b2a41',
        'ink-soft': '#46556b',
        teal: '#2ec4b6',
        'teal-dark': '#0e7c72',
        amber: '#f2b134',
        paper: '#f3f5f7',
        line: '#d5dce4',
      },
      fontFamily: {
        sans: ['Sora', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 18px 55px rgba(27, 42, 65, .12)',
      },
    },
  },
  plugins: [],
}
