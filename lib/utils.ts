// Generic utilities used across the app.

export const cx = (...args: Array<string | false | null | undefined>) =>
  args.filter(Boolean).join(" ");

export const fmtUSD = (n: number, d = 2): string => `$${Number(n).toFixed(d)}`;

export const fmtPct = (n: number, d = 0): string => `${(n * 100).toFixed(d)}%`;

export const fmtMoney = (n: number, frac = 2): string =>
  "$" +
  Number(n).toLocaleString("en-US", {
    minimumFractionDigits: frac,
    maximumFractionDigits: frac,
  });

export const sgn = (n: number): string => (n > 0 ? `+${n}` : `${n}`);

// Stable string-hash (djb2-ish XOR variant). Deterministic across runs.
export function strHash(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i);
  return Math.abs(h);
}

// Stable per-(prompt, slug) score in [base, base+span)
export function seededScore(
  prompt: string,
  slug: string,
  salt: string,
  base: number,
  span: number,
): number {
  return base + (strHash((prompt || "") + slug + salt) % span);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function trustTone(s: number): "brand" | "amber" | "coral" {
  return s >= 90 ? "brand" : s >= 75 ? "amber" : "coral";
}

export function trustLabel(s: number): "Verified" | "Caution" | "Risky" {
  return s >= 90 ? "Verified" : s >= 75 ? "Caution" : "Risky";
}

export function sevColor(s: string): string {
  return s === "high"
    ? "text-coral"
    : s === "medium"
      ? "text-amber"
      : "text-ash";
}
