/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#747574", // for text-accent
          hover: "#bed453", // for hover states
          bg: "#000000", // for bg-accent-bg
          "bg-hover": "#1d4ed8", // for hover:bg-accent-bg-hover
          light: "#60a5fa", // if you want lighter variations
          dark: "#1e40af", // if you want darker variations
        },
      },
      boxShadow: {
        "accent-hover": "0 4px 15px rgba(29, 78, 216, 0.3)", // Shadow based on accent.hover color
      },
    },
  },
  plugins: [],
};
