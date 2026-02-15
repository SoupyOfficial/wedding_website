import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: {
          DEFAULT: "#0B1D3A",
          50: "#1a3a6e",
          100: "#163260",
          200: "#122a52",
          300: "#0E2244",
          400: "#0B1D3A",
          500: "#081630",
          600: "#060f26",
          700: "#04091c",
          800: "#020412",
          900: "#010208",
        },
        royal: {
          DEFAULT: "#1E3A6E",
          light: "#2a4f8f",
          dark: "#152b52",
        },
        gold: {
          DEFAULT: "#D4A843",
          light: "#e4c373",
          warm: "#C9952B",
          shimmer: "#F0D68A",
          dark: "#a88535",
        },
        forest: {
          DEFAULT: "#2D5F3E",
          light: "#3a7a50",
          dark: "#1f4229",
        },
        sage: {
          DEFAULT: "#7A9E7E",
          light: "#9bbfa0",
          dark: "#5a7d5e",
        },
        ivory: {
          DEFAULT: "#FAF8F0",
          dark: "#F0EDE0",
        },
      },
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        twinkle: "twinkle 3s ease-in-out infinite",
        "twinkle-slow": "twinkle 5s ease-in-out infinite",
        "twinkle-fast": "twinkle 2s ease-in-out infinite",
        shimmer: "shimmer 2s ease-in-out infinite",
        "fade-in": "fadeIn 0.6s ease-out",
        "fade-in-up": "fadeInUp 0.6s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        twinkle: {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "1" },
        },
        shimmer: {
          "0%, 100%": { opacity: "0.7" },
          "50%": { opacity: "1", filter: "brightness(1.2)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-10px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      backgroundImage: {
        "gradient-celestial":
          "linear-gradient(180deg, #0B1D3A 0%, #1E3A6E 50%, #0B1D3A 100%)",
        "gradient-gold":
          "linear-gradient(135deg, #C9952B 0%, #D4A843 50%, #F0D68A 100%)",
      },
      boxShadow: {
        glow: "0 0 15px rgba(212, 168, 67, 0.3)",
        "glow-lg": "0 0 30px rgba(212, 168, 67, 0.4)",
        "glow-gold": "0 0 20px rgba(212, 168, 67, 0.5)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
