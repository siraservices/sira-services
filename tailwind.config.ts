import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#8a9f7b",
          dark: "#5a5345",
          light: "#a18f5c",
          50: "#4a4538",
          foreground: "#2a2521",
        },
        surface: {
          DEFAULT: "#3a3529",
          alt: "#413c33",
          nav: "#332e25",
          muted: "#4a4538",
          hover: "#4e493d",
          border: "#5a5345",
        },
        text: {
          DEFAULT: "#ede4d4",
          body: "#d4cbbe",
          muted: "#9a9284",
          dim: "#7a7268",
        },
        cta: {
          DEFAULT: "#8a9f7b",
          text: "#2a2521",
        },
      },
      fontFamily: {
        display: ["var(--font-poppins)", "system-ui", "sans-serif"],
        body: ["var(--font-opensans)", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease-out forwards",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-in": "slideIn 0.5s ease-out forwards",
        "pulse-slow": "pulseSlow 3s ease-in-out infinite",
        "count-up": "countUp 1s ease-out forwards",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        pulseSlow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        countUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      boxShadow: {
        soft: "0 1px 2px rgba(0,0,0,0.05)",
        card: "0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)",
        elevated: "0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.04)",
        "cta-glow": "0 4px 14px rgba(138, 159, 123, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
