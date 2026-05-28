"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("ems-theme") as Theme | null;
    const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    setTheme(savedTheme ?? preferredTheme);
  }, []);

  useEffect(() => {
    if (!theme) return;

    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem("ems-theme", theme);
  }, [theme]);

  return <ThemeContext.Provider value={{ theme: theme ?? "light", setTheme }}>{children}</ThemeContext.Provider>;
}

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
} | null>(null);

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
