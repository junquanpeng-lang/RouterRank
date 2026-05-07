"use client";

import { useLang } from "@/lib/contexts/lang";
import { PageHero, ComingSoonCard } from "@/components/page-skeleton";

export function ValidatePageBody() {
  const { t } = useLang();
  return (
    <PageHero
      tag={t("validate.tool")}
      titlePre={t("validate.headPre")}
      titleIt={t("validate.headIt")}
      titlePost={t("validate.headPost")}
      body={t("validate.subhead")}
    >
      <ComingSoonCard
        note="Single-shot fingerprint probe — paste a chat-completions URL and we'll run the L1 score suite (embedding distance · K-S length test · tokenizer signature · precision estimate · refusal alignment) directly in your browser."
      />
    </PageHero>
  );
}
