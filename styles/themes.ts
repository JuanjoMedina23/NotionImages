export const themes = {
    light: {
      background: "#f5f5f5",
      card: "#ffffff",
      text: "#1a1a1a",
      primary: "#4f46e5",
      accent: "#6366f1",
    },
    dark: {
      background: "#121212",
      card: "#1e1e1e",
      text: "#f5f5f5",
      primary: "#8b5cf6",
      accent: "#a78bfa",
    },
    christmas: {
      background: "#f3f6f4",
      card: "#ffffff",
      text: "#064e3b",
      primary: "#b91c1c",
      accent: "#f59e0b",
    },
    halloween: {
      background: "#1a1a1a",
      card: "#2c2c2c",
      text: "#ffedd5",
      primary: "#f97316",
      accent: "#facc15",
    },
  };
  
  // Tipos TypeScript
  export type ThemeName = keyof typeof themes;
  export type ThemeType = typeof themes.light;
  