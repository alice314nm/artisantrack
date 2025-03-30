/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        lightBeige: "#FFF8E8",
        beige: "#F7EED3",
        darkBeige: "#DED2AE",
        darkerBeige: "#969283",
        blackBeige: "#22150F",
        green: "#ACC86C",
        darkGreen: "#8AA85A",
        red: "#CF4D4D",
        yellow: "#E0C05F",
        darkYellow: "#b08102"
      },
    },
  },
  plugins: [],
};
