"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLang } from "@/lib/contexts/lang";
import { MODELS, PROVIDERS } from "@/lib/data";
import { cx, fmtMoney, fmtPct, fmtUSD, trustTone } from "@/lib/utils";
import { CostCell } from "@/components/ui/cost-cell";
import { Dropdown } from "@/components/ui/dropdown";
import { I } from "@/components/ui/icons";
import { ProviderMark } from "@/components/ui/provider-mark";
import { TierChip } from "@/components/ui/tier-chip";
import type { Provider } from "@/lib/types";

export function RankingSection() {
  const { t } = useLang();
  const [model, setModel] = useState("openai/gpt-5.5");
  const [sort, setSort] = useState<"cost" | "latency" | "trust" | "volume" | "overall">(
    "overall",
  );
  const [crypto, setCrypto] = useState(false);
  const [region, setRegion] = useState<"all" | "us" | "eu" | "global">("all");
  const [windowSel, setWindowSel] = useState<"1h" | "24h" | "7d" | "30d">("24h");
  const [lastRefresh, setLastRefresh] = useState(() => Date.now() - 8 * 60 * 1000);
  const [refreshing, setRefreshing] = useState(false);
  const [now, setNow] = useState(() => Date.now());

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

  const filtered = useMemo(() => {
    let data = [...PROVIDERS];
    if (crypto) data = data.filter((p) => p.crypto);
    if (region !== "all") data = data.filter((p) => p.region.toLowerCase().includes(region));
    const sortKey: Record<typeof sort, (a: Provider, b: Provider) => number> = {
      overall: (a, b) => b.overall - a.overall,
      cost: (a, b) => a.cost - b.cost,
      trust: (a, b) => b.trust - a.trust,
      latency: (a, b) => a.latency - b.latency,
      volume: (a, b) => b.volume7d - a.volume7d,
    };
    return data.sort(sortKey[sort]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, crypto, region]);

  const insight = useMemo(() => {
    if (!filtered.length) return null;
    const cheapest = [...filtered].sort((a, b) => a.cost - b.cost)[0];
    const trusted = [...filtered].sort((a, b) => b.trust - a.trust)[0];
    const overall = [...filtered].sort((a, b) => b.overall - a.overall)[0];
    const avg = filtered.reduce((s, p) => s + p.cost, 0) / filtered.length;
    const cheapPct = avg > 0 ? Math.round(((avg - cheapest.cost) / avg) * 100) : 0;
    return { cheapest, trusted, overall, cheapPct };
  }, [filtered]);

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-16">
      <div className="flex items-end justify-between mb-8 flex-wrap gap-6">
        <div>
          <div className="micro text-smoke mb-2">{t("ranking.sectionTag")}</div>
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
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          title={refreshing ? t("ranking.refreshing") : t("ranking.refreshNow")}
          className="flex items-center gap-2 text-[12px] text-ash hover:text-bone disabled:hover:text-ash disabled:cursor-wait transition-colors px-2.5 py-1.5 border border-ink-600 hover:border-rule-2"
        >
          <I.refresh className={cx("w-3.5 h-3.5", refreshing && "animate-spin")} />
          <span>
            {refreshing
              ? t("ranking.refreshing")
              : t("ranking.refreshLabel", { ago: fmtAgo(now - lastRefresh) })}
          </span>
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="border-y border-ink-600 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 mb-0 bg-ink-800/40">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Dropdown
              label={t("ranking.labelModel")}
              value={MODELS.find((m) => m.id === model)?.display || ""}
              options={MODELS.map((m) => ({ v: m.id, l: m.display }))}
              onChange={setModel}
            />
            <Dropdown
              label={t("ranking.labelRegion")}
              value={region === "all" ? t("ranking.regionAll") : region.toUpperCase()}
              options={[
                { v: "all", l: t("ranking.regionAll") },
                { v: "us", l: "US" },
                { v: "eu", l: "EU" },
                { v: "global", l: "Global" },
              ]}
              onChange={(v) => setRegion(v as typeof region)}
            />
            <Dropdown
              label={t("ranking.labelAsOf")}
              value={t(`ranking.windowLast${windowSel}`)}
              options={[
                { v: "1h", l: t("ranking.windowLast1h") },
                { v: "24h", l: t("ranking.windowLast24h") },
                { v: "7d", l: t("ranking.windowLast7d") },
                { v: "30d", l: t("ranking.windowLast30d") },
              ]}
              onChange={(v) => setWindowSel(v as typeof windowSel)}
            />
            <button
              onClick={() => setCrypto(!crypto)}
              className={cx(
                "flex items-center gap-2 px-3 py-1.5 text-[12px] border transition-colors",
                crypto
                  ? "border-brand text-brand"
                  : "border-ink-500 text-ash hover:text-bone",
              )}
            >
              <span className={cx("check", crypto && "on")}>
                {crypto && <I.check className="w-2.5 h-2.5 text-ink" />}
              </span>
              {t("ranking.cryptoOnly")}
            </button>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto no-scroll-x -mx-4 px-4 sm:-mx-0 sm:px-0">
            <span className="micro text-smoke mr-3 shrink-0">
              {t("ranking.sortLabel")}
            </span>
            {(
              [
                ["cost", "sortCheapest"],
                ["latency", "sortFastest"],
                ["trust", "sortMostTrusted"],
                ["volume", "sortHighestVolume"],
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

      {/* TABLE */}
      <div
        className={cx(
          "border-x border-b border-ink-600 -mx-4 sm:-mx-6 lg:-mx-8 transition-opacity duration-300",
          refreshing && "opacity-50 pointer-events-none",
        )}
      >
        <div className="hidden lg:grid grid-cols-[64px_2fr_1.4fr_1.2fr_140px_1fr_1fr_160px] px-8 py-3 micro text-smoke border-b border-ink-600 bg-ink-800/30">
          <div>{t("ranking.thRank")}</div>
          <div>{t("ranking.thProvider")}</div>
          <div>{t("ranking.thCost")}</div>
          <div>{t("ranking.thScore")}</div>
          <div>{t("ranking.thVolume")}</div>
          <div>{t("ranking.thSuccess")}</div>
          <div>{t("ranking.thLatency")}</div>
          <div className="text-right">{t("ranking.thAction")}</div>
        </div>
        {filtered.map((p, i) => (
          <RankingRow key={p.slug} p={p} rank={i + 1} />
        ))}
      </div>

      {/* INSIGHT */}
      {insight ? (
        <div className="-mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-5 border-b border-ink-600 bg-ink-800/30 flex flex-col md:flex-row md:items-center md:justify-between flex-wrap gap-3 md:gap-4">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8 text-[13px]">
            <span className="flex items-center gap-2">
              <span className="micro text-smoke">{t("ranking.insightCheapest")}</span>
              <span className="text-brand">{insight.cheapest.name}</span>
              <span className="num text-smoke">−{insight.cheapPct}%</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="micro text-smoke">{t("ranking.insightMostTrusted")}</span>
              <span
                className={
                  trustTone(insight.trusted.trust) === "brand"
                    ? "text-brand"
                    : trustTone(insight.trusted.trust) === "amber"
                      ? "text-amber"
                      : "text-coral"
                }
              >
                {insight.trusted.name}
              </span>
              <span className="num text-smoke">{insight.trusted.trust}</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="micro text-smoke">{t("ranking.insightBestOverall")}</span>
              <span className="text-bone">{insight.overall.name}</span>
              <span className="num text-smoke">{insight.overall.overall}</span>
            </span>
          </div>
          <Link
            href={`/run?provider=${insight.cheapest.slug}`}
            className="btn-brand px-4 py-2 text-[12px] font-medium inline-flex items-center justify-center gap-2 self-start md:self-auto"
          >
            {t("ranking.useCheapest")} <I.arrow className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="-mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-12 border-b border-ink-600 bg-ink-800/30 text-center">
          <div className="serif-it text-3xl text-ash">{t("ranking.noProviders")}</div>
          <button
            onClick={() => {
              setCrypto(false);
              setRegion("all");
            }}
            className="mt-3 micro text-brand hover:underline"
          >
            {t("ranking.resetFilters")}
          </button>
        </div>
      )}
    </section>
  );
}

function RankingRow({ p, rank }: { p: Provider; rank: number }) {
  const { t } = useLang();
  return (
    <>
      {/* Desktop layout */}
      <div className="hidden lg:grid rank-row row-hover grid-cols-[64px_2fr_1.4fr_1.2fr_140px_1fr_1fr_160px] px-8 py-5 items-center group fade-up">
        <div>
          <div className="serif-it text-3xl text-ash group-hover:text-brand transition-colors">
            {rank}
          </div>
        </div>
        <div>
          <Link href={`/providers/${p.slug}`} className="block">
            <div className="flex items-center gap-3">
              <ProviderMark slug={p.slug} />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-bone tracking-tight">{p.name}</span>
                  {p.crypto && (
                    <span className="inline-flex items-center gap-1 text-[10px] tracking-wider uppercase border border-sky/40 text-sky px-1.5 py-0.5">
                      <I.dot className="w-1.5 h-1.5" /> {t("ranking.rowCryptoTag")}
                    </span>
                  )}
                </div>
                <div className="micro text-smoke mt-0.5">
                  {p.type} · {p.region}
                </div>
              </div>
            </div>
          </Link>
        </div>
        <div>
          <CostCell costIn={p.costIn} costOut={p.costOut} />
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="num text-[15px] text-bone">{p.overall}</span>
            <TierChip tier={p.tier} />
          </div>
        </div>
        <div>
          <div className="num text-[13px] text-bone">{fmtMoney(p.volume7d, 0)}</div>
          <div className="micro text-smoke mt-0.5">via x402</div>
        </div>
        <div className="num text-[13px]">
          <span
            className={
              p.success >= 0.99
                ? "text-brand"
                : p.success >= 0.97
                  ? "text-bone"
                  : "text-amber"
            }
          >
            {fmtPct(p.success, 1)}
          </span>
        </div>
        <div className="num text-[13px]">
          <span className="text-bone">{p.latency.toFixed(1)}s</span>
          <span className="text-smoke text-[11px]"> / </span>
          <span className="text-ash">{p.p95.toFixed(1)}s</span>
        </div>
        <div className="flex items-center justify-end gap-1.5">
          <Link
            href={`/run?provider=${p.slug}`}
            className="btn-brand px-3 py-1.5 text-[12px] font-medium inline-flex items-center gap-1"
          >
            {t("ranking.rowRun")} <I.arrow className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="lg:hidden rank-row px-4 sm:px-6 py-5 fade-up">
        <Link href={`/providers/${p.slug}`} className="flex items-start gap-3">
          <div className="serif-it text-3xl text-ash w-9 shrink-0 leading-none mt-1">
            {rank}
          </div>
          <ProviderMark slug={p.slug} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-bone tracking-tight text-[15px] truncate">
                {p.name}
              </span>
              {p.crypto && (
                <span className="inline-flex items-center gap-1 text-[10px] tracking-wider uppercase border border-sky/40 text-sky px-1.5 py-0.5">
                  <I.dot className="w-1.5 h-1.5" /> {t("ranking.rowCryptoTag")}
                </span>
              )}
            </div>
            <div className="micro text-smoke mt-0.5 truncate">
              {p.type} · {p.region}
            </div>
          </div>
        </Link>
        <div className="mt-4 grid grid-cols-2 gap-px bg-ink-600 border border-ink-600">
          <div className="bg-ink p-3">
            <div className="micro text-smoke mb-1.5">{t("ranking.mob1MTok")}</div>
            <CostCell costIn={p.costIn} costOut={p.costOut} />
          </div>
          <div className="bg-ink p-3">
            <div className="micro text-smoke mb-1.5">{t("ranking.thScore")}</div>
            <div className="flex items-baseline gap-2">
              <span className="num text-[14px] text-bone">{p.overall}</span>
              <TierChip tier={p.tier} />
            </div>
          </div>
          <div className="bg-ink p-3">
            <div className="micro text-smoke mb-1.5">{t("ranking.thLatency")}</div>
            <div className="num text-[13px]">
              <span className="text-bone">{p.latency.toFixed(1)}s</span>
              <span className="text-smoke text-[11px]"> / </span>
              <span className="text-ash">{p.p95.toFixed(1)}s</span>
            </div>
          </div>
          <div className="bg-ink p-3">
            <div className="micro text-smoke mb-1.5">{t("ranking.thSuccess")}</div>
            <div
              className={cx(
                "num text-[13px]",
                p.success >= 0.99
                  ? "text-brand"
                  : p.success >= 0.97
                    ? "text-bone"
                    : "text-amber",
              )}
            >
              {fmtPct(p.success, 1)}
            </div>
          </div>
          <div className="bg-ink p-3 col-span-2 flex items-baseline justify-between">
            <div className="micro text-smoke">{t("ranking.mob7dVolX402")}</div>
            <div className="num text-[14px] text-bone">{fmtMoney(p.volume7d, 0)}</div>
          </div>
        </div>
        <div className="mt-3">
          <Link
            href={`/run?provider=${p.slug}`}
            className="btn-brand block text-center px-3 py-2 text-[12px] font-medium"
          >
            {t("ranking.rowRun")}
          </Link>
        </div>
      </div>
    </>
  );
}
