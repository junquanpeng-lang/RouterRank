"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useLang } from "@/lib/contexts/lang";
import { useToast } from "@/lib/contexts/toast";
import { useWallet } from "@/lib/contexts/wallet";
import { BENCHMARK_TEMPLATES, detectBenchmark, getMockResponse, PROVIDER_STYLE } from "@/lib/benchmarks";
import { useData } from "@/lib/contexts/data";
import { tokenCost } from "@/lib/scoring";
import { useStreamingText } from "@/lib/use-streaming-text";
import { copyToClipboard, cx, fmtPct, fmtUSD, strHash, trustLabel, trustTone } from "@/lib/utils";
import { I } from "@/components/ui/icons";
import { ModelDropdown } from "@/components/ui/model-dropdown";
import { ProviderMark } from "@/components/ui/provider-mark";
import { RangeInput } from "@/components/ui/range-input";
import { TierChip } from "@/components/ui/tier-chip";
import { TrustBadge } from "@/components/ui/trust-badge";
import { PaymentModal } from "@/components/wallet/payment-modal";
import type { BenchmarkKind, Provider, RunState, RunStatusRow, Tier } from "@/lib/types";

interface HistoryEntry {
  id: string;
  prompt: string;
  mode: "single" | "compare";
  modelDisplay: string;
  providerSlugs: string[];
  providers: RunStatusRow[];
  timestamp: number;
}

export function RunPageBody() {
  return (
    <Suspense fallback={null}>
      <RunPageInner />
    </Suspense>
  );
}

