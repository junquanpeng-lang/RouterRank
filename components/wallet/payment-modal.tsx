"use client";

import { Fragment, useState } from "react";
import { useLang } from "@/lib/contexts/lang";
import { useWallet } from "@/lib/contexts/wallet";
import { fmtUSD } from "@/lib/utils";
import { I } from "@/components/ui/icons";
import { Modal, Row } from "@/components/ui/modal";
import type { Provider } from "@/lib/types";

export function PaymentModal({
  provider,
  cost,
  onClose,
}: {
  provider: Provider;
  cost: number;
  onClose: () => void;
}) {
  const { t } = useLang();
  const { wallet } = useWallet();
  const [stage, setStage] = useState<"confirm" | "signing" | "paid">("confirm");

  const onPay = () => {
    setStage("signing");
    setTimeout(() => setStage("paid"), 1500);
  };

  return (
    <Modal onClose={onClose}>
      {stage === "confirm" && (
        <Fragment>
          <div className="flex items-center justify-between mb-2 gap-3 flex-wrap">
            <div className="micro text-smoke">{t("payment.intentTag")}</div>
            <span className="inline-flex items-center gap-1.5 text-[10px] tracking-wider uppercase border border-brand/40 text-brand px-2 py-0.5">
              <I.dot className="w-1.5 h-1.5" /> {t("payment.x402Compatible")}
            </span>
          </div>
          <h3 className="serif text-3xl sm:text-4xl tracking-editorial">
            {t("payment.headline")}
          </h3>
          <div className="mt-6 card-2 divide-y divide-ink-600">
            <Row label={t("payment.rowProvider")} value={provider.name} />
            <Row label={t("payment.rowModel")} value="GPT-5.5" />
            <Row label={t("payment.rowEstCost")} value={fmtUSD(cost, 4)} accent />
            <Row
              label={t("payment.rowMethod")}
              value={t("payment.rowMethodValue")}
            />
            <Row label={t("payment.rowFrom")} value={wallet?.address || "—"} />
          </div>
          <button
            onClick={onPay}
            className="btn-brand w-full mt-6 py-3 text-sm font-medium inline-flex items-center justify-center gap-2"
          >
            <I.lock className="w-4 h-4" /> {t("payment.signAndPay")}
          </button>
          <div className="mt-3 text-center text-[11px] text-smoke leading-relaxed">
            {t("payment.footnote")}
          </div>
        </Fragment>
      )}
      {stage === "signing" && (
        <div className="text-center py-12">
          <I.spin className="w-12 h-12 mx-auto animate-spin text-brand" />
          <div className="serif text-3xl tracking-editorial mt-6">
            {t("payment.awaiting")}
            <span className="serif-it text-brand">…</span>
          </div>
          <div className="micro text-smoke mt-2">
            {t("payment.awaitingSub")}
          </div>
        </div>
      )}
      {stage === "paid" && (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto bg-brand/10 ring-1 ring-brand flex items-center justify-center">
            <I.check className="w-7 h-7 text-brand" />
          </div>
          <div className="serif text-4xl tracking-editorial mt-6">
            {t("payment.paid")}
          </div>
          <div className="micro text-smoke mt-2">{t("payment.paidTx")}</div>
          <div className="text-ash text-[13px] mt-4">
            {t("payment.paidSub")}
          </div>
          <button
            onClick={onClose}
            className="btn-ghost px-6 py-2 text-[12px] mt-8"
          >
            {t("payment.close")}
          </button>
        </div>
      )}
    </Modal>
  );
}
