/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366F1',
        success: '#22C55E',
        danger: '#EF4444',
        warning: '#F59E0B',
        dark: '#0F172A',
        darker: '#020617',
      },
    },
  },
  plugins: [],
}