function RunPageInner() {
  const { t } = useLang();
  const { providers, models } = useData();
  const toast = useToast();
  const { wallet, setShowConnect } = useWallet();
  const params = useSearchParams();

  const initialSelected = useMemo(() => {
    const single = params.get("provider");
    const multi = (params.get("providers") || "").split(",").filter(Boolean);
    if (single) return [single];
    if (multi.length >= 2) return multi.slice(0, 5);
    if (multi.length === 1) return multi;
    return ["portkey", "openrouter", "bai", "together"];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [promptMode, setPromptMode] = useState<"single" | "system_user">("single");
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a precise technical writer. Be concrete and avoid filler.",
  );
  const [prompt, setPrompt] = useState(
    "Explain account abstraction in simple terms. Cover ERC-4337, paymasters, and trade-offs.",
  );
  const [model, setModel] = useState("openai/gpt-5.5");
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [temperature, setTemperature] = useState(0);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [fallback, setFallback] = useState(false);
  const [run, setRun] = useState<RunState | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [payTarget, setPayTarget] = useState<{ provider: Provider; cost: number } | null>(null);
  const promptRef = useRef<HTMLTextAreaElement | null>(null);

  const fullPrompt =
    promptMode === "system_user" ? `${systemPrompt}\n\n${prompt}` : prompt;

  const estimatedCost = useMemo(() => {
    if (selected.length < 1) return 0;
    const inToks = Math.max(40, Math.round(fullPrompt.length / 4));
    const expectedOut = Math.min(maxTokens, 800);
    return selected.reduce((acc, slug) => {
      const p = providers.find((x) => x.slug === slug);
      if (!p) return acc;
      return acc + tokenCost(p, inToks, expectedOut);
    }, 0);
  }, [selected, fullPrompt, maxTokens, providers]);

  const allDone = run && run.providers.every((r) => r.status === "completed" || r.status === "failed");
  const completed = run?.providers.filter((r) => r.status === "completed") ?? [];

  const buildScores = (rows: RunStatusRow[]): RunStatusRow[] =>
    rows.map((r) => {
      if (r.status !== "completed") return r;
      const p = providers.find((x) => x.slug === r.slug)!;
      return {
        ...r,
        scores: { L1: p.L1, L2: p.L2, L3: p.L3, overall: p.overall, tier: p.tier },
      };
    });

  const start = () => {
    if (selected.length < 1 || !prompt) return;
    const id = "run_" + Math.random().toString(36).slice(2, 9);
    const modelObj = models.find((m) => m.id === model);
    setRun({
      id,
      prompt: fullPrompt,
      promptPreview: prompt.slice(0, 120),
      benchmark: detectBenchmark(fullPrompt),
      modelId: model,
      modelDisplay: modelObj?.display || model,
      mode: selected.length === 1 ? "single" : "compare",
      providers: selected.map((slug) => ({ slug, status: "pending" })),
    });
  };

  const retry = (slug: string) => {
    if (!run) return;
    setRun((prev) =>
      prev
        ? { ...prev, providers: prev.providers.map((p) => (p.slug === slug ? { slug, status: "pending" } : p)) }
        : prev,
    );
  };

  // Launch any pending providers
  useEffect(() => {
    if (!run) return;
    const pending = run.providers.filter((r) => r.status === "pending");
    if (pending.length === 0) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    pending.forEach((r, i) => {
      const startDelay = 80 + i * 200;
      timers.push(
        setTimeout(() => {
          setRun((prev) =>
            prev && prev.id === run.id
              ? {
                  ...prev,
                  providers: prev.providers.map((p) =>
                    p.slug === r.slug ? { ...p, status: "running", startAt: Date.now() } : p,
                  ),
                }
              : prev,
          );
        }, startDelay),
      );
      const finishDelay = startDelay + 900 + (strHash(r.slug + run.id) % 1500);
      timers.push(
        setTimeout(() => {
          const provider = providers.find((x) => x.slug === r.slug)!;
          const failProb = r.slug === "replicate" ? 0.45 : r.slug === "anyscale" ? 0.08 : 0;
          const fail = (strHash(r.slug + run.id + "f") % 100) / 100 < failProb;
          const inputTokens = Math.max(40, Math.round(fullPrompt.length / 4));
          const baseOut = 280 + (strHash(r.slug + run.id + "o") % 480);
          const outputTokens = Math.round(baseOut * (PROVIDER_STYLE[r.slug]?.verbosity ?? 1));
          const cost = tokenCost(provider, inputTokens, outputTokens);
          const latencyJitter = ((strHash(r.slug + run.id + "l") % 100) - 50) / 200;
          const ttftJitter = ((strHash(r.slug + run.id + "t") % 100) - 50) / 500;

          setRun((prev) => {
            if (!prev || prev.id !== run.id) return prev;
            const next: RunState = {
              ...prev,
              providers: prev.providers.map((p) =>
                p.slug === r.slug
                  ? {
                      ...p,
                      status: fail ? ("failed" as const) : ("completed" as const),
                      completeAt: Date.now(),
                      latency: Math.max(0.3, provider.latency + latencyJitter),
                      ttft: Math.max(0.1, provider.ttft + ttftJitter),
                      cost: fail ? null : cost,
                      inputTokens,
                      outputTokens,
                      response: fail ? null : getMockResponse(fullPrompt, r.slug),
                      error: fail ? "Timeout after 30s · cold start on shared GPU" : null,
                    }
                  : p,
              ),
            };
            return { ...next, providers: buildScores(next.providers) };
          });
        }, finishDelay),
      );
    });
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run?.id, run?.providers.map((r) => r.slug + r.status).join("|")]);

  // Record to history once per run
  const recordedRuns = useRef(new Set<string>());
  useEffect(() => {
    if (!run || !allDone) return;
    if (recordedRuns.current.has(run.id)) return;
    recordedRuns.current.add(run.id);
    setHistory((h) =>
      [
        {
          id: run.id,
          prompt,
          mode: run.mode,
          modelDisplay: run.modelDisplay,
          providerSlugs: run.providers.map((r) => r.slug),
          providers: run.providers,
          timestamp: Date.now(),
        },
        ...h,
      ].slice(0, 5),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDone, run?.id]);

  // ⌘↩ run
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (!run || allDone) start();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt, selected, systemPrompt, promptMode, run, allDone]);

  return (
    <>
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6 border-b border-ink-600">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="micro text-smoke">{t("run.tool")}</div>
            <h1 className="serif text-4xl sm:text-5xl lg:text-6xl tracking-editorial mt-2">
              {t("run.headPre")}{" "}
              <span className="serif-it text-brand">
                {selected.length === 1 ? t("run.headOneAnswer") : t("run.headNTruths")}
              </span>
            </h1>
            <p className="text-ash mt-3 max-w-2xl text-[15px] leading-relaxed">
              {selected.length === 1 ? t("run.subSingle") : t("run.subCompare")}
            </p>
          </div>
          {run && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setRun(null);
                  promptRef.current?.focus();
                }}
                className="btn-ghost px-4 py-2 text-[12px] inline-flex items-center gap-2"
              >
                <I.refresh className="w-3.5 h-3.5" /> {t("run.newComparison")}
              </button>
            </div>
          )}
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 grid lg:grid-cols-[420px_1fr] gap-px bg-ink-600">
        {/* SETUP PANEL */}
        <div className="bg-ink p-5 sm:p-6 lg:p-8 space-y-8">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="micro text-smoke">{t("run.labelPrompt")}</div>
              <div className="flex gap-0.5 border border-ink-500">
                {(
                  [
                    ["single", t("run.modeSingle")],
                    ["system_user", t("run.modeSysUser")],
                  ] as const
                ).map(([v, l]) => (
                  <button
                    key={v}
                    onClick={() => setPromptMode(v)}
                    className={cx(
                      "px-2.5 py-1 text-[10px] tracking-wider uppercase transition-colors",
                      promptMode === v ? "bg-brand text-ink" : "text-smoke hover:text-bone",
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            {promptMode === "system_user" && (
              <>
                <div className="micro text-smoke mb-1.5">{t("run.labelSystem")}</div>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={2}
                  placeholder={t("run.sysPlaceholder")}
                  className="w-full bg-ink-800 border border-ink-500 focus:border-brand/60 outline-none p-3 text-[12px] resize-none text-ash leading-relaxed mb-2"
                />
                <div className="micro text-smoke mb-1.5">{t("run.labelUser")}</div>
              </>
            )}
            <textarea
              ref={promptRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
              placeholder={t("run.promptPlaceholder")}
              className="w-full bg-ink-800 border border-ink-500 focus:border-brand/60 outline-none p-3 text-[13px] resize-none text-bone leading-relaxed"
            />
            <div className="mt-1 flex justify-end">
              <div className="micro text-smoke">
                <span className="kbd">⌘</span>
                <span className="kbd ml-0.5">↩</span> {t("run.runHotkey")}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-ink-600">
              <div className="micro text-smoke mb-2">{t("run.samplesLabel")}</div>
              <div className="flex flex-wrap gap-1.5">
                {BENCHMARK_TEMPLATES.map((tpl) => {
                  const active = prompt.trim() === tpl.prompt.trim();
                  return (
                    <button
                      key={tpl.id}
                      onClick={() => setPrompt(tpl.prompt)}
                      className={cx(
                        "px-2.5 py-1 text-[11px] border transition-colors",
                        active
                          ? "border-brand text-brand bg-brand/5"
                          : "border-ink-500 hover:border-brand hover:text-brand text-ash",
                      )}
                    >
                      {t("run.tpl" + tpl.id.charAt(0).toUpperCase() + tpl.id.slice(1))}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <Section label={t("run.labelModel")}>
            <ModelDropdown value={model} onChange={setModel} />
            <div className="mt-2 micro text-smoke">
              {t("run.modelSupportCount", { n: providers.length })}
            </div>
          </Section>

          <Section label={t("run.labelProviders")}>
            <div className="micro text-smoke mb-2 flex items-center justify-between">
              <span>{t("run.selectedCount", { n: selected.length })}</span>
              {selected.length >= 2 && <span className="text-ash">{t("run.compareMode")}</span>}
              {selected.length === 1 && <span className="text-ash">{t("run.singleMode")}</span>}
            </div>
            <div className="space-y-1">
              {providers.map((p) => {
                const on = selected.includes(p.slug);
                return (
                  <button
                    key={p.slug}
                    onClick={() => {
                      if (on) {
                        if (selected.length === 1) {
                          toast.show(t("run.keepAtLeast1"));
                          return;
                        }
                        setSelected(selected.filter((x) => x !== p.slug));
                      } else if (selected.length < 5) {
                        setSelected([...selected, p.slug]);
                      } else {
                        toast.show(t("run.max5Providers"));
                      }
                    }}
                    className={cx(
                      "w-full flex items-center gap-3 px-3 py-2 border transition-colors text-left",
                      on ? "border-brand/60 bg-brand/5" : "border-ink-600 hover:border-bone/30",
                    )}
                  >
                    <span className={cx("check", on && "on")}>
                      {on && <I.check className="w-2.5 h-2.5 text-ink" />}
                    </span>
                    <ProviderMark slug={p.slug} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] text-bone truncate">{p.name}</div>
                      <div className="micro text-smoke">{p.type}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="num text-[12px]">{fmtUSD(p.cost, 2)}</div>
                      <TrustBadge score={p.trust} />
                    </div>
                  </button>
                );
              })}
            </div>
          </Section>

          <Section label={t("run.labelAdvanced")}>
            <div className="space-y-4 text-[12px]">
              <div className="grid grid-cols-[88px_1fr_56px] items-center gap-3">
                <span className="text-ash">{t("run.temperature")}</span>
                <RangeInput
                  min={0}
                  max={2}
                  step={0.1}
                  value={temperature}
                  onChange={setTemperature}
                />
                <span className="num text-bone text-right">
                  {temperature.toFixed(1)}
                </span>
              </div>
              <div className="grid grid-cols-[88px_1fr_56px] items-center gap-3">
                <span className="text-ash">{t("run.maxTokens")}</span>
                <RangeInput
                  min={128}
                  max={4096}
                  step={128}
                  value={maxTokens}
                  onChange={setMaxTokens}
                />
                <span className="num text-bone text-right">{maxTokens}</span>
              </div>
              <button
                onClick={() => setFallback(!fallback)}
                className="w-full flex items-center justify-between border-t border-ink-600 pt-3"
              >
                <span className="text-ash">{t("run.allowFallback")}</span>
                <span className={cx("check", fallback && "on")}>
                  {fallback && <I.check className="w-2.5 h-2.5 text-ink" />}
                </span>
              </button>
              {!fallback && (
                <div className="text-amber/80 text-[11px] flex gap-2 leading-relaxed">
                  <I.alert className="w-3 h-3 mt-0.5 shrink-0" />
                  {t("run.fallbackOff")}
                </div>
              )}
            </div>
          </Section>

          <button
            onClick={start}
            disabled={!prompt || selected.length < 1 || (run !== null && !allDone)}
            className="btn-brand w-full py-3.5 text-sm font-medium tracking-tight inline-flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <I.bolt className="w-4 h-4" />
            {run && !allDone
              ? t("run.btnRunning")
              : run
                ? selected.length === 1
                  ? t("run.btnRerun")
                  : t("run.btnRerunCompare")
                : selected.length === 1
                  ? t("run.btnRun")
                  : t("run.btnRunCompare")}
          </button>
          <div className="flex items-center justify-between micro text-smoke">
            <span>{t("run.estimatedCost")}</span>
            <span className="num text-ash">~{fmtUSD(estimatedCost, 4)}</span>
          </div>
        </div>

        {/* RESULTS PANEL */}
        <div className="bg-ink p-5 sm:p-6 lg:p-8 min-h-[600px]">
          {!run ? (
            <EmptyRun mode={selected.length === 1 ? "single" : "compare"} />
          ) : selected.length === 1 ? (
            <SingleProviderResult
              run={run}
              onPay={() => {
                const r = run.providers[0];
                if (!r || r.status !== "completed") return;
                if (!wallet) {
                  setShowConnect(true);
                  return;
                }
                const p = providers.find((x) => x.slug === r.slug)!;
                setPayTarget({ provider: p, cost: r.cost! });
              }}
            />
          ) : (
            <div className="space-y-10">
              <RunStatusList run={run} onRetry={retry} />
              {allDone && completed.length >= 1 && (
                <>
                  <SummaryCards run={run} />
                  <ResponseGrid run={run} />
                  <EvaluationTable run={run} />
                  <RecommendedAction run={run} />
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {history.length > 0 && (
        <RecentRuns
          history={history}
          onClear={() => setHistory([])}
          onReuse={(h) => {
            setPrompt(h.prompt);
            setSelected(h.providerSlugs);
            promptRef.current?.focus();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}

      {payTarget && (
        <PaymentModal
          provider={payTarget.provider}
          cost={payTarget.cost}
          onClose={() => setPayTarget(null)}
        />
      )}
    </>
  );
}

/* ---------- sub-components ---------- */

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="micro text-smoke mb-3">{label}</div>
      {children}
    </div>
  );
}

function EmptyRun({ mode }: { mode: "single" | "compare" }) {
  const { t } = useLang();
  return (
    <div className="h-full flex items-center justify-center text-center py-32">
      <div className="max-w-md">
        <div className="serif text-7xl serif-it text-ink-500 mb-6">
          {mode === "single" ? "∅" : "N=0"}
        </div>
        <div className="micro text-smoke mb-3">{t("run.emptyAwaiting")}</div>
        <h3 className="serif text-3xl tracking-editorial">
          {mode === "single" ? t("run.emptySingleTitle") : t("run.emptyCompareTitle")}{" "}
          <span className="serif-it text-brand">{t("run.emptyYet")}</span>.
        </h3>
        <p className="mt-3 text-ash text-[14px] leading-relaxed">
          {mode === "single" ? (
            <>
              {t("run.emptySingleBodyA")}
              <span className="text-brand">{t("run.btnRun")}</span>.
            </>
          ) : (
            <>
              {t("run.emptyCompareBodyA")}
              <span className="text-brand">{t("run.btnRun")}</span>
              {t("run.emptyBodyB")}
            </>
          )}
        </p>
        <div className="mt-8 flex justify-center gap-2 micro text-smoke">
          <span className="kbd">⌘</span>
          <span className="kbd">↩</span>
          <span>{t("run.emptyToRun")}</span>
        </div>
      </div>
    </div>
  );
}

function SingleProviderResult({ run, onPay }: { run: RunState; onPay: () => void }) {
  const { t } = useLang();
  const { providers } = useData();
  const r = run.providers[0];
  const p = providers.find((x) => x.slug === r.slug)!;
  const responseText = r.status === "completed" ? r.response || "" : "";
  const stream = useStreamingText(responseText, 14);

  const phaseLabel = (
    {
      pending: t("run.phaseQueued"),
      running: t("run.phaseStreaming"),
      completed: t("run.phaseComplete"),
      failed: t("run.phaseFailed"),
    } as Record<RunStatusRow["status"], string>
  )[r.status];
  const phaseTone =
    r.status === "failed"
      ? "text-coral"
      : r.status === "completed"
        ? "text-ash"
        : "text-brand";

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b border-ink-600 pb-4 mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <ProviderMark slug={r.slug} />
          <div>
            <div className="text-[14px] text-bone">{p.name}</div>
            <div className="micro text-smoke flex items-center gap-2">
              <span>{p.type}</span>
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                {r.status === "running" && (
                  <span className="w-1.5 h-1.5 bg-brand rounded-full pulse-dot" />
                )}
                {r.status === "completed" && stream.done && (
                  <span className="w-1.5 h-1.5 bg-brand rounded-full" />
                )}
                {r.status === "failed" && (
                  <span className="w-1.5 h-1.5 bg-coral rounded-full" />
                )}
                <span className={phaseTone}>
                  {r.status === "completed" && !stream.done
                    ? t("run.phaseStreaming")
                    : phaseLabel}
                </span>
              </span>
            </div>
          </div>
        </div>
        <TrustBadge score={p.trust} size="lg" />
      </div>

      <div className="flex-1 min-h-[280px] py-2">
        {r.status === "pending" && (
          <div className="micro text-smoke flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-smoke rounded-full" />
            {t("run.phaseQueued")}
          </div>
        )}
        {r.status === "running" && (
          <div className="space-y-2 text-[13px] text-ash">
            <div className="micro text-brand flex items-center gap-2 mb-3">
              <I.spin className="w-3 h-3 animate-spin" />{" "}
              {t("run.connectingTo", { name: p.name })}
            </div>
            <div className="shimmer h-3 w-2/3"></div>
            <div className="shimmer h-3 w-3/4"></div>
            <div className="shimmer h-3 w-1/2"></div>
          </div>
        )}
        {r.status === "failed" && (
          <div className="text-coral text-[13px]">
            <I.x className="w-4 h-4 inline mr-1" />
            {t("run.failedPrefix")}
            {r.error}
          </div>
        )}
        {r.status === "completed" && (
          <pre className="whitespace-pre-wrap text-[13px] leading-relaxed text-bone font-mono overflow-y-auto pr-2">
            {stream.shown}
            {!stream.done && (
              <span className="inline-block w-2 h-4 bg-brand ml-0.5 align-middle pulse-dot" />
            )}
          </pre>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-ink-600 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-6 overflow-x-auto no-scroll-x">
          <Stat label={t("run.colCost")} value={r.cost != null ? fmtUSD(r.cost, 4) : "—"} />
          <Stat
            label={t("run.colLatency")}
            value={r.latency != null ? r.latency.toFixed(2) + "s" : "—"}
          />
          <Stat
            label={t("run.colTtft")}
            value={r.ttft != null ? (r.ttft * 1000).toFixed(0) + "ms" : "—"}
          />
          <Stat
            label={t("run.colTokens")}
            value={r.outputTokens ? `${r.inputTokens} / ${r.outputTokens}` : "—"}
          />
          <Stat label={t("run.colTrust")} value={String(p.trust)} />
        </div>
        <button
          onClick={onPay}
          disabled={r.status !== "completed"}
          className="btn-brand px-4 py-2 text-[12px] font-medium inline-flex items-center gap-2 disabled:opacity-40"
        >
          <I.wallet className="w-4 h-4" /> {t("run.runWithWallet")}
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="shrink-0">
      <div className="micro text-smoke">{label}</div>
      <div className="num text-bone text-[14px] mt-1">{value}</div>
    </div>
  );
}

function RunStatusList({
  run,
  onRetry,
}: {
  run: RunState;
  onRetry: (slug: string) => void;
}) {
  const { t } = useLang();
  const { providers } = useData();
  const allDone = run.providers.every(
    (r) => r.status === "completed" || r.status === "failed",
  );
  const completedCount = run.providers.filter((r) => r.status === "completed").length;
  const failedCount = run.providers.filter((r) => r.status === "failed").length;
  const benchKey = run.benchmark || "default";
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="micro text-smoke">
            {t("run.runIdLabel")}
            <span className="num">{run.id}</span> ·{" "}
            <span className="text-ash">
              {t("run.benchDetected." + benchKey)}
            </span>
          </div>
          <div className="serif text-2xl tracking-editorial mt-1">
            {allDone ? (
              <>
                {t("run.compareComplete")}{" "}
                <span className="serif-it text-brand">{t("run.compareCompleteIt")}</span>
              </>
            ) : (
              <>
                {t("run.runningCompare")}
                <span className="serif-it text-brand">.</span>
              </>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="micro text-smoke">
            {t("run.compareCompletedFraction", { c: completedCount, t: run.providers.length })}
          </div>
          {failedCount > 0 && (
            <div className="micro text-coral mt-0.5">
              {t("run.compareFailedCount", { n: failedCount })}
            </div>
          )}
        </div>
      </div>
      <div className="space-y-2">
        {run.providers.map((r) => {
          const provider = providers.find((p) => p.slug === r.slug)!;
          const ic =
            r.status === "pending" ? (
              <span className="text-smoke">○</span>
            ) : r.status === "running" ? (
              <I.spin className="w-3.5 h-3.5 text-brand animate-spin" />
            ) : r.status === "completed" ? (
              <I.check className="w-3.5 h-3.5 text-brand" />
            ) : (
              <I.x className="w-3.5 h-3.5 text-coral" />
            );
          return (
            <div
              key={r.slug}
              className={cx(
                "flex items-center gap-4 px-4 py-3 border transition-colors",
                r.status === "running"
                  ? "border-brand/40"
                  : r.status === "failed"
                    ? "border-coral/30"
                    : "border-ink-600",
              )}
            >
              <div className="w-5 flex items-center justify-center">{ic}</div>
              <ProviderMark slug={r.slug} />
              <div className="flex-1">
                <div className="text-[13px] text-bone">{provider.name}</div>
                <div className="micro text-smoke">
                  {r.status === "pending" && t("run.phaseQueuedShort")}
                  {r.status === "running" && t("run.phaseStreamingShort")}
                  {r.status === "completed" &&
                    r.latency &&
                    r.ttft &&
                    t("run.returnedIn", {
                      l: r.latency.toFixed(2),
                      ms: (r.ttft * 1000).toFixed(0),
                    })}
                  {r.status === "failed" && r.error}
                </div>
              </div>
              {r.status === "completed" && (
                <div className="text-right num text-[12px]">
                  <div className="text-bone">{fmtUSD(r.cost!, 4)}</div>
                  <div className="text-smoke text-[11px]">{r.outputTokens} out</div>
                </div>
              )}
              {r.status === "running" && (
                <div className="w-24 h-px bg-ink-500 relative overflow-hidden shimmer"></div>
              )}
              {r.status === "failed" && (
                <button
                  onClick={() => onRetry(r.slug)}
                  className="text-[11px] text-ash hover:text-bone inline-flex items-center gap-1.5 px-2.5 py-1 border border-ink-500 hover:border-bone transition-colors"
                >
                  <I.refresh className="w-3 h-3" /> {t("run.retry")}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SummaryCards({ run }: { run: RunState }) {
  const { t } = useLang();
  const { providers } = useData();
  const completed = run.providers.filter((r) => r.status === "completed" && r.scores);
  if (!completed.length) return null;

  const cheapest = [...completed].sort((a, b) => (a.cost! - b.cost!))[0];
  const fastest = [...completed].sort((a, b) => (a.latency! - b.latency!))[0];
  const trusted = [...completed].sort((a, b) => {
    const tA = providers.find((p) => p.slug === a.slug)!.trust;
    const tB = providers.find((p) => p.slug === b.slug)!.trust;
    return tB - tA;
  })[0];
  const recommended = [...completed].sort(
    (a, b) => (b.scores!.overall - a.scores!.overall),
  )[0];

  const recProvider = providers.find((p) => p.slug === recommended.slug)!;
  const cheapProvider = providers.find((p) => p.slug === cheapest.slug)!;
  const fastProvider = providers.find((p) => p.slug === fastest.slug)!;
  const trustProvider = providers.find((p) => p.slug === trusted.slug)!;

  const avgCost = completed.reduce((s, c) => s + c.cost!, 0) / completed.length;
  const cheapPct = Math.round((avgCost / cheapest.cost! - 1) * 100);

  return (
    <div>
      <div className="micro text-smoke mb-3">
        {t("run.verdictRouters", { n: completed.length })}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-ink-600">
        <SumCard
          tag={t("run.sumCheapest")}
          name={cheapProvider.name}
          value={fmtUSD(cheapest.cost!, 4)}
          sub={t("run.sumCheapVsAvg", { pct: cheapPct })}
          tone="brand"
          slug={cheapest.slug}
        />
        <SumCard
          tag={t("run.sumFastest")}
          name={fastProvider.name}
          value={`${fastest.latency!.toFixed(2)}s`}
          sub={t("run.sumTtftMs", { ms: (fastest.ttft! * 1000).toFixed(0) })}
          tone="sky"
          slug={fastest.slug}
        />
        <SumCard
          tag={t("run.sumMostTrusted")}
          name={trustProvider.name}
          value={String(trustProvider.trust)}
          sub={trustLabel(trustProvider.trust)}
          tone={trustTone(trustProvider.trust)}
          slug={trusted.slug}
        />
        <SumCard
          tag={t("run.sumRecommended")}
          name={recProvider.name}
          value={String(recommended.scores!.overall)}
          sub={t("run.sumBestBalance")}
          tone="brand"
          slug={recommended.slug}
          highlight
        />
      </div>
    </div>
  );
}

function SumCard({
  tag,
  name,
  value,
  sub,
  tone,
  slug,
  highlight = false,
}: {
  tag: string;
  name: string;
  value: string;
  sub: string;
  tone: "brand" | "sky" | "amber" | "coral";
  slug: string;
  highlight?: boolean;
}) {
  const tColor = (
    { brand: "text-brand", sky: "text-sky", amber: "text-amber", coral: "text-coral" } as Record<typeof tone, string>
  )[tone];
  return (
    <div className={cx("p-6 bg-ink", highlight && "ring-1 ring-brand")}>
      <div className="flex items-center justify-between">
        <div className="micro text-smoke">{tag}</div>
        <ProviderMark slug={slug} />
      </div>
      <div className="mt-4">
        <div className="text-[13px] text-ash">{name}</div>
        <div className={cx("serif text-5xl mt-1 tracking-editorial", tColor)}>
          {value}
        </div>
        <div className="text-[11px] text-smoke mt-1">{sub}</div>
      </div>
    </div>
  );
}

function ResponseGrid({ run }: { run: RunState }) {
  const { t } = useLang();
  const { providers } = useData();
  const visible = run.providers.filter(
    (r) => r.status === "completed" || r.status === "failed",
  );
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [payTarget, setPayTarget] = useState<{ provider: Provider; cost: number } | null>(null);
  const toast = useToast();
  const { wallet, setShowConnect } = useWallet();
  const colCount = Math.min(visible.length, 4);
  const colCls =
    colCount === 1
      ? "md:grid-cols-1"
      : colCount === 2
        ? "md:grid-cols-2"
        : colCount === 3
          ? "md:grid-cols-3 xl:grid-cols-3"
          : "md:grid-cols-2 xl:grid-cols-4";

  return (
    <div>
      <div className="micro text-smoke mb-3">{t("run.sideBySide")}</div>
      <div className={cx("grid grid-cols-1 gap-px bg-ink-600", colCls)}>
        {visible.map((r) => {
          const p = providers.find((x) => x.slug === r.slug)!;
          const isExpanded = !!expanded[r.slug];
          return (
            <div key={r.slug} className="bg-ink p-5 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ProviderMark slug={r.slug} />
                  <div>
                    <div className="text-[13px] text-bone">{p.name}</div>
                    <div className="micro text-smoke">{p.type}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {r.response && (
                    <>
                      <button
                        onClick={() => {
                          copyToClipboard(r.response!);
                          toast.show(t("run.copiedResponse", { name: p.name }));
                        }}
                        title={t("run.copyResponse")}
                        className="text-smoke hover:text-bone p-1"
                      >
                        <I.copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          setExpanded((s) => ({ ...s, [r.slug]: !s[r.slug] }))
                        }
                        title={isExpanded ? t("run.collapse") : t("run.expand")}
                        className="text-smoke hover:text-bone p-1 text-[10px] num"
                      >
                        {isExpanded ? "−" : "+"}
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 py-3 border-y border-ink-600 text-[11px]">
                <div>
                  <div className="micro text-smoke mb-1">{t("run.colCost")}</div>
                  <div className="num text-bone">
                    {r.cost != null ? fmtUSD(r.cost, 4) : "—"}
                  </div>
                </div>
                <div>
                  <div className="micro text-smoke mb-1">{t("run.colLatency")}</div>
                  <div className="num text-bone">
                    {r.latency != null ? r.latency.toFixed(2) + "s" : "—"}
                  </div>
                </div>
                <div>
                  <div className="micro text-smoke mb-1">{t("run.colTokens")}</div>
                  <div className="num text-bone">{r.outputTokens || "—"}</div>
                </div>
              </div>
              <div
                className={cx(
                  "mt-3 flex-1 text-[12px] leading-relaxed text-ash whitespace-pre-wrap font-mono overflow-y-auto pr-2",
                  isExpanded ? "" : "max-h-[260px] gradient-mask-bottom",
                )}
              >
                {r.status === "failed" ? (
                  <div className="text-coral">
                    <I.x className="w-4 h-4 inline mb-1 mr-1" />
                    {t("run.failedPrefix")}
                    {r.error}
                  </div>
                ) : (
                  r.response
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-ink-600 flex items-center justify-between">
                <TrustBadge score={p.trust} />
                {r.status === "completed" ? (
                  <button
                    onClick={() =>
                      wallet
                        ? setPayTarget({ provider: p, cost: r.cost! })
                        : setShowConnect(true)
                    }
                    className="btn-brand px-3 py-1 text-[11px] font-medium inline-flex items-center gap-1"
                  >
                    <I.wallet className="w-3 h-3" /> {t("run.useThis")}
                  </button>
                ) : (
                  <span className="text-[10px] text-coral micro">
                    {t("run.phaseFailed")}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {payTarget && (
        <PaymentModal
          provider={payTarget.provider}
          cost={payTarget.cost}
          onClose={() => setPayTarget(null)}
        />
      )}
    </div>
  );
}

function EvaluationTable({ run }: { run: RunState }) {
  const { t } = useLang();
  const { providers } = useData();
  const completed = run.providers.filter((r) => r.status === "completed" && r.scores);
  if (!completed.length) return null;
  const rows = [...completed]
    .map((r) => ({ ...r, p: providers.find((x) => x.slug === r.slug)! }))
    .sort((a, b) => b.scores!.overall - a.scores!.overall);
  const winner = rows[0];

  return (
    <div>
      <div className="micro text-smoke mb-3">{t("run.scorecardLabel")}</div>
      <div className="border border-ink-600 overflow-x-auto">
        <div className="min-w-[640px]">
          <div className="grid grid-cols-[2fr_repeat(4,_1fr)_80px] px-5 py-3 micro text-smoke border-b border-ink-600 bg-ink-800/30">
            <div>{t("run.scoProvider")}</div>
            <div className="text-right">{t("run.scoL1")}</div>
            <div className="text-right">{t("run.scoL3")}</div>
            <div className="text-right">{t("run.scoL2")}</div>
            <div className="text-right">{t("run.scoOverall")}</div>
            <div className="text-right">{t("run.scoTier")}</div>
          </div>
          {rows.map((r) => (
            <div
              key={r.slug}
              className={cx(
                "grid grid-cols-[2fr_repeat(4,_1fr)_80px] px-5 py-4 items-center border-b border-ink-600 last:border-0",
                r.slug === winner.slug && "bg-brand/5",
              )}
            >
              <div className="flex items-center gap-3">
                <ProviderMark slug={r.slug} />
                <span className="text-bone text-[13px]">{r.p.name}</span>
                {r.slug === winner.slug && (
                  <span className="micro text-brand">{t("run.scoBest")}</span>
                )}
              </div>
              <ScoreCell value={r.scores!.L1} />
              <ScoreCell value={r.scores!.L3} />
              <ScoreCell value={r.scores!.L2} />
              <ScoreCell value={r.scores!.overall} bold />
              <div className="text-right">
                <TierChip tier={r.scores!.tier as Tier} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 text-[11px] text-smoke leading-relaxed max-w-3xl">
        {t("run.scoMethodologyNote")}{" "}
        <Link href="/docs" className="ulink text-ash">
          {t("run.scoMethodology")}
        </Link>
        .
      </div>
    </div>
  );
}

function ScoreCell({ value, bold = false }: { value: number; bold?: boolean }) {
  const tone = value >= 88 ? "brand" : value >= 70 ? "amber" : "coral";
  const colors = {
    brand: "text-brand",
    amber: "text-amber",
    coral: "text-coral",
  };
  const bars = {
    brand: "bg-brand",
    amber: "bg-amber",
    coral: "bg-coral",
  };
  return (
    <div className="text-right">
      <div className={cx("num", bold ? "text-base" : "text-[13px]", colors[tone])}>
        {value}
      </div>
      <div
        className="mt-1 ml-auto h-px relative overflow-hidden bg-ink-500"
        style={{ width: 80 }}
      >
        <div
          className={cx(bars[tone], "absolute inset-y-0 right-0")}
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );
}

function RecommendedAction({ run }: { run: RunState }) {
  const { t } = useLang();
  const { providers } = useData();
  const { wallet, setShowConnect } = useWallet();
  const [payTarget, setPayTarget] = useState<{ provider: Provider; cost: number } | null>(null);
  const completed = run.providers.filter((r) => r.status === "completed" && r.scores);
  if (!completed.length) return null;

  const recommended = [...completed].sort(
    (a, b) => b.scores!.overall - a.scores!.overall,
  )[0];
  const cheapest = [...completed].sort((a, b) => a.cost! - b.cost!)[0];
  const trusted = [...completed].sort((a, b) => {
    const tA = providers.find((p) => p.slug === a.slug)!.trust;
    const tB = providers.find((p) => p.slug === b.slug)!.trust;
    return tB - tA;
  })[0];

  const recP = providers.find((p) => p.slug === recommended.slug)!;
  const cheapP = providers.find((p) => p.slug === cheapest.slug)!;
  const trustP = providers.find((p) => p.slug === trusted.slug)!;

  const pay = (provider: Provider, cost: number) => {
    if (!wallet) setShowConnect(true);
    else setPayTarget({ provider, cost });
  };

  const isSame = (p: Provider) => p.slug === recP.slug;

  return (
    <>
      <div className="card-2 p-8 ring-1 ring-brand/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-brand"></div>
        <div className="grid md:grid-cols-[1fr_auto] gap-8 items-end">
          <div>
            <div className="micro text-smoke">{t("run.verdict")}</div>
            <h3 className="serif text-3xl sm:text-4xl lg:text-5xl tracking-editorial mt-2">
              {t("run.useHeadline")}{" "}
              <span className="serif-it text-brand">{recP.name}</span>.
            </h3>
            <p className="mt-3 text-ash text-[14px] max-w-xl leading-relaxed">
              {t("run.useBody")}{" "}
              <span className="num text-bone">{recommended.scores!.overall}</span>
              {t("run.useEstCost")}{" "}
              <span className="num text-bone">{fmtUSD(recommended.cost!, 4)}</span>
              {t("run.useTrailer")}
            </p>
          </div>
          <div className="flex flex-col gap-2 min-w-[260px]">
            <button
              onClick={() => pay(recP, recommended.cost!)}
              className="btn-brand px-6 py-3 text-sm font-medium tracking-tight inline-flex items-center gap-2 justify-center"
            >
              <I.wallet className="w-4 h-4" />{" "}
              {t("run.payAndRun", { name: recP.name })}
            </button>
            {!isSame(cheapP) && (
              <button
                onClick={() => pay(cheapP, cheapest.cost!)}
                className="btn-ghost px-6 py-2 text-[12px] inline-flex items-center justify-between gap-3"
              >
                <span>{t("run.useCheapestPick", { name: cheapP.name })}</span>
                <span className="num text-brand">{fmtUSD(cheapest.cost!, 4)}</span>
              </button>
            )}
            {!isSame(trustP) && (
              <button
                onClick={() => pay(trustP, trusted.cost!)}
                className="btn-ghost px-6 py-2 text-[12px] inline-flex items-center justify-between gap-3"
              >
                <span>{t("run.useTrustedPick", { name: trustP.name })}</span>
                <span className="num text-amber">{trustP.trust}</span>
              </button>
            )}
          </div>
        </div>
      </div>
      {payTarget && (
        <PaymentModal
          provider={payTarget.provider}
          cost={payTarget.cost}
          onClose={() => setPayTarget(null)}
        />
      )}
    </>
  );
}

function RecentRuns({
  history,
  onClear,
  onReuse,
}: {
  history: HistoryEntry[];
  onClear: () => void;
  onReuse: (h: HistoryEntry) => void;
}) {
  const { t } = useLang();
  const { providers } = useData();
  const toast = useToast();
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-12">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="micro text-smoke">{t("run.recentRuns")}</div>
          <h3 className="serif text-3xl sm:text-4xl lg:text-5xl tracking-editorial mt-1">
            {t("run.yourLast")}{" "}
            <span className="serif-it text-brand">{history.length}</span>
          </h3>
        </div>
        <button
          onClick={onClear}
          className="micro text-smoke hover:text-bone"
        >
          {t("run.clear")}
        </button>
      </div>
      <div className="space-y-px bg-ink-600 border border-ink-600">
        {history.map((h) => {
          const completed = h.providers.filter((r) => r.status === "completed");
          const totalCost = completed.reduce((s, r) => s + (r.cost || 0), 0);
          const isCompare = h.providers.length > 1;
          return (
            <div
              key={h.id}
              className="bg-ink p-4 flex flex-col md:grid md:grid-cols-[200px_1fr_auto] gap-3 md:gap-4 md:items-center"
            >
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {h.providers.slice(0, 3).map((r) => (
                    <div
                      key={r.slug}
                      className="ring-1 ring-ink rounded-sm"
                    >
                      <ProviderMark slug={r.slug} size={28} />
                    </div>
                  ))}
                  {h.providers.length > 3 && (
                    <div className="w-7 h-7 flex items-center justify-center bg-ink-700 text-ash text-[10px] num ring-1 ring-ink">
                      +{h.providers.length - 3}
                    </div>
                  )}
                </div>
                <div className="ml-1">
                  <div className="text-[13px] text-bone">
                    {isCompare
                      ? t("run.providersCount", { n: h.providers.length })
                      : providers.find((p) => p.slug === h.providers[0].slug)?.name}
                  </div>
                  <div className="micro text-smoke">
                    {isCompare ? t("run.modeCompare") : t("run.modeSingleShort")} ·{" "}
                    {h.modelDisplay}
                  </div>
                </div>
              </div>
              <div className="text-[12px] text-ash line-clamp-2 md:truncate">
                {h.prompt}
              </div>
              <div className="flex items-center justify-between md:justify-start gap-6">
                <div className="text-left md:text-right">
                  <div className="num text-[12px] text-bone">{fmtUSD(totalCost, 4)}</div>
                  <div className="micro text-smoke">
                    {t("run.okFraction", {
                      c: completed.length,
                      t: h.providers.length,
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      const r = h.providers.find((rr) => rr.status === "completed");
                      if (r?.response) {
                        copyToClipboard(r.response);
                        toast.show(t("run.responseCopied"));
                      }
                    }}
                    title={t("run.copyFirst")}
                    className="text-smoke hover:text-bone p-1.5"
                  >
                    <I.copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onReuse(h)}
                    title={t("run.reUse")}
                    className="text-smoke hover:text-bone p-1.5"
                  >
                    <I.refresh className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
