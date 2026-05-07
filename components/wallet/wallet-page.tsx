"use client";

import { useLang } from "@/lib/contexts/lang";
import { useWallet } from "@/lib/contexts/wallet";
import { fmtUSD } from "@/lib/utils";
import { PageHero } from "@/components/page-skeleton";

export function WalletPageBody() {
  const { t } = useLang();
  const { wallet, disconnect, setShowConnect } = useWallet();

  return (
    <PageHero
      tag={t("wallet.accountTag")}
      title={
        <>
          {t("wallet.headPre")}{" "}
          <span className="serif-it text-brand">{t("wallet.headIt")}</span>{" "}
          {t("wallet.headPost")}
        </>
      }
    >
      {!wallet ? (
        <div className="card p-16 text-center max-w-2xl">
          <div className="serif text-3xl tracking-editorial mt-4">
            {t("wallet.noWallet")}
          </div>
          <p className="text-ash text-[13px] mt-2">{t("wallet.noWalletSub")}</p>
          <button
            onClick={() => setShowConnect(true)}
            className="btn-brand px-6 py-3 text-sm font-medium mt-6"
          >
            {t("wallet.connectWallet")}
          </button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-px bg-ink-600 max-w-4xl">
          <div className="bg-ink p-6 lg:col-span-2">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="micro text-smoke">{t("wallet.address")}</div>
              <span className="inline-flex items-center gap-1.5 text-[10px] tracking-wider uppercase border border-brand/40 text-brand px-2 py-0.5">
                {t("wallet.x402Compatible")}
              </span>
            </div>
            <div className="num text-[15px] mt-1 text-bone break-all">
              {wallet.full}
            </div>
            <div className="grid grid-cols-3 gap-px bg-ink-600 mt-8">
              <Metric
                label={t("wallet.mBalance")}
                value={fmtUSD(wallet.balance)}
                sub={t("wallet.mBalanceSub")}
                tone="brand"
              />
              <Metric
                label={t("wallet.mChain")}
                value={wallet.chain}
                sub={t("wallet.mChainSub")}
              />
              <Metric
                label={t("wallet.mStatus")}
                value={t("wallet.mStatusActive")}
                sub={t("wallet.mStatusSub")}
                tone="brand"
              />
            </div>
          </div>
          <div className="bg-ink p-6">
            <div className="micro text-smoke mb-3">{t("wallet.recentActivity")}</div>
            <div className="space-y-3">
              {[
                { time: "2m ago", p: "Together", a: "$0.013" },
                { time: "1h ago", p: "Portkey", a: "$0.018" },
                { time: "3h ago", p: "B.ai", a: "$0.011" },
                { time: "8h ago", p: "Together", a: "$0.014" },
              ].map((tx, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-[12px] py-2 border-b border-ink-600 last:border-0"
                >
                  <div>
                    <div className="text-bone">{tx.p}</div>
                    <div className="micro text-smoke">{tx.time}</div>
                  </div>
                  <div className="num text-bone">{tx.a}</div>
                </div>
              ))}
            </div>
            <button
              onClick={disconnect}
              className="mt-6 btn-ghost w-full py-2 text-[12px]"
            >
              {t("wallet.disconnect")}
            </button>
          </div>
        </div>
      )}
    </PageHero>
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
  sub: string;
  tone?: "bone" | "brand";
}) {
  return (
    <div className="bg-ink p-4">
      <div className="micro text-smoke mb-2">{label}</div>
      <div
        className={
          "serif text-3xl tracking-editorial " +
          (tone === "brand" ? "text-brand" : "text-bone")
        }
      >
        {value}
      </div>
      <div className="text-[11px] text-ash mt-1">{sub}</div>
    </div>
  );
}
