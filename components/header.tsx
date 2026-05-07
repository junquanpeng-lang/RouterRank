"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/lib/contexts/lang";
import { useTheme } from "@/lib/contexts/theme";
import { useWallet } from "@/lib/contexts/wallet";
import { TOTAL_SAMPLES } from "@/lib/data";
import { cx } from "@/lib/utils";

export function Header() {
  const pathname = usePathname() || "/";
  const { wallet, setShowConnect } = useWallet();
  const { theme, toggle: toggleTheme } = useTheme();
  const { lang, toggle: toggleLang, t } = useLang();

  const navs = [
    { key: "ranking", path: "/", label: t("nav.ranking") },
    { key: "run", path: "/run", label: t("nav.run") },
    { key: "validate", path: "/validate", label: t("nav.validate") },
    { key: "docs", path: "/docs", label: t("nav.docs") },
  ];

  const themeTarget = theme === "dark" ? t("header.lightWord") : t("header.darkWord");

  return (
    <header className="sticky top-0 z-40 border-b border-ink-600 bg-ink/85 backdrop-blur-md">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <svg viewBox="0 0 32 32" className="w-7 h-7">
              <rect x="2" y="2" width="28" height="28" stroke="currentColor" strokeWidth="1" fill="none" />
              <path
                d="M8 22 L8 10 L20 10 M20 10 L26 16 L20 22 M14 16 L24 16"
                stroke="currentColor"
                strokeWidth="1.25"
                fill="none"
                strokeLinecap="square"
              />
            </svg>
            <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-brand rounded-full pulse-dot"></span>
          </div>
          <div className="leading-none">
            <div className="serif text-[22px] tracking-editorial">RouterRank</div>
            <div className="micro text-smoke mt-0.5">{t("header.tagline")}</div>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {navs.map((n) => {
            const active =
              (n.path === "/" && pathname === "/") ||
              (n.path !== "/" && pathname.startsWith(n.path));
            return (
              <Link
                key={n.key}
                href={n.path}
                className={cx(
                  "px-4 py-1.5 text-[13px] tracking-tight transition-colors",
                  active ? "text-bone" : "text-ash hover:text-bone",
                )}
              >
                {n.label}
                {active && <span className="block h-px bg-brand mt-1 -mx-4"></span>}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden lg:inline-flex items-center gap-1.5 text-[11px] text-smoke">
            <span className="w-1.5 h-1.5 bg-brand rounded-full pulse-dot"></span>
            <span className="micro text-ash">
              {t("header.ticker", { n: TOTAL_SAMPLES.toLocaleString() })}
            </span>
          </span>
          <button
            onClick={toggleLang}
            aria-label={t("header.switchLang")}
            title={t("header.switchLang")}
            className="h-8 px-2 shrink-0 inline-flex items-center justify-center border border-ink-500 hover:border-bone text-ash hover:text-bone transition-colors text-[11px] tracking-wider num"
          >
            {lang === "zh" ? "EN" : "中"}
          </button>
          <button
            onClick={toggleTheme}
            aria-label={t("header.switchThemeTo", { target: themeTarget })}
            title={t("header.switchThemeTo", { target: themeTarget })}
            className="h-8 w-8 shrink-0 inline-flex items-center justify-center border border-ink-500 hover:border-bone text-ash hover:text-bone transition-colors"
          >
            {theme === "dark" ? (
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M19.07 4.93l-1.41 1.41M6.34 17.66l-1.41 1.41M19.07 19.07l-1.41-1.41M6.34 6.34L4.93 4.93" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
          {wallet ? (
            <Link
              href="/wallet"
              className="hidden sm:inline-flex items-center gap-2 h-8 px-3 text-[12px] num text-bone border border-ink-500 hover:border-bone"
            >
              {wallet.address}
            </Link>
          ) : (
            <button
              onClick={() => setShowConnect(true)}
              className="btn-brand h-8 px-3 sm:px-4 text-[12px] tracking-tight inline-flex items-center gap-1.5"
            >
              {t("header.connect")}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
