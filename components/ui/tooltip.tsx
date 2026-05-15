"use client";

import { useEffect, useState } from "react";
import { cx } from "@/lib/utils";

export function Tooltip({
  content,
  side = "top",
  children,
  className = "",
  width = 240,
}: {
  content: string;
  side?: "top" | "bottom" | "left" | "right";
  children: React.ReactNode;
  className?: string;
  width?: number;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open]);

  return (
    <span
      className={cx("relative z-10 inline-flex items-center", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <span
        role="button"
        tabIndex={0}
        aria-label="Show explanation"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setOpen((o) => !o);
        }}
        className="inline-flex items-center justify-center text-smoke hover:text-bone cursor-help transition-colors"
      >
        {children}
      </span>
      {open && (
        <span
          role="tooltip"
          style={{ width }}
          className={cx(
            "absolute z-50 px-3 py-2 bg-ink-800 border border-ink-500 text-[11px] text-ash leading-relaxed shadow-lg whitespace-normal text-left normal-case tracking-normal",
            side === "top" && "bottom-full left-1/2 -translate-x-1/2 mb-2",
            side === "bottom" && "top-full left-1/2 -translate-x-1/2 mt-2",
            side === "left" && "right-full top-1/2 -translate-y-1/2 mr-2",
            side === "right" && "left-full top-1/2 -translate-y-1/2 ml-2",
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}
