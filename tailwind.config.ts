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
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        heartPop: {
          "0%": { transform: "scale(1)" },
          "25%": { transform: "scale(1.3)" },
          "50%": { transform: "scale(0.9)" },
          "75%": { transform: "scale(1.15)" },
          "100%": { transform: "scale(1)" },
        },
        badgePulse: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.04)" },
        },
        rippleGlow: {
          "0%": { transform: "scale(0.95)", opacity: "0.7" },
          "50%": { transform: "scale(1.15)", opacity: "0.25" },
          "100%": { transform: "scale(1.35)", opacity: "0" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        shimmer: "shimmer 2.5s infinite linear",
        float: "float 4s ease-in-out infinite",
        "heart-pop": "heartPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        "badge-pulse": "badgePulse 3s ease-in-out infinite",
        "ripple-glow": "rippleGlow 2.5s cubic-bezier(0, 0.2, 0.8, 1) infinite",
        "slide-down": "slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-up": "slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-in": "scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
