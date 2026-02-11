"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export const COLOR_THEMES = [
  { id: "ocean", label: "Ocean", color: "oklch(0.55 0.15 230)" },
  { id: "emerald", label: "Emerald", color: "oklch(0.48 0.17 160)" },
  { id: "sunset", label: "Sunset", color: "oklch(0.55 0.18 50)" },
  { id: "violet", label: "Violet", color: "oklch(0.50 0.21 290)" },
  { id: "rose", label: "Rose", color: "oklch(0.55 0.2 15)" },
] as const;

export type ColorThemeId = (typeof COLOR_THEMES)[number]["id"];

interface ColorThemeContextType {
  colorTheme: ColorThemeId;
  setColorTheme: (theme: ColorThemeId) => void;
}

const ColorThemeContext = createContext<ColorThemeContextType | undefined>(
  undefined,
);

export function ColorThemeProvider({ children }: { children: ReactNode }) {
  const [colorTheme, setColorThemeState] = useState<ColorThemeId>("ocean");

  useEffect(() => {
    const stored = localStorage.getItem("color-theme") as ColorThemeId | null;
    if (stored && COLOR_THEMES.some((t) => t.id === stored)) {
      setColorThemeState(stored);
      applyTheme(stored);
    }
  }, []);

  const setColorTheme = (theme: ColorThemeId) => {
    setColorThemeState(theme);
    localStorage.setItem("color-theme", theme);
    applyTheme(theme);
  };

  return (
    <ColorThemeContext.Provider value={{ colorTheme, setColorTheme }}>
      {children}
    </ColorThemeContext.Provider>
  );
}

function applyTheme(theme: ColorThemeId) {
  const el = document.documentElement;
  if (theme === "ocean") {
    el.removeAttribute("data-color-theme");
  } else {
    el.setAttribute("data-color-theme", theme);
  }
}

export function useColorTheme() {
  const context = useContext(ColorThemeContext);
  if (!context) {
    throw new Error("useColorTheme must be used within a ColorThemeProvider");
  }
  return context;
}
