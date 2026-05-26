import { useEffect, useState, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { TransactionForm } from '@/components/finance/TransactionForm';
import { accountRepo } from '@/db/repositories/accountRepository';
import { transactionRepo } from '@/db/repositories/transactionRepository';
import { categoryRepo } from '@/db/repositories/categoryRepository';
import type { Account, Transaction, Category } from '@/types';
import { formatCurrency } from '@/utils/format';
import { startOfDay, getMonthRange } from '@/utils/date';
import { ArrowLeftRight, TrendingUp, TrendingDown, ChevronRight, Flame } from 'lucide-react';
import { EmptyState, Skeleton } from '@/components/ui';
import { TransactionItem } from '@/components/finance/TransactionItem';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/utils/cn';

export default function HomePage() {
  const navigate = useNavigate();
  const { fabSignal, doubleTapSignal } = useOutletContext<{ fabSignal: number; doubleTapSignal: number }>();
  const { showToast } = useUIStore();

  const [formOpen, setFormOpen] = useState(false);
  const [totalBalance, setTotalBalance] = useState(0);
  const [recentTxs, setRecentTxs] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpense, setMonthlyExpense] = useState(0);
  const [prevIncome, setPrevIncome] = useState(0);
  const [prevExpense, setPrevExpense] = useState(0);
  const [streak, setStreak] = useState(0);
  const [monthStart, setMonthStart] = useState(0);
  const [monthEnd, setMonthEnd] = useState(0);
  const [prevMonthStart, setPrevMonthStart] = useState(0);
  const [prevMonthEnd, setPrevMonthEnd] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = Date.now();
    const range = getMonthRange(now);
    setMonthStart(range.start);
    setMonthEnd(range.end);

    const d = new Date(range.start);
    d.setMonth(d.getMonth() - 1);
    const prevRange = getMonthRange(d.getTime());
    setPrevMonthStart(prevRange.start);
    setPrevMonthEnd(prevRange.end);
  }, []);

  async function loadData() {
    const [balance, txs, cats, accs, income, expense, prevInc, prevExp, streakDays] = await Promise.all([
      accountRepo.getTotalBalance(),
      transactionRepo.getAll({ limit: 10 }),
      categoryRepo.getAll(),
      accountRepo.getAll(true),
      transactionRepo.getTotalByType('income', monthStart, monthEnd),
      transactionRepo.getTotalByType('expense', monthStart, monthEnd),
      transactionRepo.getTotalByType('income', prevMonthStart, prevMonthEnd),
      transactionRepo.getTotalByType('expense', prevMonthStart, prevMonthEnd),
      computeStreak(),
    ]);
    setTotalBalance(balance);
    setRecentTxs(txs);
    setCategories(cats);
    setAccounts(accs);
    setMonthlyIncome(income);
    setMonthlyExpense(expense);
    setPrevIncome(prevInc);
    setPrevExpense(prevExp);
    setStreak(streakDays);
    setLoading(false);
  }

  async function computeStreak(): Promise<number> {
    const thirtyDaysAgo = Date.now() - 30 * 86400000;
    const all = await transactionRepo.getAll({ dateFrom: thirtyDaysAgo });
    const activeDays = new Set<number>();
    for (const tx of all) {
      activeDays.add(startOfDay(tx.date));
    }
    const sortedDays = Array.from(activeDays).sort((a, b) => b - a);
    if (sortedDays.length === 0) return 0;
    const today = startOfDay(Date.now());
    const yesterday = startOfDay(today - 86400000);
    if (sortedDays[0]! < yesterday) return 0;
    let count = 0;
    for (let i = 0; i < sortedDays.length; i++) {
      const expected = today - i * 86400000;
      if (sortedDays[i] === startOfDay(expected)) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (fabSignal > 0) setFormOpen(true);
  }, [fabSignal]);

  useEffect(() => {
    if (doubleTapSignal > 0) {
      setFormOpen(true);
    }
  }, [doubleTapSignal]);

  async function handleDelete(tx: Transaction) {
    await transactionRepo.delete(tx.id);
    showToast('Transaksi dihapus', 'info', async () => {
      await transactionRepo.create({
        type: tx.type, amount: tx.amount, categoryId: tx.categoryId,
        accountId: tx.accountId, toAccountId: tx.toAccountId,
        date: tx.date, notes: tx.notes,
      });
      showToast('Transaksi dipulihkan', 'success');
      loadData();
    });
    loadData();
  }

  function handleEdit() {
    setFormOpen(true);
  }

  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]));
  const accountMap = Object.fromEntries(accounts.map((a) => [a.id, a]));
  const netMonthly = monthlyIncome - monthlyExpense;
  const incomeChange = prevIncome > 0 ? ((monthlyIncome - prevIncome) / prevIncome) * 100 : 0;
  const expenseChange = prevExpense > 0 ? ((monthlyExpense - prevExpense) / prevExpense) * 100 : 0;
  const budgetCategories = useMemo(() => categories.filter((c) => c.budgetLimit && c.budgetLimit > 0), [categories]);
  const totalBudget = useMemo(() => budgetCategories.reduce((s, c) => s + (c.budgetLimit ?? 0), 0), [budgetCategories]);
  const totalBudgetSpent = useMemo(() => {
    const expenseCats = new Set(budgetCategories.map((c) => c.id));
    return recentTxs
      .filter((t) => t.type === 'expense' && expenseCats.has(t.categoryId) && t.date >= monthStart)
      .reduce((s, t) => s + t.amount, 0);
  }, [recentTxs, budgetCategories, monthStart]);
  const budgetPercent = totalBudget > 0 ? Math.min((totalBudgetSpent / totalBudget) * 100, 100) : 0;

  return (
    <div className="flex flex-col gap-6 py-4">
      <div className="rounded-2xl bg-primary-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-primary-100">Total Saldo</p>
          {streak > 0 && (
            <div className="flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3 py-1 text-sm font-medium text-amber-300">
              <Flame className="h-4 w-4" />
              {streak}
            </div>
          )}
        </div>
        <h2 className="mt-1 text-3xl font-bold tracking-tight">
          {loading ? <Skeleton height="36px" className="bg-white/20" /> : formatCurrency(totalBalance)}
        </h2>
      </div>

      {!loading && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-accent-50 p-4 dark:bg-accent-500/10">
            <div className="flex items-center gap-1 text-sm text-accent-600">
              <TrendingUp className="h-4 w-4" />
              Pemasukan
            </div>
            <p className="mt-1 text-lg font-bold text-accent-600">{formatCurrency(monthlyIncome)}</p>
            {prevIncome > 0 && (
              <p className={cn('text-xs', incomeChange >= 0 ? 'text-accent-500' : 'text-danger-500')}>
                {incomeChange >= 0 ? '+' : ''}{incomeChange.toFixed(1)}% dari bulan lalu
              </p>
            )}
          </div>
          <div className="rounded-xl bg-danger-50 p-4 dark:bg-danger-500/10">
            <div className="flex items-center gap-1 text-sm text-danger-600">
              <TrendingDown className="h-4 w-4" />
              Pengeluaran
            </div>
            <p className="mt-1 text-lg font-bold text-danger-600">{formatCurrency(monthlyExpense)}</p>
            {prevExpense > 0 && (
              <p className={cn('text-xs', expenseChange <= 0 ? 'text-accent-500' : 'text-danger-500')}>
                {expenseChange >= 0 ? '+' : ''}{expenseChange.toFixed(1)}% dari bulan lalu
              </p>
            )}
          </div>
        </div>
      )}

      {!loading && (monthlyIncome > 0 || monthlyExpense > 0) && (
        <div className="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-800">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-100">Sisa Bulan Ini</p>
            <span className={cn('text-lg font-bold', netMonthly >= 0 ? 'text-accent-500' : 'text-danger-500')}>
              {netMonthly >= 0 ? '+' : ''}{formatCurrency(netMonthly)}
            </span>
          </div>
        </div>
      )}

      {!loading && totalBudget > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-100">Anggaran</h3>
            <span className="text-xs text-neutral-400">{formatCurrency(totalBudgetSpent)} / {formatCurrency(totalBudget)}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-700">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                budgetPercent > 90 ? 'bg-danger-500' : budgetPercent > 75 ? 'bg-amber-500' : 'bg-accent-500',
              )}
              style={{ width: `${budgetPercent}%` }}
            />
          </div>
        </div>
      )}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-100">Transaksi Terakhir</h3>
          <button
            onClick={() => navigate('/transactions')}
            className="flex items-center gap-0.5 text-xs font-medium text-primary-500"
          >
            Lihat Semua
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
        {loading ? (
          <Skeleton height="60px" lines={4} />
        ) : recentTxs.length === 0 ? (
          <EmptyState
            icon={<ArrowLeftRight className="h-10 w-10" />}
            title="Belum ada transaksi"
            description="Tap + untuk mencatat transaksi pertama"
          />
        ) : (
          <div className="flex flex-col gap-1">
            {recentTxs.map((tx) => (
              <TransactionItem
                key={tx.id}
                transaction={tx}
                category={categoryMap[tx.categoryId]}
                account={accountMap[tx.accountId]}
                toAccount={tx.toAccountId ? accountMap[tx.toAccountId] : undefined}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <TransactionForm
        open={formOpen}
        onClose={() => { setFormOpen(false); loadData(); }}
      />
    </div>
  );
}
