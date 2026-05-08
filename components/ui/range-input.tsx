"use client";

import type { CSSProperties } from "react";

interface Props {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}

export function RangeInput({
  min,
  max,
  step = 1,
  value,
  onChange,
  disabled = false,
}: Props) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(+e.target.value)}
      className="range-brand"
      style={{ "--pct": `${pct}%` } as CSSProperties}
    />
  );
}
