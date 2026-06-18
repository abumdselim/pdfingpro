import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Override teal to be our primary blue #137ece to globally update all UI elements
        teal: {
          50: '#f0f7fe',
          100: '#ddeffd',
          200: '#bfe0fb',
          300: '#90cbf8',
          400: '#5bb0f3',
          500: '#3596ec',
          600: '#137ece',
          700: '#1a64c4',
          800: '#19519f',
          900: '#19467f',
          950: '#112d53',
        },
        // Surface
        "surface": "#fcf8fa",
        "surface-dim": "#dcd9db",
        "surface-bright": "#fcf8fa",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f6f3f5",
        "surface-container": "#f0edef",
        "surface-container-high": "#eae7e9",
        "surface-container-highest": "#e4e2e4",
        "on-surface": "#1b1b1d",
        "on-surface-variant": "#45464d",
        "inverse-surface": "#303032",
        "inverse-on-surface": "#f3f0f2",
        "outline": "#76777d",
        "outline-variant": "#c6c6cd",
        // Primary (black)
        "primary": "#000000",
        "on-primary": "#ffffff",
        "primary-container": "#131b2e",
        "on-primary-container": "#7c839b",
        // Secondary (old teal override)
        "secondary": "#137ece",
        "on-secondary": "#ffffff",
        "secondary-container": "#bfe0fb",
        "on-secondary-container": "#112d53",
        // Error
        "error": "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
        // Background
        "background": "#f8fafc",
        "on-background": "#0f172a",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        caption: ["Work Sans", "system-ui", "sans-serif"],
        label: ["Work Sans", "system-ui", "sans-serif"],
      },
      fontSize: {
        "h1": ["36px", { lineHeight: "44px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "h2": ["24px", { lineHeight: "32px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "label-sm": ["14px", { lineHeight: "20px", letterSpacing: "0.01em", fontWeight: "500" }],
        "caption": ["12px", { lineHeight: "16px", fontWeight: "400" }],
      },
      spacing: {
        "base": "4px",
        "xs": "8px",
        "sm": "16px",
        "md": "24px",
        "lg": "48px",
        "xl": "80px",
        "gutter": "24px",
        "sidebar-width": "280px",
        "container-max": "1440px",
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        sm: "0.25rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        full: "9999px",
      },
      boxShadow: {
        card: "0px 1px 3px 0px rgba(0,0,0,0.07), 0px 1px 2px -1px rgba(0,0,0,0.04)",
        overlay: "0px 10px 15px -3px rgba(0,0,0,0.05), 0px 4px 6px -2px rgba(0,0,0,0.025)",
        glass: "0 8px 32px 0 rgba(19, 126, 206, 0.15)",
        modern: "0 20px 40px -10px rgba(0,0,0,0.08), 0 0 20px -5px rgba(19, 126, 206, 0.05)",
        glow: "0 0 20px rgba(19, 126, 206, 0.4)",
        bento: "0 2px 4px rgba(0,0,0,0.02), 0 4px 12px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.05)",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.5s ease-out forwards",
        "float": "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
