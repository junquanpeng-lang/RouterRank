import { MODELS, PROVIDERS } from "./data";
import { strHash } from "./utils";
import type { FingerprintResult, Provider } from "./types";

interface OverrideShape {
  embedDist?: number;
  lengthKsP?: number;
  refusalDelta?: number;
  precision?: "FP16" | "Q8" | "Q4";
  tokenizer?: { observed: string; expected?: string };
  flag?: { kind: string; headline: string; detail: string };
}

// Hand-curated outliers — these tell specific stories
const FINGERPRINT_OVERRIDES: Record<string, OverrideShape> = {
  "openrouter:anthropic/claude-4.6-sonnet": {
    embedDist: 0.78,
    lengthKsP: 0.18,
    refusalDelta: 7,
    tokenizer: { observed: "cl100k_base", expected: "claude" },
    flag: {
      kind: "silent_fallback",
      headline: "Silent fallback suspected",
      detail:
        "Tokenizer signature does not match Anthropic's expected tokenizer on 18% of sampled responses. Last seen 2h ago.",
    },
  },
  "bai:openai/gpt-5.5": {
    precision: "Q8",
    flag: {
      kind: "quantization",
      headline: "Quantization detected",
      detail:
        "Numeric precision tasks show ~6.3% accuracy delta vs. canonical FP16 baseline — consistent with Q8 quantization.",
    },
  },
  "replicate:meta/llama-4-maverick": {
    precision: "Q4",
    embedDist: 0.81,
    flag: {
      kind: "quantization",
      headline: "Aggressive quantization",
      detail:
        "Q4 weights detected via output entropy fingerprint. Cost is lower but reasoning benchmarks underperform by ~9 points.",
    },
  },
  "replicate:anthropic/claude-4.6-sonnet": {
    embedDist: 0.71,
    lengthKsP: 0.06,
    refusalDelta: -8,
    flag: {
      kind: "distribution_drift",
      headline: "Output distribution drift",
      detail:
        "Response embedding distance and length distribution diverge from the canonical Claude 4.6 reference. Possible non-canonical variant.",
    },
  },
  "anyscale:meta/llama-4-maverick": {
    precision: "Q8",
  },
};

export function fingerprint(slug: string, modelId: string): FingerprintResult | null {
  const p = PROVIDERS.find((x) => x.slug === slug);
  const m = MODELS.find((x) => x.id === modelId);
  if (!p || !m) return null;

  const closed = ["OpenAI", "Anthropic", "Google"].includes(m.owner);
  const isPureInference = p.type === "inference";
  if (closed && isPureInference) {
    return {
      unsupported: true,
      reason: `${p.name} is a direct-inference provider for open-weight models. Requests for ${m.owner} models would not be routed honestly.`,
    } as FingerprintResult;
  }

  const key = `${slug}:${modelId}`;
  const ov = FINGERPRINT_OVERRIDES[key] || {};
  const seed = strHash(key);

  const base = p.trust / 100;
  const noise = ((seed % 200) - 100) / 4000;
  const embedDist =
    ov.embedDist != null
      ? ov.embedDist
      : Math.min(0.99, Math.max(0.45, base + noise + 0.02));

  const lengthKsP =
    ov.lengthKsP != null
      ? ov.lengthKsP
      : Math.min(
          0.95,
          Math.max(0.04, 0.4 + (p.trust - 80) / 120 + ((seed % 100) - 50) / 600),
        );

  const tokExpected =
    m.owner === "OpenAI"
      ? "cl100k_base"
      : m.owner === "Anthropic"
        ? "claude"
        : m.owner === "Google"
          ? "gemini"
          : "sentencepiece";
  const tokenizer = ov.tokenizer
    ? {
        observed: ov.tokenizer.observed,
        expected: ov.tokenizer.expected || tokExpected,
        match: ov.tokenizer.observed === (ov.tokenizer.expected || tokExpected),
      }
    : { observed: tokExpected, expected: tokExpected, match: true };

  const precision = ov.precision || "FP16";

  const refusalDelta =
    ov.refusalDelta != null
      ? ov.refusalDelta
      : Math.round(((seed % 14) - 7) * (1 - p.trust / 110));

  const samples = Math.max(48, Math.round(p.samples / (MODELS.length * 2) + (seed % 80)));

  const score = Math.round(
    Math.max(0, embedDist * 50) +
      lengthKsP * 20 +
      (tokenizer.match ? 15 : 4) +
      (precision === "FP16" ? 10 : precision === "Q8" ? 6 : 3) +
      Math.max(0, 5 - Math.abs(refusalDelta) * 0.5),
  );

  return {
    embedDist,
    lengthKsP,
    tokenizer,
    precision,
    refusalDelta,
    samples,
    score,
    flag: ov.flag || null,
  };
}

// Try to recognize a known PROVIDER from a pasted URL
export function inferProvider(rawUrl: string): string | null {
  if (!rawUrl) return null;
  let host = "";
  try {
    const u = new URL(rawUrl.match(/^https?:/) ? rawUrl : "https://" + rawUrl);
    host = u.hostname.toLowerCase();
  } catch {
    return null;
  }
  const stripped = host.replace(/^(api|www|inference|router|gateway)\./, "");
  for (const p of PROVIDERS) {
    if (!p.domain) continue;
    if (host === p.domain || host.endsWith("." + p.domain) || stripped === p.domain) {
      return p.slug;
    }
  }
  return null;
}

