/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fef7ee",
          100: "#fdedd3",
          200: "#fad7a5",
          300: "#f6bc6d",
          400: "#f19633",
          500: "#ed7a11",
          600: "#de5f07",
          700: "#b84609",
          800: "#92380f",
          900: "#76300f",
        },
        safe: "#22c55e",
        caution: "#eab308",
        danger: "#ef4444",
      },
    },
  },
  plugins: [],
};
