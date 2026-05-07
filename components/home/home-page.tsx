"use client";

import Link from "next/link";
import { useLang } from "@/lib/contexts/lang";
import { useTheme } from "@/lib/contexts/theme";
import { HERO_STATS, PROVIDERS } from "@/lib/data";
import { fmtMoney, fmtUSD } from "@/lib/utils";

// Minimal home page — full version (Hero / TickerBar / RankingSection /
// InsightsRail) lives in index.html and is being modularized. This stub
// wires up the data + i18n + theme so engineers can iterate.

export function HomePage() {
  const { t } = useLang();
  useTheme(); // ensures theme attribute is hydrated

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
      {/* Mini hero */}
      <section className="border-b border-ink-600 pb-12">
        <div className="micro text-smoke">{t("hero.issue")}</div>
        <h1 className="serif text-5xl sm:text-6xl lg:text-7xl tracking-editorial leading-none mt-3">
          {t("hero.findThe")}{" "}
          <span className="serif-it text-brand">{t("hero.adjMostTrusted")}</span>{" "}
          {t("hero.aiRouter")}
        </h1>
        <p className="mt-6 text-ash text-lg leading-relaxed max-w-2xl">
          {t("hero.subhead1")} {t("hero.subhead2")}
        </p>
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-px bg-ink-600 border border-ink-600 max-w-3xl">
          <Stat label={t("hero.activeRouters")} value={HERO_STATS.activeRouters} sub={t("hero.cryptoRailsSub", { n: HERO_STATS.cryptoCount })} />
          <Stat label={t("hero.walletPaid24h")} value={fmtMoney(HERO_STATS.paymentVolume, 0)} sub={t("hero.paidRunsX402", { n: HERO_STATS.paidRuns24h.toLocaleString() })} />
          <Stat label={t("hero.costVariance")} value={`${HERO_STATS.variance}%`} sub={t("hero.costVarianceSub")} />
          <Stat label={t("hero.driftEvents")} value={HERO_STATS.driftTotal} sub={t("hero.driftSub", { n: HERO_STATS.driftMedium })} />
        </div>
      </section>

      {/* Minimal ranking table */}
      <section className="pt-12">
        <div className="micro text-smoke mb-3">{t("ranking.sectionTag")}</div>
        <h2 className="serif text-3xl sm:text-4xl tracking-editorial mb-8">
          {t("ranking.headlinePre")}
          <span className="serif-it text-brand">{t("ranking.headlineItalic")}</span>
          {t("ranking.headlinePost")}
          {t("ranking.headlineLine2") && (
            <>
              <br />
              {t("ranking.headlineLine2")}
            </>
          )}
        </h2>

        <div className="border border-ink-600 -mx-4 sm:-mx-6 lg:-mx-8 overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-[64px_2fr_1fr_1fr_1fr_120px] px-6 py-3 micro text-smoke border-b border-ink-600 bg-ink-800/40">
              <div>{t("ranking.thRank")}</div>
              <div>{t("ranking.thProvider")}</div>
              <div>{t("ranking.thCost")}</div>
              <div>{t("ranking.thScore")}</div>
              <div>{t("ranking.thLatency")}</div>
              <div className="text-right">{t("ranking.thAction")}</div>
            </div>
            {[...PROVIDERS]
              .sort((a, b) => b.overall - a.overall)
              .map((p, i) => (
                <div
                  key={p.slug}
                  className="grid grid-cols-[64px_2fr_1fr_1fr_1fr_120px] px-6 py-5 items-center rank-row row-hover"
                >
                  <div className="serif-it text-3xl text-ash">{i + 1}</div>
                  <Link href={`/providers/${p.slug}`} className="block">
                    <div className="text-bone tracking-tight">{p.name}</div>
                    <div className="micro text-smoke mt-0.5">
                      {p.type} · {p.region}
                    </div>
                  </Link>
                  <div className="num text-[13px] text-bone">
                    {fmtUSD(p.costIn)} <span className="text-smoke">/</span> {fmtUSD(p.costOut)}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="num text-[15px] text-bone">{p.overall}</span>
                    <span className="text-[10px] tracking-wider text-brand">{p.tier}</span>
                  </div>
                  <div className="num text-[13px] text-bone">
                    {p.latency.toFixed(1)}s
                    <span className="text-smoke text-[11px]"> / </span>
                    <span className="text-ash">{p.p95.toFixed(1)}s</span>
                  </div>
                  <div className="flex items-center justify-end">
                    <Link
                      href={`/run?provider=${p.slug}`}
                      className="btn-brand px-3 py-1.5 text-[12px] font-medium"
                    >
                      {t("ranking.rowRun")}
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      <div className="mt-16 card p-6 max-w-2xl">
        <div className="micro text-smoke mb-2">Migration in progress</div>
        <p className="text-[13px] text-ash leading-relaxed">
          The full ranking experience (filters, mobile cards, insight bar, ticker, insights rail)
          is being ported from the original <code className="num text-bone">index.html</code> to
          modular Next.js components. See <code className="num text-bone">MIGRATION.md</code>.
        </p>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub: string;
}) {
  return (
    <div className="bg-ink p-4">
      <div className="micro text-smoke">{label}</div>
      <div className="serif text-4xl tracking-editorial text-bone mt-1">{value}</div>
      <div className="text-[11px] text-ash mt-1">{sub}</div>
    </div>
  );
}
