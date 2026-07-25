import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { budgetRepo } from '@/db/repositories/budgetRepository';
import { transactionRepo } from '@/db/repositories/transactionRepository';
import { calculateDailyBudget, getTodaysBudget, getSpendingStatus, getSuggestion } from '@/utils/budgeting';
import { formatCurrency } from '@/utils/format';
import { format } from 'date-fns';
import { ChevronRight, Wallet, TrendingDown, TrendingUp, Minus, Calendar } from 'lucide-react';
import { cn } from '@/utils/cn';

export function DailyBudgetCard() {
  const navigate = useNavigate();
  const [effectiveBudget, setEffectiveBudget] = useState<number | null>(null);
  const [spent, setSpent] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [carryForward, setCarryForward] = useState(0);
  const [isOverBudget, setIsOverBudget] = useState(false);
  const [status, setStatus] = useState<string>('hemat');
  const [suggestion, setSuggestion] = useState('');
  const [totalBudget, setTotalBudget] = useState(0);
  const [cycleStart, setCycleStart] = useState<number>(0);
  const [cycleEnd, setCycleEnd] = useState<number>(0);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      const { cycleStart: cs, cycleEnd: ce } = await budgetRepo.ensureActiveCycle();
      const budget = await budgetRepo.getTotalBudget(cs, ce);
      if (budget.totalBudget === 0) {
        setCycleStart(cs);
        setCycleEnd(ce);
        setLoaded(true);
        return;
      }

      const txs = await transactionRepo.getByDateRange(cs, ce);
      const expenseTxs = txs.filter((t) => t.type === 'expense');

      const now = Date.now();
      const msPerDay = 86400000;
      const daysElapsed = Math.floor((now - cs) / msPerDay) + 1;
      const remaining = Math.max(30 - daysElapsed, 0);

      const cycle = calculateDailyBudget(budget.totalBudget, expenseTxs, cs);
      const today = getTodaysBudget(budget.totalBudget, expenseTxs, cs, now);

      if (today) {
        setEffectiveBudget(today.effectiveBudget);
        setSpent(today.spent);
        setRemaining(today.remaining);
        setCarryForward(today.carryForward);
        setIsOverBudget(today.isOverBudget);
        setStatus(getSpendingStatus(today));
        setSuggestion(getSuggestion(today));
      }

      setTotalBudget(budget.totalBudget);
      setCycleStart(cs);
      setCycleEnd(ce);
      setDaysRemaining(remaining);
      setLoaded(true);
    }
    load();
  }, []);

  if (!loaded || totalBudget === 0 || effectiveBudget === null) return null;

  const percent = effectiveBudget > 0 ? Math.min((spent / effectiveBudget) * 100, 100) : 0;

  return (
    <button
      onClick={() => navigate('/more/budgets')}
      className="w-full text-left rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-800"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-primary-500" />
          <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-100">Budget Hari Ini</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3 w-3 text-neutral-400" />
          <span className="text-[10px] text-neutral-400">Sisa {daysRemaining} hari</span>
          <ChevronRight className="h-4 w-4 text-neutral-300" />
        </div>
      </div>

      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="text-[10px] font-medium uppercase text-neutral-400">Tersedia</p>
          <p className={cn(
            'text-2xl font-bold',
            isOverBudget ? 'text-danger-500' : remaining > 0 ? 'text-accent-500' : 'text-neutral-700 dark:text-neutral-100'
          )}>
            {formatCurrency(remaining)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-medium uppercase text-neutral-400">Terpakai</p>
          <p className="text-base font-semibold text-neutral-600 dark:text-neutral-300">{formatCurrency(spent)}</p>
        </div>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-700 mb-3">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            isOverBudget ? 'bg-danger-500' : percent > 80 ? 'bg-amber-500' : 'bg-accent-500',
          )}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-[11px] text-neutral-400">{suggestion}</p>
        {carryForward !== 0 && (
          <div className={cn(
            'flex items-center gap-1 text-[10px] font-medium',
            carryForward > 0 ? 'text-accent-500' : 'text-danger-500'
          )}>
            {carryForward > 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : carryForward < 0 ? (
              <TrendingDown className="h-3 w-3" />
            ) : (
              <Minus className="h-3 w-3" />
            )}
            {carryForward > 0 ? '+' : ''}{formatCurrency(carryForward)}
          </div>
        )}
      </div>

      <div className="mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-700 flex items-center justify-between text-[10px] text-neutral-400">
        <span>Siklus: {format(cycleStart, 'd MMM')} — {format(cycleEnd, 'd MMM yyyy')}</span>
      </div>
    </button>
  );
}
