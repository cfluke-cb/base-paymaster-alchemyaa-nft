/** @type {import('tailwindcss').Config} */
import t from "tailwindcss-radix";
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [t()],
};
