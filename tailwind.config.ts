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
        thaagai: {
          maroon: "#741832",
          burgundy: "#5E1028",
          gold: "#B78A45",
          rose: "#E9A0B7",
          ivory: "#F7F2EB",
          cardWhite: "#FFFFFF",
          ink: "#211D1E",
          secondary: "#766E6B",
          line: "#E2D6C9",
          green: "#16835D",
          red: "#B42335",
          // Backward-compatible aliases
          wine: "#741832",
          wineHover: "#5E1028",
          goldHover: "#9F7535",
          bg: "#F7F2EB",
          sand: "#EDE5DA",
          cardDark: "#1c1917",
          sandDark: "#2a2522",
          inkDark: "#f3ece3",
        },
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-noto-sans)", "system-ui", "sans-serif"],
        tamil: ["var(--font-noto-tamil)", "sans-serif"],
      },
      minHeight: {
        touch: "44px",
      },
      minWidth: {
        touch: "44px",
      },
    },
  },
  plugins: [],
};

export default config;
