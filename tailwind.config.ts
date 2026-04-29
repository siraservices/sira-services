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
        /* Brand System v1.1 tokens */
        ink: "#0A0A0A",
        paper: "#FAFAF7",
        charcoal: "#2A2A2A",
        muted: "#6B6B6B",

        /* Semantic mapping — keeps existing class names working */
        primary: {
          DEFAULT: "#0A0A0A",
          dark: "#1A1A1A",
          light: "#2A2A2A",
          50: "rgba(10, 10, 10, 0.05)",
          foreground: "#FAFAF7",
        },
        surface: {
          DEFAULT: "#FAFAF7",
          alt: "#FFFFFF",
          nav: "#FAFAF7",
          muted: "#F0F0EC",
          hover: "rgba(10, 10, 10, 0.04)",
          border: "rgba(10, 10, 10, 0.1)",
        },
        text: {
          DEFAULT: "#0A0A0A",
          body: "#2A2A2A",
          muted: "#6B6B6B",
          dim: "#9A9A9A",
        },
        cta: {
          DEFAULT: "#0A0A0A",
          text: "#FAFAF7",
        },
      },
      fontFamily: {
        display: ["var(--font-manrope)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        pill: "999px",
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
        elevated:
          "0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.04)",
        "cta-glow": "0 4px 14px rgba(10, 10, 10, 0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
