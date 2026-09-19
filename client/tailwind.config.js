/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        // Editorial Palette Tokens
        brand: {
          50: '#FDF7F4',
          100: '#FAEBE6',
          200: '#F5D5CB',
          300: '#EBB4A2',
          400: '#DE8B72',
          500: '#CF6646', // Primary muted terracotta / copper accent
          600: '#BA5033',
          700: '#9B3F27',
          800: '#7F3624',
          900: '#682E20',
        },
        surface: {
          light: {
            bg: '#F8F7F4',        // Warm alabaster / editorial off-white
            subtle: '#F0EFEA',    // Secondary warm surface
            panel: '#FFFFFF',     // Clean sheet surface
            border: '#E4E2DC',    // Refined subtle border
            borderHover: '#D1CEC4',
            text: '#1C1B19',      // Deep charcoal primary
            textMuted: '#68655F', // Muted secondary
            textSubtle: '#9A978E',
          },
          dark: {
            bg: '#0E0F12',        // Deep obsidian slate
            subtle: '#15171C',    // Secondary dark panel
            panel: '#1B1E24',     // Elevated panel
            border: '#262A33',    // 1px architectural border
            borderHover: '#383D4A',
            text: '#ECEBE8',      // Soft warm white text
            textMuted: '#8E94A0', // Slate secondary
            textSubtle: '#5A606E',
          }
        },
        accent: {
          copper: '#CF6646',
          olive: '#4D7C5D',
          amber: '#D97736',
          slate: '#475569',
        }
      },
      boxShadow: {
        'fine': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'float': '0 10px 30px -10px rgba(0, 0, 0, 0.15)',
        'modal': '0 20px 45px -15px rgba(0, 0, 0, 0.35)',
      },
      borderRadius: {
        'xs': '2px',
        'sm': '4px',
        'DEFAULT': '6px',
        'md': '8px',
        'lg': '12px',
      },
      letterSpacing: {
        'tightest': '-0.035em',
        'tighter': '-0.02em',
      }
    },
  },
  plugins: [],
}
