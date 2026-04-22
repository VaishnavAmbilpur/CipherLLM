import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050505",
        surface: "#0D0D10",
        elevated: "#15151A",
        primary: "#00F5FF",
        secondary: "#7B61FF",
        "border-subtle": "rgba(255, 255, 255, 0.05)",
        "border-active": "rgba(255, 255, 255, 0.15)",
        textMain: "#FFFFFF",
        textDim: "#A1A1AA",
        textMuted: "#52525B",
        danger: "#FF4D4D",
        success: "#00FF94",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Outfit", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
