import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F6F4EF",
        surface: "#FDFCFA",
        ink: "#17140F",
        muted: "#6C6458",
        faint: "#9B9386",
        line: "#E7E1D4",
        lineStrong: "#D7CFBF",
        bronze: "#8A6A3B",
        gold: "#B18845",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Inter",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        display: [
          "Iowan Old Style",
          "Palatino Linotype",
          "Palatino",
          "Georgia",
          "Times New Roman",
          "serif",
        ],
      },
      letterSpacing: {
        tightest: "-0.03em",
      },
    },
  },
  plugins: [],
};

export default config;
