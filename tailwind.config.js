/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // base premium
        bg: "#F6F7FB",        // gris muy claro
        surface: "#FFFFFF",   // cards
        border: "#E6E8EF",    // borde sutil
        text: "#111827",
        muted: "#6B7280",

        // marca (podés cambiar después)
        primary: "#2563EB",
        primaryDark: "#1D4ED8",
        danger: "#DC2626",
      },
      borderRadius: {
        xl: "16px",
        "2xl": "20px",
      },
    },
  },
  plugins: [],
};
