import type { Tier } from "@/lib/types";
import { cx } from "@/lib/utils";

const TONE: Record<Tier, string> = {
  AAA: "border-brand text-brand",
  AA: "border-brand text-brand",
  A: "border-amber text-amber",
  B: "border-coral text-coral",
  C: "border-coral text-coral",
};

export function TierChip({
  tier,
  size = "sm",
}: {
  tier: Tier;
  size?: "sm" | "lg";
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 border tracking-wider font-medium",
        TONE[tier],
        size === "lg" ? "px-2 py-0.5 text-[11px]" : "px-1.5 py-0.5 text-[10px]",
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {tier}
    </span>
  );
}
