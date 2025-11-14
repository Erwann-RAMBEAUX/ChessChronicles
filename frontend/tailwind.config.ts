import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#F2C14E',
          600: '#e0ad2f'
        },
        surface: '#101722',
        panel: '#1a2332',
      }
    },
  },
  plugins: [],
} satisfies Config
