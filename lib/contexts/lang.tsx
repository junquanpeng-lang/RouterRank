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
import { I18N, type Lang } from "../i18n-dict";

interface LangCtxShape {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
  t: (path: string, vars?: Record<string, string | number>) => string;
}

const LangCtx = createContext<LangCtxShape | null>(null);

export const useLang = (): LangCtxShape => {
  const ctx = useContext(LangCtx);
  if (!ctx) throw new Error("useLang must be used inside LangProvider");
  return ctx;
};

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  // Hydrate from localStorage / navigator after mount.
  useEffect(() => {
    try {
      const saved = localStorage.getItem("rr-lang");
      if (saved === "en" || saved === "zh") {
        setLang(saved);
        return;
      }
    } catch {
      /* no-op */
    }
    if (typeof navigator !== "undefined" && /^zh/i.test(navigator.language || "")) {
      setLang("zh");
    }
  }, []);

  // Persist on change.
  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    try {
      localStorage.setItem("rr-lang", lang);
    } catch {
      /* no-op */
    }
  }, [lang]);

  const t = useCallback(
    (path: string, vars?: Record<string, string | number>): string => {
      const walk = (root: unknown): unknown =>
        path
          .split(".")
          .reduce<unknown>(
            (o, k) => (o && typeof o === "object" && k in (o as Record<string, unknown>)
              ? (o as Record<string, unknown>)[k]
              : undefined),
            root,
          );
      let val = walk(I18N[lang]);
      if (val === undefined && lang !== "en") val = walk(I18N.en);
      if (val === undefined) return path;
      if (typeof val === "string" && vars) {
        let out = val;
        for (const k of Object.keys(vars)) {
          out = out.replace(new RegExp("\\{" + k + "\\}", "g"), String(vars[k]));
        }
        return out;
      }
      return typeof val === "string" ? val : path;
    },
    [lang],
  );

  const toggle = useCallback(() => setLang((l) => (l === "zh" ? "en" : "zh")), []);

  const value = useMemo(
    () => ({ lang, setLang, toggle, t }),
    [lang, toggle, t],
  );

  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>;
}
