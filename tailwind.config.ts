import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#E30613",
          hover: "#FF1A2A",
          dark: "#B00510",
        },
        silver: "#C0C0C0",
        surface: {
          DEFAULT: "rgb(var(--color-surface) / <alpha-value>)",
          card: "rgb(var(--color-surface-card) / <alpha-value>)",
          header: "rgb(var(--color-surface-header) / <alpha-value>)",
          footer: "rgb(var(--color-surface-footer) / <alpha-value>)",
          border: "rgb(var(--color-surface-border) / <alpha-value>)",
        },
        heading: "rgb(var(--color-heading) / <alpha-value>)",
        body: "rgb(var(--color-body) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        // Legacy aliases for accent (used throughout components)
        accent: {
          DEFAULT: "#E30613",
          light: "#FF1A2A",
          dark: "#B00510",
        },
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
        display: ["'DM Serif Display'", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
        "card-hover":
          "0 20px 40px -12px rgb(0 0 0 / 0.1), 0 4px 12px -2px rgb(0 0 0 / 0.05)",
        header: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
      },
      borderRadius: {
        card: "0.875rem",
      },
      fontSize: {
        "display-xl": [
          "3.25rem",
          { lineHeight: "1.1", letterSpacing: "-0.02em" },
        ],
        "display-lg": [
          "2.5rem",
          { lineHeight: "1.15", letterSpacing: "-0.015em" },
        ],
        "display-md": [
          "1.875rem",
          { lineHeight: "1.2", letterSpacing: "-0.01em" },
        ],
        "display-sm": [
          "1.5rem",
          { lineHeight: "1.25", letterSpacing: "-0.005em" },
        ],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
