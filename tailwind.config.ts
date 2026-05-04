import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1D3461',
          50: '#f0f3f9',
          100: '#dde4f1',
          200: '#c1cfe6',
          300: '#96aed5',
          400: '#6585be',
          500: '#4467ab',
          600: '#334f90',
          700: '#2b4075',
          800: '#273762',
          900: '#1D3461',
        },
        gold: {
          DEFAULT: '#E9A620',
          50: '#fdf8ec',
          100: '#fbeecc',
          200: '#f6da94',
          300: '#f0c15b',
          400: '#eba830',
          500: '#E9A620',
          600: '#c97e14',
          700: '#a75d14',
          800: '#884817',
          900: '#713c17',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
