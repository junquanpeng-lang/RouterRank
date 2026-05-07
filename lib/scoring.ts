import type { Provider, SubScores, Tier, TierTone } from "./types";
import { fmtUSD } from "./utils";

export function computeL1(s: SubScores): number {
  return Math.round(
    s.L1.modelAuth * 0.5 + s.L1.billingTrans * 0.3 + s.L1.cacheFraud * 0.2,
  );
}

export function computeL2(s: SubScores): number {
  return Math.round(
    s.L2.latency * 0.5 + s.L2.throughput * 0.3 + s.L2.longContext * 0.2,
  );
}

export function computeL3(s: SubScores): number {
  return Math.round(
    s.L3.listPricing * 0.35 +
      s.L3.relativeToOfficial * 0.4 +
      s.L3.hiddenCost * 0.25,
  );
}

export function computeOverall(s: SubScores): number {
  return Math.round(computeL1(s) * 0.4 + computeL3(s) * 0.4 + computeL2(s) * 0.2);
}

export function tier(overall: number): Tier {
  if (overall >= 90) return "AAA";
  if (overall >= 80) return "AA";
  if (overall >= 70) return "A";
  if (overall >= 60) return "B";
  return "C";
}

export function tierTone(t: Tier): TierTone {
  return (
    ({ AAA: "brand", AA: "brand", A: "amber", B: "coral", C: "coral" }) as Record<Tier, TierTone>
  )[t] || "smoke";
}

// Spec §7.5 — stepped bands
export function latencyScore(s: number): number {
  if (s < 1) return 100;
  if (s < 2) return 85;
  if (s < 4) return 65;
  if (s < 8) return 40;
  return 20;
}

// Spec §7.2 — linear interpolation between anchor points on price_ratio
export function costScore(observed: number, ref: number): number {
  if (!ref || ref <= 0) return 50;
  const r = observed / ref;
  const anchors: [number, number][] = [
    [0.8, 100],
    [1.0, 85],
    [1.2, 70],
    [1.5, 40],
    [2.0, 10],
  ];
  if (r <= anchors[0][0]) return anchors[0][1];
  if (r >= anchors[anchors.length - 1][0]) return anchors[anchors.length - 1][1];
  for (let i = 0; i < anchors.length - 1; i++) {
    const [r0, s0] = anchors[i];
    const [r1, s1] = anchors[i + 1];
    if (r >= r0 && r <= r1)
      return Math.round(s0 + ((s1 - s0) * (r - r0)) / (r1 - r0));
  }
  return 50;
}

export function tokenCost(p: Provider, inTok: number, outTok: number): number {
  return (inTok * p.costIn) / 1e6 + (outTok * p.costOut) / 1e6;
}

// One-line evidence note per L group on the Provider detail score breakdown.
export function subNote(p: Provider, group: "L1" | "L2" | "L3"): string {
  if (group === "L1") {
    const inflate =
      p.scores.L1.billingTrans >= 88
        ? "token count matches official"
        : "minor inflation flagged";
    const cache =
      p.scores.L1.cacheFraud >= 80
        ? "cache TTL respected"
        : p.scores.L1.cacheFraud >= 65
          ? "sporadic cache discrepancy"
          : "cache claims unreliable";
    return `${inflate} · ${cache}`;
  }
  if (group === "L2") {
    return `p50 ${p.latency.toFixed(1)}s · p95 ${p.p95.toFixed(1)}s · ${p.samples.toLocaleString()} samples · ${(p.success * 100).toFixed(1)}% success`;
  }
  if (group === "L3") {
    const baseline =
      p.type === "router"
        ? "1.055× baseline (5.5% router fee)"
        : p.type === "gateway"
          ? "1.0× baseline (passthrough gateway)"
          : p.type === "self_host"
            ? "compared to upstream cost"
            : "compared to direct-vendor pricing";
    return `${fmtUSD(p.cost)} blended · ${p.costDelta > 0 ? "+" : ""}${p.costDelta}% vs ref · ${baseline}`;
  }
  return "";
}
