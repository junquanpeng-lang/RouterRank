"use client";

import { useEffect, useRef, useState } from "react";
import { MODELS } from "@/lib/data";
import { cx } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
  showOwner?: boolean;
}

export function ModelDropdown({
  value,
  onChange,
  disabled = false,
  showOwner = true,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);
  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);
  const current = MODELS.find((m) => m.id === value) || MODELS[0];
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={cx(
          "w-full flex items-center justify-between gap-2 bg-ink-800 border px-3 py-2 text-[13px] text-bone transition-colors",
          disabled
            ? "border-ink-500 opacity-60 cursor-not-allowed"
            : open
              ? "border-brand/60"
              : "border-ink-500 hover:border-bone",
        )}
      >
        <span className="truncate">
          {current.display}
          {showOwner && <span className="text-smoke"> · {current.owner}</span>}
        </span>
        <svg
          viewBox="0 0 12 12"
          className={cx(
            "w-2.5 h-2.5 text-ash shrink-0 transition-transform",
            open && "rotate-180",
          )}
        >
          <path
            d="M3 5l3 3 3-3"
            stroke="currentColor"
            fill="none"
            strokeWidth="1.25"
          />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 card z-30 py-1 max-h-72 overflow-y-auto">
          {MODELS.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                onChange(m.id);
                setOpen(false);
              }}
              className={cx(
                "w-full text-left px-3 py-2 text-[13px] transition-colors",
                m.id === value
                  ? "text-brand bg-brand/5"
                  : "text-ash hover:bg-ink-700 hover:text-bone",
              )}
            >
              {m.display}
              {showOwner && (
                <span
                  className={cx(
                    m.id === value ? "text-brand/70" : "text-smoke",
                  )}
                >
                  {" "}
                  · {m.owner}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
