"use client";

import { useState } from "react";
import { PROVIDERS } from "@/lib/data";

const PROVIDER_SVG: Record<string, React.ReactNode> = {
  bai: (
    <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="6" fill="#0EA5E9" />
      <text
        x="20"
        y="28"
        textAnchor="middle"
        fontFamily="Instrument Serif, serif"
        fontStyle="italic"
        fontSize="22"
        fill="#ffffff"
      >
        B.
      </text>
    </svg>
  ),
  litellm: (
    <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="6" fill="#0a0a0b" />
      <path d="M10 14 L20 9 L30 14 L20 19 Z" fill="#84cc16" opacity="0.9" />
      <path d="M10 22 L20 17 L30 22 L20 27 Z" fill="#84cc16" opacity="0.55" />
      <path d="M10 30 L20 25 L30 30 L20 35 Z" fill="#84cc16" opacity="0.3" />
    </svg>
  ),
};

function ProviderFallback({ text, size }: { text: string; size: number }) {
  return (
    <div
      className="flex items-center justify-center serif shrink-0 bg-ink-700 text-bone"
      style={{ width: size, height: size, fontSize: size * 0.5 }}
    >
      {text}
    </div>
  );
}

export function ProviderMark({ slug, size = 36 }: { slug: string; size?: number }) {
  const p = PROVIDERS.find((x) => x.slug === slug);
  const [failed, setFailed] = useState(false);

  if (!p) return <ProviderFallback text="?" size={size} />;

  if (p.domain && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`https://logo.clearbit.com/${p.domain}`}
        alt={p.name}
        width={size}
        height={size}
        loading="lazy"
        onError={() => setFailed(true)}
        className="shrink-0 rounded-sm bg-white object-contain"
        style={{
          width: size,
          height: size,
          padding: Math.max(2, size * 0.06),
        }}
      />
    );
  }

  if (PROVIDER_SVG[slug]) {
    return (
      <span
        className="shrink-0 inline-flex items-center justify-center"
        style={{ width: size, height: size }}
        aria-label={p.name}
      >
        {PROVIDER_SVG[slug]}
      </span>
    );
  }

  return <ProviderFallback text={p.name[0]} size={size} />;
}
