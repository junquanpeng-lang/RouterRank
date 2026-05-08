"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { cx } from "@/lib/utils";
import { I } from "./icons";

export function Modal({
  onClose,
  children,
  size = "md",
}: {
  onClose: () => void;
  children: ReactNode;
  size?: "md" | "lg";
}) {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onEsc);
    // Lock body scroll while modal open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onEsc);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);
  const widthClass = size === "lg" ? "max-w-2xl" : "max-w-md";
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={cx(
          "card w-full p-6 sm:p-8 relative fade-up max-h-[90vh] overflow-y-auto",
          widthClass,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-smoke hover:text-bone"
          aria-label="Close"
        >
          <I.x className="w-4 h-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

export function Row({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="micro text-smoke">{label}</span>
      <span
        className={cx("text-[13px] num", accent ? "text-brand" : "text-bone")}
      >
        {value}
      </span>
    </div>
  );
}
