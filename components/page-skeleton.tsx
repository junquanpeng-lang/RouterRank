"use client";

import Link from "next/link";

interface Props {
  tag: string;
  title: string;
  body?: string;
}

// Temporary scaffold component used by route pages whose UI is still being
// ported from the original index.html. Engineers should replace each call
// site with the real page implementation.
export function PageSkeleton({ tag, title, body }: Props) {
  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="micro text-smoke">{tag}</div>
      <h1 className="serif text-5xl sm:text-6xl tracking-editorial leading-none mt-2">
        {title}
      </h1>
      {body && <p className="mt-6 text-ash text-lg max-w-2xl leading-relaxed">{body}</p>}
      <div className="mt-12 card p-8 max-w-xl">
        <div className="micro text-smoke mb-3">Migration in progress</div>
        <p className="text-[14px] text-ash leading-relaxed">
          This page is a skeleton stub. The full UI lives in{" "}
          <code className="num text-bone bg-ink-700 px-1.5 py-0.5">index.html</code>{" "}
          (kept locally as a reference) and is being modularized into Next.js components.
          See <code className="num text-bone bg-ink-700 px-1.5 py-0.5">MIGRATION.md</code>.
        </p>
        <Link
          href="/"
          className="btn-ghost inline-flex items-center gap-2 px-4 py-2 text-[12px] mt-6"
        >
          ← Ranking
        </Link>
      </div>
    </div>
  );
}
