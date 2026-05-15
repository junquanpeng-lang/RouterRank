"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLang } from "@/lib/contexts/lang";
import { useData } from "@/lib/contexts/data";
import { cx, fmtPct } from "@/lib/utils";
import { CostCell } from "@/components/ui/cost-cell";
import { Dropdown } from "@/components/ui/dropdown";
import { I } from "@/components/ui/icons";
import { ProviderDomainLink } from "@/components/ui/provider-domain-link";
import { ProviderMark } from "@/components/ui/provider-mark";
import { TierChip } from "@/components/ui/tier-chip";
import { Tooltip } from "@/components/ui/tooltip";
import type { Provider } from "@/lib/types";

export function RankingSection() {
  const { t } = useLang();
  const { providers, models, loading } = useData();
  const [model, setModel] = useState("");
  const [sort, setSort] = useState<"cost" | "latency" | "trust" | "overall">("overall");
  const [lastRefresh, setLastRefresh] = useState(() => Date.now() - 8 * 60 * 1000);
  const [refreshing, setRefreshing] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  // Set default model once models load
  useEffect(() => {
    if (models.length > 0 && !model) setModel(models[0].id);
  }, [models, model]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const handleRefresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    setTimeout(() => {
      const ts = Date.now();
      setLastRefresh(ts);
      setNow(ts);
      setRefreshing(false);
    }, 700);
  };

  const fmtAgo = (ms: number): string => {
    const s = Math.max(0, Math.round(ms / 1000));
    if (s < 30) return t("ranking.agoJustNow");
    if (s < 90) return t("ranking.ago1m");
    if (s < 3600) return t("ranking.agoMinutes", { n: Math.round(s / 60) });
    if (s < 7200) return t("ranking.ago1h");
    if (s < 86400) return t("ranking.agoHours", { n: Math.round(s / 3600) });
    return t("ranking.agoDays", { n: Math.round(s / 86400) });
  };

  const blendedCost = (p: Provider): number => {
    const mp = p.modelPricing?.[model];
    return mp ? (mp.listedIn + mp.listedOut) / 2 : Infinity;
  };

  const filtered = useMemo(() => {
    // Only show providers that have pricing data for the selected model.
    const data = providers.filter((p) => p.modelPricing?.[model]);
    const evalScore = (p: Provider) => p.modelEvals[model]?.totalScore ?? p.overall;
    const evalLatency = (p: Provider) => p.modelEvals[model]?.ttftP50Ms ?? p.ttft * 1000;
    const sortKey: Record<typeof sort, (a: Provider, b: Provider) => number> = {
      overall:  (a, b) => evalScore(b) - evalScore(a),
      cost:     (a, b) => blendedCost(a) - blendedCost(b),
      trust:    (a, b) => evalScore(b) - evalScore(a),
      latency:  (a, b) => evalLatency(a) - evalLatency(b),
    };
    return [...data].sort(sortKey[sort]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providers, model, sort]);

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-16">
      {/* Centered header */}
      <div className="text-center mb-8">
        <div className="micro text-smoke mb-3">{t("ranking.sectionTag")}</div>
        <h2 className="serif text-3xl sm:text-4xl lg:text-5xl tracking-editorial">
          {t("ranking.headlinePre")}
          <span className="serif-it text-brand">{t("ranking.headlineItalic")}</span>
          {t("ranking.headlinePost")}
          {t("ranking.headlineLine2") ? (
            <>
              <br />
              {t("ranking.headlineLine2")}
            </>
          ) : null}
        </h2>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          title={refreshing ? t("ranking.refreshing") : t("ranking.refreshNow")}
          className="mt-5 inline-flex items-center gap-2 text-[12px] text-ash hover:text-bone disabled:hover:text-ash disabled:cursor-wait transition-colors px-2.5 py-1.5 border border-ink-600 hover:border-rule-2"
        >
          <I.refresh className={cx("w-3.5 h-3.5", refreshing && "animate-spin")} />
          <span>
            {refreshing
              ? t("ranking.refreshing")
              : t("ranking.refreshLabel", { ago: fmtAgo(now - lastRefresh) })}
          </span>
        </button>
      </div>

      {/* Filter bar + table — single bordered container */}
      <div className="border border-ink-600 -mx-4 sm:-mx-6 lg:-mx-8">
        {/* Filter bar */}
        <div className="px-4 sm:px-6 lg:px-8 py-4 border-b border-ink-600 bg-ink-800/40">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Dropdown
                label={t("ranking.labelModel")}
                value={models.find((m) => m.id === model)?.display || ""}
                options={models.map((m) => ({ v: m.id, l: m.display }))}
                onChange={setModel}
              />
            </div>
            <div className="flex items-center gap-1 overflow-x-auto no-scroll-x -mx-4 px-4 sm:-mx-0 sm:px-0">
              <span className="micro text-smoke mr-3 shrink-0">{t("ranking.sortLabel")}</span>
              {(
                [
                  ["cost",    "sortCheapest"],
                  ["latency", "sortFastest"],
                  ["trust",   "sortMostTrusted"],
                  ["overall", "sortBestOverall"],
                ] as const
              ).map(([v, key]) => (
                <button
                  key={v}
                  onClick={() => setSort(v)}
                  className={cx(
                    "px-3 py-1.5 text-[12px] tracking-tight transition-colors shrink-0",
                    sort === v ? "text-ink bg-brand" : "text-ash hover:text-bone",
                  )}
                >
                  {t(`ranking.${key}`)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className={cx("transition-opacity duration-300", refreshing && "opacity-50 pointer-events-none")}>
          <div className="hidden lg:grid grid-cols-[64px_2fr_1.4fr_1.6fr_1.2fr_1.2fr_160px] px-8 py-3 micro text-smoke border-b border-ink-600 bg-ink-800/30">
            <div>{t("ranking.thRank")}</div>
            <div>{t("ranking.thProvider")}</div>
            <div className="flex items-center gap-1.5">
              <span>{t("ranking.thScore")}</span>
              <Tooltip content={t("ranking.thScoreHint")}><I.info className="w-3 h-3" /></Tooltip>
            </div>
            <div className="flex items-center gap-1.5">
              <span>{t("ranking.thCost")}</span>
              <Tooltip content={t("ranking.thCostHint")}><I.info className="w-3 h-3" /></Tooltip>
            </div>
            <div className="flex items-center gap-1.5">
              <span>{t("ranking.thSuccess")}</span>
              <Tooltip content={t("ranking.thSuccessHint")}><I.info className="w-3 h-3" /></Tooltip>
            </div>
            <div className="flex items-center gap-1.5">
              <span>{t("ranking.thLatency")}</span>
              <Tooltip content={t("ranking.thLatencyHint")}><I.info className="w-3 h-3" /></Tooltip>
            </div>
            <div className="text-right">{t("ranking.thAction")}</div>
          </div>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rank-row px-4 lg:px-8 py-5 flex items-center gap-4 animate-pulse">
                <div className="w-8 h-4 bg-ink-600 rounded" />
                <div className="w-8 h-8 bg-ink-600 rounded-sm" />
                <div className="flex-1 h-4 bg-ink-600 rounded max-w-[160px]" />
                <div className="hidden lg:flex flex-1 gap-4">
                  <div className="h-4 bg-ink-600 rounded w-16" />
                  <div className="h-4 bg-ink-600 rounded w-20" />
                  <div className="h-4 bg-ink-600 rounded w-16" />
                  <div className="h-4 bg-ink-600 rounded w-16" />
                </div>
              </div>
            ))
          ) : filtered.length > 0 ? (
            filtered.map((p, i) => (
              <RankingRow key={p.slug} p={p} rank={i + 1} modelId={model} />
            ))
          ) : (
            <div className="px-8 py-12 text-center">
              <div className="serif-it text-3xl text-ash">{t("ranking.noProviders")}</div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function RankingRow({ p, rank, modelId }: { p: Provider; rank: number; modelId: string }) {
  const { t } = useLang();
  const ev = p.modelEvals[modelId];
  const score       = ev?.totalScore  ?? p.overall;
  const rating      = ev?.rating      ?? p.tier;
  const successRate = ev?.successRate ?? p.success;
  const latencySec  = ev ? ev.ttftP50Ms / 1000 : p.ttft;
  const p95Sec      = ev ? ev.ttftP95Ms / 1000 : p.p95;

  return (
    <>
      {/* Desktop — stretched link covers the row; Run button lifts to z-[2] */}
      <div className="hidden lg:grid rank-row row-hover grid-cols-[64px_2fr_1.4fr_1.6fr_1.2fr_1.2fr_160px] px-8 py-5 items-center group fade-up relative">
        <Link href={`/providers/${p.slug}`} aria-label={p.name} className="absolute inset-0 z-[1]" />
        <div>
          <div className="serif-it text-3xl text-ash group-hover:text-brand transition-colors">{rank}</div>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <ProviderMark slug={p.slug} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-bone tracking-tight truncate group-hover:text-brand transition-colors">
                  {p.name}
                </span>
              </div>
              <ProviderDomainLink p={p} />
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="num text-[14px] text-bone">{score}</span>
            <TierChip tier={rating} />
          </div>
        </div>
        <div>
          <CostCell p={p} modelId={modelId} />
        </div>
        <div className="num text-[14px]">
          <span className={successRate >= 0.99 ? "text-brand" : successRate >= 0.97 ? "text-bone" : "text-amber"}>
            {fmtPct(successRate, 1)}
          </span>
        </div>
        <div className="num text-[14px]">
          <span className="text-bone">{latencySec.toFixed(1)}s</span>
          <span className="text-smoke text-[11px]"> / </span>
          <span className="text-ash">{p95Sec.toFixed(1)}s</span>
        </div>
        <div className="relative z-[2] flex items-center justify-end gap-1.5">
          <Link
            href={`/run?provider=${p.slug}`}
            className="btn-brand px-3 py-1.5 text-[12px] font-medium inline-flex items-center gap-1"
          >
            {t("ranking.rowRun")} <I.arrow className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Mobile — card with stretched link */}
      <div className="lg:hidden rank-row row-hover px-4 sm:px-6 py-5 fade-up relative group">
        <Link href={`/providers/${p.slug}`} aria-label={p.name} className="absolute inset-0 z-[1]" />
        <div className="flex items-start gap-3">
          <div className="serif-it text-3xl text-ash w-9 shrink-0 leading-none mt-1">{rank}</div>
          <ProviderMark slug={p.slug} />
          <div className="flex-1 min-w-0">
            <span className="text-bone tracking-tight text-[15px] truncate group-hover:text-brand transition-colors block">
              {p.name}
            </span>
            <ProviderDomainLink p={p} />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-px bg-ink-600 border border-ink-600">
          <div className="bg-ink p-3">
            <div className="micro text-smoke mb-1.5 flex items-center gap-1.5">
              <span>{t("ranking.thScore")}</span>
              <Tooltip content={t("ranking.thScoreHint")}><I.info className="w-3 h-3" /></Tooltip>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="num text-[14px] text-bone">{score}</span>
              <TierChip tier={rating} />
            </div>
          </div>
          <div className="bg-ink p-3">
            <div className="micro text-smoke mb-1.5 flex items-center gap-1.5">
              <span>{t("ranking.thCost")}</span>
              <Tooltip content={t("ranking.thCostHint")}><I.info className="w-3 h-3" /></Tooltip>
            </div>
            <CostCell p={p} modelId={modelId} />
          </div>
          <div className="bg-ink p-3">
            <div className="micro text-smoke mb-1.5 flex items-center gap-1.5">
              <span>{t("ranking.thLatency")}</span>
              <Tooltip content={t("ranking.thLatencyHint")}><I.info className="w-3 h-3" /></Tooltip>
            </div>
            <div className="num text-[14px]">
              <span className="text-bone">{latencySec.toFixed(1)}s</span>
              <span className="text-smoke text-[11px]"> / </span>
              <span className="text-ash">{p95Sec.toFixed(1)}s</span>
            </div>
          </div>
          <div className="bg-ink p-3">
            <div className="micro text-smoke mb-1.5 flex items-center gap-1.5">
              <span>{t("ranking.thSuccess")}</span>
              <Tooltip content={t("ranking.thSuccessHint")}><I.info className="w-3 h-3" /></Tooltip>
            </div>
            <div className={cx("num text-[14px]", successRate >= 0.99 ? "text-brand" : successRate >= 0.97 ? "text-bone" : "text-amber")}>
              {fmtPct(successRate, 1)}
            </div>
          </div>
        </div>
        <div className="mt-3 relative z-[2]">
          <Link
            href={`/run?provider=${p.slug}`}
            className="btn-brand w-full text-center px-3 py-2 text-[12px] font-medium inline-flex items-center justify-center gap-1"
          >
            {t("ranking.rowRun")} <I.arrow className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </>
  );
}
