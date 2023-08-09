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
          50: "#83cdf0",
          100: "#6dc4ed",
          200: "#56bbea",
          300: "#40b1e7",
          400: "#29a8e4",
          500: "#1B9CD9",
          600: "#188cc2",
          700: "#157bac",
          800: "#136b95",
          900: "#105b7e",
        },
        text: {
          50: "#d4d4d4",
          100: "#c7c7c7",
          200: "#bababa",
          300: "#aeaeae",
          400: "#a1a1a1",
          500: "#949494",
          600: "#878787",
          700: "#7b7b7b",
          800: "#6e6e6e",
          900: "#616161",
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
};

export default config;
