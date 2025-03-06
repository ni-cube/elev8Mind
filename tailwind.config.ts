import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#72bbce",
        lighter: "#a7d7e4",
        lightest: "#e8f4f7",
        darker: "#5999ab",
        darkest: "#082a32",
        text: "#2c5561",
      },
      animation: {
        pumpHeart: 'pumpHeart 1s infinite', // Register animation
      },
      keyframes: {
        pumpHeart: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
      },      
    },
  },
  plugins: [],
} satisfies Config;
