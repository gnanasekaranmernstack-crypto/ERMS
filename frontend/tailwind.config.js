/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F46E5',
          dark: '#4338CA',
          light: '#A5B4FC',
        },
        background: '#F3F4F6',
        surface: '#FFFFFF',
        text: {
          primary: '#1E293B',
          secondary: '#64748B',
        }
      },
    },
  },
  plugins: [],
}
