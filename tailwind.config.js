/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./context/**/*.{js,jsx}",
    "./hooks/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6366f1",
        "primary-dark": "#4f46e5",
        brand: {
          50:  "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
        surface: {
          0:   "#ffffff",
          50:  "#f8f8fc",
          100: "#f1f1f8",
          200: "#e8e8f2",
        },
        ink: {
          50:  "#f5f5f9",
          100: "#ebebf5",
          200: "#d1d1e8",
          400: "#8888aa",
          600: "#555577",
          900: "#0d0d1a",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "soft":    "0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
        "card":    "0 4px 24px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)",
        "popup":   "0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
        "brand":   "0 4px 20px rgba(99,102,241,0.3)",
        "brand-lg":"0 8px 32px rgba(99,102,241,0.35)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #6366f1, #8b5cf6)",
        "brand-gradient-vivid": "linear-gradient(135deg, #4f46e5, #7c3aed)",
        "hero-gradient": "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)",
      },
      animation: {
        "fade-in":  "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.25s cubic-bezier(0.16,1,0.3,1)",
        "scale-in": "scaleIn 0.2s cubic-bezier(0.16,1,0.3,1)",
      },
      keyframes: {
        fadeIn:  { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        slideUp: { "0%": { opacity: 0, transform: "translateY(10px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        scaleIn: { "0%": { opacity: 0, transform: "scale(0.96)" }, "100%": { opacity: 1, transform: "scale(1)" } },
      },
    },
  },
  plugins: [],
};
