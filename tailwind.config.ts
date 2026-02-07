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
        nexus: {
          black: "#000000",
          darkest: "#0A0A0A",
          dark: "#111111",
          cyan: "#00F0FF",
          cyanGlow: "#00D9FF",
          blue: "#0066FF",
          purple: "#6B4FFF",
          gray: {
            900: "#0F0F0F",
            800: "#1A1A1A",
            700: "#262626",
            500: "#737373",
            400: "#A3A3A3",
          },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      animation: {
        marquee: "marquee 30s linear infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "flow-pulse": "flow-pulse 2s ease-in-out infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "glow-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 15px rgba(0, 240, 255, 0.3)",
            borderColor: "rgba(0, 240, 255, 0.3)",
          },
          "50%": {
            boxShadow: "0 0 25px rgba(0, 240, 255, 0.5)",
            borderColor: "rgba(0, 240, 255, 0.5)",
          },
        },
        "flow-pulse": {
          "0%, 100%": { opacity: "0.4", transform: "scaleY(1)" },
          "50%": { opacity: "1", transform: "scaleY(1.1)" },
        },
      },
      boxShadow: {
        neon: "0 0 15px rgba(0, 240, 255, 0.5)",
        "neon-strong": "0 0 30px rgba(0, 240, 255, 0.7)",
      },
    },
  },
  plugins: [],
};
export default config;
