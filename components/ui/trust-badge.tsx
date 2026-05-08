import { cx, trustLabel, trustTone } from "@/lib/utils";

export function TrustBadge({
  score,
  size = "sm",
}: {
  score: number;
  size?: "sm" | "lg";
}) {
  const tone = trustTone(score);
  const colors = {
    brand: "border-brand text-brand",
    amber: "border-amber text-amber",
    coral: "border-coral text-coral",
  };
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 border tracking-wider whitespace-nowrap",
        colors[tone],
        size === "lg" ? "px-2 py-0.5 text-[11px]" : "px-1.5 py-0.5 text-[10px]",
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      <span className="num">{score}</span>
      <span>· {trustLabel(score)}</span>
    </span>
  );
}
