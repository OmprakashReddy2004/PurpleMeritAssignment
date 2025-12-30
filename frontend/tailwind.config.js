/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class", // enable class-based dark mode
  theme: {
    extend: {
      colors: {
        darkbg: "#0b0f1a",
        cardbg: "#111827",
        accent1: "#4ade80", // neon green
        accent2: "#3b82f6", // neon blue
        accent3: "#f472b6", // neon pink
      },
      animation: {
        pulseSlow: "pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
