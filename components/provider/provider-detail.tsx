"use client";

import Link from "next/link";
import { Fragment, useState } from "react";
import { useLang } from "@/lib/contexts/lang";
import { MODELS, PROVIDERS } from "@/lib/data";
import { fingerprint, trustHistory } from "@/lib/fingerprint";
import { subNote } from "@/lib/scoring";
import {
  cx,
  fmtMoney,
  fmtPct,
  fmtUSD,
  trustLabel,
  trustTone,
  sevColor,
} from "@/lib/utils";
import { VELOCITY_NOTES } from "@/lib/velocity-notes";
import { I } from "@/components/ui/icons";
import { ProviderMark } from "@/components/ui/provider-mark";
import { Sparkline } from "@/components/ui/sparkline";
import { TierChip } from "@/components/ui/tier-chip";
import { SetupPromptModal } from "@/components/wallet/setup-prompt-modal";
import type { FingerprintResult, ModelDef, Provider } from "@/lib/types";

export function ProviderDetail({ slug }: { slug: string }) {
  const { t } = useLang();
  const p = PROVIDERS.find((x) => x.slug === slug);
  const [showSetup, setShowSetup] = useState(false);

  if (!p) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center text-smoke">
        {t("provider.notFound")}
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-12">
      <Link
        href="/"
        className="micro text-smoke hover:text-bone inline-flex items-center gap-1.5 mb-8"
      >
        <span>←</span> {t("provider.backToRanking")}
      </Link>

      <div className="border-b border-ink-600 pb-10 mb-12 flex items-end justify-between flex-wrap gap-6">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <ProviderMark slug={slug} size={64} />
            <div>
              <div className="micro text-smoke flex items-center gap-2 flex-wrap">
                <span>
                  {p.type} · {p.region}
                </span>
                {p.website && (
                  <Fragment>
                    <span>·</span>
                    <a
                      href={p.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-bone inline-flex items-center gap-1 transition-colors"
                    >
                      <span className="normal-case tracking-normal">
                        {p.domain || p.website.replace(/^https?:\/\//, "")}
                      </span>
                      <I.external className="w-2.5 h-2.5" />
                    </a>
                  </Fragment>
                )}
              </div>
              <h1 className="serif text-4xl sm:text-5xl lg:text-6xl tracking-editorial">
                {p.name}
              </h1>
            </div>
          </div>
          <p className="text-ash text-[15px] max-w-2xl leading-relaxed">{p.desc}</p>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <Link
            href={`/run?provider=${slug}`}
            className="btn-brand px-5 py-2.5 text-sm font-medium inline-flex items-center gap-2"
          >
            {t("provider.openInRun")} <I.arrow className="w-4 h-4" />
          </Link>
          <button
            onClick={() => setShowSetup(true)}
            className="btn-ghost px-5 py-2 text-sm inline-flex items-center gap-2"
          >
            <I.bolt className="w-4 h-4" /> {t("provider.setupViaAgent")}
          </button>
          {p.walletPay && (
            <span className="inline-flex items-center gap-1.5 text-[11px] border border-sky/40 text-sky px-2.5 py-1 mt-2">
              <I.dot className="w-2 h-2" /> {t("provider.walletPaySupported")}
            </span>
          )}
        </div>
      </div>

      {showSetup && (
        <SetupPromptModal provider={p} onClose={() => setShowSetup(false)} />
      )}

      {/* METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-ink-600 mb-12">
        <Metric
          label={t("provider.m1MTokInOut")}
          value={`${fmtUSD(p.costIn)} / ${fmtUSD(p.costOut)}`}
          tone={p.costDelta < 0 ? "brand" : p.costDelta > 10 ? "coral" : "bone"}
        />
        <TrustHistoryCard p={p} />
        <Metric
          label={t("provider.mP50Latency")}
          value={`${p.latency}s`}
          sub={t("provider.mP95", { v: String(p.p95) })}
        />
        <Metric
          label={t("provider.mSuccess")}
          value={fmtPct(p.success, 1)}
          sub={t("provider.mSamples", { n: p.samples.toLocaleString() })}
        />
        <Metric
          label={t("provider.mWallet")}
          value={p.walletPay ? t("provider.mWalletYes") : t("provider.mWalletNo")}
          sub={p.crypto ? t("provider.mCryptoRails") : t("provider.mCardOnly")}
          tone={p.walletPay ? "sky" : "bone"}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* COST */}
        <div className="lg:col-span-2">
          <CostBreakdown p={p} />
        </div>

        {/* SCORE BREAKDOWN */}
        <div>
          <ScoreBreakdown p={p} />
          <TrustVelocity p={p} />
        </div>
      </div>

      {/* INCIDENTS */}
      <div className="mt-16">
        <div className="micro text-smoke mb-3">{t("provider.tagIncidents")}</div>
        <div className="card divide-y divide-ink-600">
          {p.incidents.length === 0 ? (
            <div className="px-6 py-8 text-ash text-[13px]">
              {t("provider.noIncidents")}
            </div>
          ) : (
            p.incidents.map((inc, i) => (
              <div
                key={i}
                className="grid grid-cols-[140px_1fr_140px] px-6 py-4 items-center"
              >
                <div className="num text-[12px] text-smoke">{inc.time}</div>
                <div className="text-[13px] text-bone">{inc.issue}</div>
                <div
                  className={cx(
                    "micro flex items-center gap-2 justify-end",
                    sevColor(inc.sev),
                  )}
                >
                  <I.dot className="w-2 h-2" />
                  {t(
                    "provider.sev" +
                      (inc.sev === "high"
                        ? "High"
                        : inc.sev === "medium"
                          ? "Med"
                          : "Low"),
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODEL FINGERPRINT */}
      <FingerprintPanel p={p} />

      {/* SUPPORTED MODELS */}
      <div className="mt-16">
        <div className="micro text-smoke mb-3">
          {t("provider.tagSupportedModels")}
        </div>
        <div className="card overflow-x-auto">
          <div className="min-w-[640px]">
            <div className="grid grid-cols-[1.6fr_repeat(4,_1fr)_120px] px-6 py-3 micro text-smoke border-b border-ink-600 bg-ink-800/30">
              <div>{t("provider.smModel")}</div>
              <div className="text-center">{t("provider.smStreaming")}</div>
              <div className="text-center">{t("provider.smToolCalling")}</div>
              <div className="text-center">{t("provider.smJsonSchema")}</div>
              <div className="text-center">{t("provider.smZdr")}</div>
              <div className="text-right">{t("provider.smPriceInOut")}</div>
            </div>
            {MODELS.map((m) => (
              <div
                key={m.id}
                className="grid grid-cols-[1.6fr_repeat(4,_1fr)_120px] px-6 py-3 items-center border-b border-ink-600 last:border-0"
              >
                <div>
                  <div className="text-bone text-[13px]">{m.display}</div>
                  <div className="micro text-smoke">{m.owner}</div>
                </div>
                <Cap on={m.caps.stream} />
                <Cap on={m.caps.tool} />
                <Cap on={m.caps.json} />
                <Cap on={m.caps.zdr} />
                <div className="text-right num text-[12px]">
                  {fmtUSD(m.officialIn)}{" "}
                  <span className="text-smoke">/</span> {fmtUSD(m.officialOut)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- sub-components ---------- */

function Cap({ on }: { on: boolean }) {
  return (
    <div className="text-center">
      {on ? (
        <I.check className="w-3.5 h-3.5 text-brand inline" />
      ) : (
        <span className="text-smoke">—</span>
      )}
    </div>
  );
}

function Metric({
  label,
  value,
  sub,
  tone = "bone",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "brand" | "amber" | "coral" | "sky" | "bone";
}) {
  const colors = {
    brand: "text-brand",
    amber: "text-amber",
    coral: "text-coral",
    sky: "text-sky",
    bone: "text-bone",
  };
  return (
    <div className="bg-ink p-6">
      <div className="micro text-smoke mb-3">{label}</div>
      <div className={cx("serif text-4xl tracking-editorial", colors[tone])}>
        {value}
      </div>
      {sub && <div className="text-[11px] text-ash mt-1">{sub}</div>}
    </div>
  );
}

function TrustHistoryCard({ p }: { p: Provider }) {
  const { t } = useLang();
  const h = trustHistory(p);
  const tone = trustTone(p.trust);
  const tColors = {
    brand: "text-brand",
    amber: "text-amber",
    coral: "text-coral",
  };
  const trendColor =
    h.trend === "up"
      ? "text-brand"
      : h.trend === "down"
        ? "text-coral"
        : "text-smoke";
  const trendArrow = h.trend === "up" ? "↑" : h.trend === "down" ? "↓" : "→";
  const sparkColor =
    h.trend === "up"
      ? "rgb(var(--brand))"
      : h.trend === "down"
        ? "rgb(var(--coral))"
        : "rgb(var(--ash))";
  return (
    <div className="bg-ink p-6">
      <div className="micro text-smoke mb-3">{t("provider.trustHistoryLabel")}</div>
      <div className="flex items-baseline gap-2">
        <span
          className={cx("serif text-4xl tracking-editorial", tColors[tone])}
        >
          {p.trust}
        </span>
        <span className={cx("text-[11px] num", trendColor)}>
          {trendArrow} {h.delta30 > 0 ? "+" : ""}
          {h.delta30}
        </span>
      </div>
      <div className="text-[11px] text-ash mt-1">{trustLabel(p.trust)}</div>
      <div className="mt-3 -ml-1">
        <Sparkline data={h.spark} color={sparkColor} w={180} h={26} />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-3 text-[11px]">
        <div>
          <div className="num text-bone">{h.streakDays}d</div>
          <div className="micro text-smoke">{t("provider.streakLabel")}</div>
        </div>
        <div>
          <div className="num text-bone">
            {h.recoveryMin != null ? `${h.recoveryMin}m` : "—"}
          </div>
          <div className="micro text-smoke">{t("provider.recoveryLabel")}</div>
        </div>
      </div>
    </div>
  );
}

function TrustVelocity({ p }: { p: Provider }) {
  const { t, lang } = useLang();
  const h = trustHistory(p);
  const trendColor =
    h.trend === "up"
      ? "text-brand"
      : h.trend === "down"
        ? "text-coral"
        : "text-smoke";
  const trendArrow = h.trend === "up" ? "↑" : h.trend === "down" ? "↓" : "→";
  const trendWord =
    h.trend === "up"
      ? t("provider.trendImproving")
      : h.trend === "down"
        ? t("provider.trendDegrading")
        : t("provider.trendStable");
  const note =
    VELOCITY_NOTES[lang]?.[p.slug] || VELOCITY_NOTES.en[p.slug] || "—";
  return (
    <div className="mt-6 pt-5 border-t border-ink-600">
      <div className="flex items-center justify-between mb-2">
        <span className="micro text-smoke">{t("provider.trustVelocity")}</span>
        <span className={cx("text-[12px]", trendColor)}>
          {trendArrow} {trendWord}{" "}
          {t("provider.trustOver30d", {
            delta: (h.delta30 >= 0 ? "+" : "") + h.delta30,
          })}
        </span>
      </div>
      <p className="text-[11px] text-ash leading-relaxed">{note}</p>
    </div>
  );
}

function CostBreakdown({ p }: { p: Provider }) {
  const { t } = useLang();
  const refIn = p.ref * 0.5;
  const refOut = p.ref * 1.5;

  const inTok = 250;
  const outTok = 750;
  const observedReq = (inTok * p.costIn + outTok * p.costOut) / 1e6;
  const refReq = (inTok * refIn + outTok * refOut) / 1e6;
  const perCallDelta = observedReq - refReq;
  const cheaper = perCallDelta < 0;
  const tiedMatch = Math.abs(p.costDelta) < 1;

  const tone = cheaper
    ? "text-brand"
    : p.costDelta > 10
      ? "text-coral"
      : p.costDelta > 0
        ? "text-amber"
        : "text-smoke";
  const barClr = cheaper
    ? "bg-brand"
    : p.costDelta > 10
      ? "bg-coral"
      : p.costDelta > 0
        ? "bg-amber"
        : "bg-smoke";
  const deltaTone = cheaper ? "text-brand" : "text-coral";

  const maxBlended = Math.max(p.cost, p.ref);
  const obsBarPct = (p.cost / maxBlended) * 100;
  const refBarPct = (p.ref / maxBlended) * 100;

  const tiers = [100, 1000, 10000, 100000];

  return (
    <>
      <div className="micro text-smoke mb-3">{t("provider.tagCost")}</div>
      <h3 className="serif text-3xl tracking-editorial">
        {t("provider.headObservedVsOfficial")}
      </h3>
      <p className="mt-2 text-[13px] text-ash leading-relaxed">
        {p.costDelta > 0
          ? t("provider.observedHigher", { pct: p.costDelta })
          : t("provider.observedLower", { pct: Math.abs(p.costDelta) })}
      </p>

      <div className="mt-6 card p-6 space-y-6">
        {/* Per 1M tokens */}
        <div>
          <div className="micro text-smoke mb-4">{t("provider.per1M")}</div>
          <div className="space-y-3">
            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-[13px] text-bone">
                  {p.name} · {t("provider.observed")}
                </span>
                <span className={cx("num text-[15px]", tone)}>
                  {fmtUSD(p.cost)}
                </span>
              </div>
              <div className="h-2 bg-ink-700 relative overflow-hidden">
                <div
                  className={cx("absolute inset-y-0 left-0 transition-all", barClr)}
                  style={{ width: `${obsBarPct}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-[13px] text-smoke">
                  {t("provider.officialReference")}
                </span>
                <span className="num text-[15px] text-smoke">
                  {fmtUSD(p.ref)}
                </span>
              </div>
              <div className="h-2 bg-ink-700 relative overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-smoke"
                  style={{ width: `${refBarPct}%` }}
                />
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-ink-600 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
            <div className="flex items-baseline justify-between">
              <span className="text-smoke">{t("provider.input")}</span>
              <span className="num">
                <span className={tone}>{fmtUSD(p.costIn)}</span>{" "}
                <span className="text-smoke">
                  / {fmtUSD(refIn)} {t("provider.ref")}
                </span>
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-smoke">{t("provider.output")}</span>
              <span className="num">
                <span className={tone}>{fmtUSD(p.costOut)}</span>{" "}
                <span className="text-smoke">
                  / {fmtUSD(refOut)} {t("provider.ref")}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Per typical chat */}
        <div className="pt-4 border-t border-ink-600">
          <div className="micro text-smoke mb-3">
            {t("provider.perTypicalChat", { inTok, outTok })}
          </div>
          <div className="grid grid-cols-3 gap-px bg-ink-600 border border-ink-600">
            <div className="bg-ink p-3">
              <div className="micro text-smoke mb-1">
                {t("provider.observedShort")}
              </div>
              <div className="num text-[15px] text-bone">
                {fmtUSD(observedReq, 4)}
              </div>
            </div>
            <div className="bg-ink p-3">
              <div className="micro text-smoke mb-1">
                {t("provider.reference")}
              </div>
              <div className="num text-[15px] text-smoke">{fmtUSD(refReq, 4)}</div>
            </div>
            <div className="bg-ink p-3">
              <div className="micro text-smoke mb-1">
                {tiedMatch
                  ? t("provider.colMatch")
                  : cheaper
                    ? t("provider.colYouSave")
                    : t("provider.colYouPayExtra")}
              </div>
              <div
                className={cx(
                  "num text-[15px]",
                  tiedMatch ? "text-smoke" : deltaTone,
                )}
              >
                {tiedMatch
                  ? "—"
                  : `${cheaper ? "−" : "+"}${fmtUSD(Math.abs(perCallDelta), 4)}`}
              </div>
            </div>
          </div>
        </div>

        {/* At your scale */}
        {!tiedMatch && (
          <div className="pt-4 border-t border-ink-600">
            <div className="micro text-smoke mb-3">
              {cheaper
                ? t("provider.atScaleSavings")
                : t("provider.atScalePremium")}
            </div>
            <div>
              {tiers.map((n) => {
                const daily = Math.abs(perCallDelta) * n;
                return (
                  <div
                    key={n}
                    className="flex items-baseline justify-between text-[12px] py-2 border-b border-ink-600 last:border-0"
                  >
                    <span className="num text-ash">
                      {t("provider.callsPerDay", { n: n.toLocaleString() })}
                    </span>
                    <span className={cx("num", deltaTone)}>
                      {cheaper ? "−" : "+"}
                      {fmtUSD(daily)}
                      {t("provider.perDay")}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 pt-3 border-t border-ink-600 text-[11px] text-smoke leading-relaxed">
              {(cheaper
                ? t("provider.annualizedSaved", { amt: "__AMT__" })
                : t("provider.annualizedExtra", { amt: "__AMT__" })
              )
                .split("__AMT__")
                .map((part: string, i: number, arr: string[]) => (
                  <Fragment key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <span className={cx("num", deltaTone)}>
                        {cheaper ? "−" : "+"}
                        {fmtMoney(Math.abs(perCallDelta) * 10000 * 365, 0)}
                      </span>
                    )}
                  </Fragment>
                ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function ScoreBreakdown({ p }: { p: Provider }) {
  const { t } = useLang();

  const groups = [
    {
      key: "L1" as const,
      label: t("provider.l1Label"),
      score: p.L1,
      w: 40,
      defaultOpen: true,
      subs: [
        { id: "1.1", name: t("provider.sub11"), value: p.scores.L1.modelAuth, w: 50 },
        { id: "1.2", name: t("provider.sub12"), value: p.scores.L1.billingTrans, w: 30 },
        { id: "1.3", name: t("provider.sub13"), value: p.scores.L1.cacheFraud, w: 20 },
      ],
    },
    {
      key: "L3" as const,
      label: t("provider.l3Label"),
      score: p.L3,
      w: 40,
      defaultOpen: false,
      subs: [
        { id: "3.1", name: t("provider.sub31"), value: p.scores.L3.listPricing, w: 35 },
        { id: "3.2", name: t("provider.sub32"), value: p.scores.L3.relativeToOfficial, w: 40 },
        { id: "3.3", name: t("provider.sub33"), value: p.scores.L3.hiddenCost, w: 25 },
      ],
    },
    {
      key: "L2" as const,
      label: t("provider.l2Label"),
      score: p.L2,
      w: 20,
      defaultOpen: false,
      subs: [
        { id: "2.1", name: t("provider.sub21"), value: p.scores.L2.latency, w: 50 },
        { id: "2.2", name: t("provider.sub22"), value: p.scores.L2.throughput, w: 30 },
        { id: "2.3", name: t("provider.sub23"), value: p.scores.L2.longContext, w: 20 },
      ],
    },
  ];

  return (
    <>
      <div className="micro text-smoke mb-3">{t("provider.tagScore")}</div>
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h3 className="serif text-3xl tracking-editorial">
          {t("provider.headBench")}
        </h3>
        <div className="flex items-baseline gap-2">
          <TierChip tier={p.tier} size="lg" />
          <span className="num text-[20px] text-bone">{p.overall}</span>
          <span className="text-smoke text-[11px] num">/ 100</span>
        </div>
      </div>

      <div className="mt-5 space-y-px bg-ink-600 border border-ink-600">
        {groups.map((g) => {
          const tone =
            g.score >= 90 ? "bg-brand" : g.score >= 75 ? "bg-amber" : "bg-coral";
          return (
            <details key={g.key} open={g.defaultOpen} className="bg-ink group">
              <summary className="px-4 py-3 flex items-center gap-3 hover:bg-ink-700 transition-colors">
                <span className="text-smoke text-[10px] num group-open:rotate-90 transition-transform inline-block w-2">
                  ▶
                </span>
                <span className="text-[13px] text-bone shrink-0 w-32">
                  <span className="text-smoke">{g.key}</span> {g.label}
                </span>
                <div className="flex-1 h-1 bg-ink-500 relative overflow-hidden mx-2 max-w-[200px]">
                  <div
                    className={cx("absolute inset-y-0 left-0", tone)}
                    style={{ width: `${g.score}%` }}
                  ></div>
                </div>
                <span className="num text-[14px] text-bone w-8 text-right">
                  {g.score}
                </span>
                <span className="micro text-smoke w-12 text-right">{g.w}%</span>
              </summary>
              <div className="border-t border-ink-600 divide-y divide-ink-600">
                {g.subs.map((s) => {
                  const sTone =
                    s.value >= 90
                      ? "bg-brand/70"
                      : s.value >= 75
                        ? "bg-amber/70"
                        : "bg-coral/70";
                  return (
                    <div
                      key={s.id}
                      className="px-4 py-2.5 flex items-center gap-3"
                    >
                      <span className="num text-[10px] text-smoke shrink-0 w-6">
                        {s.id}
                      </span>
                      <span className="text-[12px] text-ash shrink-0 w-40">
                        {s.name}
                      </span>
                      <div className="flex-1 h-px bg-ink-500 relative overflow-hidden mx-2 max-w-[160px]">
                        <div
                          className={cx("absolute inset-y-0 left-0", sTone)}
                          style={{ width: `${s.value}%` }}
                        ></div>
                      </div>
                      <span className="num text-[12px] text-bone w-8 text-right">
                        {s.value}
                      </span>
                      <span className="micro text-smoke w-12 text-right">
                        {s.w}%
                      </span>
                    </div>
                  );
                })}
                <div className="px-4 py-2 text-[11px] text-smoke leading-relaxed">
                  {subNote(p, g.key)}
                </div>
              </div>
            </details>
          );
        })}
      </div>

      <div className="mt-3 text-[11px] text-smoke leading-relaxed">
        {t("provider.overallFormula")}{" "}
        <span className="num text-bone">{p.overall}</span> →{" "}
        <TierChip tier={p.tier} />{" "}
        <Link href="/docs" className="ulink ml-1">
          {t("provider.methodology")}
        </Link>
      </div>
    </>
  );
}

function FingerprintPanel({ p }: { p: Provider }) {
  const { t } = useLang();
  const [activeModel, setActiveModel] = useState(MODELS[0].id);
  const m = MODELS.find((x) => x.id === activeModel);
  if (!m) return null;
  const fp = fingerprint(p.slug, activeModel);

  return (
    <div className="mt-16">
      <div className="flex items-end justify-between mb-4 flex-wrap gap-3">
        <div>
          <div className="micro text-smoke mb-2">
            {t("provider.tagFingerprint")}
          </div>
          <h3 className="serif text-3xl tracking-editorial">
            {t("provider.headDidYouGet")}{" "}
            <span className="serif-it text-brand">{m.display}</span>?
          </h3>
        </div>
        <div className="text-right flex flex-col items-end gap-2">
          <Link
            href="/validate"
            className="micro text-brand hover:underline inline-flex items-center gap-1"
          >
            <I.bolt className="w-3 h-3" /> {t("provider.runLiveValidation")}
          </Link>
          <div>
            <div className="micro text-smoke">{t("provider.refreshNightly")}</div>
            <div className="num text-[10px] text-ash mt-0.5">
              2026-05-08 · 14:04 UTC
            </div>
          </div>
        </div>
      </div>

      <div className="flex md:flex-wrap gap-0 border-b border-ink-600 mb-6 -mx-1 overflow-x-auto md:overflow-visible no-scroll-x">
        {MODELS.map((model) => {
          const active = model.id === activeModel;
          const modelFp = fingerprint(p.slug, model.id);
          const tone =
            !modelFp || modelFp.unsupported
              ? "text-smoke"
              : modelFp.flag
                ? "text-coral"
                : modelFp.score >= 88
                  ? "text-brand"
                  : modelFp.score >= 70
                    ? "text-amber"
                    : "text-coral";
          return (
            <button
              key={model.id}
              onClick={() => setActiveModel(model.id)}
              className={cx(
                "px-4 py-2.5 text-[12px] tracking-tight transition-colors border-b-2 -mb-px flex items-center gap-1.5",
                active
                  ? "border-brand text-bone"
                  : cx("border-transparent hover:text-bone", tone),
              )}
            >
              <span>{model.display}</span>
              {modelFp?.flag && <span className="text-coral">⚠</span>}
              {modelFp?.unsupported && (
                <span className="text-smoke text-[10px]">—</span>
              )}
              {!modelFp?.unsupported && !modelFp?.flag && modelFp && (
                <span
                  className={cx(
                    "num text-[10px]",
                    tone,
                    active && "text-ash",
                  )}
                >
                  {modelFp.score}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <FingerprintCard p={p} m={m} fp={fp} />
    </div>
  );
}

function FingerprintCard({
  p,
  m,
  fp,
}: {
  p: Provider;
  m: ModelDef;
  fp: FingerprintResult | null;
}) {
  const { t } = useLang();
  if (!fp) return null;

  if (fp.unsupported) {
    const titleStr = t("provider.fpUnsupportedTitle", {
      name: "__NAME__",
      model: "__MODEL__",
    });
    return (
      <div className="card p-8">
        <div className="flex items-start gap-5">
          <span className="serif-it text-6xl text-smoke leading-none">∅</span>
          <div className="flex-1 pt-1">
            <div className="micro text-smoke mb-2">
              {t("provider.fpUnsupportedTag")}
            </div>
            <h4 className="serif text-2xl tracking-editorial">
              {titleStr.split(/(__NAME__|__MODEL__)/).map((part, i) => {
                if (part === "__NAME__")
                  return <Fragment key={i}>{p.name}</Fragment>;
                if (part === "__MODEL__")
                  return (
                    <span key={i} className="text-bone">
                      {m.display}
                    </span>
                  );
                return <Fragment key={i}>{part}</Fragment>;
              })}
            </h4>
            <p className="mt-3 text-ash text-[13px] leading-relaxed max-w-2xl">
              {fp.reason}
            </p>
            <p className="mt-2 text-[11px] text-smoke leading-relaxed">
              {t("provider.fpUnsupportedNote")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6 space-y-5">
      {fp.flag && (
        <div className="border border-coral/40 bg-coral/[0.04] px-4 py-3">
          <div className="flex items-start gap-3">
            <I.alert className="w-4 h-4 text-coral mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="text-coral text-[13px] tracking-tight">
                {fp.flag.headline}
              </div>
              <p className="mt-1 text-[12px] text-ash leading-relaxed">
                {fp.flag.detail}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-baseline justify-between">
        <div>
          <div className="micro text-smoke">{t("provider.matchScore")}</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span
              className={cx(
                "serif text-3xl sm:text-4xl lg:text-5xl tracking-editorial",
                fp.score >= 88
                  ? "text-brand"
                  : fp.score >= 70
                    ? "text-amber"
                    : "text-coral",
              )}
            >
              {fp.score}
            </span>
            <span className="text-[12px] text-smoke num">/ 100</span>
            {!fp.flag && fp.score >= 88 && (
              <span className="micro text-brand ml-2">
                {t("provider.verified")}
              </span>
            )}
            {!fp.flag && fp.score >= 70 && fp.score < 88 && (
              <span className="micro text-amber ml-2">
                {t("provider.caution")}
              </span>
            )}
            {fp.score < 70 && (
              <span className="micro text-coral ml-2">
                {t("provider.risky")}
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="num text-[13px] text-bone">{fp.samples}</div>
          <div className="micro text-smoke">{t("provider.samples24h")}</div>
        </div>
      </div>

      <div className="pt-4 border-t border-ink-600 space-y-4">
        <FpBar
          label={t("provider.fpEmbedDist")}
          value={fp.embedDist.toFixed(2)}
          pct={fp.embedDist * 100}
          ok={fp.embedDist >= 0.85}
          hint={t("provider.fpEmbedHint")}
        />
        <FpBar
          label={t("provider.fpLengthDist")}
          value={`K-S p=${fp.lengthKsP.toFixed(2)}`}
          pct={Math.min(100, fp.lengthKsP * 200)}
          ok={fp.lengthKsP >= 0.2}
          hint={t("provider.fpLengthHint")}
        />
        <FpRow
          label={t("provider.fpTokenizer")}
          value={fp.tokenizer.observed}
          ok={fp.tokenizer.match}
          expected={fp.tokenizer.expected}
          expectedLabel={t("provider.fpExpected")}
          hint={t("provider.fpTokenizerHint")}
        />
        <FpRow
          label={t("provider.fpPrecision")}
          value={fp.precision}
          ok={fp.precision === "FP16"}
          expectedLabel={t("provider.fpExpected")}
          hint={t("provider.fpPrecisionHint")}
        />
        <FpRow
          label={t("provider.fpRefusal")}
          value={`${fp.refusalDelta > 0 ? "+" : ""}${fp.refusalDelta}pt`}
          ok={Math.abs(fp.refusalDelta) <= 3}
          expectedLabel={t("provider.fpExpected")}
          hint={t("provider.fpRefusalHint")}
        />
      </div>
    </div>
  );
}

function FpBar({
  label,
  value,
  pct,
  ok,
  hint,
}: {
  label: string;
  value: string;
  pct: number;
  ok: boolean;
  hint: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[13px] text-ash">{label}</span>
        <div className="flex items-center gap-2">
          <span className="num text-[12px] text-bone">{value}</span>
          <span
            className={cx("text-[11px]", ok ? "text-brand" : "text-coral")}
          >
            {ok ? "✓" : "✗"}
          </span>
        </div>
      </div>
      <div className="h-1 bg-ink-500 relative overflow-hidden">
        <div
          className={cx(
            "absolute inset-y-0 left-0 transition-all",
            ok ? "bg-brand" : "bg-coral",
          )}
          style={{ width: `${Math.max(2, Math.min(100, pct))}%` }}
        ></div>
      </div>
      <p className="text-[10px] text-smoke mt-1.5 leading-relaxed">{hint}</p>
    </div>
  );
}

function FpRow({
  label,
  value,
  ok,
  expected,
  expectedLabel,
  hint,
}: {
  label: string;
  value: string;
  ok: boolean;
  expected?: string;
  expectedLabel?: string;
  hint: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[13px] text-ash">{label}</span>
        <div className="flex items-center gap-2">
          {expected && expected !== value && (
            <span className="text-[10px] text-smoke">
              {expectedLabel || "expected"}{" "}
              <span className="text-ash">{expected}</span>
            </span>
          )}
          <span className="num text-[12px] text-bone">{value}</span>
          <span
            className={cx("text-[11px]", ok ? "text-brand" : "text-coral")}
          >
            {ok ? "✓" : "✗"}
          </span>
        </div>
      </div>
      <p className="text-[10px] text-smoke mt-0.5 leading-relaxed">{hint}</p>
    </div>
  );
}
