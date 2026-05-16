import type { Config } from "tailwindcss"

export default {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0F",
        card: "#11111A",
        primary: "#7C3AED",
        accent: "#22D3EE",
      },
      boxShadow: {
        glow: "0 0 40px rgba(124, 58, 237, 0.4)",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config