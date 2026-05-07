"use client";

import { useMemo } from "react";
import { useLang } from "@/lib/contexts/lang";
import { PROVIDERS } from "@/lib/data";
import { ProviderMark } from "@/components/ui/provider-mark";

export function TickerBar() {
  const { t } = useLang();

  // Mock x402 payment feed — recent wallet → router payments
  const feed = useMemo(
    () => [
      { addr: "0x7a3F…e9b2", slug: "together", amt: 0.014, ago: "2s ago" },
      { addr: "agent01.eth", slug: "portkey", amt: 0.083, ago: "5s ago" },
      { addr: "0x4D21…c0F8", slug: "fireworks", amt: 0.027, ago: "11s ago" },
      { addr: "kira.base.eth", slug: "openrouter", amt: 0.142, ago: "14s ago" },
      { addr: "0x9B5e…4a17", slug: "bai", amt: 0.018, ago: "22s ago" },
      { addr: "0xC3a8…d901", slug: "together", amt: 0.236, ago: "29s ago" },
      { addr: "router-bot.eth", slug: "fireworks", amt: 0.041, ago: "34s ago" },
      { addr: "0x2E7d…8b44", slug: "portkey", amt: 0.058, ago: "48s ago" },
      { addr: "0xF1c6…3e2a", slug: "anyscale", amt: 0.092, ago: "1m ago" },
      { addr: "agent42.eth", slug: "together", amt: 0.012, ago: "1m ago" },
      { addr: "0x8Ac4…5d39", slug: "replicate", amt: 0.114, ago: "2m ago" },
      { addr: "pact.base.eth", slug: "openrouter", amt: 0.064, ago: "2m ago" },
      { addr: "0x3F2b…7e15", slug: "litellm", amt: 0.008, ago: "3m ago" },
      { addr: "0xA9d7…c23e", slug: "fireworks", amt: 0.031, ago: "4m ago" },
    ],
    [],
  );
  const list = [...feed, ...feed];

  return (
    <div className="border-y border-ink-600 bg-ink-800/50 overflow-hidden">
      <div className="flex items-center">
        <div className="micro text-smoke px-4 py-2 border-r border-ink-600 shrink-0 flex items-center gap-2 bg-ink">
          <span className="w-1.5 h-1.5 bg-brand rounded-full pulse-dot"></span>
          {t("ticker.live")}
        </div>
        <div className="overflow-hidden flex-1">
          <div className="ticker-track flex items-center gap-8 py-2 whitespace-nowrap">
            {list.map((x, i) => {
              const provider = PROVIDERS.find((p) => p.slug === x.slug);
              return (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 text-[12px] shrink-0"
                >
                  <span className="num text-ash">{x.addr}</span>
                  <span className="text-smoke">→</span>
                  <ProviderMark slug={x.slug} size={16} />
                  <span className="text-bone">{provider?.name || x.slug}</span>
                  <span className="num text-brand">${x.amt.toFixed(3)}</span>
                  <span className="micro text-smoke">{x.ago}</span>
                  <span className="text-ink-500 ml-2">·</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
