import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { transactionRepo } from '@/db/repositories/transactionRepository';
import { categoryRepo } from '@/db/repositories/categoryRepository';
import { getWeekRange } from '@/utils/date';
import { formatCurrency } from '@/utils/format';
import { TrendingUp, TrendingDown, ChevronRight, Calendar } from 'lucide-react';
import { cn } from '@/utils/cn';

interface WeeklySummaryCardProps {
  onData?: (data: { totalExpense: number; totalIncome: number; topCategory?: string }) => void;
}

export function WeeklySummaryCard({ onData }: WeeklySummaryCardProps) {
  const navigate = useNavigate();
  const [totalExpense, setTotalExpense] = useState<number | null>(null);
  const [totalIncome, setTotalIncome] = useState<number | null>(null);
  const [prevExpense, setPrevExpense] = useState<number | null>(null);
  const [topCategory, setTopCategory] = useState('');

  useEffect(() => {
    async function load() {
      const now = Date.now();
      const { start, end } = getWeekRange(now);
      const lastWeekStart = start - 7 * 86400000;
      const lastWeekEnd = end - 7 * 86400000;

      const summary = await transactionRepo.getWeeklySummary(start, end);
      const prevSummary = await transactionRepo.getWeeklySummary(lastWeekStart, lastWeekEnd);
      const cats = await categoryRepo.getAll();

      setTotalExpense(summary.totalExpense);
      setTotalIncome(summary.totalIncome);
      setPrevExpense(prevSummary.totalExpense);

      if (summary.topCategories.length > 0) {
        const cat = cats.find((c) => c.id === summary.topCategories[0]!.categoryId);
        setTopCategory(cat?.name ?? '');
      }

      onData?.({
        totalExpense: summary.totalExpense,
        totalIncome: summary.totalIncome,
        topCategory: summary.topCategories.length > 0
          ? cats.find((c) => c.id === summary.topCategories[0]!.categoryId)?.name
          : undefined,
      });
    }
    load();
  }, [onData]);

  if (totalExpense === null || totalIncome === null) return null;
  if (totalExpense === 0 && totalIncome === 0) return null;

  const change = prevExpense !== null && prevExpense > 0
    ? ((totalExpense - prevExpense) / prevExpense) * 100
    : null;

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-800">
      <button
        onClick={() => navigate('/insights/review')}
        className="w-full text-left"
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary-500" />
            <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-100">Minggu Ini</h3>
          </div>
          <ChevronRight className="h-4 w-4 text-neutral-300" />
        </div>

        <div className="flex items-center gap-4">
          <div>
            <p className="text-[10px] font-medium uppercase text-neutral-400">Pengeluaran</p>
            <p className="text-base font-bold text-danger-500">{formatCurrency(totalExpense)}</p>
            {change !== null && (
              <div className="flex items-center gap-0.5">
                {change > 0 ? (
                  <TrendingUp className="h-3 w-3 text-danger-400" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-accent-400" />
                )}
                <span className={cn('text-[10px] font-medium', change > 0 ? 'text-danger-400' : 'text-accent-400')}>
                  {change > 0 ? '+' : ''}{change.toFixed(0)}%
                </span>
              </div>
            )}
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase text-neutral-400">Pemasukan</p>
            <p className="text-base font-bold text-accent-500">{formatCurrency(totalIncome)}</p>
          </div>
        </div>

        {topCategory && (
          <p className="mt-2 text-[11px] text-neutral-400">
            Kategori teratas: <span className="font-medium text-neutral-600 dark:text-neutral-300">{topCategory}</span>
          </p>
        )}
      </button>
    </div>
  );
}
