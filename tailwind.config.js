/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,ts}',
  ],
  corePlugins: {
    // Disable preflight to avoid conflicts with existing global CSS
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        'bp-bg':      '#1A1A2E',
        'bp-bg2':     '#252541',
        'bp-bg3':     '#2D2D44',
        'bp-orange':  '#FF6B35',
        'bp-green':   '#10B981',
        'bp-yellow':  '#F59E0B',
        'bp-red':     '#EF4444',
        'bp-blue':    '#3B82F6',
        'bp-purple':  '#8B5CF6',
        'bp-muted':   '#A0A0B0',
        'bp-border':  'rgba(255, 255, 255, 0.1)',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

