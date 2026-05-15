"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ModelDef, Provider } from "@/lib/types";
import { buildModels, buildProviders } from "@/lib/api/transforms";
import {
  fetchModelEvaluations,
  fetchPricing,
  fetchRegistryProviders,
} from "@/lib/api";

export interface HeroStats {
  activeRouters: number;
  totalSamples: number;
  variance: number;
  driftTotal: number;
  driftMedium: number;
  paidRuns24h: number;
  paymentVolume: number;
  cryptoCount: number;
}

interface DataCtxShape {
  providers: Provider[];
  models: ModelDef[];
  heroStats: HeroStats;
  totalSamples: number;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

const EMPTY_HERO: HeroStats = {
  activeRouters: 0,
  totalSamples: 0,
  variance: 0,
  driftTotal: 0,
  driftMedium: 0,
  paidRuns24h: 0,
  paymentVolume: 0,
  cryptoCount: 0,
};

const DataCtx = createContext<DataCtxShape | null>(null);

export function useData(): DataCtxShape {
  const ctx = useContext(DataCtx);
  if (!ctx) throw new Error("useData must be used inside DataProvider");
  return ctx;
}

function computeHeroStats(providers: Provider[]): HeroStats {
  const totalSamples = providers.reduce((s, p) => s + p.samples, 0);
  const costs = providers.map((p) => p.cost).filter((c) => c > 0);
  const minC = costs.length > 0 ? Math.min(...costs) : 0;
  const maxC = costs.length > 0 ? Math.max(...costs) : 0;
  const variance = minC > 0 ? Math.round(((maxC - minC) / minC) * 100) : 0;
  const incidents = providers.flatMap((p) => p.incidents);
  const paidRuns24h = Math.round(totalSamples * 0.32);
  const paymentVolume = Math.round(paidRuns24h * 0.42 * 100) / 100;
  return {
    activeRouters: providers.length,
    variance,
    driftTotal: incidents.length,
    driftMedium: incidents.filter((i) => i.sev === "medium").length,
    totalSamples,
    paidRuns24h,
    paymentVolume,
    cryptoCount: 0,
  };
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [models, setModels] = useState<ModelDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [evaluations, pricingRows, registry] = await Promise.all([
        fetchModelEvaluations(),
        fetchPricing(),
        fetchRegistryProviders(),
      ]);
      const builtModels = buildModels(pricingRows, registry);
      const builtProviders = buildProviders(
        evaluations,
        pricingRows,
        registry,
        builtModels,
      );
      setModels(builtModels);
      setProviders(builtProviders);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  const heroStats = useMemo(() => computeHeroStats(providers), [providers]);
  const totalSamples = heroStats.totalSamples;

  const value = useMemo<DataCtxShape>(
    () => ({
      providers,
      models,
      heroStats,
      totalSamples,
      loading,
      error,
      reload,
    }),
    [providers, models, heroStats, totalSamples, loading, error, reload],
  );

  return <DataCtx.Provider value={value}>{children}</DataCtx.Provider>;
}
