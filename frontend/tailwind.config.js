/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: "#2D6A4F",
          light: "#EAF4EE",
        },
        ink: "#1A1917",
        critical: {
          DEFAULT: "#C0392B",
          bg: "#FDECEA",
        },
        warning: {
          DEFAULT: "#B7691A",
          bg: "#FDF3E3",
        },
        entity: {
          diagnosis: "#7C3AED",
          symptom: "#C0392B",
          lab: "#B7691A",
          medication: "#1A6E3C",
        },
        page: "#F9F8F6",
        surface: "#FFFFFF",
        border: "#E8E5E0",
        faint: "#ABA8A3",
        muted: "#7A7570",
      },
      fontFamily: {
        display: ["Lora", "serif"],
        body: ["Inter", "sans-serif"],
      },
      fontSize: {
        /* Brand book gives a print/doc point scale (36/24/18/14/13/11/9/8pt).
           Mapped up to legible web pixel sizes, same hierarchy + ratios. */
        display: ["44px", { lineHeight: "1.15" }],
        h1: ["30px", { lineHeight: "1.15" }],
        h2: ["22px", { lineHeight: "1.2" }],
        h3: ["17px", { lineHeight: "1.3" }],
        "body-lg": ["17px", { lineHeight: "1.65" }],
        body: ["15px", { lineHeight: "1.65" }],
        "body-sm": ["13px", { lineHeight: "1.6" }],
        label: ["11px", { lineHeight: "1" }],
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        "2xl": "48px",
        "3xl": "64px",
      },
      borderRadius: {
        tag: "4px",
        btn: "8px",
        card: "10px",
        modal: "16px",
        pill: "999px",
      },
      maxWidth: {
        content: "1100px",
      },
      transitionDuration: {
        150: "150ms",
      },
    },
  },
  plugins: [],
};
