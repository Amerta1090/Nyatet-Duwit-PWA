/* eslint-disable react-refresh/only-export-components */
import { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { formatCurrency } from '@/utils/format';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface DataPoint {
  date: number;
  total: number;
}

interface SpendingTrendChartProps {
  data: DataPoint[];
  compareData?: DataPoint[];
  dailyTopCategory?: Map<number, string>;
  days?: number;
}

export function movingAverage(data: DataPoint[], window: number): { date: number; value: number }[] {
  if (data.length < window) return [];
  const result: { date: number; value: number }[] = [];
  for (let i = window - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < window; j++) {
      const pt = data[i - j];
      if (pt) sum += pt.total;
    }
    const pt = data[i];
    if (pt) result.push({ date: pt.date, value: sum / window });
  }
  return result;
}

function fillDailyGaps(sorted: DataPoint[]): DataPoint[] {
  if (sorted.length < 2) return sorted;
  const filled: DataPoint[] = [];
  const DAY_MS = 86400000;
  for (let i = 0; i < sorted.length - 1; i++) {
    const cur = sorted[i];
    const next = sorted[i + 1];
    if (!cur || !next) continue;
    filled.push(cur);
    let cursor = cur.date + DAY_MS;
    while (cursor < next.date) {
      filled.push({ date: cursor, total: 0 });
      cursor += DAY_MS;
    }
  }
  const last = sorted[sorted.length - 1];
  if (last) filled.push(last);
  return filled;
}

const ZOOM_LEVELS = [1, 3, 12] as const;
const PADDING = { top: 20, right: 16, bottom: 32, left: 56 };

