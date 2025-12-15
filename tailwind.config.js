export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
      // add screens here instead of replacing defaults entirely
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",

        // custom compact-only breakpoint (exactly 768-1023)
        mdx: { min: "768px", max: "1023px" },

        // your extra large breakpoints
        "3xl": "1920px",
        "4xl": "2560px",
      },
    },
  },
  plugins: [],
};
