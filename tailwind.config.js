/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        // Badge "pop" when a count changes
        pop: {
          '0%': { transform: 'scale(0.5)' },
          '60%': { transform: 'scale(1.25)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: { pop: 'pop 0.2s ease-out' },
    },
  },
  plugins: [],
}
