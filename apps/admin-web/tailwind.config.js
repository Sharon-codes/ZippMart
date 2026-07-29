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
          DEFAULT: "#0C1A3D",
          mid: "#162554",
          hover: "#1e3166",
        },
      },
    },
  },
  plugins: [],
};
