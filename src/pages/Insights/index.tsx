import { useEffect, useState, useMemo, createElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { transactionRepo } from '@/db/repositories/transactionRepository';
import { categoryRepo } from '@/db/repositories/categoryRepository';
import { tagRepo } from '@/db/repositories/tagRepository';
import type { Transaction, Category, Tag } from '@/types';
import { formatCurrency } from '@/utils/format';
import { getMonthRange } from '@/utils/date';
import { BarChart } from '@/components/finance/BarChart';
import { PieChart } from '@/components/finance/PieChart';
import { EmptyState, Skeleton } from '@/components/ui';
import { getCategoryIcon } from '@/utils/icons';
import { TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon, Minus, ChevronRight, Hash } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function InsightsPage() {
  const navigate = useNavigate();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [prevIncome, setPrevIncome] = useState(0);
  const [prevExpense, setPrevExpense] = useState(0);
  const [trendData, setTrendData] = useState<{ categoryId: string; current: number; prev: number }[]>([]);
  const [chartMode, setChartMode] = useState<'bar' | 'pie'>('bar');
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagSpending, setTagSpending] = useState<{ tagId: string; total: number }[]>([]);
  const [prevTagSpending, setPrevTagSpending] = useState<{ tagId: string; total: number }[]>([]);

  const range = useMemo(() => {
    const d = new Date(year, month, 1);
    return getMonthRange(d.getTime());
  }, [year, month]);

  const prevRange = useMemo(() => {
    const d = new Date(year, month, 1);
    d.setMonth(d.getMonth() - 1);
    return getMonthRange(d.getTime());
  }, [year, month]);

  const prev2Range = useMemo(() => {
    const d = new Date(year, month, 1);
    d.setMonth(d.getMonth() - 2);
    return getMonthRange(d.getTime());
  }, [year, month]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [txs, cats, prevInc, prevExp, curByCat, prevByCat, prev2ByCat, tagList, curTagSpending, prevTagSp] = await Promise.all([
        transactionRepo.getByDateRange(range.start, range.end),
        categoryRepo.getAll(),
        transactionRepo.getTotalByType('income', prevRange.start, prevRange.end),
        transactionRepo.getTotalByType('expense', prevRange.start, prevRange.end),
        transactionRepo.getTotalByCategory(range.start, range.end),
        transactionRepo.getTotalByCategory(prevRange.start, prevRange.end),
        transactionRepo.getTotalByCategory(prev2Range.start, prev2Range.end),
        tagRepo.getAll(),
        tagRepo.getSpendingByTag(range.start, range.end),
        tagRepo.getSpendingByTag(prevRange.start, prevRange.end),
      ]);
      setTransactions(txs);
      setCategories(cats);
      setTags(tagList);
      setTagSpending(curTagSpending);
      setPrevTagSpending(prevTagSp);
      setPrevIncome(prevInc);
      setPrevExpense(prevExp);

      const allIds = new Set([
        ...curByCat.map((c) => c.categoryId),
        ...prevByCat.map((c) => c.categoryId),
        ...prev2ByCat.map((c) => c.categoryId),
      ]);
      setTrendData(
        Array.from(allIds).map((categoryId) => {
          const current = curByCat.find((c) => c.categoryId === categoryId)?.total ?? 0;
          const prev = (prevByCat.find((c) => c.categoryId === categoryId)?.total ?? 0) +
            (prev2ByCat.find((c) => c.categoryId === categoryId)?.total ?? 0);
          return { categoryId, current, prev: prev > 0 ? prev / 2 : 0 };
        }),
      );
      setLoading(false);
    }
    load();
  }, [range, prevRange, prev2Range]);

  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c])),
    [categories],
  );

  const monthlyIncome = useMemo(
    () => transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    [transactions],
  );

  const monthlyExpense = useMemo(
    () => transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    [transactions],
  );

  const netMonthly = monthlyIncome - monthlyExpense;
  const incomeChange = prevIncome > 0 ? ((monthlyIncome - prevIncome) / prevIncome) * 100 : 0;
  const expenseChange = prevExpense > 0 ? ((monthlyExpense - prevExpense) / prevExpense) * 100 : 0;

  const expenseByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const tx of transactions) {
      if (tx.type === 'expense') {
        map.set(tx.categoryId, (map.get(tx.categoryId) ?? 0) + tx.amount);
      }
    }
    return Array.from(map.entries())
      .map(([categoryId, total]) => ({ categoryId, total, category: categoryMap[categoryId] }))
      .sort((a, b) => b.total - a.total);
  }, [transactions, categoryMap]);

  const transactionCount = transactions.length;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const avgDaily = daysInMonth > 0 ? monthlyExpense / daysInMonth : 0;

  const highestDay = useMemo(() => {
    const dayMap = new Map<number, number>();
    for (const tx of transactions) {
      if (tx.type === 'expense') {
        dayMap.set(tx.date, (dayMap.get(tx.date) ?? 0) + tx.amount);
      }
    }
    let maxDay = 0;
    let maxAmount = 0;
    for (const [day, amount] of dayMap) {
      if (amount > maxAmount) { maxAmount = amount; maxDay = day; }
    }
    return { day: maxDay, amount: maxAmount };
  }, [transactions]);

  function goToPrevMonth() {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else { setMonth((m) => m - 1); }
  }

  function goToNextMonth() {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    if (nextYear > now.getFullYear() || (nextYear === now.getFullYear() && nextMonth > now.getMonth())) return;
    setYear(nextYear);
    setMonth(nextMonth);
  }

  const monthLabel = new Date(year, month).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  if (loading) {
    return (
      <div className="flex flex-col gap-4 py-4">
        <Skeleton height="40px" />
        <Skeleton height="100px" />
        <Skeleton height="120px" />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col gap-4 py-4">
        <div className="flex items-center justify-between">
          <button onClick={goToPrevMonth} className="rounded-lg px-3 py-1.5 text-sm text-primary-500 hover:bg-neutral-100 dark:hover:bg-neutral-700">◀</button>
          <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-100">{monthLabel}</h2>
          <button onClick={goToNextMonth} className="rounded-lg px-3 py-1.5 text-sm text-primary-500 hover:bg-neutral-100 dark:hover:bg-neutral-700">▶</button>
        </div>
        <EmptyState icon={<BarChart3 className="h-12 w-12" />} title="Butuh minimal 7 hari data" description={`Data terkumpul: 0 hari — catat transaksi setiap hari untuk melihat insight keuangan`} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-4">
      <div className="flex items-center justify-between">
        <button onClick={goToPrevMonth} className="rounded-lg px-3 py-1.5 text-sm text-primary-500 hover:bg-neutral-100 dark:hover:bg-neutral-700">◀</button>
        <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-100">
          {monthLabel}{isCurrentMonth && <span className="ml-1 text-primary-500">•</span>}
        </h2>
        <button onClick={goToNextMonth} className="rounded-lg px-3 py-1.5 text-sm text-primary-500 hover:bg-neutral-100 dark:hover:bg-neutral-700">▶</button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-accent-50 p-4 dark:bg-accent-500/10">
          <div className="flex items-center gap-1 text-sm text-accent-600">
            <TrendingUp className="h-4 w-4" /> Pemasukan
          </div>
          <p className="mt-1 text-lg font-bold text-accent-600">{formatCurrency(monthlyIncome)}</p>
          {prevIncome > 0 && (
            <p className={cn('text-xs', incomeChange >= 0 ? 'text-accent-500' : 'text-danger-500')}>
              {incomeChange >= 0 ? '+' : ''}{incomeChange.toFixed(1)}%
            </p>
          )}
        </div>
        <div className="rounded-xl bg-danger-50 p-4 dark:bg-danger-500/10">
          <div className="flex items-center gap-1 text-sm text-danger-600">
            <TrendingDown className="h-4 w-4" /> Pengeluaran
          </div>
          <p className="mt-1 text-lg font-bold text-danger-600">{formatCurrency(monthlyExpense)}</p>
          {prevExpense > 0 && (
            <p className={cn('text-xs', expenseChange <= 0 ? 'text-accent-500' : 'text-danger-500')}>
              {expenseChange >= 0 ? '+' : ''}{expenseChange.toFixed(1)}%
            </p>
          )}
        </div>
      </div>

      {(monthlyIncome > 0 || monthlyExpense > 0) && (
        <div className="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-800">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-100">Sisa Bulan Ini</p>
            <span className={cn('text-lg font-bold', netMonthly >= 0 ? 'text-accent-500' : 'text-danger-500')}>
              {netMonthly >= 0 ? '+' : ''}{formatCurrency(netMonthly)}
            </span>
          </div>
        </div>
      )}

      {expenseByCategory.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-100">Pengeluaran per Kategori</h3>
            <button
              onClick={() => setChartMode((m) => m === 'bar' ? 'pie' : 'bar')}
              className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-[11px] font-medium text-neutral-600 transition-all hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300"
            >
              {chartMode === 'bar' ? <PieChartIcon className="h-3.5 w-3.5" /> : <BarChart3 className="h-3.5 w-3.5" />}
              {chartMode === 'bar' ? 'Pie Chart' : 'Bar Chart'}
            </button>
          </div>
          {chartMode === 'bar' ? (
            <BarChart
              items={expenseByCategory.map((e) => ({
                label: e.category?.name ?? 'Tanpa Kategori',
                value: e.total,
                color: e.category?.color ?? '#64748B',
                icon: e.category ? createElement(getCategoryIcon(e.category.icon), { className: 'h-3.5 w-3.5', style: { color: e.category.color } }) : undefined,
              }))}
            />
          ) : (
            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-800">
              <PieChart
                items={expenseByCategory.map((e) => ({
                  label: e.category?.name ?? 'Tanpa Kategori',
                  value: e.total,
                  color: e.category?.color ?? '#64748B',
                }))}
              />
            </div>
          )}
        </div>
      )}

      {expenseByCategory.length > 0 && (
        <div className="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-800">
          <h3 className="mb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-100">Statistik</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-medium uppercase text-neutral-400">Total Transaksi</p>
              <p className="text-lg font-bold text-neutral-900 dark:text-neutral-50">{transactionCount}</p>
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase text-neutral-400">Rata-rata Harian</p>
              <p className="text-lg font-bold text-neutral-900 dark:text-neutral-50">{formatCurrency(Math.round(avgDaily))}</p>
            </div>
            {highestDay.amount > 0 && (
              <div className="col-span-2">
                <p className="text-[10px] font-medium uppercase text-neutral-400">Hari Paling Boros</p>
                <p className="text-lg font-bold text-danger-500">
                  {new Date(highestDay.day).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
                  {' — '}{formatCurrency(highestDay.amount)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {trendData.filter((t) => t.current > 0 || t.prev > 0).length > 0 && (
        <div className="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-800">
          <h3 className="mb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-100">Tren Kategori</h3>
          <div className="flex flex-col gap-2">
            {trendData
              .filter((t) => t.current > 0 || t.prev > 0)
              .sort((a, b) => b.current - a.current)
              .slice(0, 8)
              .map((t) => {
                const cat = categoryMap[t.categoryId];
                const change = t.prev > 0 ? ((t.current - t.prev) / t.prev) * 100 : 0;
                return (
                  <div key={t.categoryId} className="flex items-center gap-2">
                    {cat && createElement(getCategoryIcon(cat.icon), { className: 'h-4 w-4', style: { color: cat.color } })}
                    <span className="flex-1 text-xs text-neutral-700 dark:text-neutral-100">{cat?.name ?? 'Tanpa Kategori'}</span>
                    <span className="flex items-center gap-1">
                      {Math.abs(change) < 5 ? (
                        <Minus className="h-3 w-3 text-neutral-400" />
                      ) : change > 0 ? (
                        <TrendingUp className="h-3 w-3 text-danger-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-accent-500" />
                      )}
                      <span className={cn(
                        'text-xs font-medium',
                        Math.abs(change) < 5 ? 'text-neutral-400' : change > 0 ? 'text-danger-500' : 'text-accent-500',
                      )}>
                        {Math.abs(change) < 5 ? '—' : `${change > 0 ? '+' : ''}${change.toFixed(0)}%`}
                      </span>
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {tags.length > 0 && (
        <div className="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-800">
          <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-neutral-700 dark:text-neutral-100">
            <Hash className="h-4 w-4" />
            Pengeluaran per Tag
          </h3>
          {(() => {
            const tagMap = Object.fromEntries(tags.map((t) => [t.id, t]));
            const prevMap = new Map(prevTagSpending.map((t) => [t.tagId, t.total]));
            const sorted = [...tagSpending]
              .sort((a, b) => b.total - a.total)
              .slice(0, 10);
            if (sorted.length === 0) {
              return <p className="text-xs text-neutral-400">Belum ada pengeluaran dengan tag bulan ini</p>;
            }
            return (
              <div className="flex flex-col gap-2">
                {sorted.map(({ tagId, total }) => {
                  const tag = tagMap[tagId];
                  if (!tag) return null;
                  const prev = prevMap.get(tagId) ?? 0;
                  const change = prev > 0 ? ((total - prev) / prev) * 100 : 0;
                  return (
                    <div key={tagId} className="flex items-center gap-2">
                      <div
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${tag.color}20` }}
                      >
                        <Hash className="h-3 w-3" style={{ color: tag.color }} />
                      </div>
                      <span className="flex-1 text-xs text-neutral-700 dark:text-neutral-100">{tag.name}</span>
                      <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-50">{formatCurrency(total)}</span>
                      {prev > 0 && (
                        <span className={cn(
                          'text-[10px] font-medium',
                          Math.abs(change) < 5 ? 'text-neutral-400' : change > 0 ? 'text-danger-500' : 'text-accent-500',
                        )}>
                          {Math.abs(change) < 5 ? '' : `${change > 0 ? '+' : ''}${change.toFixed(0)}%`}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      <button
        onClick={() => navigate('/insights/review')}
        className="flex w-full items-center justify-between rounded-xl bg-primary-50 p-4 dark:bg-primary-500/10"
      >
        <span className="text-sm font-medium text-primary-600">Review Bulanan</span>
        <ChevronRight className="h-4 w-4 text-primary-500" />
      </button>
    </div>
  );
}
