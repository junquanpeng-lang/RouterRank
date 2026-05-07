import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Instrument Serif"', "serif"],
        sans: ['"General Sans"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      colors: {
        ink: {
          DEFAULT: "rgb(var(--ink) / <alpha-value>)",
          800: "rgb(var(--ink-800) / <alpha-value>)",
          700: "rgb(var(--ink-700) / <alpha-value>)",
          600: "rgb(var(--ink-600) / <alpha-value>)",
          500: "rgb(var(--ink-500) / <alpha-value>)",
        },
        bone: "rgb(var(--bone) / <alpha-value>)",
        ash: "rgb(var(--ash) / <alpha-value>)",
        smoke: "rgb(var(--smoke) / <alpha-value>)",
        brand: {
          DEFAULT: "rgb(var(--brand) / <alpha-value>)",
          deep: "rgb(var(--brand-deep) / <alpha-value>)",
        },
        amber: "rgb(var(--amber) / <alpha-value>)",
        coral: "rgb(var(--coral) / <alpha-value>)",
        sky: "rgb(var(--sky) / <alpha-value>)",
      },
      letterSpacing: {
        tighter: "-0.04em",
        editorial: "-0.03em",
      },
    },
  },
  plugins: [],
};

export default config;
