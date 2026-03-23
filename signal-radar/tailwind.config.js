/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Jost', 'Arial', 'sans-serif'],
      },
      colors: {
        brand: {
          red: '#A32135',
          beige: '#E6E0D8',
          cream: '#F4F1EC',
          taupe: '#CBBCA5',
          'dark-taupe': '#BBB2A5',
          blue: '#7798B2',
          'light-steel': '#B3C2CE',
          charcoal: '#5D646B',
          'dark-gray': '#505052',
          rose: '#AA9391',
          sage: '#858D84',
        },
      },
    },
  },
  plugins: [],
}
