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
        background: {
          primary: "#0A0A0F",
          surface: "#111118",
          elevated: "#16161F",
        },
        border: {
          DEFAULT: "#1E1E2E",
          accent: "#2A2A3E",
        },
        text: {
          primary: "#F0F0F5",
          secondary: "#7A7A9A",
          muted: "#3A3A5A",
        },
        accent: {
          green: "#00FF88",
          red: "#FF4466",
          blue: "#4488FF",
          yellow: "#FFCC44",
        },
      },
      fontFamily: {
        display: ["Space Mono", "monospace"],
        heading: ["Syne", "sans-serif"],
        body: ["DM Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        'glow-green': '0 0 20px rgba(0, 255, 136, 0.25)',
        'glow-red': '0 0 20px rgba(255, 68, 102, 0.25)',
      }
    },
  },
  plugins: [],
} satisfies Config;
