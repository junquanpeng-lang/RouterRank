"use client";

import Link from "next/link";
import { useLang } from "@/lib/contexts/lang";

export function Footer() {
  const { t } = useLang();
  const now = new Date().toISOString().slice(0, 16).replace("T", " ") + " UTC";

  return (
    <footer className="border-t border-ink-600 mt-32 pt-16 pb-10">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-[1.5fr_1fr_1fr] gap-10">
        <div className="max-w-md">
          <div className="serif text-3xl tracking-editorial mb-3">RouterRank</div>
          <p className="text-[13px] text-ash leading-relaxed">{t("footer.tagline")}</p>
          <div className="mt-6 micro text-smoke">
            {t("footer.lastRefresh")}{" "}
            <span className="num text-ash">{now}</span>
          </div>
        </div>
        <div>
          <div className="micro text-smoke mb-4">{t("footer.productHeading")}</div>
          <ul className="space-y-2 text-[13px]">
            <li><Link href="/" className="text-ash hover:text-bone ulink">{t("footer.linkRanking")}</Link></li>
            <li><Link href="/run" className="text-ash hover:text-bone ulink">{t("footer.linkRun")}</Link></li>
            <li><Link href="/validate" className="text-ash hover:text-bone ulink">{t("footer.linkValidate")}</Link></li>
            <li><a href="#" className="text-ash hover:text-bone ulink">{t("footer.linkApiSdk")}</a></li>
          </ul>
        </div>
        <div>
          <div className="micro text-smoke mb-4">{t("footer.methodologyHeading")}</div>
          <ul className="space-y-2 text-[13px]">
            <li><Link href="/docs" className="text-ash hover:text-bone ulink">{t("footer.mTrust")}</Link></li>
            <li><Link href="/docs" className="text-ash hover:text-bone ulink">{t("footer.mCost")}</Link></li>
            <li><Link href="/docs" className="text-ash hover:text-bone ulink">{t("footer.mSampling")}</Link></li>
            <li><Link href="/docs" className="text-ash hover:text-bone ulink">{t("footer.mIntegrity")}</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-ink-600">
        <p className="text-[11px] text-smoke leading-relaxed max-w-3xl">
          {t("footer.disclaimer")}
        </p>
        <div className="micro text-smoke mt-4">{t("footer.copyright")}</div>
      </div>
    </footer>
  );
}
