/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: ["class"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      colors: {
        brand: {
          teal: {
            50: "#E0FFF8",
            100: "#B3FFF0",
            200: "#80FFE6",
            300: "#4DFFDC",
            400: "#1AFFD1",
            500: "#00D4A8",
            600: "#00B88F",
            700: "#009977",
            800: "#007D60",
            900: "#00614A",
          },
          orange: {
            50: "#FFF8E6",
            100: "#FFECB3",
            200: "#FFD87F",
            300: "#FFC44D",
            400: "#FFB01A",
            500: "#FF9500",
            600: "#E67A00",
            700: "#CC6600",
            800: "#B35200",
            900: "#993D00",
          },
        },
        volunteer: {
          50: "#E0FFF8",
          100: "#B3FFF0",
          200: "#80FFE6",
          300: "#4DFFDC",
          400: "#1AFFD1",
          500: "#00D4A8",
          600: "#00B88F",
          700: "#009977",
          800: "#007D60",
          900: "#00614A",
        },
        accent: {
          coral: "#FF6B9D",
          blue: "#0EA5E9",
          yellow: "#FCD34D",
          purple: "#A78BFA",
        },
      },
      backgroundImage: {
        "gradient-hero":
          "linear-gradient(135deg, #E0FFF8 0%, #FFFFFF 50%, #FFF8E6 100%)",
        "gradient-vibrant": "linear-gradient(135deg, #00D4A8 0%, #FF9500 100%)",
        "gradient-warm": "linear-gradient(135deg, #FFF8E6 0%, #FFECB3 100%)",
        "gradient-cool": "linear-gradient(135deg, #E0FFF8 0%, #B3FFF0 100%)",
        "gradient-community":
          "linear-gradient(135deg, #00D4A8 0%, #FF9500 50%, #FF6B9D 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-vibrant":
          "pulseVibrant 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-gentle": "bounceGentle 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        pulseVibrant: {
          "0%, 100%": {
            boxShadow: "0 0 0 0 rgba(0, 212, 168, 0.7)",
            transform: "scale(1)",
          },
          "50%": {
            boxShadow: "0 0 0 15px rgba(0, 212, 168, 0)",
            transform: "scale(1.05)",
          },
        },
        bounceGentle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      boxShadow: {
        vibrant: "0 10px 20px -5px rgba(0, 212, 168, 0.3)",
        warm: "0 10px 20px -5px rgba(255, 149, 0, 0.3)",
        coral: "0 10px 20px -5px rgba(255, 107, 157, 0.25)",
      },
    },
  },
  plugins: [],
};
