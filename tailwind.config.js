/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // CoW DAO Forum Theme Colors (forum.cow.fi)
        'cow-brown': {
          DEFAULT: '#3A2A2C',      // Primary body background
          dark: '#23191A',          // Header/darkest background
          medium: '#614649',        // Hover/selection states
          light: '#8B7578',         // Lighter variant for borders
        },
        'cow-orange': {
          DEFAULT: '#FF3215',       // Primary accent (buttons, links, focus)
          hover: '#E62D13',         // Darker orange for hover states
          light: '#FF5A42',         // Lighter orange variant
        },
        'cow-pink': {
          DEFAULT: '#FFEDEC',       // Pastel pink (sidebar icons, subtle highlights)
          light: '#FFF8F7',         // Off-white text color
        },
        'cow-purple': {
          DEFAULT: '#9D256B',       // Forum purple (love reactions, special states)
          light: '#B83582',
        },
        'cow-green': {
          DEFAULT: '#3D854D',       // Success/governance green
          light: '#4FA85F',
        },
        'cow-red': {
          DEFAULT: '#C31717',       // Error red
          light: '#D63535',
        },
        // Forum Badge Colors
        'cow-badge': {
          general: '#F7941D',       // General category
          technical: '#B3B5B4',     // Technical category
          governance: '#3AB54A',    // Governance/Treasury
          knowledge: '#0088CC',     // Grants/Knowledge Base
        },
        // Legacy color mappings for compatibility
        primary: '#FF3215',
        success: '#3D854D',
        warning: '#F7941D',
        danger: '#C31717',
      },
      backgroundImage: {
        'gradient-cow-primary': 'linear-gradient(135deg, #3A2A2C 0%, #23191A 100%)',
        'gradient-cow-warm': 'linear-gradient(135deg, #614649 0%, #3A2A2C 100%)',
        'gradient-cow-orange': 'linear-gradient(135deg, #FF3215 0%, #9D256B 100%)',
      },
      boxShadow: {
        'cow-glow': '0 0 20px rgba(255, 50, 21, 0.3)',
        'cow-glow-sm': '0 0 10px rgba(255, 50, 21, 0.2)',
        'cow-purple-glow': '0 0 20px rgba(157, 37, 107, 0.3)',
      },
      borderRadius: {
        'cow': '12px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
