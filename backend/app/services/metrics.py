"""
All metric and score calculation logic for model_evaluation.

Phase 1 — raw metrics (per provider/model):
  success_rate, ttft/tpot/e2e P50+P95,
  prompt/output token deviation vs official,
  input/output/cached_input price deviation vs official (after discount)

Phase 2 — dimension scores (0-100):
  trustworthiness_score  based on token deviations
  economics_score        based on price deviations
  performance_score      relative ranking across all providers (best=100, worst=0)

Phase 3 — total score + rating:
  total_score = 0.4 * trustworthiness + 0.4 * economics + 0.2 * performance
  rating      = AAA / AA / A / B / C
"""
from __future__ import annotations
from typing import Optional

from app.database import get_client
from app.models.registry import MODEL_REGISTRY

# model_family → official provider name
_OFFICIAL: dict[str, str] = {
    "GPT":    "OpenAI",
    "Claude": "Anthropic",
    "Gemini": "Google",
}

_LATENCY_METRICS = ["ttft_p50", "ttft_p95", "tpot_p50", "tpot_p95", "e2e_p50", "e2e_p95"]


# ── pure helpers ───────────────────────────────────────────────────────────────

def _percentile(values: list[float], p: float) -> Optional[float]:
    s = sorted(v for v in values if v is not None)
    if not s:
        return None
    idx = (p / 100) * (len(s) - 1)
    lo = int(idx)
    hi = min(lo + 1, len(s) - 1)
    return s[lo] + (idx - lo) * (s[hi] - s[lo])


def _safe_avg(values: list[Optional[float]]) -> Optional[float]:
    vs = [v for v in values if v is not None]
    return sum(vs) / len(vs) if vs else None


def _normalize(value: float, ideal: float, worst: float) -> float:
    """Map value to 0-100 where ideal→100, worst→0. Lower latency = higher score."""
    if ideal == worst:
        return 100.0
    score = (worst - value) / (worst - ideal) * 100
    return max(0.0, min(100.0, score))


# ── score calculators ──────────────────────────────────────────────────────────

def _calc_trustworthiness(
    prompt_dev: Optional[float],
    output_dev: Optional[float],
) -> Optional[float]:
    """
    100 at 0% avg deviation, 0 at 20% avg deviation.
    formula: 100 - avg_abs_dev * 500, clamped to [0, 100].
    """
    devs = [abs(d) for d in [prompt_dev, output_dev] if d is not None]
    if not devs:
        return None
    avg = sum(devs) / len(devs)
    return round(max(0.0, min(100.0, 100.0 - avg * 500)), 2)


def _calc_economics(
    input_dev: Optional[float],
    output_dev: Optional[float],
    cached_dev: Optional[float],
) -> Optional[float]:
    """
    Weighted price deviation (input 40%, output 40%, cached 20%).
    0% deviation → 80 (official baseline).
    -20% (cheaper) → 100.  +20% (more expensive) → 60.
    formula: 80 - weighted_dev * 100, clamped to [0, 100].
    """
    pairs = [(input_dev, 0.4), (output_dev, 0.4), (cached_dev, 0.2)]
    valid = [(v, w) for v, w in pairs if v is not None]
    if not valid:
        return None
    total_w = sum(w for _, w in valid)
    weighted = sum(v * w for v, w in valid) / total_w
    return round(max(0.0, min(100.0, 80.0 - weighted * 100)), 2)


def _derive_perf_thresholds(all_raw: list[dict]) -> dict[str, tuple[float, float]]:
    """Compute (ideal, worst) per latency metric from all providers' data."""
    thresholds: dict[str, tuple[float, float]] = {}
    for m in _LATENCY_METRICS:
        values = [r[m] for r in all_raw if r.get(m) is not None]
        if values:
            thresholds[m] = (min(values), max(values))
    return thresholds


