import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px"
      }
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        gold: {
          50: "#FFFBF0",
          100: "#FFF5DC",
          200: "#FFEAB8",
          300: "#FFDC8A",
          400: "#E8A73B",
          500: "#C6932F",
          600: "#A67925",
          700: "#8B6914",
          800: "#6B4F0E",
          900: "#4A3609"
        },
        cyber: {
          50: "#F0F9FF",
          100: "#E0F2FE",
          200: "#B9E1FE",
          300: "#7CC9F7",
          400: "#38B2F0",
          500: "#0EA5E9",
          600: "#0284C7",
          700: "#0369A1",
          800: "#075985",
          900: "#0C1825"
        },
        emerald: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
          800: "#065F46",
          900: "#0A1F1A"
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      keyframes: {
        "slide-up": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" }
        },
        "slide-down": {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" }
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" }
        },
        "pulse-gold": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(198, 147, 47, 0.7)" },
          "50%": { boxShadow: "0 0 0 10px rgba(198, 147, 47, 0)" }
        }
      },
      animation: {
        "slide-up": "slide-up 0.5s ease-out",
        "slide-down": "slide-down 0.5s ease-out",
        "fade-in": "fade-in 0.3s ease-in",
        shimmer: "shimmer 2s linear infinite",
        "pulse-gold": "pulse-gold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-clash)", "system-ui", "sans-serif"],
        editorial: ["var(--font-editorial)", "Georgia", "serif"],
        mono: ["var(--font-jetbrains)", "monospace"]
      },
      boxShadow: {
        glow: "0 0 30px rgba(14, 165, 233, 0.18)",
        gold: "0 14px 40px rgba(198, 147, 47, 0.22)"
      },
      backgroundImage: {
        "grid-fade": "radial-gradient(circle at top, rgba(14,165,233,0.16), transparent 45%), radial-gradient(circle at bottom right, rgba(198,147,47,0.12), transparent 35%)"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
}

export default config
