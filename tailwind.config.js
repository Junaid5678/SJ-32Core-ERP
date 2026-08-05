/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        enterprise: {
          dark: '#0f172a',    // Slate 900 - Sidebar & Headers
          card: '#1e293b',    // Slate 800 - Cards & Modals
          accent: '#3b82f6',  // Blue 500 - Primary Buttons
          success: '#10b981', // Emerald 500 - Completed/Stock OK
          warning: '#f59e0b', // Amber 500 - Low Stock / Pending
          danger: '#e11d48',  // Rose 600 - Errors & Deletions
        },
      },
    },
  },
  plugins: [],
};