def _calc_performance(raw: dict, thresholds: dict[str, tuple[float, float]]) -> Optional[float]:
    """Average of normalized sub-scores using dynamic thresholds derived from all providers."""
    subs = []
    for k in _LATENCY_METRICS:
        v = raw.get(k)
        t = thresholds.get(k)
        if v is not None and t is not None:
            subs.append(_normalize(v, t[0], t[1]))
    return round(sum(subs) / len(subs), 2) if subs else None


def _calc_total(
    trust: Optional[float],
    econ:  Optional[float],
    perf:  Optional[float],
) -> Optional[float]:
    pairs = [(trust, 0.4), (econ, 0.4), (perf, 0.2)]
    valid = [(v, w) for v, w in pairs if v is not None]
    if not valid:
        return None
    total_w = sum(w for _, w in valid)
    return round(sum(v * w for v, w in valid) / total_w, 2)


def _calc_rating(score: Optional[float]) -> Optional[str]:
    if score is None:
        return None
    if score >= 90: return "AAA"
    if score >= 80: return "AA"
    if score >= 70: return "A"
    if score >= 60: return "B"
    return "C"


# ── main computation ───────────────────────────────────────────────────────────

def _compute_raw(provider: str, model_id: str, client) -> Optional[dict]:
    """Phase 1: compute raw metrics only (no scores)."""
    rows = (
        client.table("test_result")
        .select("*")
        .eq("provider", provider)
        .eq("model_id", model_id)
        .execute()
        .data
    )
    if not rows:
        return None

    sample_count = len(rows)

    # ── success rate ───────────────────────────────────────────────────────────
    def _is_success(r: dict) -> bool:
        s = r.get("success")
        if s is True:
            return True
        if s is False:
            return False
        return r.get("error") is None

    success_count = sum(1 for r in rows if _is_success(r))
    success_rate = round(success_count / sample_count, 4)
    ok_rows = [r for r in rows if _is_success(r)]

    # ── latency percentiles ────────────────────────────────────────────────────
    ttft_vals = [r["ttft_ms"] for r in ok_rows if r.get("ttft_ms") is not None]
    tpot_vals = [r["tpot_ms"] for r in ok_rows if r.get("tpot_ms") is not None]
    e2e_vals  = [r["e2e_ms"]  for r in ok_rows if r.get("e2e_ms")  is not None]

    ttft_p50 = _percentile(ttft_vals, 50)
    ttft_p95 = _percentile(ttft_vals, 95)
    tpot_p50 = _percentile(tpot_vals, 50)
    tpot_p95 = _percentile(tpot_vals, 95)
    e2e_p50  = _percentile(e2e_vals,  50)
    e2e_p95  = _percentile(e2e_vals,  95)

    # ── token deviation vs official ────────────────────────────────────────────
    spec = MODEL_REGISTRY.get(model_id)
    family = spec.model_family if spec else None
    official_provider = _OFFICIAL.get(family) if family else None

    if official_provider == provider:
        avg_prompt_token_deviation: Optional[float] = 0.0
        avg_output_token_deviation: Optional[float] = 0.0
    elif official_provider:
        official_rows = (
            client.table("test_result")
            .select("run_id,prompt,prompt_tokens,output_tokens")
            .eq("provider", official_provider)
            .eq("model_id", model_id)
            .execute()
            .data
        )
        ref_index: dict[tuple, dict] = {
            (r["run_id"], r["prompt"]): r for r in official_rows
        }

        prompt_devs: list[float] = []
        output_devs: list[float] = []
        for r in ok_rows:
            ref = ref_index.get((r.get("run_id"), r.get("prompt")))
            if not ref:
                continue
            ref_pt = ref.get("prompt_tokens")
            ref_ot = ref.get("output_tokens")
            if ref_pt and r.get("prompt_tokens") is not None:
                prompt_devs.append((r["prompt_tokens"] - ref_pt) / ref_pt)
            if ref_ot and r.get("output_tokens") is not None:
                output_devs.append((r["output_tokens"] - ref_ot) / ref_ot)

        avg_prompt_token_deviation = _safe_avg(prompt_devs)
        avg_output_token_deviation = _safe_avg(output_devs)
    else:
        avg_prompt_token_deviation = None
        avg_output_token_deviation = None

    # ── price deviation vs official (after discount) ───────────────────────────
    input_price_deviation: Optional[float] = None
    output_price_deviation: Optional[float] = None
    cached_input_price_deviation: Optional[float] = None

    if official_provider == provider:
        input_price_deviation = 0.0
        output_price_deviation = 0.0
        cached_input_price_deviation = 0.0
    elif official_provider and spec:
        pricing_rows = (
            client.table("model_pricing")
            .select(
                "provider_name,model_name,input_price_per_1m,"
                "output_price_per_1m,cached_input_price_per_1m,current_discount"
            )
            .in_("provider_name", [provider, official_provider])
            .eq("model_family", family)
            .execute()
            .data
        )
        off_row = next((r for r in pricing_rows if r["provider_name"] == official_provider), None)
        pv_row  = next((r for r in pricing_rows if r["provider_name"] == provider), None)

        if off_row and pv_row:
            def _effective(row: dict, field: str) -> Optional[float]:
                val = row.get(field)
                if val is None:
                    return None
                discount = float(row.get("current_discount") or 0)
                return float(val) * (1 - discount)

            def _dev(pv: Optional[float], off: Optional[float]) -> Optional[float]:
                if pv is None or off is None or off == 0:
                    return None
                return (pv - off) / off

            input_price_deviation = _dev(
                _effective(pv_row, "input_price_per_1m"),
                _effective(off_row, "input_price_per_1m"),
            )
            output_price_deviation = _dev(
                _effective(pv_row, "output_price_per_1m"),
                _effective(off_row, "output_price_per_1m"),
            )
            cached_input_price_deviation = _dev(
                _effective(pv_row, "cached_input_price_per_1m"),
                _effective(off_row, "cached_input_price_per_1m"),
            )

    return {
        "provider":   provider,
        "model_id":   model_id,
        "model":      spec.display_name if spec else model_id,
        "sample_count": sample_count,
        "success_rate": success_rate,
        "ttft_p50": ttft_p50, "ttft_p95": ttft_p95,
        "tpot_p50": tpot_p50, "tpot_p95": tpot_p95,
        "e2e_p50":  e2e_p50,  "e2e_p95":  e2e_p95,
        "prompt_token_deviation":       avg_prompt_token_deviation,
        "output_token_deviation":       avg_output_token_deviation,
        "input_price_deviation":        input_price_deviation,
        "output_price_deviation":       output_price_deviation,
        "cached_input_price_deviation": cached_input_price_deviation,
    }


