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
          DEFAULT: "#E30613",
          hover: "#FF1A2A",
          dark: "#B00510",
        },
        silver: "#C0C0C0",
        surface: {
          DEFAULT: "#F5F5F5",
          card: "#FFFFFF",
          header: "#1A1A1A",
          footer: "#111111",
          border: "#E2E2E2",
        },
        heading: "#111111",
        body: "#333333",
        muted: "#888888",
        // Legacy aliases for accent (used throughout components)
        accent: {
          DEFAULT: "#E30613",
          light: "#FF1A2A",
          dark: "#B00510",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
