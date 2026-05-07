# GatewayBench

> A transparency study of AI routers — cost truth, latency, model fidelity, and on-chain payment rails.

GatewayBench is the framework behind RouterRank, a public ledger of AI router behavior for developers who refuse to take vendor claims at face value. Three tiers, nine dimensions, all anchored to published research.

## Live preview

This repository is a self-contained single-file React app (no build step). Open `index.html` in any browser, or deploy via GitHub Pages.

```bash
# Local viewing
open index.html
# or
python3 -m http.server 8000   # then visit http://localhost:8000
```

## What's inside

- **Ranking** — 8 routers across 6 frontier models, sorted by GatewayBench composite score (L1 Trust 40% · L3 Economics 40% · L2 Performance 20%).
- **Run** — Send identical prompts through 1–5 routers in parallel, watch real-time output, compare on a 9-dimension scorecard.
- **Validate** — Paste any chat-completions URL; we run a one-shot fingerprint probe (embedding distance, length distribution, tokenizer signature, precision estimate, refusal alignment).
- **Provider detail** — Model fingerprint per (router × model), trust velocity over 30 days, recent incidents, supported model matrix.
- **Wallet + x402** — Pay-per-request via Agentic Wallet (USDC on Base, ~3s settlement).

## GatewayBench rubric

| Tier | Dimension | Weight | Core question |
| --- | --- | --- | --- |
| L1 | Trustworthiness | 40% | Is it really the model & service it claims? |
| L3 | Economics | 40% | How much does it actually cost? |
| L2 | Performance | 20% | How fast and how stable? |

Each tier decomposes into 3 sub-dimensions (9 total). See the in-app **Methodology** page for the full rubric, citations to RUT, CoIn, PALACE, Etalon, and others.

## Status

This is a product preview built on mock data. Trust scores, fingerprint readings, latency and cost figures are illustrative — not investment, integration or procurement advice.

## License

TBD.
