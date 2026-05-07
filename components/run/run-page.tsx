"use client";

import { useLang } from "@/lib/contexts/lang";
import { PageHero, ComingSoonCard } from "@/components/page-skeleton";

export function RunPageBody() {
  const { t } = useLang();
  return (
    <PageHero
      tag={t("run.tool")}
      title={
        <>
          {t("run.headPre")}{" "}
          <span className="serif-it text-brand">{t("run.headNTruths")}</span>
        </>
      }
      body={t("run.subCompare")}
    >
      <ComingSoonCard
        note="The full Run experience — prompt setup, multi-router parallel streaming, scorecard, side-by-side response grid, recommended action — is being built component-by-component."
      />
    </PageHero>
  );
}
