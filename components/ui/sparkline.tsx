interface Props {
  data: number[];
  color?: string;
  w?: number;
  h?: number;
}

export function Sparkline({ data, color = "currentColor", w = 80, h = 22 }: Props) {
  if (!data?.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className="block">
      <polyline points={pts} className="spark" stroke={color} />
    </svg>
  );
}