def _apply_scores(raw: dict, perf_thresholds: dict[str, tuple[float, float]]) -> dict:
    """Phase 2+3: add dimension scores, total, and rating to a raw metrics dict."""
    trust = _calc_trustworthiness(raw.get("prompt_token_deviation"), raw.get("output_token_deviation"))
    econ  = _calc_economics(raw.get("input_price_deviation"), raw.get("output_price_deviation"), raw.get("cached_input_price_deviation"))
    perf  = _calc_performance(raw, perf_thresholds)
    total = _calc_total(trust, econ, perf)
    return {
        **raw,
        "trustworthiness_score": trust,
        "economics_score":       econ,
        "performance_score":     perf,
        "total_score":           total,
        "rating":                _calc_rating(total),
    }


def compute_all() -> list[dict]:
    """
    Compute metrics for every distinct (provider, model_id) in test_result.
    Performance scores use dynamic thresholds: best across all providers = 100, worst = 0.
    """
    client = get_client()
    rows = client.table("test_result").select("provider,model_id").execute().data
    combos = sorted({(r["provider"], r["model_id"]) for r in rows})

    # Pass 1: raw metrics for all combos
    all_raw = [r for provider, model_id in combos if (r := _compute_raw(provider, model_id, client))]

    # Derive performance thresholds from all providers' actual data
    perf_thresholds = _derive_perf_thresholds(all_raw)

    # Pass 2: apply scores using shared thresholds
    return [_apply_scores(r, perf_thresholds) for r in all_raw]
