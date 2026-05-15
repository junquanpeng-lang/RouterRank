"use client";

import { useEffect, useState } from "react";

export function CountUp({
  target,
  duration = 1100,
  format = (n: number) => n.toLocaleString(),
}: {
  target: number;
  duration?: number;
  format?: (n: number) => string;
}) {
  const [n, setN] = useState(0);

  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const e = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setN(Math.round(target * e));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return <span className="num text-bone">{format(n)}</span>;
}
