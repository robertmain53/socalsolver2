import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Palette SoCalSolver (lega ai CSS variables del tuo global.css)
        "sunset-orange": "var(--color-sunset-orange)",
        "sunset-orange-light": "var(--color-sunset-orange-light)",
        "sunset-orange-dark": "var(--color-sunset-orange-dark)",

        "golden-yellow": "var(--color-golden-yellow)",
        "golden-yellow-light": "var(--color-golden-yellow-light)",
        "golden-yellow-dark": "var(--color-golden-yellow-dark)",

        "light-sand": "var(--color-light-sand)",
        "ocean-teal": "var(--color-ocean-teal)",
        "ocean-teal-light": "var(--color-ocean-teal-light)",
        "ocean-teal-dark": "var(--color-ocean-teal-dark)",

        "dark-brown": "var(--color-dark-brown)",
        "dark-brown-light": "var(--color-dark-brown-light)",
        "dark-brown-dark": "var(--color-dark-brown-dark)",

        "cream-bg": "var(--color-cream-bg)",
        "cream-bg-dark": "var(--color-cream-bg-dark)",
      },

      boxShadow: {
        "sunset":
          "0 4px 6px -1px rgba(242,107,46,0.10), 0 2px 4px -1px rgba(242,107,46,0.06)",
        "ocean":
          "0 4px 6px -1px rgba(60,157,167,0.10), 0 2px 4px -1px rgba(60,157,167,0.06)",
        "warm":
          "0 10px 15px -3px rgba(249,185,52,0.10), 0 4px 6px -2px rgba(242,107,46,0.05)",
        "deep":
          "0 20px 25px -5px rgba(58,42,26,0.15), 0 10px 10px -5px rgba(58,42,26,0.08)",
      },

      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        glow: {
          "0%,100%": { boxShadow: "0 0 20px rgba(242,107,46,0.30)" },
          "50%": { boxShadow: "0 0 30px rgba(242,107,46,0.50)" },
        },
      },

      animation: {
        "fade-in": "fadeIn 0.6s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        shimmer: "shimmer 1.5s infinite",
        glow: "glow 2s ease-in-out infinite",
      },

      // Utility per gradienti in linea con le classi CSS custom
      backgroundImage: {
        "gradient-sunset":
          "linear-gradient(135deg, var(--color-golden-yellow), var(--color-sunset-orange))",
        "gradient-ocean":
          "linear-gradient(135deg, var(--color-ocean-teal), var(--color-dark-brown))",
        "gradient-sand":
          "linear-gradient(135deg, var(--color-cream-bg), var(--color-cream-bg-dark))",
        "gradient-warm":
          "linear-gradient(135deg, var(--color-sunset-orange-light), var(--color-golden-yellow))",
      },
    },
  },
  plugins: [],
}

export default config
