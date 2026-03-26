import type { Config } from "tailwindcss";
import { heroui } from "@heroui/react";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        light: {
          0: "#dce4ef"
        },
        dark: {
          0: "#263d5f"
        },
        customBlue: {
          0: "#0f68aa",
          1: "rgba(48, 189, 244, 0.15) !important"
        },
        customYellow: {
          0: "#f0721c",
        },
        customPurple: {
          0: "#d444f1"
        }
      },
      padding: {
        "118": "7.375rem",
        "120": "7.5rem",
      },
      width: {
        "480": "30rem",
        "448": "28rem"
      }
    },
  },
  plugins: [heroui()],
};
export default config;
