import { useEffect, useState } from 'react';
import { transactionRepo } from '@/db/repositories/transactionRepository';
import { categoryRepo } from '@/db/repositories/categoryRepository';
import { SpendingTrendChart } from '@/components/finance/SpendingTrendChart';
import { Skeleton } from '@/components/ui';
import { subDays, startOfDay } from 'date-fns';

const TREND_DAYS = 90;

function getRange() {
  const now = Date.now();
  return {
    start: startOfDay(subDays(now, TREND_DAYS)).getTime(),
    end: startOfDay(now).getTime(),
  };
}

export default function TrendPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{ date: number; total: number }[]>([]);
  const [compareData, setCompareData] = useState<{ date: number; total: number }[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [dailyTopCategory, setDailyTopCategory] = useState<Map<number, string>>(new Map());

  useEffect(() => {
    const range = getRange();
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [current, allTxs, allCats] = await Promise.all([
          transactionRepo.getDailySpending(range.start, range.end),
          transactionRepo.getByDateRange(range.start, range.end),
          categoryRepo.getAll(),
        ]);
        if (cancelled) return;
        setData(current);

        const catNameMap = new Map(allCats.map((c) => [c.id, c.name]));
        const dayCatMap = new Map<number, Map<string, number>>();
        for (const tx of allTxs) {
          if (tx.type !== 'expense') continue;
          if (!dayCatMap.has(tx.date)) dayCatMap.set(tx.date, new Map());
          const catTotals = dayCatMap.get(tx.date)!;
          const name = catNameMap.get(tx.categoryId) ?? 'Tanpa Kategori';
          catTotals.set(name, (catTotals.get(name) ?? 0) + tx.amount);
        }

        const topCatPerDay = new Map<number, string>();
        for (const [date, catTotals] of dayCatMap) {
          let topName = '';
          let topAmount = 0;
          for (const [name, amount] of catTotals) {
            if (amount > topAmount) { topName = name; topAmount = amount; }
          }
          topCatPerDay.set(date, topName);
        }
        if (!cancelled) setDailyTopCategory(topCatPerDay);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Gagal memuat data');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const range = getRange();
    let cancelled = false;
    async function load() {
      if (!showCompare) {
        setCompareData([]);
        return;
      }
      try {
        const prevEnd = range.start - 1;
        const prevStart = startOfDay(subDays(prevEnd, TREND_DAYS)).getTime();
        const prev = await transactionRepo.getDailySpending(prevStart, prevEnd);
        if (!cancelled) setCompareData(prev);
      } catch {
        if (!cancelled) setCompareData([]);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [showCompare]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 py-4">
        <Skeleton height="40px" />
        <Skeleton height="240px" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <p className="text-sm text-danger-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-primary-500 px-4 py-2 text-sm text-white"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-100">
          Trend Pengeluaran {TREND_DAYS} Hari
        </h2>
        <button
          onClick={() => setShowCompare((v) => !v)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            showCompare
              ? 'bg-primary-500 text-white'
              : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300'
          }`}
        >
          {showCompare ? 'Sembunyikan' : 'Bandingkan'} periode
        </button>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-800">
        <SpendingTrendChart
          data={data}
          compareData={showCompare ? compareData : undefined}
          dailyTopCategory={dailyTopCategory}
          days={TREND_DAYS}
        />
      </div>

      {data.length === 0 && (
        <p className="mt-2 text-center text-xs text-neutral-400">
          Transaksi akan muncul di grafik setelah kamu mencatat pengeluaran harian.
        </p>
      )}
    </div>
  );
}
