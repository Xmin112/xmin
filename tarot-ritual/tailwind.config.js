/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fbc: {
          black:   '#050508',
          concrete:'#1a1a1f',
          panel:   '#121218',
          red:     '#c0392b',
          dred:    '#8b0000',
          bone:    '#e8e0d5',
          gray:    '#6b6b6b',
          gold:    '#c9a96e',
          astral:  '#f5f0e8',
          hiss:    '#ff1a1a',
        },
      },
      fontFamily: {
        mono:  ['JetBrains Mono', 'monospace'],
        sans:  ['system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'scanline': 'scanline 3s linear infinite',
        'flicker':  'flicker 0.15s steps(1) infinite',
        'drift':    'drift 20s linear infinite',
        'stamp':    'stamp 0.3s ease-out',
        'redact':   'redact 1.5s steps(4) forwards',
      },
      keyframes: {
        scanline: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.85' },
        },
        drift: {
          '0%':   { transform: 'translate(0, 0) rotate(0deg)' },
          '33%':  { transform: 'translate(2px, -1px) rotate(0.5deg)' },
          '66%':  { transform: 'translate(-1px, 1px) rotate(-0.3deg)' },
          '100%': { transform: 'translate(0, 0) rotate(0deg)' },
        },
        stamp: {
          '0%':   { transform: 'scale(1.5)', opacity: '0' },
          '60%':  { transform: 'scale(0.95)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        redact: {
          '0%':   { clipPath: 'inset(0 100% 0 0)' },
          '100%': { clipPath: 'inset(0 0 0 0)' },
        },
      },
    },
  },
  plugins: [],
}
