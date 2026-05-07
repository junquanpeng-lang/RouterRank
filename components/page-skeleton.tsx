"use client";

import Link from "next/link";
import type { ReactNode } from "react";

interface Props {
  tag: string;
  titlePre?: string;
  titleIt?: string;
  titlePost?: string;
  title?: ReactNode;
  body?: ReactNode;
  children?: ReactNode;
}

// Shared page hero used by Run / Validate / Wallet / Docs and the Provider
// detail page. Renders the top section (tag · headline · subhead) consistently.
export function PageHero({ tag, titlePre, titleIt, titlePost, title, body, children }: Props) {
  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
      <div className="border-b border-ink-600 pb-8 mb-10">
        <div className="micro text-smoke">{tag}</div>
        <h1 className="serif text-4xl sm:text-5xl lg:text-6xl tracking-editorial mt-2">
          {title ? (
            title
          ) : (
            <>
              {titlePre} <span className="serif-it text-brand">{titleIt}</span>
              {titlePost}
            </>
          )}
        </h1>
        {body && (
          <p className="text-ash mt-3 max-w-2xl text-[15px] leading-relaxed">{body}</p>
        )}
      </div>
      {children}
    </div>
  );
}

export function ComingSoonCard({ note }: { note?: string }) {
  return (
    <div className="card p-8 max-w-xl">
      <div className="micro text-smoke mb-3">Coming soon</div>
      <p className="text-[14px] text-ash leading-relaxed">
        {note ||
          "This page is being built. The interactive controls will land in an upcoming release."}
      </p>
      <Link
        href="/"
        className="btn-ghost inline-flex items-center gap-2 px-4 py-2 text-[12px] mt-6"
      >
        ← Back to ranking
      </Link>
    </div>
  );
}
