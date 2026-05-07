import { fmtUSD } from "@/lib/utils";

export function CostCell({ costIn, costOut }: { costIn: number; costOut: number }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="num tracking-tight text-bone">{fmtUSD(costIn)}</span>
      <span className="text-smoke text-[11px]">/</span>
      <span className="num text-[12px] text-bone">{fmtUSD(costOut)}</span>
    </div>
  );
}
