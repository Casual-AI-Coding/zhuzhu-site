/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '480px',
      },
      colors: {
        primary: '#D4A574',
        background: '#F5EDE4',
        card: '#FFF8F0',
        text: {
          main: '#3D3D3D',
          secondary: '#8B7355',
        },
        border: '#E8DDD0',
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Inter', 'sans-serif'],
        handwriting: ['Caveat', 'cursive'],
      },
    },
  },
  plugins: [],
};
