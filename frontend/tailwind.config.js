/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        light: {
          ...require("daisyui/src/theming/themes")["light"],
          "primary": "#ea580c", // Burnt Orange
          "secondary": "#d97706", // Amber/Gold
          "accent": "#dc2626", // Deep Red
          "neutral": "#3d4451",
          "base-100": "#ffffff",
          "base-200": "#f3f4f6",
          "base-300": "#e5e7eb",
        },
        dark: {
          ...require("daisyui/src/theming/themes")["dark"],
          "primary": "#ea580c", // Burnt Orange
          "secondary": "#d97706", // Amber/Gold
          "accent": "#dc2626", // Deep Red
          "neutral": "#1f2937",
          "base-100": "#0f172a", // Slate 900
          "base-200": "#1e293b", // Slate 800
          "base-300": "#334155", // Slate 700
        },
      },
    ],
  },
}

