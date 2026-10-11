/** @type {import('tailwindcss').Config} */
export default {
  // The static 404 and privacy pages use Tailwind classes too, so every root
  // HTML file is scanned — not just index.html.
  content: ['./*.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Clash Display"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
      },
      // The *-rgb tokens let the /opacity modifier work (bg-accent/10).
      colors: {
        bg: 'rgb(var(--bg-rgb) / <alpha-value>)',
        surface: 'var(--surface)',
        fg: 'rgb(var(--fg-rgb) / <alpha-value>)',
        muted: 'var(--muted)',
        line: 'var(--line)',
        accent: 'rgb(var(--accent-rgb) / <alpha-value>)',
        'accent-ink': 'var(--accent-ink)',
        ember: 'rgb(var(--ember-rgb) / <alpha-value>)',
        ok: 'var(--ok)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
