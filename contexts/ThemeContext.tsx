import React, { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { themes, ThemeName, ThemeType } from "./../styles/themes";

interface ThemeContextProps {
  themeName: ThemeName;
  theme: ThemeType;
  changeTheme: (theme: ThemeName) => void;
}

export const ThemeContext = createContext<ThemeContextProps>({
  themeName: "light",
  theme: themes.light,
  changeTheme: () => {},
});

interface ThemeProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = "@user_theme";

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [themeName, setThemeName] = useState<ThemeName>("light");

  // Cargar tema desde AsyncStorage al iniciar
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(STORAGE_KEY);

        // Validar que sea uno de los temas permitidos
        if (savedTheme && Object.keys(themes).includes(savedTheme)) {
          setThemeName(savedTheme as ThemeName);
        }
      } catch (e) {
        console.log("Error loading theme:", e);
      }
    };
    loadTheme();
  }, []);

  // Cambiar tema y guardar en AsyncStorage
  const changeTheme = async (newTheme: ThemeName) => {
    try {
      setThemeName(newTheme);
      await AsyncStorage.setItem(STORAGE_KEY, newTheme);
    } catch (e) {
      console.log("Error saving theme:", e);
    }
  };

  return (
    <ThemeContext.Provider value={{ themeName, theme: themes[themeName], changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
