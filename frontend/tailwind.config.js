export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      colors: {
        slatebrand: {
          50: '#f3fafb',
          100: '#d9f2f5',
          200: '#a9e4ea',
          300: '#6fd0dc',
          400: '#34b8cb',
          500: '#1f9aae',
          600: '#187c8e',
          700: '#176375',
          800: '#185261',
          900: '#1a4550'
        },
      },
      animation: {
        'slide-up': 'slideUp 0.45s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
