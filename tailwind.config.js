/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        manrope: ['"Manrope"', 'sans-serif'],
        cabin: ['"Cabin"', 'sans-serif'],
        instrument: ['"Instrument Serif"', 'serif'],
        inter: ['"Inter"', 'sans-serif'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        poppins: ['"Poppins"', 'sans-serif'],
      },
      colors: {
        'brand-gray': '#1A1A1A',
      },
      keyframes: {
        fadeUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0', filter: 'blur(4px)' },
          '100%': { transform: 'translateY(0)', opacity: '1', filter: 'blur(0)' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 700ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
    },
  },
  plugins: [],
}
