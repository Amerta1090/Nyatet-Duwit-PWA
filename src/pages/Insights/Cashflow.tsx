import { useEffect, useState } from 'react';
import { transactionRepo } from '@/db/repositories/transactionRepository';
import { CashflowChart } from '@/components/finance/CashflowChart';
import { Skeleton } from '@/components/ui';

const PERIODS = [6, 12, 24] as const;

export default function CashflowPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<number>(12);
  const [data, setData] = useState<{ month: number; year: number; income: number; expense: number }[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await transactionRepo.getMonthlyTotals(period);
        if (!cancelled) setData(result);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Gagal memuat data arus kas');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [period]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 py-4">
        <Skeleton height="40px" />
        <Skeleton height="280px" />
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
          Arus Kas Bulanan
        </h2>
        <div className="flex gap-1">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                period === p
                  ? 'bg-primary-500 text-white'
                  : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300'
              }`}
            >
              {p} bln
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-800">
        <CashflowChart data={data} />
      </div>
    </div>
  );
}
