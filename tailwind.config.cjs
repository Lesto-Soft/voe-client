/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "light",
  purge: ["./src/**/*.{js,ts,jsx,tsx,ts}"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        overlayShow: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        overlayHide: {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        contentHide: {
          from: { opacity: "1", transform: "translate(-50%, -50%) scale(1)" },
          to: { opacity: "0", transform: "translate(-50%, -48%) scale(0.96)" },
        },
        contentShow: {
          from: {
            opacity: "0",
            transform: "translate(-50%, -48%) scale(0.96)",
          },
          to: { opacity: "1", transform: "translate(-50%, -50%) scale(1)" },
        },
      },
      animation: {
        overlayShow: "overlayShow 250ms cubic-bezier(0.16, 1, 0.3, 1)",
        overlayHide: "overlayHide 250ms cubic-bezier(0.16, 1, 0.3, 1)",
        contentShow: "contentShow 250ms cubic-bezier(0.16, 1, 0.3, 1)",
        contentHide: "contentHide 250ms cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
