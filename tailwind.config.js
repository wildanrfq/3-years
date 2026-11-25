/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sage: {
          50: 'var(--sage-50)',
          100: 'var(--sage-100)',
          200: 'var(--sage-200)',
          300: 'var(--sage-300)',
          400: 'var(--sage-400)',
          500: 'var(--sage-500)',
          600: 'var(--sage-600)',
          700: 'var(--sage-700)',
          800: 'var(--sage-800)',
          900: 'var(--sage-900)',
        },
        cream: 'var(--cream)',
        blush: 'var(--blush)',
        ink: 'var(--ink)',
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Nunito"', 'system-ui', 'sans-serif'],
        hand: ['"Caveat"', 'cursive'],
      },
      borderRadius: {
        card: '24px',
        sheet: '28px',
        pill: '9999px',
      },
      boxShadow: {
        'sage-sm': '0 4px 14px -2px rgba(60, 78, 54, 0.09)',
        'sage-md': '0 10px 30px -6px rgba(60, 78, 54, 0.14)',
        'sage-lg': '0 20px 48px -12px rgba(43, 56, 39, 0.18)',
        'sage-glow': '0 0 0 4px rgba(156, 179, 142, 0.25)',
      },
    },
  },
  plugins: [],
};
