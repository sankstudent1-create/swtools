import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:  ['Source Sans 3', 'sans-serif'],
        serif: ['Libre Baskerville', 'serif'],
        mono:  ['Source Code Pro', 'monospace'],
      },
      colors: {
        navy: '#1b2d4f',
      },
    },
  },
  plugins: [],
}

export default config
