import { fmtUSD } from "@/lib/utils";
import type { Provider } from "@/lib/types";

interface ModelAwareProps {
  p: Provider;
  modelId: string;
}

interface LegacyProps {
  costIn: number;
  costOut: number;
}

type CostCellProps = ModelAwareProps | LegacyProps;

export function CostCell(props: CostCellProps) {
  let costIn: number;
  let costOut: number;

  if ("p" in props) {
    const mp = props.p.modelPricing?.[props.modelId];
    if (!mp) return <span className="text-smoke num text-[12px]">—</span>;
    costIn = mp.listedIn;
    costOut = mp.listedOut;
  } else {
    costIn = props.costIn;
    costOut = props.costOut;
  }

  return (
    <div className="flex items-baseline gap-1.5">
      <span className="num tracking-tight text-bone">{fmtUSD(costIn)}</span>
      <span className="text-smoke text-[11px]">/</span>
      <span className="num text-[12px] text-bone">{fmtUSD(costOut)}</span>
    </div>
  );
}
