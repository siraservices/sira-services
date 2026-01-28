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
          DEFAULT: "#CC7722",
          dark: "#B36A1E",
          light: "#E8943A",
        },
        surface: {
          DEFAULT: "#1a1a1a",
          light: "#252525",
          dark: "#0f0f0f",
        },
      },
    },
  },
  plugins: [],
};

export default config;
