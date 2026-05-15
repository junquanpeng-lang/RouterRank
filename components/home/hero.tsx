"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLang } from "@/lib/contexts/lang";
import { useData } from "@/lib/contexts/data";
import { cx } from "@/lib/utils";
import { CountUp } from "@/components/ui/count-up";
import { I } from "@/components/ui/icons";
import { TierChip } from "@/components/ui/tier-chip";

export function Hero() {
  const { t, lang } = useLang();
  const { heroStats, models } = useData();
  const [adj, setAdj] = useState(0);

  const adjs = useMemo(() => [
    { word: t("hero.adjCheapest"),    tone: "text-brand" },
    { word: t("hero.adjMostTrusted"), tone: "text-amber" },
    { word: t("hero.adjFastest"),     tone: "text-sky" },
  ], [t]);

  useEffect(() => {
    const id = setInterval(() => setAdj((a) => (a + 1) % adjs.length), 2400);
    return () => clearInterval(id);
  }, [adjs.length]);

  const tiers = [
    { key: "l1", weight: 40, color: "text-brand", bar: "bg-brand" },
    { key: "l2", weight: 20, color: "text-sky",   bar: "bg-sky"   },
    { key: "l3", weight: 40, color: "text-amber",  bar: "bg-amber" },
  ];

  return (
    <section className="relative hero-glow grid-bg overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-12 lg:pt-16 pb-12 lg:pb-16">
        <div className="grid lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-16 items-start">

          {/* LEFT — pitch */}
          <div>
            <div className="micro text-smoke mb-4 fade-up" style={{ animationDelay: "0s" }}>
              §00 · {lang === "zh" ? "API 中转站评测台" : "API Gateway Benchmark"}
            </div>
            <h1
              className="serif leading-[0.95] tracking-editorial fade-up"
              style={{ animationDelay: "0.05s", fontSize: "clamp(44px, 6.4vw, 84px)" }}
            >
              {t("hero.findThe")}<br />
              <span className={cx("serif-it transition-colors duration-500 inline-block", adjs[adj].tone)}>
                {adjs[adj].word}
              </span><br />
              <span className="text-bone">{t("hero.aiRouter")}</span>
            </h1>
            <p
              className="mt-6 sm:mt-8 max-w-xl text-ash text-[15px] sm:text-base leading-relaxed fade-up"
              style={{ animationDelay: "0.1s" }}
            >
              {t("hero.subhead1")}{" "}
              <span className="text-smoke">{t("hero.subhead2")}</span>
            </p>
            <div
              className="mt-7 sm:mt-9 flex flex-wrap items-center gap-3 fade-up"
              style={{ animationDelay: "0.15s" }}
            >
              <Link
                href="/run"
                className="btn-brand px-6 py-3 text-sm font-medium tracking-tight inline-flex items-center gap-2"
              >
                {t("hero.openRun")} <I.arrow className="w-4 h-4" />
              </Link>
              <Link
                href="/docs"
                className="btn-ghost px-5 py-3 text-sm tracking-tight inline-flex items-center gap-2"
              >
                {t("homeMethodology.link")} <I.arrow className="w-4 h-4" />
              </Link>
            </div>
            <div
              className="mt-8 sm:mt-10 flex items-center gap-3 sm:gap-5 micro text-smoke flex-wrap fade-up"
              style={{ animationDelay: "0.2s" }}
            >
              <span><CountUp target={heroStats.activeRouters} /> {t("homeMethodology.heroStripRouters")}</span>
              <span className="text-ink-500">·</span>
              <span><CountUp target={models.length} /> {t("homeMethodology.heroStripModels")}</span>
              <span className="text-ink-500">·</span>
              <span><CountUp target={heroStats.totalSamples} duration={1500} /> {t("homeMethodology.heroStripSamples")}</span>
            </div>
          </div>

          {/* RIGHT — methodology card */}
          <div className="fade-up" style={{ animationDelay: "0.28s" }}>
            <div className="card relative overflow-hidden">
              {/* Top brand gradient line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand/70 to-transparent" />

              <div className="p-6 sm:p-7">
                {/* Header */}
                <div className="flex items-baseline justify-between mb-5">
                  <div className="micro text-smoke flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-brand rounded-full pulse-dot" />
                    {t("homeMethodology.tag")}
                  </div>
                  <Link href="/docs" className="micro text-brand hover:underline inline-flex items-center gap-1">
                    {t("homeMethodology.link")} <I.arrow className="w-3 h-3" />
                  </Link>
                </div>

                {/* Compact headline */}
                <h2 className="serif text-[28px] sm:text-[32px] tracking-editorial leading-[1.1]">
                  {t("homeMethodology.headlinePre")}{" "}
                  <span className="serif-it text-brand">{t("homeMethodology.headlineIt")}</span>
                  {t("homeMethodology.headlinePost")}
                </h2>
                <p className="mt-2 text-ash text-[12.5px] leading-relaxed">{t("homeMethodology.subhead")}</p>

                {/* Tier rows */}
                <div className="mt-6 space-y-px bg-ink-600 border border-ink-600">
                  {tiers.map((tier, i) => (
                    <div
                      key={tier.key}
                      className="bg-ink p-4 transition-colors hover:bg-ink-800 group fade-up"
                      style={{ animationDelay: `${0.35 + i * 0.07}s` }}
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <div className={cx("serif text-[18px] tracking-editorial", tier.color)}>
                          {t(`homeMethodology.${tier.key}Label`)}
                        </div>
                        <div className={cx("num text-[11px] opacity-60 group-hover:opacity-100 transition-opacity", tier.color)}>
                          {tier.weight}%
                        </div>
                      </div>
                      <div className="mt-1.5 text-[11.5px] text-smoke">
                        {t(`homeMethodology.${tier.key}d1`)}
                        <span className="text-ink-500 mx-1.5">·</span>
                        {t(`homeMethodology.${tier.key}d2`)}
                        <span className="text-ink-500 mx-1.5">·</span>
                        {t(`homeMethodology.${tier.key}d3`)}
                      </div>
                      {/* Weight bar */}
                      <div className="mt-3 h-0.5 bg-ink-700 relative overflow-hidden">
                        <div
                          className={cx("absolute inset-y-0 left-0 transition-all duration-1000", tier.bar)}
                          style={{ width: `${tier.weight}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Formula + tier ladder */}
                <div className="mt-5 pt-4 border-t border-ink-600 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="micro text-smoke">{t("homeMethodology.formulaLabel")}</span>
                    <span className="num text-bone">{t("homeMethodology.formula")}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {(["AAA", "AA", "A", "B", "C"] as const).map((tier) => (
                      <TierChip key={tier} tier={tier} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
