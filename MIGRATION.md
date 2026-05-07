# Migration: index.html → Next.js

## Status (commit 1)

The repo has been **converted from a single-file React app to a Next.js 15 + TypeScript project**. The legacy `index.html` is kept locally (gitignored) as the visual reference for any UX detail.

### ✅ Done — engineers can build on top

| Layer | Files |
|---|---|
| Foundation | `package.json`, `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts`, `postcss.config.mjs`, `app/globals.css` (full theme + custom CSS classes ported) |
| Domain types | `lib/types.ts` |
| Data | `lib/data.ts` (8 PROVIDERS, 6 MODELS, HERO_STATS — derived) |
| Scoring | `lib/scoring.ts` (computeL1 / L2 / L3 / Overall, tier, costScore, latencyScore, subNote, tokenCost) |
| Fingerprint | `lib/fingerprint.ts` (fingerprint, syntheticFingerprint, inferProvider, trustHistory + overrides) |
| Mock content | `lib/benchmarks.ts` (BENCHMARK_TEMPLATES, BENCHMARK_RESPONSES, PROVIDER_STYLE, detectBenchmark, getMockResponse) |
| Setup prompt | `lib/setup-prompt.ts` |
| Velocity copy | `lib/velocity-notes.ts` (en + zh) |
| Utilities | `lib/utils.ts` (cx, fmtUSD, fmtPct, fmtMoney, strHash, seededScore, copyToClipboard, trustTone, trustLabel, sevColor) |
| i18n dict | `lib/i18n-dict.ts` — **partial** (nav / header / hero / footer / ticker / common). The remaining namespaces (ranking / insights / docs / validate / wallet / setup / payment / run / provider) need to be copied verbatim from the original `index.html` lines 1265–1908 (en) and 1963–2607 (zh). |
| Contexts | `lib/contexts/{lang,theme,wallet,toast}.tsx` (all 'use client') |
| App shell | `app/layout.tsx`, `app/providers.tsx`, fonts, root html |
| Header / Footer | `components/{header,footer}.tsx` (fully ported with i18n + theme + wallet) |
| Home page | `app/page.tsx` + `components/home/home-page.tsx` — minimal hero stats grid + ranking table. Filters / mobile cards / insight bar / ticker / insights rail still TBD. |
| Stub pages | `/run`, `/validate`, `/wallet`, `/docs`, `/providers/[slug]` — all build to a placeholder card with a link back home. |

`npm run build` passes cleanly. 16 static pages including all 8 provider detail routes.

### 🟡 To do — porting roadmap

Reference: `index.html` (kept locally; gitignored). Search by symbol name to find the source.

1. **Finish `lib/i18n-dict.ts`** — copy the remaining namespaces verbatim from `index.html` lines 1265–1908 (en) and 1963–2607 (zh).
2. **Shared UI** — `components/ui/`:
   - `tier-chip.tsx`, `trust-badge.tsx`, `trust-bar.tsx`, `provider-mark.tsx` (Clearbit logo + SVG fallback for `bai` / `litellm`)
   - `dropdown.tsx`, `model-dropdown.tsx`, `range-input.tsx`, `section.tsx`
   - `modal.tsx`, `sparkline.tsx`, `icons.tsx` (the `I.*` SVG set — see `index.html` ~line 295)
3. **Home** — `components/home/`:
   - `hero.tsx` (rotating adjective animation + 4 stat cards + quote)
   - `ticker-bar.tsx` (live x402 payment events marquee)
   - `ranking-section.tsx` + `ranking-row.tsx` (filters: Model / Region / As-of / Crypto-only; sort: 5 modes; insight bar; mobile cards)
   - `insights-rail.tsx` (3 §03/§04/§05 cards)
4. **Run page** — `app/run/page.tsx` + `components/run/`:
   - `setup-panel.tsx` (Prompt + Model + Providers + Advanced sliders)
   - `empty-run.tsx`, `single-result.tsx`, `status-list.tsx`
   - `summary-cards.tsx`, `response-grid.tsx`, `eval-table.tsx`
   - `difference-analysis.tsx`, `recommended-action.tsx`, `recent-runs.tsx`
   - `useStreamingText` hook for the typewriter effect (see `index.html` ~line 1070)
5. **Provider detail** — `app/providers/[slug]/page.tsx` + `components/provider/`:
   - Header section (logo + meta + CTAs + wallet-pay badge)
   - Metrics row, cost breakdown (per 1M / per typical chat / at scale), score breakdown (L1/L2/L3 + 9 sub-dim collapsible)
   - Trust history card + velocity, incidents list
   - Fingerprint panel (model tabs + bars/rows), supported models matrix
6. **Validate page** — `app/validate/page.tsx` + `components/validate/{form,pipeline,report}.tsx`
7. **Wallet** — `app/wallet/page.tsx` + `components/wallet/{connect-modal,payment-modal,setup-modal}.tsx`
8. **Docs** — `app/docs/page.tsx` + `components/docs/{doc-section,dim-section,sub-dim,methods}.tsx`
9. **Hash router → App Router** — every `<a href="#/...">` in `index.html` becomes `<Link href="/...">`. Provider detail uses `[slug]` dynamic route (already wired). The `?provider=X&providers=X,Y` query params for Run page are preserved with `useSearchParams()` from `next/navigation`.
10. **Cobo Agentic Wallet / Pact** — per the most recent product direction, `SetupPromptModal` and `WalletPage` should reframe around the Pact concept (Intent / Execution Plan / Rules / Termination) instead of generic "Agentic Wallet". x402 demoted to "one of the settlement paths Pact supports". See the user's direction in `.claude/plans/token-in-out-gleaming-clarke.md` (kept locally).

### Patterns engineers should follow

- **'use client' boundary** — anything that uses `useLang` / `useTheme` / `useWallet` / `useToast` / `useState` / `useEffect` must be a client component. Page route files (`app/.../page.tsx`) can stay server components and just render client components.
- **i18n** — always use `t('namespace.key', { vars })` from `useLang()`. Never hardcode user-facing strings.
- **theme switching** — never write a hex color in JSX. Use Tailwind classes (`text-bone`, `bg-ink-700`) or CSS vars (`rgb(var(--brand))`). The `[data-theme="light"]` attribute on `<html>` flips all the variables.
- **Provider-themed content** — pass the typed `Provider` from `@/lib/data` rather than re-deriving from a slug string.

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
npm run typecheck    # strict TS check
```

## Reference files

- `index.html` — original single-file demo (gitignored). Open in any browser for the visual reference.
- `.claude/plans/token-in-out-gleaming-clarke.md` — plan history + Cobo / Pact context note (gitignored).
