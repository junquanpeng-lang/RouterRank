"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLang } from "@/lib/contexts/lang";
import { HERO_STATS, MODELS } from "@/lib/data";
import { cx, fmtMoney } from "@/lib/utils";
import { I } from "@/components/ui/icons";

export function Hero() {
  const { t } = useLang();
  const [adj, setAdj] = useState(0);

  const adjs = [
    { word: t("hero.adjCheapest"), tone: "text-brand" },
    { word: t("hero.adjMostTrusted"), tone: "text-amber" },
    { word: t("hero.adjFastest"), tone: "text-sky" },
    { word: t("hero.adjCryptoNative"), tone: "text-bone" },
  ];

  useEffect(() => {
    const id = setInterval(() => setAdj((a) => (a + 1) % adjs.length), 2400);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live wallet-paid volume — tick every ~5s with mock increments
  const [volume, setVolume] = useState(HERO_STATS.paymentVolume);
  const [paidRuns, setPaidRuns] = useState(HERO_STATS.paidRuns24h);
  useEffect(() => {
    const id = setInterval(() => {
      const bump = 0.18 + Math.random() * 0.5;
      const ranBumped = Math.random() < 0.65;
      setVolume((v) => Math.round((v + bump) * 100) / 100);
      if (ranBumped) setPaidRuns((r) => r + 1);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative hero-glow grid-bg">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-20 pb-16 lg:pb-24">
        <div className="grid md:grid-cols-12 gap-8 md:gap-10">
          <div className="md:col-span-8">
            <div
              className="flex items-center gap-3 micro text-smoke fade-up flex-wrap"
              style={{ animationDelay: "0s" }}
            >
              <span className="w-6 h-px bg-brand"></span>
              <span>{t("hero.issue")}</span>
              <span className="hidden sm:inline w-6 h-px bg-rule-2"></span>
              <span className="hidden sm:inline text-ash">{t("hero.preface")}</span>
            </div>
            <h1
              className="mt-6 serif leading-[0.92] tracking-editorial fade-up"
              style={{
                animationDelay: "0.05s",
                fontSize: "clamp(48px, 9vw, 112px)",
              }}
            >
              {t("hero.findThe")}
              <br />
              <span
                className={cx(
                  "serif-it transition-colors duration-500 inline-block",
                  adjs[adj].tone,
                )}
              >
                {adjs[adj].word}
              </span>
              <br />
              <span className="text-bone">{t("hero.aiRouter")}</span>
            </h1>
            <p
              className="mt-6 sm:mt-8 max-w-2xl text-ash text-base sm:text-lg leading-relaxed fade-up"
              style={{ animationDelay: "0.1s" }}
            >
              {t("hero.subhead1")}
              <br className="hidden sm:inline" />
              <span className="text-smoke">{t("hero.subhead2")}</span>
            </p>
            <div
              className="mt-8 sm:mt-10 flex flex-col sm:flex-row sm:items-center gap-3 fade-up"
              style={{ animationDelay: "0.15s" }}
            >
              <Link
                href="/run"
                className="btn-brand px-5 py-3 text-sm font-medium tracking-tight inline-flex items-center gap-2 justify-center sm:justify-start"
              >
                {t("hero.openRun")} <I.arrow className="w-4 h-4" />
              </Link>
              <span className="hidden lg:inline-flex micro text-smoke ml-3">
                <span className="kbd mr-2">⌘</span>{" "}
                <span className="kbd">K</span>
              </span>
            </div>
          </div>

          <div
            className="md:col-span-4 fade-up"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="card p-6 relative">
              <div className="micro text-smoke mb-4 flex items-center justify-between">
                <span>{t("hero.liveSignal")}</span>
                <span className="num text-ash text-[10px]">14:04:21Z</span>
              </div>
              <div className="space-y-5">
                <Stat
                  live
                  label={t("hero.walletPaid24h")}
                  value={fmtMoney(volume)}
                  sub={t("hero.paidRunsX402", {
                    n: paidRuns.toLocaleString(),
                  })}
                  tone="brand"
                />
                <Stat
                  label={t("hero.activeRouters")}
                  value={String(HERO_STATS.activeRouters)}
                  sub={t("hero.cryptoRailsSub", { n: HERO_STATS.cryptoCount })}
                />
                <Stat
                  label={t("hero.costVariance")}
                  value={`${HERO_STATS.variance}%`}
                  sub={t("hero.costVarianceSub")}
                  tone="amber"
                />
                <Stat
                  label={t("hero.driftEvents")}
                  value={String(HERO_STATS.driftTotal)}
                  sub={t("hero.driftSub", { n: HERO_STATS.driftMedium })}
                  tone="amber"
                />
                <Stat
                  label={t("hero.sampledRequests")}
                  value={HERO_STATS.totalSamples.toLocaleString()}
                  sub={t("hero.acrossModels", { n: MODELS.length })}
                />
              </div>
              <div className="absolute inset-0 pointer-events-none">
                <svg
                  className="absolute -top-px left-0 right-0"
                  height="2"
                  width="100%"
                >
                  <line
                    x1="0"
                    y1="1"
                    x2="100%"
                    y2="1"
                    stroke="rgb(var(--brand))"
                    strokeWidth="1"
                    strokeDasharray="2 4"
                    opacity="0.4"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-6 text-[13px] text-smoke leading-relaxed">
              <span className="serif-it text-bone text-base">
                {t("hero.quote")}
              </span>
              <div className="mt-2 micro">{t("hero.quoteAttr")}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  sub,
  tone = "brand",
  live = false,
}: {
  label: string;
  value: string;
  sub: string;
  tone?: "brand" | "amber" | "bone";
  live?: boolean;
}) {
  const tones = {
    brand: "text-brand",
    amber: "text-amber",
    bone: "text-bone",
  };
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-ink-600 pb-3 last:border-0 last:pb-0">
      <div className="micro text-smoke flex items-center gap-1.5">
        {live && (
          <span className="w-1.5 h-1.5 bg-brand rounded-full pulse-dot" />
        )}
        {label}
      </div>
      <div className="text-right">
        <div
          key={live ? value : undefined}
          className={cx(
            "serif text-3xl tracking-editorial",
            tones[tone],
            live && "flicker",
          )}
        >
          {value}
        </div>
        <div className="text-[11px] text-ash mt-0.5">{sub}</div>
      </div>
    </div>
  );
}
