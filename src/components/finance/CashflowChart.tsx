import { useMemo, useRef, useState, useEffect } from 'react';
import { formatCurrency } from '@/utils/format';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface MonthlyData {
  month: number;
  year: number;
  income: number;
  expense: number;
}

interface CashflowChartProps {
  data: MonthlyData[];
}

const PADDING = { top: 20, right: 16, bottom: 40, left: 56 };
const CASHFLOW_HEIGHT = 260;
const MIN_BAR = 16;

export function CashflowChart({ data }: CashflowChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dim, setDim] = useState({ w: 400, h: 0 });
  const [animPhase, setAnimPhase] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDim({ w: entry.contentRect.width, h: CASHFLOW_HEIGHT });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (data.length === 0) return;
    rafRef.current = requestAnimationFrame(() => {
      setAnimPhase(1);
    });
    return () => cancelAnimationFrame(rafRef.current);
  }, [data]);

  const { maxVal, barWidth, minWidth } = useMemo(() => {
    const allVals = data.flatMap((d) => [d.income, d.expense]);
    const mx = Math.max(...allVals, 1);
    const totalBars = data.length * 2;
    const availW = Math.max(dim.w - PADDING.left - PADDING.right, 1);
    const gap = 4;
    const bw = Math.max(Math.min((availW - gap * (totalBars - 1)) / totalBars, 24), MIN_BAR);
    const mw = totalBars * (bw + gap) + gap;
    return { maxVal: mx, barWidth: bw, minWidth: mw };
  }, [data, dim.w]);

  const plotW = Math.max(dim.w - PADDING.left - PADDING.right, minWidth);
  const plotH = dim.h - PADDING.top - PADDING.bottom;

  const yTicks = useMemo(() => {
    const ticks: number[] = [];
    const step = maxVal / 4;
    for (let i = 0; i <= 4; i++) {
      ticks.push(Math.round(step * i));
    }
    return ticks;
  }, [maxVal]);

  const totalIncome = useMemo(() => data.reduce((s, d) => s + d.income, 0), [data]);
  const totalExpense = useMemo(() => data.reduce((s, d) => s + d.expense, 0), [data]);
  const avgIncome = data.length > 0 ? totalIncome / data.length : 0;
  const avgExpense = data.length > 0 ? totalExpense / data.length : 0;
  const avgNet = avgIncome - avgExpense;
  const gap = 4;

  if (data.length === 0) {
    return (
      <div style={{ height: CASHFLOW_HEIGHT }} className="flex items-center justify-center text-sm text-neutral-400">
        Belum ada data bulanan
      </div>
    );
  }

  const chartAnimStyle = animPhase === 0
    ? { opacity: 0, transform: 'translateY(8px)' }
    : { opacity: 1, transform: 'translateY(0)' };

  const needsScroll = minWidth > dim.w - PADDING.left - PADDING.right;

  return (
    <div>
      <div ref={containerRef} className="relative select-none overflow-x-auto" style={{ maxWidth: '100%' }}>
        <svg
          width={Math.max(dim.w, minWidth + PADDING.left + PADDING.right)}
          height={dim.h}
          className="overflow-visible transition-all duration-500"
          style={chartAnimStyle as React.CSSProperties}
        >
          {yTicks.map((tick) => {
            const y = PADDING.top + plotH - (tick / maxVal) * plotH;
            return (
              <g key={tick}>
                <line x1={PADDING.left} y1={y} x2={PADDING.left + plotW} y2={y} stroke="#e5e7eb" strokeWidth={0.5} />
                <text x={PADDING.left - 8} y={y + 4} textAnchor="end" className="text-[10px] fill-neutral-400">
                  {formatCurrency(tick)}
                </text>
              </g>
            );
          })}

          {data.map((d, i) => {
            const groupX = PADDING.left + i * (barWidth * 2 + gap * 2 + 4);
            const incomeH = (d.income / maxVal) * plotH;
            const expenseH = (d.expense / maxVal) * plotH;
            const incomeY = PADDING.top + plotH - incomeH;
            const expenseY = PADDING.top + plotH - expenseH;

            return (
              <g key={`${d.year}-${d.month}`}>
                <rect
                  x={groupX}
                  y={incomeY}
                  width={barWidth}
                  height={Math.max(incomeH, 1)}
                  rx={3}
                  fill="#10B981"
                  opacity={0.85}
                >
                  <title>{formatCurrency(d.income)}</title>
                </rect>
                <rect
                  x={groupX + barWidth + gap}
                  y={expenseY}
                  width={barWidth}
                  height={Math.max(expenseH, 1)}
                  rx={3}
                  fill="#EF4444"
                  opacity={0.85}
                >
                  <title>{formatCurrency(d.expense)}</title>
                </rect>

                {incomeH > 14 && (
                  <text
                    x={groupX + barWidth / 2}
                    y={incomeY - 4}
                    textAnchor="middle"
                    className="text-[9px] fill-accent-500 font-medium"
                  >
                    {formatCurrency(d.income)}
                  </text>
                )}
                {expenseH > 14 && (
                  <text
                    x={groupX + barWidth * 1.5 + gap}
                    y={expenseY - 4}
                    textAnchor="middle"
                    className="text-[9px] fill-danger-500 font-medium"
                  >
                    {formatCurrency(d.expense)}
                  </text>
                )}

                <text
                  x={groupX + barWidth + gap / 2}
                  y={PADDING.top + plotH + 16}
                  textAnchor="middle"
                  className="text-[9px] fill-neutral-400"
                  transform={`rotate(-45, ${groupX + barWidth + gap / 2}, ${PADDING.top + plotH + 16})`}
                >
                  {format(new Date(d.year, d.month), 'MMM', { locale: id })}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {needsScroll && (
        <p className="mt-1 text-center text-[10px] text-neutral-400">
          Geser untuk lihat bulan lainnya
        </p>
      )}

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-accent-50 p-3 text-center dark:bg-accent-500/10">
          <p className="text-[10px] font-medium text-accent-600 dark:text-accent-400">Rata-rata Pemasukan</p>
          <p className="text-sm font-bold text-accent-600">{formatCurrency(Math.round(avgIncome))}</p>
        </div>
        <div className="rounded-lg bg-danger-50 p-3 text-center dark:bg-danger-500/10">
          <p className="text-[10px] font-medium text-danger-600 dark:text-danger-400">Rata-rata Pengeluaran</p>
          <p className="text-sm font-bold text-danger-600">{formatCurrency(Math.round(avgExpense))}</p>
        </div>
        <div className="rounded-lg bg-neutral-50 p-3 text-center dark:bg-neutral-800">
          <p className="text-[10px] font-medium text-neutral-500">Rata-rata Bersih</p>
          <p className={`text-sm font-bold ${avgNet >= 0 ? 'text-accent-500' : 'text-danger-500'}`}>
            {avgNet >= 0 ? '+' : ''}{formatCurrency(Math.round(avgNet))}
          </p>
        </div>
      </div>
    </div>
  );
}
