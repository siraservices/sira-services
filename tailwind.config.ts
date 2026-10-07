import type { Config } from "tailwindcss";

/**
 * SIRA design system v2 (premium site system).
 *
 * Color slots: primary (buttons, icons, accents), primary-dark (hover, text
 * on light), primary-light (tints), accent (sparingly), background, surface,
 * ink, muted, divider and deep (dark sections: services grid, footer, hero).
 *
 * The older semantic names (surface.*, text.*, cta.*) are kept so existing
 * class names keep working; they now map onto the v2 slots.
 */
const PRIMARY = "#0B4A2F";
const PRIMARY_DARK = "#083524";
const PRIMARY_LIGHT = "#1F8A52";
const ACCENT = "#C2410C";
const ACCENT_DARK = "#9A3412";
const BACKGROUND = "#F9F9F9";
const SURFACE = "#FFFFFF";
const INK = "#1A1A1A";
const MUTED = "#6A6A6A";
const DIVIDER = "#E0E0E0";
const DEEP = "#0F1419";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* v2 slots */
        ink: INK,
        paper: BACKGROUND,
        charcoal: "#2A2A2A",
        muted: MUTED,
        divider: DIVIDER,
        deep: DEEP,
        background: BACKGROUND,
        accent: {
          DEFAULT: ACCENT,
          dark: ACCENT_DARK,
        },
        primary: {
          DEFAULT: PRIMARY,
          dark: PRIMARY_DARK,
          light: PRIMARY_LIGHT,
          50: "rgba(11, 74, 47, 0.08)",
          foreground: "#FFFFFF",
        },

        /* Semantic mapping — keeps existing class names working */
        surface: {
          DEFAULT: BACKGROUND,
          alt: SURFACE,
          nav: BACKGROUND,
          muted: "#F2F2F4",
          hover: "rgba(26, 26, 26, 0.04)",
          border: DIVIDER,
        },
        text: {
          DEFAULT: INK,
          body: "#2A2A2A",
          muted: MUTED,
          dim: "#9A9A9A",
        },
        cta: {
          DEFAULT: PRIMARY,
          dark: PRIMARY_DARK,
          text: "#FFFFFF",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        pill: "999px",
        "2.5xl": "1.25rem",
        "4xl": "2rem",
        "5xl": "2.5rem",
        "6xl": "3rem",
        "7xl": "4rem",
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease-out forwards",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-in": "slideIn 0.5s ease-out forwards",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "count-up": "countUp 1s ease-out forwards",
        blink: "blink 1s step-end infinite",
        float: "float 6s ease-in-out infinite",
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
        countUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      boxShadow: {
        soft: "0 1px 2px rgba(0,0,0,0.05)",
        card: "0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)",
        elevated:
          "0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.04)",
        "cta-glow": "0 4px 14px rgba(11, 74, 47, 0.3)",
        /* Glass elevation (see .glass* in globals.css) */
        glass: "inset 0 1px 0 rgba(255,255,255,0.75), 0 12px 32px -16px rgba(26,26,26,0.18)",
        "glass-strong":
          "inset 0 1px 0 rgba(255,255,255,0.75), 0 24px 60px -24px rgba(26,26,26,0.28)",
      },
    },
  },
  plugins: [],
};

export default config;
