"use client";

import { useLang } from "@/lib/contexts/lang";
import { useWallet } from "@/lib/contexts/wallet";
import { cx } from "@/lib/utils";
import { I } from "@/components/ui/icons";
import { Modal } from "@/components/ui/modal";

export function WalletConnectModal() {
  const { t } = useLang();
  const { showConnect, setShowConnect, connect } = useWallet();
  if (!showConnect) return null;

  const wallets = [
    {
      name: t("wallet.walletAgenticName"),
      sub: t("wallet.walletAgenticSub"),
      primary: true,
    },
    {
      name: t("wallet.walletConnectName"),
      sub: t("wallet.walletConnectSub"),
      primary: false,
    },
    {
      name: t("wallet.walletExtName"),
      sub: t("wallet.walletExtSub"),
      primary: false,
    },
  ];

  return (
    <Modal onClose={() => setShowConnect(false)}>
      <div className="micro text-smoke mb-2">{t("wallet.connectTag")}</div>
      <h3 className="serif text-4xl tracking-editorial">
        {t("wallet.connectHeadPre")}{" "}
        <span className="serif-it text-brand">{t("wallet.connectHeadIt")}</span>{" "}
        {t("wallet.connectHeadPost")}
      </h3>
      <p className="mt-3 text-ash text-[13px] leading-relaxed">
        {t("wallet.connectBody")}
      </p>
      <div className="mt-6 space-y-2">
        {wallets.map((w, i) => (
          <button
            key={i}
            onClick={connect}
            className={cx(
              "w-full flex items-center justify-between px-4 py-3 border transition-colors text-left",
              w.primary
                ? "border-brand/60 hover:bg-brand/5"
                : "border-ink-600 hover:border-bone/30",
            )}
          >
            <div>
              <div
                className={cx(
                  "text-[14px]",
                  w.primary ? "text-brand" : "text-bone",
                )}
              >
                {w.name}
              </div>
              <div className="micro text-smoke mt-0.5">{w.sub}</div>
            </div>
            <I.arrow className="w-4 h-4 text-ash" />
          </button>
        ))}
      </div>
      <p className="mt-6 text-[11px] text-smoke leading-relaxed">
        {t("wallet.connectDisclaimerPre")}
        <a href="#" className="ulink text-ash">
          {t("wallet.connectDisclaimerPrivacy")}
        </a>
        {t("wallet.connectDisclaimerAnd")}
        <a href="#" className="ulink text-ash">
          {t("wallet.connectDisclaimerTerms")}
        </a>
        {t("wallet.connectDisclaimerPost")}
      </p>
    </Modal>
  );
}
