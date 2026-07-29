/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "rgba(15, 23, 42, 0.1)",
        brand: {
          DEFAULT: "#0052FF",
          hover: "#0040CC",
          light: "#EFF6FF",
        },
        navy: {
          DEFAULT: "#090D16",
          mid: "#0F172A",
          light: "#1E293B",
        },
      },
      animation: {
        spotlight: "spotlight 2s ease .5s 1 forwards",
      },
      keyframes: {
        spotlight: {
          "0%": {
            opacity: 0,
            transform: "translate(-72%, -62%) scale(0.5)",
          },
          "100%": {
            opacity: 1,
            transform: "translate(-50%,-40%) scale(1)",
          },
        },
      },
    },
  },
  plugins: [],
};
