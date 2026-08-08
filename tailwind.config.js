module.exports = {
  darkMode: 'class', // controlled by a parent class
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          850: '#0b1220',
        },
      },
    },
  },
  plugins: [],
}
