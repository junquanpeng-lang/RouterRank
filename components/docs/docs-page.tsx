"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useLang } from "@/lib/contexts/lang";
import { TierChip } from "@/components/ui/tier-chip";
import { I } from "@/components/ui/icons";
import type { Tier } from "@/lib/types";

export function DocsPageBody() {
  const { t } = useLang();

  return (
    <div className="max-w-[920px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-24">
      {/* Hero */}
      <div className="micro text-smoke">{t("docs.heroTag")}</div>
      <h1 className="serif text-5xl sm:text-6xl lg:text-7xl tracking-editorial leading-none mt-2">
        {t("docs.heroTitlePre")}{" "}
        <span className="serif-it text-brand">{t("docs.heroTitleIt")}</span>
      </h1>
      <p className="mt-6 text-ash text-lg leading-relaxed max-w-2xl">
        {t("docs.heroSubhead")}
      </p>

      {/* Framework overview */}
      <section className="mt-12 pt-10 border-t border-ink-600">
        <div className="micro text-smoke">{t("docs.s00Tag")}</div>
        <h2 className="serif text-3xl sm:text-4xl tracking-editorial mt-2">
          {t("docs.s00Title")}
        </h2>
        <p className="mt-3 text-ash text-[15px] leading-relaxed max-w-2xl">
          {t("docs.s00Body")}
          <em className="text-bone not-italic">{t("docs.s00BodyEm")}</em>
          {t("docs.s00BodyPost")}
        </p>
        <div className="mt-6 grid sm:grid-cols-3 gap-px bg-ink-600 border border-ink-600">
          {[
            { tier: "L1", labelKey: "tierL1Label", weight: "40%", qKey: "tierL1Q" },
            { tier: "L3", labelKey: "tierL3Label", weight: "40%", qKey: "tierL3Q" },
            { tier: "L2", labelKey: "tierL2Label", weight: "20%", qKey: "tierL2Q" },
          ].map((it) => (
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

      {/* Rating bands */}
      <section className="mt-12 pt-10 border-t border-ink-600">
        <div className="micro text-smoke">{t("docs.s01Tag")}</div>
        <h2 className="serif text-3xl sm:text-4xl tracking-editorial mt-2">
          {t("docs.s01Title")}
        </h2>
        <p className="mt-3 text-ash text-[15px] leading-relaxed max-w-2xl">
          {t("docs.s01Body")}
        </p>
        <div className="mt-6 space-y-px bg-ink-600 border border-ink-600">
          {(
            [
              ["AAA", "≥ 90", "band1Desc"],
              ["AA", "80–89", "band2Desc"],
              ["A", "70–79", "band3Desc"],
              ["B", "60–69", "band4Desc"],
              ["C", "< 60", "band5Desc"],
            ] as Array<[Tier, string, string]>
          ).map(([tier, range, descKey]) => (
            <div
              key={tier}
              className="bg-ink p-4 grid grid-cols-[80px_80px_1fr] gap-4 items-center"
            >
              <TierChip tier={tier} size="lg" />
              <span className="num text-[12px] text-bone">{range}</span>
              <span className="text-[13px] text-ash leading-relaxed">
                {t("docs." + descKey)}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* L1 - Trustworthiness */}
      <DimSection
        num="L1"
        title={t("docs.tierL1Label")}
        weight="40%"
        question={t("docs.tierL1Q")}
      >
        <p>
          {t("docs.l1Intro")}
          <strong className="text-bone">{t("docs.l1IntroBold")}</strong>
        </p>

        <SubDim id="1.1" name={t("provider.sub11")} weight="50%">
          <p>{t("docs.l11Intro")}</p>
          <Methods
            items={[
              {
                k: "RUT (Rank-based Uniformity Test)",
                arxiv: "2506.06975",
                why: t("docs.l11Method1Why"),
              },
              {
                k: "Logprob Tracking",
                arxiv: "2512.03816",
                why: t("docs.l11Method2Why"),
              },
              {
                k: "Output Distribution Comparison",
                arxiv: null,
                why: t("docs.l11Method3Why"),
              },
              {
                k: "Response Consistency Test",
                arxiv: null,
                why: t("docs.l11Method4Why"),
              },
            ]}
          />
          <p className="text-[12px] text-smoke mt-3">{t("docs.l11Score")}</p>
        </SubDim>

        <SubDim id="1.2" name={t("provider.sub12")} weight="30%">
          <p>
            {t("docs.l12IntroPre")}
            <em className="text-bone not-italic">{t("docs.l12IntroEm1")}</em>
            {t("docs.l12IntroSep")}
            <em className="text-bone not-italic">{t("docs.l12IntroEm2")}</em>
            {t("docs.l12IntroAnd")}
            <em className="text-bone not-italic">{t("docs.l12IntroEm3")}</em>
            {t("docs.l12IntroPost")}
          </p>
          <Methods
            items={[
              {
                k: "CoIn — Hash-tree audit",
                arxiv: "2505.13778",
                why: t("docs.l12Method1Why"),
              },
              {
                k: "PALACE — Reasoning prediction",
                arxiv: "2508.00912",
                why: t("docs.l12Method2Why"),
              },
              {
                k: "Three-class inflation taxonomy",
                arxiv: "2505.18471",
                why: t("docs.l12Method3Why"),
              },
            ]}
          />
          <p className="text-[12px] text-smoke mt-3">{t("docs.l12Score")}</p>
        </SubDim>

        <SubDim id="1.3" name={t("provider.sub13")} weight="20%">
          <p>{t("docs.l13Intro")}</p>
          <ul className="mt-3 space-y-1 text-[13px]">
            <li className="text-coral">{t("docs.l13DirUp")}</li>
            <li className="text-amber">{t("docs.l13DirDown")}</li>
          </ul>
          <Methods
            items={[
              { k: "Latency fingerprint", arxiv: null, why: t("docs.l13Method1Why") },
              { k: "Usage field consistency", arxiv: null, why: t("docs.l13Method2Why") },
              { k: "Cross-account isolation probe", arxiv: null, why: t("docs.l13Method3Why") },
              { k: "TTL behavior", arxiv: null, why: t("docs.l13Method4Why") },
            ]}
          />
          <p className="text-[12px] text-smoke mt-3">{t("docs.l13Score")}</p>
        </SubDim>
      </DimSection>

      {/* L2 - Performance */}
      <DimSection
        num="L2"
        title={t("docs.tierL2Label")}
        weight="20%"
        question={t("docs.tierL2Q")}
      >
        <p>{t("docs.l2Intro")}</p>

        <SubDim id="2.1" name={t("provider.sub21")} weight="50%">
          <p>
            {t("docs.l21IntroPre")}
            <strong className="text-bone">{t("docs.l21IntroBold")}</strong>
            {t("docs.l21IntroPost")}
          </p>
          <Methods
            items={[
              { k: "TTFT (Time to First Token)", arxiv: null, why: t("docs.l21Method1Why") },
              { k: "TPOT / ITL (Inter-Token Latency)", arxiv: null, why: t("docs.l21Method2Why") },
              { k: "TTFA (Time to First Answer)", arxiv: null, why: t("docs.l21Method3Why") },
              { k: "E2E latency", arxiv: null, why: t("docs.l21Method4Why") },
              {
                k: "Etalon — distribution-based eval",
                arxiv: "2407.07000",
                why: t("docs.l21Method5Why"),
              },
            ]}
          />
          <p className="text-[12px] text-smoke mt-3">{t("docs.l21Note")}</p>
        </SubDim>

        <SubDim id="2.2" name={t("provider.sub22")} weight="30%">
          <p>
            {t("docs.l22IntroPre")}
            <strong className="text-bone">{t("docs.l22IntroBold")}</strong>
            {t("docs.l22IntroPost")}
          </p>
          <Methods
            items={[
              { k: "Output speed", arxiv: null, why: t("docs.l22Method1Why") },
              { k: "System throughput", arxiv: null, why: t("docs.l22Method2Why") },
              { k: "Goodput", arxiv: null, why: t("docs.l22Method3Why") },
              { k: "Requests per second", arxiv: null, why: t("docs.l22Method4Why") },
            ]}
          />
        </SubDim>

        <SubDim id="2.3" name={t("provider.sub23")} weight="20%">
          <p>{t("docs.l23Intro")}</p>
          <ul className="mt-3 space-y-1 text-[13px]">
            <li>{t("docs.l23Size1")}</li>
            <li>{t("docs.l23Size2")}</li>
            <li>{t("docs.l23Size3")}</li>
          </ul>
        </SubDim>
      </DimSection>

      {/* L3 - Economics */}
      <DimSection
        num="L3"
        title={t("docs.tierL3Label")}
        weight="40%"
        question={t("docs.tierL3Q")}
      >
        <p>{t("docs.l3Intro")}</p>

        <SubDim id="3.1" name={t("provider.sub31")} weight="35%">
          <p>
            {t("docs.l31IntroPre")}
            <strong className="text-bone">{t("docs.l31IntroBold")}</strong>
          </p>
          <ul className="mt-3 space-y-1 text-[13px]">
            <li>
              <span className="num text-bone">{t("docs.l31Price1Pre")}</span>
              {t("docs.l31Price1Post")}
            </li>
            <li>
              <span className="num text-bone">{t("docs.l31Price2Pre")}</span>
              {t("docs.l31Price2Post")}
            </li>
            <li>
              <span className="num text-bone">{t("docs.l31Price3Pre")}</span>
              {t("docs.l31Price3Post")}
            </li>
            <li>
              <span className="num text-bone">{t("docs.l31Price4Pre")}</span>
              {t("docs.l31Price4Post")}
            </li>
          </ul>
          <p className="text-[12px] text-smoke mt-3">{t("docs.l31Note")}</p>
        </SubDim>

        <SubDim id="3.2" name={t("provider.sub32")} weight="40%">
          <p>{t("docs.l32Intro")}</p>
          <div className="mt-3 grid sm:grid-cols-2 gap-px bg-ink-600 border border-ink-600 text-[12px]">
            <div className="bg-ink p-3">
              <span className="micro text-smoke">{t("docs.l32Base1Tag")}</span>
              <br />
              <span className="num text-bone mt-1 inline-block">≈ 1.055×</span>
              {t("docs.l32Base1Body")}
            </div>
            <div className="bg-ink p-3">
              <span className="micro text-smoke">{t("docs.l32Base2Tag")}</span>
              <br />
              <span className="num text-bone mt-1 inline-block">≈ 1.0×</span>
              {t("docs.l32Base2Body")}
            </div>
            <div className="bg-ink p-3">
              <span className="micro text-smoke">{t("docs.l32Base3Tag")}</span>
              <br />
              <span className="num text-bone mt-1 inline-block">vs vendor-hosted</span>
              {t("docs.l32Base3Body")}
            </div>
            <div className="bg-ink p-3">
              <span className="micro text-smoke">{t("docs.l32Base4Tag")}</span>
              <br />
              <span className="num text-bone mt-1 inline-block">vs upstream cost</span>
              {t("docs.l32Base4Body")}
            </div>
          </div>
          <p className="text-[12px] text-smoke mt-3">{t("docs.l32Note")}</p>
        </SubDim>

        <SubDim id="3.3" name={t("provider.sub33")} weight="25%">
          <p>{t("docs.l33Intro")}</p>
          <ul className="mt-3 space-y-1 text-[13px]">
            <li>{t("docs.l33Item1")}</li>
            <li>{t("docs.l33Item2")}</li>
            <li>{t("docs.l33Item3")}</li>
            <li>{t("docs.l33Item4")}</li>
            <li>{t("docs.l33Item5")}</li>
          </ul>
          <Methods
            items={[
              {
                k: "Invisible Tokens, Visible Bills",
                arxiv: "2505.18471",
                why: t("docs.l33Method1Why"),
              },
            ]}
          />
        </SubDim>
      </DimSection>

      {/* §04 Sampling */}
      <DocSection num="04" title={t("docs.s04Title")}>
        <p>{t("docs.s04Intro")}</p>
        <div className="mt-4 grid sm:grid-cols-2 gap-px bg-ink-600 border border-ink-600 text-[13px]">
          <div className="bg-ink p-4">
            <div className="micro text-smoke mb-2">{t("docs.s04WindowTag")}</div>
            <p className="text-ash">
              <span className="num text-bone">{t("docs.s04WindowSpan1")}</span>
              {t("docs.s04WindowMid")}
              <span className="num text-bone">{t("docs.s04WindowSpan2")}</span>
              {t("docs.s04WindowPost")}
            </p>
          </div>
          <div className="bg-ink p-4">
            <div className="micro text-smoke mb-2">{t("docs.s04CadenceTag")}</div>
            <p className="text-ash">
              {t("docs.s04CadencePre")}
              <span className="num text-bone">{t("docs.s04CadenceSpan1")}</span>
              {t("docs.s04CadenceMid1")}
              <span className="num text-bone">{t("docs.s04CadenceSpan2")}</span>
              {t("docs.s04CadenceMid2")}
              <span className="num text-bone">{t("docs.s04CadenceSpan3")}</span>
              {t("docs.s04CadencePost")}
            </p>
          </div>
          <div className="bg-ink p-4">
            <div className="micro text-smoke mb-2">{t("docs.s04WorkloadsTag")}</div>
            <p className="text-ash">{t("docs.s04WorkloadsBody")}</p>
          </div>
          <div className="bg-ink p-4">
            <div className="micro text-smoke mb-2">{t("docs.s04RegionsTag")}</div>
            <p className="text-ash">{t("docs.s04RegionsBody")}</p>
          </div>
        </div>
      </DocSection>

      {/* §05 Reproducibility */}
      <DocSection num="05" title={t("docs.s05Title")}>
        <p>{t("docs.s05Intro")}</p>
        <ul className="mt-4 space-y-2 text-[13px]">
          <li>{t("docs.s05Item1")}</li>
          <li>{t("docs.s05Item2")}</li>
          <li>{t("docs.s05Item3")}</li>
          <li>
            {t("docs.s05Item4Pre")}
            <code className="num text-bone bg-ink-700 px-1.5 py-0.5">tiktoken</code>
            {t("docs.s05Item4Mid")}
            <code className="num text-bone bg-ink-700 px-1.5 py-0.5">o200k_base</code>
            {t("docs.s05Item4Post")}
          </li>
          <li>{t("docs.s05Item5")}</li>
        </ul>
        <Methods
          items={[
            { k: "LLMRouterBench", arxiv: "2601.07206", why: t("docs.s05Method1Why") },
            { k: "RouterBench", arxiv: "2403.12031", why: t("docs.s05Method2Why") },
          ]}
        />
      </DocSection>

      {/* §06 Conflicts */}
      <DocSection num="06" title={t("docs.s06Title")}>
        <ul className="space-y-2 text-[13px]">
          <li>{t("docs.s06Item1")}</li>
          <li>{t("docs.s06Item2")}</li>
          <li>{t("docs.s06Item3")}</li>
          <li>{t("docs.s06Item4")}</li>
        </ul>
      </DocSection>

      {/* §07 Known limitations */}
      <DocSection num="07" title={t("docs.s07Title")}>
        <p>{t("docs.s07Intro")}</p>
        <ol className="mt-4 space-y-3 text-[13px] list-decimal pl-5 marker:text-smoke">
          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
            <li key={n}>
              <strong className="text-bone">{t(`docs.s07Item${n}Bold`)}</strong>
              {t(`docs.s07Item${n}Body`)}
            </li>
          ))}
        </ol>
      </DocSection>

      {/* CTA */}
      <section className="mt-16 pt-10 border-t border-ink-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-ash text-[14px] leading-relaxed max-w-md">
          {t("docs.ctaBody")}
        </p>
        <Link
          href="/"
          className="btn-brand px-6 py-3 text-sm font-medium tracking-tight inline-flex items-center gap-2 shrink-0"
        >
          {t("docs.ctaButton")} <I.arrow className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}

function DocSection({
  num,
  title,
  children,
}: {
  num: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-16 pt-10 border-t border-ink-600">
      <div className="grid md:grid-cols-[100px_1fr] gap-4 md:gap-8">
        <div className="serif-it text-4xl sm:text-5xl text-smoke">{num}</div>
        <div>
          <h2 className="serif text-3xl sm:text-4xl tracking-editorial">{title}</h2>
          <div className="mt-4 text-ash text-[15px] leading-relaxed space-y-3">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

function DimSection({
  num,
  title,
  weight,
  question,
  children,
}: {
  num: string;
  title: string;
  weight: string;
  question: string;
  children: ReactNode;
}) {
  const { t } = useLang();
  return (
    <section className="mt-16 pt-10 border-t border-ink-600">
      <div className="flex items-baseline justify-between flex-wrap gap-3">
        <div className="micro text-smoke">
          {num} · {title}
        </div>
        <span className="num text-[12px] text-brand">
          {t("docs.labelWeight")} {weight}
        </span>
      </div>
      <h2 className="serif text-3xl sm:text-4xl tracking-editorial mt-2">{title}</h2>
      <p className="serif-it text-bone text-xl mt-2">{question}</p>
      <div className="mt-6 text-ash text-[15px] leading-relaxed space-y-4">
        {children}
      </div>
    </section>
  );
}

function SubDim({
  id,
  name,
  weight,
  children,
}: {
  id: string;
  name: string;
  weight: string;
  children: ReactNode;
}) {
  const { t } = useLang();
  return (
    <div className="mt-6 pt-6 border-t border-ink-600">
      <div className="flex items-baseline justify-between flex-wrap gap-2 mb-3">
        <h3 className="serif text-2xl tracking-editorial">
          <span className="text-smoke">§{id}</span> {name}
        </h3>
        <span className="num text-[11px] text-smoke">
          {t("docs.labelWeightWithin", { w: weight })}
        </span>
      </div>
      <div className="text-ash text-[14px] leading-relaxed space-y-2">
        {children}
      </div>
    </div>
  );
}

function Methods({
  items,
}: {
  items: { k: string; arxiv: string | null; why: string }[];
}) {
  return (
    <div className="mt-4 card-2">
      {items.map((it, i) => (
        <div
          key={i}
          className={
            "px-4 py-3 flex items-start gap-3 flex-wrap " +
            (i > 0 ? "border-t border-ink-600" : "")
          }
        >
          <div className="flex-1 min-w-0">
            <div className="text-[13px] text-bone">{it.k}</div>
            <p className="text-[12px] text-ash mt-1 leading-relaxed">{it.why}</p>
          </div>
          {it.arxiv && (
            <a
              href={`https://arxiv.org/abs/${it.arxiv}`}
              target="_blank"
              rel="noopener noreferrer"
              className="micro text-smoke hover:text-brand whitespace-nowrap inline-flex items-center gap-1 transition-colors shrink-0"
            >
              arXiv:{it.arxiv} <I.external className="w-2.5 h-2.5" />
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
