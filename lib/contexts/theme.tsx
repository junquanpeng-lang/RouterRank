"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Theme = "dark" | "light";

interface ThemeCtxShape {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
}

const ThemeCtx = createContext<ThemeCtxShape | null>(null);

export const useTheme = (): ThemeCtxShape => {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("rr-theme");
      if (saved === "light" || saved === "dark") {
        setTheme(saved);
      } else if (window.matchMedia?.("(prefers-color-scheme: light)").matches) {
        setTheme("light");
      }
    } catch {
      /* no-op */
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("rr-theme", theme);
    } catch {
      /* no-op */
    }
  }, [theme]);

  const toggle = useCallback(
    () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    [],
  );

  const value = useMemo(
    () => ({ theme, setTheme, toggle }),
    [theme, toggle],
  );

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}
