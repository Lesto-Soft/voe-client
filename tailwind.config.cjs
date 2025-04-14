/** @type {import('tailwindcss').Config} */
export default {
  purge: ["./src/**/*.{js,ts,jsx,tsx,ts}"], // paths to scan for classes
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
