"use client";

import { useEffect, useState } from "react";

// Typewriter-style streaming reveal of `text`. `cps` controls characters
// per stream tick (one per requestAnimationFrame). Returns the prefix
// shown so far + a `done` flag.
export function useStreamingText(
  text: string,
  cps = 14,
): { shown: string; done: boolean } {
  const [shown, setShown] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setShown("");
    setDone(false);
    if (!text) {
      setDone(true);
      return;
    }
    let cancelled = false;
    let i = 0;
    const tick = () => {
      if (cancelled) return;
      i = Math.min(text.length, i + cps);
      setShown(text.slice(0, i));
      if (i >= text.length) {
        setDone(true);
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return () => {
      cancelled = true;
    };
  }, [text, cps]);

  return { shown, done };
}
