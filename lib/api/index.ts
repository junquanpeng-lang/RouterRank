// Typed fetch wrappers for the FastAPI backend.
// Base URL is set via NEXT_PUBLIC_API_URL (default: http://localhost:8000)

const BASE =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) ||
  "http://localhost:8000";

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`API ${path} returned ${res.status}`);
  return res.json() as Promise<T>;
}

// ── Response types (mirror FastAPI Pydantic models) ──────────────────────────

export interface ApiModelEvaluation {
  id: number;
  provider: string;       // e.g. "OpenRouter", "B.ai"
  model_id: string;       // e.g. "gpt-5.4-mini"
  model: string;          // display name, e.g. "GPT-5.4 mini"
  evaluated_at: string;
  sample_count: number | null;
  success_rate: number | null;           // 0–1
  ttft_p50: number | null;               // ms
  ttft_p95: number | null;               // ms
  tpot_p50: number | null;               // ms
  tpot_p95: number | null;               // ms
  e2e_p50: number | null;                // ms
  e2e_p95: number | null;                // ms
  prompt_token_deviation: number | null; // fraction, e.g. 0.02 = +2%
  output_token_deviation: number | null;
  input_price_deviation: number | null;  // fraction vs official
  output_price_deviation: number | null;
  cached_input_price_deviation: number | null;
  trustworthiness_score: number | null;  // 0–100
  economics_score: number | null;        // 0–100
  performance_score: number | null;      // 0–100
  total_score: number | null;            // 0–100
  rating: string | null;                 // "AAA" | "AA" | "A" | "B" | "C"
}

export interface ApiPricingRow {
  id: number;
  provider_type: "official" | "aggregator";
  provider_name: string;
  model_family: string;   // "GPT" | "Claude" | "Gemini"
  model_name: string;     // "gpt-5.4-mini"
  pricing_type: string;
  input_price_per_1m: number | null;
  output_price_per_1m: number | null;
  cached_input_price_per_1m: number | null;
  cache_write_price_per_1m: number | null;
  context_window: number | null;
  max_output_tokens: number | null;
  current_discount: number;  // e.g. 0.15 means 15% off list → pays 85%
  last_updated: string | null;
  source_url: string | null;
}

export interface ApiRegistryProvider {
  name:           string;        // "OpenRouter"
  slug:           string;        // "openrouter"
  is_official:    boolean;
  type:           string;        // "router" | "gateway" | "inference" | "self_host"
  domain:         string | null; // for logo.clearbit.com
  website:        string | null;
  region:         string;
  description_en: string;
  description_zh: string;
  models: Array<{
    model_id: string;
    model_family: string;
    display: string;
  }>;
}

// ── Fetch functions ───────────────────────────────────────────────────────────

export const fetchModelEvaluations = () =>
  apiFetch<ApiModelEvaluation[]>("/model-evaluation");

export const fetchPricing = () =>
  apiFetch<ApiPricingRow[]>("/pricing/");

export const fetchRegistryProviders = () =>
  apiFetch<ApiRegistryProvider[]>("/registry/providers");
