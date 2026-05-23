import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#14211f",
        mist: "#eef4f1",
        pine: "#0f5d56",
        mint: "#44c5a1",
        coral: "#f06f61",
        amber: "#f0ad4e",
        steel: "#57706b"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(21, 33, 31, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
