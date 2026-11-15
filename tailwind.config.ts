import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: {
          DEFAULT: "var(--surface)",
          card: "var(--surface-card)",
        },
        brand: {
          primary: "var(--primary)",
          "primary-hover": "var(--primary-hover)",
          "primary-fg": "var(--primary-fg)",
          secondary: "var(--secondary)",
          "secondary-hover": "var(--secondary-hover)",
          "secondary-fg": "var(--secondary-fg)",
          accent: "var(--accent)",
          "accent-fg": "var(--accent-fg)",
        },
        text: {
          main: "var(--foreground)",
          muted: "var(--muted)",
          subtle: "var(--subtle)",
          gold: "var(--secondary)",
        },
        theme: {
          border: "var(--border)",
          "border-subtle": "var(--border-subtle)",
          input: "var(--input-bg)",
          "input-border": "var(--input-border)",
          "input-focus": "var(--input-focus)",
        },
        library: {
          50: "#faf8f5",
          100: "#f3ede3",
          200: "#e6d7c3",
          300: "#d4bc9e",
          400: "#c19d77",
          500: "#ab8057",
          600: "#946645",
          700: "#784f38",
          800: "#634131",
          900: "#53372b",
          950: "#2d1b15",
        },
        wood: {
          dark: "#1e130c",
          base: "#2b1c14",
          light: "#3d271c",
          edge: "#4a3225",
          trim: "#c59a67"
        }
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
      },
      boxShadow: {
        'book': '2px 4px 12px rgba(0,0,0,0.4), inset -2px 0 6px rgba(0,0,0,0.3)',
        'book-spine': 'inset -3px 0 5px rgba(0,0,0,0.5), inset 3px 0 5px rgba(255,255,255,0.15)',
        'shelf': '0 12px 24px -6px rgba(0, 0, 0, 0.7), inset 0 2px 4px rgba(255, 255, 255, 0.1)',
      }
    },
  },
  plugins: [],
};

export default config;

