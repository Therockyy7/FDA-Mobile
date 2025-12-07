const { hairlineWidth } = require('nativewind/theme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./features/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // ===== FDA Brand Colors =====
        primary: "#0077BE",           // Main brand color (Ocean Blue)
        secondary: "#00B4D8",         // Secondary brand (Sky Blue)
        accent: "#FDB813",            // Accent color (Warning Yellow)

        // ===== Flood Risk Level Colors =====
        "flood-safe": "#10B981",      // Green (Safe zone)
        "flood-warning": "#F59E0B",   // Orange (Warning zone)
        "flood-danger": "#EF4444",    // Red (Dangerous zone)
        "flood-critical": "#991B1B",  // Dark Red (Critical zone)

        // ===== Water Level Colors =====
        "water-low": "#67E8F9",       // Cyan (Low water level)
        "water-medium": "#3B82F6",    // Blue (Medium water level)
        "water-high": "#1E40AF",      // Dark Blue (High water level)
        "water-critical": "#7C2D12",  // Deep Red (Critical water level)

        // ===== Background Colors =====
        "bg-light": "#F8FAFC",        // Light mode background
        "bg-dark": "#0F172A",         // Dark mode background
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        // ===== Text Colors =====
        "text-light": "#1E293B",      // Light mode text
        "text-dark": "#F1F5F9",       // Dark mode text
        "text-primary-light": "#111827",
        "text-primary-dark": "#F9FAFB",
        "text-secondary-light": "#6B7280",
        "text-secondary-dark": "#9CA3AF",

        // ===== Border Colors =====
        "border-light": "#E2E8F0",    // Light mode border
        "border-dark": "#334155",     // Dark mode border
        border: "hsl(var(--border))",

        "background-light": "#F9FAFB",
        "background-dark": "#131314",
        "input-light": "#F3F4F6",
        "input-dark": "#2C2C2E",


        // ===== UI Component Colors =====
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },

      fontFamily: {
        display: ["Inter", "sans-serif"],
      },

      borderRadius: {
        DEFAULT: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
        full: "9999px",
      },

      borderWidth: {
        hairline: hairlineWidth(),
      },

      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        'slide-in': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
      },

      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'slide-in': 'slide-in 0.3s ease-out',
      },

      // Shadow presets for FDA components
      boxShadow: {
        'flood-card': '0 2px 8px rgba(0, 119, 190, 0.1)',
        'danger-glow': '0 4px 16px rgba(239, 68, 68, 0.3)',
        'warning-glow': '0 4px 16px rgba(251, 191, 36, 0.3)',
        'safe-glow': '0 4px 16px rgba(16, 185, 129, 0.3)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
