import { useMemo } from 'react';
import { formatCurrency } from '@/utils/format';

interface BarItem {
  label: string;
  value: number;
  color: string;
  icon?: React.ReactNode;
}

interface BarChartProps {
  items: BarItem[];
  maxItems?: number;
}

export function BarChart({ items, maxItems = 10 }: BarChartProps) {
  const sorted = useMemo(
    () => [...items].sort((a, b) => b.value - a.value).slice(0, maxItems),
    [items, maxItems],
  );

  const maxValue = useMemo(
    () => Math.max(...sorted.map((i) => i.value), 1),
    [sorted],
  );

  if (sorted.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {sorted.map((item) => {
        const percent = (item.value / maxValue) * 100;
        return (
          <div key={item.label} className="flex items-center gap-3">
            <div className="flex w-28 shrink-0 items-center gap-2">
              {item.icon && <span className="h-4 w-4 shrink-0">{item.icon}</span>}
              <span className="truncate text-xs font-medium text-neutral-700 dark:text-neutral-100">
                {item.label}
              </span>
            </div>
            <div className="flex flex-1 items-center gap-2">
              <div className="h-5 flex-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-700">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${percent}%`, backgroundColor: item.color }}
                />
              </div>
              <span className="w-24 text-right text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                {formatCurrency(item.value)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
