import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
    "./utils/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#061f43",
          900: "#082a5a",
          800: "#0b3d91"
        },
        growth: {
          blue: "#155bd7",
          cyan: "#1fb6d9",
          green: "#10a884",
          orange: "#ff7a1a",
          purple: "#7c5cff"
        }
      },
      boxShadow: {
        soft: "0 20px 55px rgba(26, 42, 73, 0.11)",
        sidebar: "inset -1px 0 0 rgba(255,255,255,0.08)"
      }
    }
  },
  plugins: []
};

export default config;
