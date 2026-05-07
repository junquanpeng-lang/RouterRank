"use client";

import { useLang } from "@/lib/contexts/lang";

export function DocsPageBody() {
  const { t } = useLang();

  const tiers = [
    { tier: "L1", labelKey: "tierL1Label", weight: "40%", qKey: "tierL1Q" },
    { tier: "L3", labelKey: "tierL3Label", weight: "40%", qKey: "tierL3Q" },
    { tier: "L2", labelKey: "tierL2Label", weight: "20%", qKey: "tierL2Q" },
  ];

  const bands: { tier: "AAA" | "AA" | "A" | "B" | "C"; range: string }[] = [
    { tier: "AAA", range: "≥ 90" },
    { tier: "AA", range: "80–89" },
    { tier: "A", range: "70–79" },
    { tier: "B", range: "60–69" },
    { tier: "C", range: "< 60" },
  ];

  return (
    <div className="max-w-[920px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-24">
      <div className="micro text-smoke">{t("docs.heroTag")}</div>
      <h1 className="serif text-5xl sm:text-6xl lg:text-7xl tracking-editorial leading-none mt-2">
        {t("docs.heroTitlePre")}{" "}
        <span className="serif-it text-brand">{t("docs.heroTitleIt")}</span>
      </h1>
      <p className="mt-6 text-ash text-lg leading-relaxed max-w-2xl">
        {t("docs.heroSubhead")}
      </p>

      {/* Three-tier overview */}
      <section className="mt-12 pt-10 border-t border-ink-600">
        <h2 className="serif text-3xl sm:text-4xl tracking-editorial">
          Three tiers · nine dimensions
        </h2>
        <div className="mt-6 grid sm:grid-cols-3 gap-px bg-ink-600 border border-ink-600">
          {tiers.map((it) => (
            <div key={it.tier} className="bg-ink p-5">
              <div className="flex items-baseline justify-between mb-2">
                <span className="micro text-smoke">{it.tier}</span>
                <span className="num text-[12px] text-brand">{it.weight}</span>
              </div>
              <div className="serif text-2xl tracking-editorial text-bone">
                {t("docs." + it.labelKey)}
              </div>
              <p className="text-[12px] text-ash mt-2 leading-relaxed">
                {t("docs." + it.qKey)}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-6 p-4 card-2 num text-[13px] text-ash text-center">
          {t("docs.formula")}
        </div>
      </section>

      {/* Tier rating */}
      <section className="mt-12 pt-10 border-t border-ink-600">
        <h2 className="serif text-3xl sm:text-4xl tracking-editorial">AAA → C</h2>
        <div className="mt-6 space-y-px bg-ink-600 border border-ink-600">
          {bands.map((b) => (
            <div
              key={b.tier}
              className="bg-ink p-4 grid grid-cols-[80px_80px_1fr] gap-4 items-center"
            >
              <span
                className={
                  "inline-flex items-center gap-1 px-2 py-0.5 text-[11px] tracking-wider border w-fit " +
                  (b.tier === "AAA" || b.tier === "AA"
                    ? "border-brand text-brand"
                    : b.tier === "A"
                      ? "border-amber text-amber"
                      : "border-coral text-coral")
                }
              >
                ● {b.tier}
              </span>
              <span className="num text-[12px] text-bone">{b.range}</span>
              <span className="text-[13px] text-ash leading-relaxed">
                Rating band — full descriptions in the next release.
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 pt-10 border-t border-ink-600">
        <p className="text-ash text-[14px] leading-relaxed max-w-md">
          {t("docs.ctaBody")}
        </p>
      </section>
    </div>
  );
}
