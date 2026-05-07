"use client";

import Link from "next/link";
import { useLang } from "@/lib/contexts/lang";
import { PROVIDERS } from "@/lib/data";
import { fmtPct, fmtUSD } from "@/lib/utils";

export function ProviderDetail({ slug }: { slug: string }) {
  const { t } = useLang();
  const p = PROVIDERS.find((x) => x.slug === slug);

  if (!p) {
    return (
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center text-smoke">
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
          <div className="micro text-smoke flex items-center gap-2 flex-wrap">
            <span>
              {p.type} · {p.region}
            </span>
            {p.website && (
              <>
                <span>·</span>
                <a
                  href={p.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-bone normal-case tracking-normal"
                >
                  {p.domain || p.website.replace(/^https?:\/\//, "")}
                </a>
              </>
            )}
          </div>
          <h1 className="serif text-4xl sm:text-5xl lg:text-6xl tracking-editorial">
            {p.name}
          </h1>
          <p className="text-ash text-[15px] max-w-2xl leading-relaxed mt-3">
            {p.desc}
          </p>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <Link
            href={`/run?provider=${slug}`}
            className="btn-brand px-5 py-2.5 text-sm font-medium inline-flex items-center gap-2"
          >
            {t("provider.openInRun")} →
          </Link>
          {p.walletPay && (
            <span className="inline-flex items-center gap-1.5 text-[11px] border border-sky/40 text-sky px-2.5 py-1 mt-2">
              ● {t("provider.walletPaySupported")}
            </span>
          )}
        </div>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-ink-600 mb-12">
        <Metric
          label={t("provider.m1MTokInOut")}
          value={`${fmtUSD(p.costIn)} / ${fmtUSD(p.costOut)}`}
          tone={p.costDelta < 0 ? "brand" : p.costDelta > 10 ? "coral" : "bone"}
        />
        <Metric
          label={t("provider.trustHistoryLabel")}
          value={String(p.trust)}
          sub={`${p.tier}`}
          tone={p.trust >= 90 ? "brand" : p.trust >= 75 ? "amber" : "coral"}
        />
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

      {/* Score breakdown */}
      <div className="grid lg:grid-cols-2 gap-12 mb-16">
        <div>
          <div className="micro text-smoke mb-3">{t("provider.tagScore")}</div>
          <h3 className="serif text-3xl tracking-editorial mb-6">
            {t("provider.headBench")}
          </h3>
          <div className="space-y-3">
            <ScoreRow label={t("provider.l1Label")} score={p.L1} weight="40%" />
            <ScoreRow label={t("provider.l3Label")} score={p.L3} weight="40%" />
            <ScoreRow label={t("provider.l2Label")} score={p.L2} weight="20%" />
          </div>
          <div className="mt-6 pt-4 border-t border-ink-600 flex items-baseline justify-between">
            <span className="micro text-smoke">Overall</span>
            <span className="num text-3xl text-bone">{p.overall}</span>
          </div>
          <Link
            href="/docs"
            className="micro text-brand hover:underline inline-block mt-4"
          >
            {t("provider.methodology")}
          </Link>
        </div>

        {/* Incidents */}
        <div>
          <div className="micro text-smoke mb-3">{t("provider.tagIncidents")}</div>
          <div className="card divide-y divide-ink-600">
            {p.incidents.length === 0 ? (
              <div className="px-6 py-8 text-ash text-[13px]">
                {t("provider.noIncidents")}
              </div>
            ) : (
              p.incidents.map((inc, i) => (
                <div key={i} className="px-6 py-4">
                  <div className="flex items-baseline justify-between gap-3 flex-wrap">
                    <div className="num text-[12px] text-smoke">{inc.time}</div>
                    <span
                      className={
                        "micro " +
                        (inc.sev === "high"
                          ? "text-coral"
                          : inc.sev === "medium"
                            ? "text-amber"
                            : "text-ash")
                      }
                    >
                      ● {inc.sev}
                    </span>
                  </div>
                  <div className="text-[13px] text-bone mt-1">{inc.issue}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
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
  tone?: "bone" | "brand" | "amber" | "coral" | "sky";
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
      <div className={`serif text-3xl tracking-editorial ${colors[tone]}`}>
        {value}
      </div>
      {sub && <div className="text-[11px] text-ash mt-1">{sub}</div>}
    </div>
  );
}

function ScoreRow({
  label,
  score,
  weight,
}: {
  label: string;
  score: number;
  weight: string;
}) {
  const tone =
    score >= 90 ? "bg-brand" : score >= 75 ? "bg-amber" : "bg-coral";
  return (
    <div className="flex items-center gap-3">
      <span className="text-[13px] text-bone shrink-0 w-32">{label}</span>
      <div className="flex-1 h-1 bg-ink-500 relative overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 ${tone}`}
          style={{ width: `${score}%` }}
        ></div>
      </div>
      <span className="num text-[14px] text-bone w-8 text-right">{score}</span>
      <span className="micro text-smoke w-12 text-right">{weight}</span>
    </div>
  );
}
