/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        restaurant: {
          primary: '#f59e0b',
          'primary-content': '#fffbeb',
          secondary: '#fb923c',
          accent: '#fbbf24',
          neutral: '#44403c',
          'base-100': '#ffffff',
          'base-200': '#fef3c7',
          'base-300': '#fde68a',
          'base-content': '#292524',
          info: '#0ea5e9',
          success: '#22c55e',
          warning: '#f59e0b',
          error: '#ef4444',
        },
      },
    ],
  },
};
