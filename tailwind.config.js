/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        'xs': '480px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        // 新增响应式断点
        '3xl': '1920px',      // 大屏桌面
        '4xl': '2560px',      // 4K 屏幕
        'tablet': '768px',    // 平板竖屏
        'landscape': {'raw': '(orientation: landscape)'},
        'portrait': {'raw': '(orientation: portrait)'},
        'fold': {'raw': '(max-width: 320px)'},  // 折叠屏折叠状态
        'unfold': {'raw': '(min-width: 700px)'}, // 折叠屏展开状态
      },
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
        },
        background: {
          DEFAULT: 'var(--color-background)',
        },
        card: {
          DEFAULT: 'var(--color-card)',
        },
        text: {
          main: 'var(--color-text-main)',
          secondary: 'var(--color-text-secondary)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
        },
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        handwriting: ['Caveat', 'cursive'],
      },
      // 新增字体大小（大屏适配）
      fontSize: {
        '2xs': '0.625rem',    // 10px
        '4xl': ['2.5rem', { lineHeight: '1.2' }],
        '5xl': ['3rem', { lineHeight: '1.1' }],
        '6xl': ['3.75rem', { lineHeight: '1.1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
    },
  },
  plugins: [],
};
