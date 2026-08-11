/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'hh-green-deep': '#0b3d24',
        'hh-green-mid': '#14532d',
        'hh-pink': '#ec1263',
        'hh-yellow': '#f6d33c',
        'hh-cream': '#f6efd8',
        'hh-cream-line': '#d8cfa8',
        'hh-ink': '#123524',
      },
      fontFamily: {
        'display': ['Anton', 'sans-serif'],
        'body': ['Space Grotesk', 'sans-serif'],
        'mono-label': ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}