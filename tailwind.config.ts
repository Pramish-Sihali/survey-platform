import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  // In Tailwind v4, most configuration is now done via @theme in CSS
  // This config file is mainly for content paths and any remaining JS-based config
}

export default config