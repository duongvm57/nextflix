import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      'xs': '480px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        primary: '#2563eb', // Blue-500
        secondary: '#141414',
      },
      animation: {
        'ripple': 'ripple 0.6s linear forwards',
        'loading-bar': 'loading-bar 1.5s ease-in-out infinite',
        'pulse-blue': 'pulse-blue 1.5s ease-in-out infinite',
        'spin': 'spin 0.8s linear infinite',
        'popup-in': 'popup-in 0.2s ease-out forwards',
        'popup-out': 'popup-out 0.2s ease-out forwards',
      },
      keyframes: {
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '0.7' },
          '100%': { transform: 'scale(1)', opacity: '0' },
        },
        'loading-bar': {
          '0%': { transform: 'translateX(-100%)', opacity: '0.7' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateX(400%)', opacity: '0.7' },
        },
        'pulse-blue': {
          '0%, 100%': { backgroundColor: 'rgba(59, 130, 246, 0.2)' },
          '50%': { backgroundColor: 'rgba(59, 130, 246, 0.5)' },
        },
        'popup-in': {
          '0%': { 
            opacity: '0',
            transform: 'translateY(10px) scale(0.95)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0) scale(1)'
          }
        },
        'popup-out': {
          '0%': {
            opacity: '1',
            transform: 'translateY(0) scale(1)'
          },
          '100%': {
            opacity: '0',
            transform: 'translateY(10px) scale(0.95)'
          }
        }
      },
    },
  },
  plugins: [],
};

export default config;
