import type { Config } from "tailwindcss";

/**
 * Tuju design system — "The Guided Path".
 * Tokens sourced from frontend/design/tuju/DESIGN.md.
 */
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f7f9fb",
        "on-background": "#191c1e",
        surface: "#f7f9fb",
        "surface-dim": "#d8dadc",
        "surface-bright": "#f7f9fb",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f2f4f6",
        "surface-container": "#eceef0",
        "surface-container-high": "#e6e8ea",
        "surface-container-highest": "#e0e3e5",
        "surface-variant": "#e0e3e5",
        "on-surface": "#191c1e",
        "on-surface-variant": "#444650",
        "inverse-surface": "#2d3133",
        "inverse-on-surface": "#eff1f3",
        outline: "#757682",
        "outline-variant": "#c5c6d2",
        "surface-tint": "#435b9f",
        primary: "#00113a",
        "on-primary": "#ffffff",
        "primary-container": "#002366",
        "on-primary-container": "#758dd5",
        "inverse-primary": "#b3c5ff",
        "primary-fixed": "#dbe1ff",
        "primary-fixed-dim": "#b3c5ff",
        "on-primary-fixed": "#00174a",
        "on-primary-fixed-variant": "#2a4386",
        secondary: "#2552ca",
        "on-secondary": "#ffffff",
        "secondary-container": "#446ce4",
        "on-secondary-container": "#fffbff",
        "secondary-fixed": "#dce1ff",
        "secondary-fixed-dim": "#b6c4ff",
        "on-secondary-fixed": "#00164e",
        "on-secondary-fixed-variant": "#003baf",
        tertiary: "#001813",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#002f27",
        "on-tertiary-container": "#00a28c",
        "tertiary-fixed": "#26fedc",
        "tertiary-fixed-dim": "#00dfc1",
        "on-tertiary-fixed": "#00201a",
        "on-tertiary-fixed-variant": "#005144",
        error: "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
        accent: {
          teal: "#00f5d4",
          purple: "#7b2cbf",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        label: ["var(--font-geist-sans)", "Geist", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      fontSize: {
        "display-lg": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display-lg-mobile": ["32px", { lineHeight: "40px", letterSpacing: "-0.01em", fontWeight: "700" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "label-sm": ["12px", { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "500" }],
        button: ["16px", { lineHeight: "20px", fontWeight: "600" }],
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem",
      },
      boxShadow: {
        // Navy-tinted elevation instead of heavy black shadows
        "navy-sm": "0px 4px 12px rgba(0, 35, 102, 0.06)",
        navy: "0px 10px 30px rgba(0, 35, 102, 0.08)",
        "navy-lg": "0px 20px 50px rgba(0, 35, 102, 0.12)",
        "glow-teal": "0 0 0 3px rgba(0, 245, 212, 0.25)",
        "glow-purple": "0 0 20px rgba(123, 44, 191, 0.35)",
      },
      maxWidth: {
        container: "1280px",
      },
      spacing: {
        gutter: "24px",
        "section-gap": "80px",
      },
    },
  },
  plugins: [],
};
export default config;
