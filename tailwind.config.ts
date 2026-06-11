const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Geist", ...defaultTheme.fontFamily.sans],
        mono: ["Geist Mono", ...defaultTheme.fontFamily.mono],
      },
      colors: {
        surface: "#FAFAFA",
        "surface-alt": "#FFFFFF",
        "text-primary": "#1A1A1A",
        "text-secondary": "#8E8E93",
        "text-tertiary": "#C7C7CC",
        divider: "rgba(0, 0, 0, 0.06)",
        "error-red": "#FF3B30",
        "success-green": "#34C759",
      },
      maxWidth: {
        prose: "640px",
      },
      spacing: {
        section: "6rem",   // py-24
        "section-lg": "10rem", // py-40
      },
      borderRadius: {
        card: "2rem",
      },
      transitionTimingFunction: {
        voyage: "cubic-bezier(0.32, 0.72, 0, 1)",
      },
    },
  },
  plugins: [],
};
