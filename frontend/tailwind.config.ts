import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}", "./frontend/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-plus-jakarta-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        bg:       "#060c16",
        canvas:   "#f8fafc",
        surface:  "#0d1625",
        "surface-2": "#111d2e",
        "surface-3": "#1a2740",
        accent:   "#00d4aa",
        "accent-dim": "#00b894",
        ink:      "#e8f4f8",
        muted:    "#7a9bb5",
        dim:      "#4a6580",
        border:   "rgba(99,179,237,0.08)",
        "border-bright": "rgba(99,179,237,0.18)",
        teal: {
          650: "#0f766e",
          750: "#115e59",
          850: "#134e4a",
        },
        indigo: {
          650: "#4f46e5",
        },
        rose: {
          650: "#e11d48",
        },
        slate: {
          150: "#e9eef5",
          450: "#718096",
          650: "#475569",
        },
      },
      spacing: {
        "4.5": "1.125rem",
        "8.5": "2.125rem",
        "9.5": "2.375rem",
      },
      fontSize: {
        "2.5xl": ["1.75rem", { lineHeight: "2.125rem" }],
      },
      boxShadow: {
        glow:      "0 0 30px rgba(0,212,170,0.25), 0 0 60px rgba(0,212,170,0.1)",
        "glow-sm": "0 0 15px rgba(0,212,170,0.2)",
        "card":    "0 20px 60px -20px rgba(0,0,0,0.8)",
        "float":   "0 30px 80px -10px rgba(0,0,0,0.9)",
        "inner-glow": "inset 0 1px 0 rgba(255,255,255,0.05)",
        soft: "0 18px 45px -24px rgba(15,23,42,0.35)",
        lift: "0 22px 60px -28px rgba(15,23,42,0.55)",
        "glow-teal": "0 18px 45px -25px rgba(15,118,110,0.65)",
        "glow-blue": "0 18px 45px -25px rgba(37,99,235,0.55)",
        "glow-amber": "0 18px 45px -25px rgba(245,158,11,0.55)",
        "glow-rose": "0 18px 45px -25px rgba(225,29,72,0.55)",
      },
      backgroundImage: {
        "accent-gradient": "linear-gradient(135deg, #00d4aa, #00b894)",
        "vibrant-gradient": "linear-gradient(135deg, #00d4aa 0%, #4facfe 50%, #a78bfa 100%)",
        "card-gradient": "linear-gradient(135deg, rgba(17,29,46,0.9) 0%, rgba(10,15,30,0.95) 100%)",
        "hero-gradient": "radial-gradient(ellipse at 50% 0%, rgba(0,212,170,0.15) 0%, transparent 60%)",
      },
      animation: {
        "fade-up": "fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in": "fadeIn 0.3s ease forwards",
        "float":   "float 6s ease-in-out infinite",
        "spin-slow": "spin-slow 20s linear infinite",
        "shimmer": "shimmer 3s linear infinite",
        "pulse-ring": "pulse-ring 2s ease-out infinite",
        "gradient-shift": "gradient-shift 4s ease infinite",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "33%":       { transform: "translateY(-12px) rotate(1deg)" },
          "66%":       { transform: "translateY(-6px) rotate(-1deg)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to:   { transform: "rotate(360deg)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        "pulse-ring": {
          "0%":   { transform: "scale(0.8)", opacity: "1" },
          "100%": { transform: "scale(2)", opacity: "0" },
        },
        "gradient-shift": {
          "0%":   { backgroundPosition: "0% 50%" },
          "50%":  { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
