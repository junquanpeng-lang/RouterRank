// Core domain types for GatewayBench / RouterRank

export type ProviderType = "router" | "gateway" | "inference" | "self_host";

export type Severity = "low" | "medium" | "high";

export type Tier = "AAA" | "AA" | "A" | "B" | "C";

export type TierTone = "brand" | "amber" | "coral" | "smoke";

export interface SubScores {
  L1: { modelAuth: number; billingTrans: number; cacheFraud: number };
  L2: { latency: number; throughput: number; longContext: number };
  L3: { listPricing: number; relativeToOfficial: number; hiddenCost: number };
}

export interface TrustParts {
  modelConsistency: number;
  providerMatch: number;
  fallbackTransparency: number;
  pricingIntegrity: number;
  safety: number;
}

export interface Incident {
  time: string;
  issue: string;
  sev: Severity;
}

export interface ProviderRaw {
  slug: string;
  name: string;
  type: ProviderType;
  domain: string | null;
  website: string | null;
  crypto: boolean;
  walletPay: boolean;
  region: string;
  costIn: number;
  costOut: number;
  costDelta: number;
  ref: number;
  latency: number;
  p95: number;
  ttft: number;
  success: number;
  samples: number;
  overall: number;
  volume7d: number;
  scores: SubScores;
  spark: number[];
  trustParts: TrustParts;
  incidents: Incident[];
  desc: string;
}

export interface Provider extends ProviderRaw {
  cost: number;
  trust: number;
  L1: number;
  L2: number;
  L3: number;
  tier: Tier;
}

export interface ModelDef {
  id: string;
  display: string;
  owner: string;
  ctx: number;
  officialIn: number;
  officialOut: number;
  caps: { stream: boolean; tool: boolean; json: boolean; zdr: boolean };
}

export interface BenchmarkTemplate {
  id: string;
  label: string;
  prompt: string;
}

export type BenchmarkKind =
  | "default"
  | "reasoning"
  | "coding"
  | "math"
  | "long"
  | "json"
  | "safety"
  | "multi";

export interface FingerprintFlag {
  kind: string;
  headline: string;
  detail: string;
}

export interface FingerprintResult {
  unsupported?: boolean;
  reason?: string;
  flag?: FingerprintFlag | null;
  score: number;
  samples: number;
  embedDist: number;
  lengthKsP: number;
  tokenizer: { observed: string; expected: string; match: boolean };
  precision: "FP16" | "Q8" | "Q4" | string;
  refusalDelta: number;
  firstSeen?: boolean;
}

export interface RunStatusRow {
  slug: string;
  status: "pending" | "running" | "completed" | "failed";
  startAt?: number;
  completeAt?: number;
  latency?: number;
  ttft?: number;
  cost?: number | null;
  inputTokens?: number;
  outputTokens?: number;
  response?: string | null;
  error?: string | null;
  scores?: { L1: number; L2: number; L3: number; overall: number; tier: Tier };
}

export interface RunState {
  id: string;
  prompt: string;
  promptPreview: string;
  benchmark: BenchmarkKind;
  modelId: string;
  modelDisplay: string;
  mode: "single" | "compare";
  providers: RunStatusRow[];
}

export interface Wallet {
  address: string;
  full: string;
  balance: number;
  chain: string;
}
