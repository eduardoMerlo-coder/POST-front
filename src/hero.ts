// hero.ts
import { heroui } from "@heroui/react";

export default heroui({
  themes: {
    light: {
      colors: {
        default: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0", // Usa nuestro border color
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          DEFAULT: "#64748b",
          foreground: "#1e293b",
        },
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb", // Nuestro accent principal
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          DEFAULT: "#2563eb",
          foreground: "#ffffff",
        },
      },
    },
    dark: {
      colors: {
        default: {
          50: "#202028",
          100: "#2a2d35",
          200: "#353442", // Usa nuestro border color
          300: "#404050",
          400: "#64748b",
          500: "#94a3b8",
          600: "#cbd5e1",
          700: "#e2e8f0",
          800: "#f1f5f9",
          900: "#f8fafc",
          DEFAULT: "#94a3b8",
          foreground: "#f1f5f9",
        },
        primary: {
          50: "#0a1f1a",
          100: "#0f2d26",
          200: "#1a4a3d",
          300: "#266b58",
          400: "#338f75",
          500: "#2fb89a",
          600: "#3cd6b1", // Turquesa brillante principal
          700: "#5adec4",
          800: "#78e6d7",
          900: "#96eeea",
          DEFAULT: "#3cd6b1",
          foreground: "#202028",
        },
      },
    },
  },
});
