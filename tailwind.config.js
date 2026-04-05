/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:    '#6366F1',
        accent:     '#22C55E',
        bg:         '#0F172A',
        surface:    '#1E293B',
        'surface-2':'#263147',
        border:     '#334155',
      },
      fontFamily: {
        // Inter as primary everywhere — clean, professional
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(99,102,241,0.3)' },
          '50%':       { boxShadow: '0 0 50px rgba(99,102,241,0.7)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-18px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
      },
      animation: {
        'glow-pulse': 'glowPulse 2.5s ease-in-out infinite',
        'float':      'float 5s ease-in-out infinite',
        'shimmer':    'shimmer 2.5s linear infinite',
      },
      screens: {
        'xs': '375px',
      },
    },
  },
  plugins: [],
}     