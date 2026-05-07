"use client";

import { useEffect, useRef, useState } from "react";

interface DropdownProps {
  label: string;
  value: string;
  options: { v: string; l: string }[];
  onChange: (v: string) => void;
}

export function Dropdown({ label, value, options, onChange }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 text-[12px] border border-ink-500 hover:border-bone transition-colors"
      >
        <span className="micro text-smoke">{label}</span>
        <span className="text-bone">{value}</span>
        <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-ash">
          <path d="M3 5l3 3 3-3" stroke="currentColor" fill="none" strokeWidth="1.25" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-48 card z-30 py-1">
          {options.map((o) => (
            <button
              key={o.v}
              onClick={() => {
                onChange(o.v);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-[12px] text-ash hover:bg-ink-700 hover:text-bone transition-colors"
            >
              {o.l}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
