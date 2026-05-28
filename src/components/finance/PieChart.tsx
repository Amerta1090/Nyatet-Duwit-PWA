import { useMemo } from 'react';
import { formatCurrency } from '@/utils/format';

interface PieSlice {
  label: string;
  value: number;
  color: string;
  icon?: React.ReactNode;
}

interface PieChartProps {
  items: PieSlice[];
  size?: number;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
}

export function PieChart({ items, size = 180 }: PieChartProps) {
  const total = useMemo(() => items.reduce((s, i) => s + i.value, 0), [items]);

  const { segments, legend } = useMemo(() => {
    const main: PieSlice[] = [];
    const other: PieSlice[] = [];

    for (const item of items) {
      if (item.value / total < 0.05 && items.length > 6) {
        other.push(item);
      } else {
        main.push(item);
      }
    }

    const otherTotal = other.reduce((s, o) => s + o.value, 0);
    const final: PieSlice[] = otherTotal > 0
      ? [...main, { label: 'Lainnya', value: otherTotal, color: '#94a3b8' }]
      : main;

    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 4;

    let currentAngle = 0;
    const arcs = final.map((item) => {
      const sliceAngle = (item.value / total) * 360;
      const path = describeArc(cx, cy, r, currentAngle, currentAngle + sliceAngle);
      const midAngle = currentAngle + sliceAngle / 2;
      const labelPos = polarToCartesian(cx, cy, r * 0.65, midAngle);
      const percent = ((item.value / total) * 100);
      currentAngle += sliceAngle;
      return { path, item, percent, labelPos, midAngle };
    });

    const leg = final.map((item) => ({
      label: item.label,
      value: item.value,
      color: item.color,
      percent: (item.value / total) * 100,
    }));

    return { segments: arcs, legend: leg };
  }, [items, total, size]);

  if (total === 0) return null;

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
        {segments.map((seg, i) => (
          <g key={i}>
            <path d={seg.path} fill={seg.item.color} stroke="white" strokeWidth={1.5} />
            {seg.percent >= 8 && (
              <text
                x={seg.labelPos.x}
                y={seg.labelPos.y}
                textAnchor="middle"
                dominantBaseline="central"
                className="text-[10px] font-bold"
                fill="white"
                style={{ fontSize: `${Math.max(8, size * 0.055)}px`, pointerEvents: 'none' }}
              >
                {seg.percent.toFixed(0)}%
              </text>
            )}
          </g>
        ))}
      </svg>

      <div className="flex w-full flex-col gap-1.5">
        {legend.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="flex-1 truncate text-xs text-neutral-700 dark:text-neutral-100">
              {item.label}
            </span>
            <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-50">
              {formatCurrency(item.value)}
            </span>
            <span className="w-10 text-right text-[10px] text-neutral-400">
              {item.percent.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
