"use client";

import { useMemo, useState } from "react";
import { useLang } from "@/lib/contexts/lang";
import { useToast } from "@/lib/contexts/toast";
import { setupPrompt } from "@/lib/setup-prompt";
import { copyToClipboard, cx } from "@/lib/utils";
import { I } from "@/components/ui/icons";
import { Modal } from "@/components/ui/modal";
import type { Provider } from "@/lib/types";

export function SetupPromptModal({
  provider,
  onClose,
}: {
  provider: Provider;
  onClose: () => void;
}) {
  const { t } = useLang();
  const toast = useToast();
  const [funding, setFunding] = useState(20);
  const [customMode, setCustomMode] = useState(false);
  const PRESETS = [10, 20, 50];
  const promptText = useMemo(
    () => setupPrompt(provider, funding),
    [provider, funding],
  );

  const onCopy = async () => {
    await copyToClipboard(promptText);
    toast.show(t("setup.copyToast"));
  };

  return (
    <Modal onClose={onClose} size="lg">
      <div className="flex items-center justify-between mb-2 gap-3 flex-wrap">
        <div className="micro text-smoke">{t("setup.tag")}</div>
        <span className="inline-flex items-center gap-1.5 text-[10px] tracking-wider uppercase border border-brand/40 text-brand px-2 py-0.5">
          <I.dot className="w-1.5 h-1.5" /> {t("setup.x402Compatible")}
        </span>
      </div>
      <h3 className="serif text-3xl sm:text-4xl tracking-editorial">
        {t("setup.headPre")}{" "}
        <span className="serif-it text-brand">{provider.name}</span>{" "}
        {t("setup.headPost")}
      </h3>
      <p className="mt-3 text-ash text-[13px] leading-relaxed max-w-xl">
        {t("setup.body", { name: provider.name })}
      </p>

      {/* 3-step strip */}
      <div className="mt-6 grid grid-cols-3 gap-px bg-ink-600 border border-ink-600">
        {[
          { n: "1", l: t("setup.step1Title"), d: t("setup.step1Sub") },
          { n: "2", l: t("setup.step2Title"), d: t("setup.step2Sub") },
          { n: "3", l: t("setup.step3Title"), d: t("setup.step3Sub") },
        ].map((s) => (
          <div key={s.n} className="bg-ink p-3">
            <div className="serif-it text-2xl text-brand leading-none">{s.n}</div>
            <div className="text-[12px] text-bone mt-2">{s.l}</div>
            <div className="micro text-smoke mt-1">{s.d}</div>
          </div>
        ))}
      </div>

      {/* Funding */}
      <div className="mt-6">
        <div className="micro text-smoke mb-2">{t("setup.fundingLabel")}</div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {PRESETS.map((amt) => (
            <button
              key={amt}
              onClick={() => {
                setFunding(amt);
                setCustomMode(false);
              }}
              className={cx(
                "px-3 py-1.5 text-[12px] border transition-colors",
                !customMode && funding === amt
                  ? "border-brand text-brand bg-brand/5"
                  : "border-ink-500 text-ash hover:border-bone hover:text-bone",
              )}
            >
              ${amt}
            </button>
          ))}
          <button
            onClick={() => setCustomMode(true)}
            className={cx(
              "px-3 py-1.5 text-[12px] border transition-colors",
              customMode
                ? "border-brand text-brand bg-brand/5"
                : "border-ink-500 text-ash hover:border-bone hover:text-bone",
            )}
          >
            {t("setup.fundingCustom")}
          </button>
          {customMode && (
            <input
              type="number"
              min={1}
              max={500}
              value={funding}
              onChange={(e) => {
                const v = Math.max(1, Math.min(500, Number(e.target.value) || 0));
                setFunding(v);
              }}
              className="w-24 bg-ink-800 border border-ink-500 focus:border-brand/60 outline-none px-3 py-1.5 text-[12px] num text-bone"
            />
          )}
        </div>
      </div>

      {/* Prompt block */}
      <div className="mt-5">
        <div className="micro text-smoke mb-2">{t("setup.promptLabel")}</div>
        <pre className="bg-ink-800 border border-ink-600 px-4 py-3 text-[12px] leading-relaxed text-bone font-mono whitespace-pre-wrap max-h-[280px] overflow-y-auto">
          {promptText}
        </pre>
      </div>

      <button
        onClick={onCopy}
        className="btn-brand w-full mt-5 py-3 text-sm font-medium inline-flex items-center justify-center gap-2"
      >
        <I.copy className="w-4 h-4" /> {t("setup.copyPrompt")}
      </button>

      <div className="mt-4 flex items-start gap-2 text-[11px] text-smoke leading-relaxed">
        <I.lock className="w-3 h-3 mt-0.5 shrink-0 text-brand" />
        <span>{t("setup.footnote")}</span>
      </div>
    </Modal>
  );
}
