// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-playfair)", "Georgia", "serif"],
        body: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        sage: {
          50: "#f4f7f5",
          100: "#e6eeea",
          200: "#ccddd5",
          300: "#a5c4b5",
          400: "#77a48f",
          500: "#6B9080",
          600: "#4d7a69",
          700: "#3e6255",
          800: "#344f45",
          900: "#2c423a",
        },
        terracotta: {
          50: "#fdf5f2",
          100: "#fae8e0",
          200: "#f4d0c0",
          300: "#ecad93",
          400: "#e18060",
          500: "#D4856A",
          600: "#c45e3f",
          700: "#a44b30",
          800: "#883f2b",
          900: "#713828",
        },
        lavender: {
          50: "#f5f3fb",
          100: "#ece8f6",
          200: "#dcd4ef",
          300: "#c2b5e3",
          400: "#a490d3",
          500: "#8B7EC8",
          600: "#7664b8",
          700: "#6453a0",
          800: "#544585",
          900: "#45396c",
        },
        cream: {
          50: "#fdfcf8",
          100: "#faf8f0",
          200: "#f4f0e4",
          300: "#ede6d3",
          400: "#e0d5b9",
          500: "#cfc09a",
        },
        forest: {
          900: "#1a2e25",
          800: "#1f3a2d",
          700: "#254736",
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        card: "0 2px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
        "card-hover": "0 8px 32px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06)",
        soft: "0 4px 24px rgba(107, 144, 128, 0.15)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
        "bounce-soft": "bounceSoft 0.5s ease-out",
        "check-pop": "checkPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(16px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateX(-12px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        bounceSoft: {
          "0%": { transform: "scale(0.95)" },
          "60%": { transform: "scale(1.02)" },
          "100%": { transform: "scale(1)" },
        },
        checkPop: {
          "0%": { transform: "scale(0)" },
          "70%": { transform: "scale(1.2)" },
          "100%": { transform: "scale(1)" },
        },
      },
      spacing: {
        "safe-bottom": "env(safe-area-inset-bottom)",
        "safe-top": "env(safe-area-inset-top)",
      },
    },
  },
  plugins: [],
};
export default config;
