/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#C9A961',
          light: '#E8D4A2',
          dark: '#9A7B3D',
        },
        secondary: '#2D5A4A',
        accent: '#8B4513',
        vermilion: '#C9372C',
        background: {
          primary: '#1A1A1A',
          secondary: '#2D2D2D',
          tertiary: '#3D3D3D',
        },
        text: {
          primary: '#F5F5F5',
          secondary: '#B0B0B0',
          muted: '#707070',
        },
        region: {
          mountain: '#E8F4F8',
          forest: '#1B4D3E',
          flower: '#D4A574',
          stream: '#4A7C8B',
          cliff: '#5C4033',
        },
        status: {
          success: '#4A7C59',
          warning: '#D4A574',
          error: '#8B3A3A',
          info: '#4A6B8B',
        },
      },
      fontFamily: {
        title: ['Source Han Serif SC', 'Noto Serif SC', 'serif'],
        body: ['Source Han Sans SC', 'Noto Sans SC', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
        decorative: ['ZCOOL XiaoWei', 'serif'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 10px rgba(201, 169, 97, 0.6))' },
          '50%': { filter: 'drop-shadow(0 0 20px rgba(201, 169, 97, 0.9))' },
        },
      },
    },
  },
  plugins: [],
}
