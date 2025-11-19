/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        primary: {
          DEFAULT: '#3396FF',
          dark: '#2978CC',
        },
        accent: {
          DEFAULT: '#47A1FF',
          light: '#6CB4FF',
        },
        // Background Colors
        background: {
          DEFAULT: '#0F1419',
          card: '#1A1F2E',
          elevated: '#222833',
          input: '#1E2433',
          hover: '#252B3B',
        },
        // Text Colors
        text: {
          primary: '#FFFFFF',
          secondary: '#A8B1B1',
          tertiary: '#6E7777',
          disabled: '#474D4D',
        },
        // Semantic Colors
        success: {
          DEFAULT: '#26D962',
          dark: '#26B562',
        },
        error: {
          DEFAULT: '#F25A67',
          dark: '#F05142',
        },
        warning: {
          DEFAULT: '#FFD641',
          orange: '#F0AD4E',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'monospace'],
      },
      fontSize: {
        'heading-1': ['80px', { lineHeight: '1.1', letterSpacing: '-1px' }],
        'heading-2': ['48px', { lineHeight: '1.2' }],
        'heading-3': ['36px', { lineHeight: '1.2' }],
        'heading-4': ['24px', { lineHeight: '1.3' }],
        'body-lg': ['18px', { lineHeight: '1.5' }],
        'body': ['16px', { lineHeight: '1.5' }],
        'body-sm': ['14px', { lineHeight: '1.5' }],
        'caption': ['12px', { lineHeight: '1.5' }],
        'micro': ['11px', { lineHeight: '1.5' }],
      },
      spacing: {
        '18': '72px',
        '22': '88px',
       '26': '104px',
      },
      borderRadius: {
        'sm': '6px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        'full': '9999px',
      },
      boxShadow: {
        'low': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.15)',
        'high': '0 20px 60px rgba(0, 0, 0, 0.4)',
        'glow': '0 0 20px rgba(71, 161, 255, 0.3)',
        'glow-strong': '0 0 40px rgba(71, 161, 255, 0.5)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #3396FF 0%, #47A1FF 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #2978CC 0%, #3396FF 100%)',
        'gradient-hero': 'linear-gradient(180deg, #0A0E27 0%, #141B3D 100%)',
        'gradient-card': 'linear-gradient(135deg, #1A1F2E 0%, #141824 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite alternate',
        'count-up': 'countUp 2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%': { boxShadow: '0 0 10px rgba(71, 161, 255, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(71, 161, 255, 0.5)' },
        },
      },
    },
  },
  plugins: [],
}
