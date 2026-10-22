/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#14141A",
          soft: "#23232B",
          muted: "#3A3A45",
        },
        ivory: {
          DEFAULT: "#FAF7F0",
          dark: "#F0EADF",
        },
        gold: {
          DEFAULT: "#C9A227",
          light: "#E3C566",
          dark: "#9C7C14",
        },
        clay: "#B4552D",
      },
      fontFamily: {
        display: ["Playfair Display", "Amiri", "serif"],
        sans: ["Inter", "Cairo", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(20,20,26,0.06), 0 8px 24px rgba(20,20,26,0.08)",
        lift: "0 2px 4px rgba(20,20,26,0.08), 0 16px 40px rgba(20,20,26,0.14)",
      },
    },
  },
  plugins: [],
};