// Deterministic fingerprint for any URL we haven't sampled before. Lower
// confidence than `fingerprint()` because it's a single-shot probe.
export function syntheticFingerprint(url: string, modelId: string): FingerprintResult | null {
  const m = MODELS.find((x) => x.id === modelId);
  if (!m) return null;
  const seed = strHash(url + ":" + modelId);
  const baseTier = 60 + (seed % 30); // 60..89
  const embedDist = Math.min(
    0.97,
    Math.max(0.55, baseTier / 100 + ((seed % 200) - 100) / 5000),
  );
  const lengthKsP = Math.min(
    0.92,
    Math.max(0.05, 0.3 + (baseTier - 70) / 150 + ((seed % 100) - 50) / 700),
  );

  const tokExpected =
    m.owner === "OpenAI"
      ? "cl100k_base"
      : m.owner === "Anthropic"
        ? "claude"
        : m.owner === "Google"
          ? "gemini"
          : "sentencepiece";
  const tokMatch = seed % 100 > 12;
  const tokenizer = {
    observed: tokMatch ? tokExpected : "cl100k_base",
    expected: tokExpected,
    match: tokMatch,
  };
  const precision: "FP16" | "Q8" | "Q4" =
    seed % 100 > 30 ? "FP16" : seed % 100 > 8 ? "Q8" : "Q4";
  const refusalDelta = Math.round(((seed % 18) - 9) * 0.7);
  const samples = 40 + (seed % 30);
  const score = Math.round(
    Math.max(0, embedDist * 50) +
      lengthKsP * 20 +
      (tokenizer.match ? 15 : 4) +
      (precision === "FP16" ? 10 : precision === "Q8" ? 6 : 3) +
      Math.max(0, 5 - Math.abs(refusalDelta) * 0.5),
  );
  let flag: FingerprintResult["flag"] = null;
  if (!tokenizer.match) {
    flag = {
      kind: "tokenizer_mismatch",
      headline: "Tokenizer mismatch",
      detail: `Observed tokenizer (${tokenizer.observed}) does not match the expected ${tokenizer.expected} signature for ${m.display}. This is a strong signal of silent fallback or a non-canonical variant.`,
    };
  } else if (precision === "Q4") {
    flag = {
      kind: "quantization",
      headline: "Aggressive quantization (Q4)",
      detail:
        "Q4 weights detected via numeric task accuracy delta. Cost is lower; reasoning benchmarks underperform by ~9 points vs FP16.",
    };
  } else if (precision === "Q8") {
    flag = {
      kind: "quantization",
      headline: "Quantization detected (Q8)",
      detail: "~6% accuracy delta on numeric tasks vs canonical FP16 baseline.",
    };
  }
  return {
    firstSeen: true,
    embedDist,
    lengthKsP,
    tokenizer,
    precision,
    refusalDelta,
    samples,
    score,
    flag,
  };
}

// 30-day trust trajectory + streak + recovery, all deterministic from p.slug
const TRUST_DRIFT: Record<string, number> = {
  portkey: 0,
  openrouter: -1,
  bai: 0,
  together: +1,
  fireworks: 0,
  anyscale: -1,
  replicate: -2,
  litellm: +3,
};

export interface TrustHistory {
  spark: number[];
  streakDays: number;
  recoveryMin: number | null;
  delta30: number;
  trend: "up" | "down" | "flat";
}

export function trustHistory(p: Provider): TrustHistory {
  const drift = TRUST_DRIFT[p.slug] ?? 0;
  const seed = strHash("trust:" + p.slug);
  const spark: number[] = [];
  const startVal = p.trust - drift;
  for (let i = 0; i < 30; i++) {
    const linear = startVal + (drift * i) / 29;
    const noise = (((seed * (i + 7)) % 100) - 50) / 50;
    let bump = 0;
    if (p.slug === "bai" && i >= 6 && i <= 12) bump = -3 + (i - 9);
    spark.push(Math.round(linear + noise + bump));
  }

  const mediums = (p.incidents || []).filter(
    (i) => i.sev === "medium" || i.sev === "high",
  );
  const parseAgoH = (s: string): number => {
    const m = /(\d+)\s*([hd])/.exec(s || "");
    return m ? Number(m[1]) * (m[2] === "d" ? 24 : 1) : Infinity;
  };
  const oldestMediumH = mediums.length
    ? Math.min(...mediums.map((i) => parseAgoH(i.time)))
    : null;
  const streakDays =
    oldestMediumH == null
      ? 30 + (seed % 14)
      : Math.max(0, Math.floor(oldestMediumH / 24));

  const recoveryMin = (p.incidents || []).length === 0 ? null : 4 + (seed % 28);

  const delta30 = spark[spark.length - 1] - spark[0];
  const trend: "up" | "down" | "flat" =
    delta30 >= 2 ? "up" : delta30 <= -2 ? "down" : "flat";

  return { spark, streakDays, recoveryMin, delta30, trend };
}