export function SpendingTrendChart({ data, compareData, dailyTopCategory, days = 90 }: SpendingTrendChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; point: DataPoint } | null>(null);
  const [zoomLevel, setZoomLevel] = useState(0);
  const [offset, setOffset] = useState(0);
  const [dim, setDim] = useState({ w: 400, h: 0 });
  const [animPhase, setAnimPhase] = useState(0);
  const rafRef = useRef<number>(0);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartOffset = useRef(0);
  const height = 220;

  useEffect(() => {
    const el = svgRef.current?.parentElement;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDim({ w: entry.contentRect.width, h: height });
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

  const zoom = ZOOM_LEVELS[zoomLevel] ?? 1;

  const { points, maxVal, minVal, maLine } = useMemo(() => {
    if (data.length === 0) return { points: [], maxVal: 0, minVal: 0, maLine: [] };

    const sorted = [...data].sort((a, b) => a.date - b.date);
    const filled = fillDailyGaps(sorted);
    const vals = filled.map((d) => d.total);
    const mx = Math.max(...vals, 1);
    const mn = 0;
    const ma = movingAverage(filled, 7);

    return { points: filled, maxVal: mx, minVal: mn, maLine: ma };
  }, [data]);

  const { comparePoints } = useMemo(() => {
    if (!compareData || compareData.length === 0) return { comparePoints: [] };
    const sorted = [...compareData].sort((a, b) => a.date - b.date);
    return { comparePoints: fillDailyGaps(sorted) };
  }, [compareData]);

  const visiblePoints = useMemo(() => {
    if (zoom === 1) return points;
    const total = points.length;
    const visibleCount = Math.floor(total / zoom);
    const endIdx = Math.min(Math.floor(total * (1 - offset)), total);
    const startIdx = Math.max(0, endIdx - visibleCount);
    return points.slice(startIdx, endIdx);
  }, [points, zoom, offset]);

  const visibleMA = useMemo(() => {
    if (zoom === 1) return maLine;
    const total = maLine.length;
    const visibleCount = Math.floor(total / zoom);
    const endIdx = Math.min(Math.floor(total * (1 - offset)), total);
    const startIdx = Math.max(0, endIdx - visibleCount);
    return maLine.slice(startIdx, endIdx);
  }, [maLine, zoom, offset]);

  const plotW = dim.w - PADDING.left - PADDING.right;
  const plotH = dim.h - PADDING.top - PADDING.bottom;
  const valRange = maxVal - minVal || 1;

  const xScale = useCallback(
    (i: number, len: number) => PADDING.left + (i / Math.max(len - 1, 1)) * plotW,
    [plotW],
  );

  const yScale = useCallback((v: number) => PADDING.top + plotH - ((v - minVal) / valRange) * plotH, [plotH, minVal, valRange]);

  const linePath = useMemo(() => {
    if (visiblePoints.length < 2) return '';
    return visiblePoints
      .map((p, i) => {
        const x = xScale(i, visiblePoints.length);
        const y = yScale(p.total);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  }, [visiblePoints, xScale, yScale]);

  const comparePath = useMemo(() => {
    if (comparePoints.length < 2) return '';
    return comparePoints
      .map((p, i) => {
        const x = xScale(i, comparePoints.length);
        const y = yScale(p.total);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  }, [comparePoints, xScale, yScale]);

  const maPath = useMemo(() => {
    if (visibleMA.length < 2) return '';
    return visibleMA
      .map((p, i) => {
        const x = xScale(i, visibleMA.length);
        const y = yScale(p.value);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  }, [visibleMA, xScale, yScale]);

  const yTicks = useMemo(() => {
    const ticks: number[] = [];
    const step = valRange / 4;
    for (let i = 0; i <= 4; i++) {
      ticks.push(minVal + step * i);
    }
    return ticks;
  }, [minVal, valRange]);

  const xTicks = useMemo(() => {
    if (visiblePoints.length === 0) return [];
    const count = zoom <= 3 ? 6 : 4;
    const step = Math.max(1, Math.floor(visiblePoints.length / count));
    const ticks: { date: number; x: number }[] = [];
    for (let i = 0; i < visiblePoints.length; i += step) {
      const pt = visiblePoints[i];
      if (pt) ticks.push({ date: pt.date, x: xScale(i, visiblePoints.length) });
    }
    const last = visiblePoints[visiblePoints.length - 1];
    if (last) {
      const lastDate = last.date;
      const existing = ticks[ticks.length - 1];
      if (!existing || existing.date !== lastDate) {
        ticks.push({ date: lastDate, x: xScale(visiblePoints.length - 1, visiblePoints.length) });
      }
    }
    return ticks;
  }, [visiblePoints, xScale, zoom]);

  const handleTap = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      const clientX = 'touches' in e ? e.touches[0]!.clientX : e.clientX;
      const x = clientX - rect.left;
      let closest = 0;
      let minDist = Infinity;
      for (let i = 0; i < visiblePoints.length; i++) {
        const px = xScale(i, visiblePoints.length);
        const dist = Math.abs(px - x);
        if (dist < minDist) {
          minDist = dist;
          closest = i;
        }
      }
      const point = visiblePoints[closest];
      if (point && minDist < 40) {
        setTooltip({ x: xScale(closest, visiblePoints.length), y: yScale(point.total), point });
      } else {
        setTooltip(null);
      }
    },
    [visiblePoints, xScale, yScale],
  );

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoomLevel((z) => Math.max(0, Math.min(ZOOM_LEVELS.length - 1, z + (e.deltaY > 0 ? -1 : 1))));
    setOffset(0);
  }, []);

  const totalPoints = points.length;
  const maxOffset = 1 - 1 / zoom;

  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (zoom === 1) return;
    const clientX = 'touches' in e ? e.touches[0]!.clientX : e.clientX;
    isDragging.current = true;
    dragStartX.current = clientX;
    dragStartOffset.current = offset;
  }, [zoom, offset]);

  const handleDragMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging.current || zoom === 1) return;
    const clientX = 'touches' in e ? e.touches[0]!.clientX : e.clientX;
    const dx = clientX - dragStartX.current;
    const plotW = dim.w - PADDING.left - PADDING.right;
    const offsetDelta = -(dx / plotW) * maxOffset;
    setOffset(Math.max(0, Math.min(maxOffset, dragStartOffset.current + offsetDelta)));
  }, [zoom, dim.w, maxOffset]);

  const handleDragEnd = useCallback(() => {
    isDragging.current = false;
  }, []);

  const zoomLabel = zoom === 1 ? `${days}h` : zoom === 3 ? `${Math.round(days / 3)}h` : `${Math.round(days / 12)}h`;

  if (data.length === 0) {
    return (
      <div style={{ height }} className="flex items-center justify-center text-sm text-neutral-400">
        Belum cukup data untuk grafik trend
      </div>
    );
  }

  const svgAnimStyle = animPhase === 0
    ? { opacity: 0, transform: 'translateY(8px)' }
    : { opacity: 1, transform: 'translateY(0)' };

  return (
    <div className="relative select-none">
      <svg
        ref={svgRef}
        width={dim.w}
        height={dim.h}
        style={svgAnimStyle as React.CSSProperties}
        onMouseMove={(e) => { if (!isDragging.current) handleTap(e); handleDragMove(e); }}
        onTouchMove={(e) => { handleTap(e); handleDragMove(e); }}
        onTouchStart={handleDragStart}
        onMouseDown={handleDragStart}
        onMouseUp={handleDragEnd}
        onTouchEnd={handleDragEnd}
        onMouseLeave={() => { setTooltip(null); handleDragEnd(); }}
        onWheel={handleWheel}
        style={{ cursor: zoom > 1 ? 'grab' : 'default' }}
        className="overflow-visible transition-all duration-500 select-none"
        draggable={false}
      >
        <defs>
          <linearGradient id="trendGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="compareGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.12} />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
          </linearGradient>
        </defs>

        {yTicks.map((tick) => {
          const y = yScale(tick);
          return (
            <g key={tick}>
              <line x1={PADDING.left} y1={y} x2={dim.w - PADDING.right} y2={y} stroke="#e5e7eb" strokeWidth={0.5} />
              <text x={PADDING.left - 8} y={y + 4} textAnchor="end" className="text-[10px] fill-neutral-400">
                {formatCurrency(tick)}
              </text>
            </g>
          );
        })}

        {xTicks.map((tick) => (
          <text
            key={tick.date}
            x={tick.x}
            y={dim.h - 4}
            textAnchor="middle"
            className="text-[10px] fill-neutral-400"
          >
            {format(tick.date, 'dd MMM', { locale: id })}
          </text>
        ))}

        {comparePath && (
          <>
            <path
              d={`${comparePath} L ${xScale(comparePoints.length - 1, comparePoints.length)} ${PADDING.top + plotH} L ${xScale(0, comparePoints.length)} ${PADDING.top + plotH} Z`}
              fill="url(#compareGradient)"
            />
            <path d={comparePath} fill="none" stroke="#8B5CF6" strokeWidth={2} strokeDasharray="6 3" />
          </>
        )}

        {visiblePoints.length > 1 && (
          <path
            d={linePath}
            fill="none"
            stroke="#3B82F6"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transition: 'd 0.15s ease' }}
          />
        )}

        {visiblePoints.length > 1 && (
          <path
            d={`${linePath} L ${xScale(visiblePoints.length - 1, visiblePoints.length)} ${PADDING.top + plotH} L ${xScale(0, visiblePoints.length)} ${PADDING.top + plotH} Z`}
            fill="url(#trendGradient)"
          />
        )}

        {maPath && (
          <path d={maPath} fill="none" stroke="#F59E0B" strokeWidth={1.5} strokeDasharray="4 2" opacity={0.8} />
        )}

        {tooltip && (
          <>
            <line
              x1={tooltip.x}
              y1={PADDING.top}
              x2={tooltip.x}
              y2={PADDING.top + plotH}
              stroke="#64748b"
              strokeWidth={1}
              strokeDasharray="3 2"
            />
            <circle cx={tooltip.x} cy={tooltip.y} r={4} fill="#3B82F6" stroke="white" strokeWidth={2} />
          </>
        )}
      </svg>

      {tooltip && (() => {
        const topCat = dailyTopCategory?.get(tooltip.point.date);
        return (
          <div
            className="absolute z-10 rounded-lg bg-neutral-900 px-3 py-2 shadow-lg dark:bg-white"
            style={{
              left: Math.min(tooltip.x, dim.w - 160),
              top: Math.max(tooltip.y - 80, 0),
              pointerEvents: 'none',
            }}
          >
            <p className="text-[10px] font-medium text-neutral-300 dark:text-neutral-700">
              {format(tooltip.point.date, 'EEEE, dd MMM yyyy', { locale: id })}
            </p>
            <p className="text-xs font-bold text-white dark:text-neutral-900">
              {formatCurrency(tooltip.point.total)}
            </p>
            {topCat && (
              <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
                Terbanyak: {topCat}
              </p>
            )}
          </div>
        );
      })()}

      <div className="mt-1 flex items-center gap-4 text-[10px] text-neutral-400">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-4 rounded bg-blue-500" />
          Pengeluaran harian
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 border-t-2 border-dashed border-amber-500" />
          Rata-rata 7 hari
        </div>
        {compareData && compareData.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 border-t-2 border-dashed border-violet-500" />
            Periode sebelumnya
          </div>
        )}
        <span className="ml-auto">Gulung: zoom {zoomLabel}</span>
      </div>
    </div>
  );
}
