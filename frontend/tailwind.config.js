/** @type {import('tailwindcss').Config} */
// All design tokens live in src/index.css under @theme (Tailwind v4).
// This file is kept for Vite's content path awareness only.
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: { extend: {} },
  plugins: [],
};
