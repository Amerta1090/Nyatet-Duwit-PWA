import { useEffect, useState, useMemo, createElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { transactionRepo } from '@/db/repositories/transactionRepository';
import { categoryRepo } from '@/db/repositories/categoryRepository';
import { tagRepo } from '@/db/repositories/tagRepository';
import { goalRepo } from '@/db/repositories/goalRepository';
import { debtRepo } from '@/db/repositories/debtRepository';
import { emergencyFundRepo } from '@/db/repositories/emergencyFundRepository';
import type { Category, Tag, Goal, Debt } from '@/types';
import { formatCurrency } from '@/utils/format';
import { getMonthLabel, getDayLabel } from '@/utils/date';
import { YouSavedHighlight } from '@/components/finance/YouSavedHighlight';
import { Skeleton, EmptyState } from '@/components/ui';
import { getCategoryIcon } from '@/utils/icons';
import {
  TrendingUp, TrendingDown, BarChart3, Minus,
  Flame, Share2, Check, ArrowLeft, Hash,
  Target, Wallet, Shield,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useUIStore } from '@/stores/uiStore';

export default function MonthlyReviewPage() {
  const navigate = useNavigate();
  const { showToast } = useUIStore();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Awaited<ReturnType<typeof transactionRepo.getMonthlyComparison>> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryComparison, setCategoryComparison] = useState<{ categoryId: string; current: number; prev: number }[]>([]);
  const [tagSpending, setTagSpending] = useState<{ tagId: string; total: number }[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [shared, setShared] = useState(false);
  const [goalProgress, setGoalProgress] = useState<{ totalTarget: number; totalCurrent: number; totalPercent: number; goalCount: number } | null>(null);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [efund, setEfund] = useState<{ current: number; target: number; percent: number } | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [comparison, cats] = await Promise.all([
        transactionRepo.getMonthlyComparison(year, month),
        categoryRepo.getAll(),
      ]);
      setData(comparison);
      setCategories(cats);

      const range = {
        start: new Date(year, month, 1).getTime(),
        end: new Date(year, month + 1, 0, 23, 59, 59).getTime(),
      };
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const prevRange = {
        start: new Date(prevYear, prevMonth, 1).getTime(),
        end: new Date(prevYear, prevMonth + 1, 0, 23, 59, 59).getTime(),
      };

      const [curByCat, prevByCat, tagList, curTagSpending, gp, allDebts, ef] = await Promise.all([
        transactionRepo.getTotalByCategory(range.start, range.end),
        transactionRepo.getTotalByCategory(prevRange.start, prevRange.end),
        tagRepo.getAll(),
        tagRepo.getSpendingByTag(range.start, range.end),
        goalRepo.getTotalProgress(),
        debtRepo.getAll(),
        emergencyFundRepo.getProgress(),
      ]);

      const allIds = new Set([...curByCat.map((c) => c.categoryId), ...prevByCat.map((c) => c.categoryId)]);
      setCategoryComparison(
        Array.from(allIds).map((categoryId) => {
          const current = curByCat.find((c) => c.categoryId === categoryId)?.total ?? 0;
          const prev = prevByCat.find((c) => c.categoryId === categoryId)?.total ?? 0;
          return { categoryId, current, prev };
        }),
      );

      setTags(tagList);
      setTagSpending(curTagSpending);
      setGoalProgress(gp);
      setDebts(allDebts);
      setEfund(ef);

      setLoading(false);
    }
    load();
  }, [year, month]);

  const catMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c])),
    [categories],
  );

  const monthLabel = getMonthLabel(year, month);
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  const canGoNext = year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth());

  function goToPrevMonth() {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else { setMonth((m) => m - 1); }
  }

  function goToNextMonth() {
    if (!canGoNext) return;
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else { setMonth((m) => m + 1); }
  }

  async function handleShare() {
    if (!data) return;
    const lines = [
      `📊 Review Bulanan ${monthLabel}`,
      '',
      `Pemasukan: ${formatCurrency(data.income)}`,
      `Pengeluaran: ${formatCurrency(data.expense)}`,
      `Sisa: ${formatCurrency(data.income - data.expense)}`,
      '',
      `Rata-rata harian: ${formatCurrency(data.dailyAvg)}`,
      `Total transaksi: ${data.transactionCount}`,
    ];
    if (data.highestDay.amount > 0) {
      lines.push(`Hari termahal: ${getDayLabel(data.highestDay.date)} (${formatCurrency(data.highestDay.amount)})`);
    }
    lines.push(`🔥 Streak: ${data.streakDays} hari`);

    const text = lines.join('\n');

    if (navigator.share) {
      try {
        await navigator.share({ title: `Review Bulanan ${monthLabel}`, text });
        setShared(true);
        setTimeout(() => setShared(false), 3000);
      } catch {
        await navigator.clipboard.writeText(text);
        showToast('Ringkasan disalin ke clipboard', 'success');
      }
    } else {
      await navigator.clipboard.writeText(text);
      showToast('Ringkasan disalin ke clipboard', 'success');
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4 py-4">
        <Skeleton height="40px" />
        <Skeleton height="80px" />
        <Skeleton height="80px" />
        <Skeleton height="120px" />
      </div>
    );
  }

  if (!data || (data.income === 0 && data.expense === 0)) {
    return (
      <div className="flex flex-col gap-4 py-4">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-100">Review Bulanan</h2>
        </div>
        <EmptyState
          icon={<BarChart3 className="h-12 w-12" />}
          title="Belum ada data"
          description={`Belum ada transaksi di ${monthLabel.toLowerCase()}`}
        />
      </div>
    );
  }

  const incomeChange = data.prevIncome > 0 ? ((data.income - data.prevIncome) / data.prevIncome) * 100 : 0;
  const expenseChange = data.prevExpense > 0 ? ((data.expense - data.prevExpense) / data.prevExpense) * 100 : 0;

  const expenseByCat = categoryComparison
    .filter((c) => c.current > 0)
    .sort((a, b) => b.current - a.current);

  return (
    <div className="flex flex-col gap-5 py-4">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-100">Review Bulanan</h2>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={goToPrevMonth} className="rounded-lg px-3 py-1.5 text-sm text-primary-500 hover:bg-neutral-100 dark:hover:bg-neutral-700">◀</button>
        <h3 className="text-base font-semibold text-neutral-700 dark:text-neutral-100">
          {monthLabel}{isCurrentMonth && <span className="ml-1 text-primary-500">•</span>}
        </h3>
        <button
          onClick={goToNextMonth}
          disabled={!canGoNext}
          className={cn('rounded-lg px-3 py-1.5 text-sm', canGoNext ? 'text-primary-500 hover:bg-neutral-100 dark:hover:bg-neutral-700' : 'text-neutral-300 dark:text-neutral-600')}
        >▶</button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-accent-50 p-4 dark:bg-accent-500/10">
          <div className="flex items-center gap-1 text-sm text-accent-600">
            <TrendingUp className="h-4 w-4" /> Pemasukan
          </div>
          <p className="mt-1 text-lg font-bold text-accent-600">{formatCurrency(data.income)}</p>
          {data.prevIncome > 0 && (
            <p className={cn('text-xs', incomeChange >= 0 ? 'text-accent-500' : 'text-danger-500')}>
              {incomeChange >= 0 ? '▲' : '▼'} {Math.abs(incomeChange).toFixed(1)}%
            </p>
          )}
        </div>
        <div className="rounded-xl bg-danger-50 p-4 dark:bg-danger-500/10">
          <div className="flex items-center gap-1 text-sm text-danger-600">
            <TrendingDown className="h-4 w-4" /> Pengeluaran
          </div>
          <p className="mt-1 text-lg font-bold text-danger-600">{formatCurrency(data.expense)}</p>
          {data.prevExpense > 0 && (
            <p className={cn('text-xs', expenseChange <= 0 ? 'text-accent-500' : 'text-danger-500')}>
              {expenseChange >= 0 ? '▲' : '▼'} {Math.abs(expenseChange).toFixed(1)}%
            </p>
          )}
        </div>
      </div>

      <YouSavedHighlight
        currentIncome={data.income}
        currentExpense={data.expense}
        prevIncome={data.prevIncome}
        prevExpense={data.prevExpense}
      />

      <div className="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-800">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] font-medium uppercase text-neutral-400">Rata-rata Harian</p>
            <p className="text-base font-bold text-neutral-900 dark:text-neutral-50">{formatCurrency(data.dailyAvg)}</p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase text-neutral-400">Total Transaksi</p>
            <p className="text-base font-bold text-neutral-900 dark:text-neutral-50">{data.transactionCount}</p>
          </div>
          {data.highestDay.amount > 0 && (
            <>
              <div>
                <p className="text-[10px] font-medium uppercase text-neutral-400">Hari Termahal</p>
                <p className="text-sm font-bold text-danger-500">
                  {getDayLabel(data.highestDay.date)}
                </p>
                <p className="text-xs font-semibold text-danger-400">{formatCurrency(data.highestDay.amount)}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase text-neutral-400">Streak</p>
                <div className="flex items-center gap-1 text-base font-bold text-amber-500">
                  <Flame className="h-4 w-4" />
                  {data.streakDays} hari
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {tags.length > 0 && tagSpending.length > 0 && (
        <div>
          <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-neutral-700 dark:text-neutral-100">
            <Hash className="h-4 w-4" />
            Pengeluaran per Tag
          </h3>
          <div className="flex flex-col gap-2">
            {(() => {
              const tagMap = Object.fromEntries(tags.map((t) => [t.id, t]));
              return [...tagSpending]
                .sort((a, b) => b.total - a.total)
                .slice(0, 8)
                .map(({ tagId, total }) => {
                  const tag = tagMap[tagId];
                  if (!tag) return null;
                  return (
                    <div key={tagId} className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 shadow-sm dark:bg-neutral-800">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full" style={{ backgroundColor: `${tag.color}20` }}>
                        <Hash className="h-3 w-3" style={{ color: tag.color }} />
                      </div>
                      <span className="flex-1 text-xs text-neutral-700 dark:text-neutral-100">{tag.name}</span>
                      <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-50">{formatCurrency(total)}</span>
                    </div>
                  );
                });
            })()}
          </div>
        </div>
      )}

      {goalProgress && goalProgress.goalCount > 0 && (
        <div>
          <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-neutral-700 dark:text-neutral-100">
            <Target className="h-4 w-4" />
            Ringkasan Tujuan
          </h3>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between rounded-xl bg-white px-4 py-2.5 shadow-sm dark:bg-neutral-800">
              <span className="text-xs text-neutral-500">Tujuan Aktif</span>
              <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-50">{goalProgress.goalCount}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-white px-4 py-2.5 shadow-sm dark:bg-neutral-800">
              <span className="text-xs text-neutral-500">Progres Keseluruhan</span>
              <span className="text-xs font-semibold text-accent-500">{goalProgress.totalPercent}%</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-white px-4 py-2.5 shadow-sm dark:bg-neutral-800">
              <span className="text-xs text-neutral-500">Total Terkumpul</span>
              <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-50">{formatCurrency(goalProgress.totalCurrent)}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-white px-4 py-2.5 shadow-sm dark:bg-neutral-800">
              <span className="text-xs text-neutral-500">Total Target</span>
              <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-50">{formatCurrency(goalProgress.totalTarget)}</span>
            </div>
          </div>
        </div>
      )}

      {debts.length > 0 && (
        <div>
          <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-neutral-700 dark:text-neutral-100">
            <Wallet className="h-4 w-4" />
            Ringkasan Hutang
          </h3>
          <div className="flex flex-col gap-2">
            {(() => {
              const totalOwe = debts.filter((d) => d.type === 'owing').reduce((s, d) => s + d.amount, 0);
              const totalOwed = debts.filter((d) => d.type === 'owed').reduce((s, d) => s + d.amount, 0);
              const overdue = debts.filter((d) => d.dueDate && d.dueDate < Date.now() && d.amount > 0).length;
              return (
                <>
                  <div className="flex items-center justify-between rounded-xl bg-white px-4 py-2.5 shadow-sm dark:bg-neutral-800">
                    <span className="text-xs text-neutral-500">Total Hutang</span>
                    <span className="text-xs font-semibold text-danger-500">{formatCurrency(totalOwe)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-white px-4 py-2.5 shadow-sm dark:bg-neutral-800">
                    <span className="text-xs text-neutral-500">Total Piutang</span>
                    <span className="text-xs font-semibold text-accent-500">{formatCurrency(totalOwed)}</span>
                  </div>
                  {overdue > 0 && (
                    <div className="flex items-center justify-between rounded-xl bg-white px-4 py-2.5 shadow-sm dark:bg-neutral-800">
                      <span className="text-xs text-neutral-500">Jatuh Tempo</span>
                      <span className="text-xs font-semibold text-danger-500">{overdue}</span>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}

      {efund && (
        <div>
          <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-neutral-700 dark:text-neutral-100">
            <Shield className="h-4 w-4" />
            Dana Darurat
          </h3>
          <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-800">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-neutral-500">Progres</span>
              <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-50">{efund.percent}%</span>
            </div>
            <div className="mb-3 h-2.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
              <div
                className="h-full rounded-full bg-accent-500 transition-all"
                style={{ width: `${Math.min(efund.percent, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">{formatCurrency(efund.current)}</span>
              <span className="text-neutral-400">Target {formatCurrency(efund.target)}</span>
            </div>
          </div>
        </div>
      )}

      {expenseByCat.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-100">Perbandingan Kategori</h3>
          <div className="flex flex-col gap-2">
            {expenseByCat.slice(0, 8).map((c) => {
              const cat = catMap[c.categoryId];
              const change = c.prev > 0 ? ((c.current - c.prev) / c.prev) * 100 : 0;
              return (
                <div key={c.categoryId} className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 shadow-sm dark:bg-neutral-800">
                  {cat && createElement(getCategoryIcon(cat.icon), { className: 'h-4 w-4', style: { color: cat.color } })}
                  <span className="flex-1 text-xs text-neutral-700 dark:text-neutral-100">{cat?.name ?? 'Tanpa Kategori'}</span>
                  <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-50">{formatCurrency(c.current)}</span>
                  <div className="flex items-center gap-0.5">
                    {Math.abs(change) < 5 ? (
                      <Minus className="h-3 w-3 text-neutral-400" />
                    ) : change > 0 ? (
                      <TrendingUp className="h-3 w-3 text-danger-400" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-accent-400" />
                    )}
                    <span className={cn(
                      'text-[10px] font-medium',
                      Math.abs(change) < 5 ? 'text-neutral-400' : change > 0 ? 'text-danger-400' : 'text-accent-400',
                    )}>
                      {Math.abs(change) < 5 ? '—' : `${change > 0 ? '+' : ''}${change.toFixed(0)}%`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <button
        onClick={handleShare}
        className={cn(
          'flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all',
          shared
            ? 'bg-accent-500 text-white'
            : 'bg-primary-600 text-white hover:bg-primary-700',
        )}
      >
        {shared ? (
          <><Check className="h-4 w-4" /> Tersalin!</>
        ) : (
          <><Share2 className="h-4 w-4" /> Bagikan Ringkasan</>
        )}
      </button>
    </div>
  );
}
