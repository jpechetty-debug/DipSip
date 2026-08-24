/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B1220',
        card: '#111827',
        border: '#1F2937',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
        primary: '#6366F1',
      },
    },
  },
  plugins: [],
}
