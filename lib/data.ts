// lib/data.ts — real data is loaded at runtime via DataContext (lib/contexts/data.tsx).
// These empty exports exist only so that the static-params route file can compile.
// All components should use useData() instead of importing from here.

import type { ModelDef, Provider } from "./types";

export const MODELS: ModelDef[] = [];
export const PROVIDERS: Provider[] = [];

export const HERO_STATS = {
  activeRouters: 0,
  totalSamples: 0,
  variance: 0,
  driftTotal: 0,
  driftMedium: 0,
  paidRuns24h: 0,
  paymentVolume: 0,
  cryptoCount: 0,
};

export const TOTAL_SAMPLES = 0;
