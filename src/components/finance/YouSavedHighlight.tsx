import { TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { cn } from '@/utils/cn';

interface YouSavedHighlightProps {
  currentIncome: number;
  currentExpense: number;
  prevIncome: number;
  prevExpense: number;
  minimal?: boolean;
}

export function YouSavedHighlight({ currentIncome, currentExpense, prevIncome, prevExpense, minimal }: YouSavedHighlightProps) {
  const currentSaved = currentIncome - currentExpense;
  const prevSaved = prevIncome - prevExpense;
  const savedDiff = currentSaved - prevSaved;

  const hasPrevData = prevIncome > 0 || prevExpense > 0;
  const isPositive = savedDiff >= 0;

  if (currentIncome === 0 && currentExpense === 0) return null;

  return (
    <div
      className={cn(
        'rounded-xl p-4',
        isPositive ? 'bg-accent-50 dark:bg-accent-500/10' : 'bg-danger-50 dark:bg-danger-500/10',
        minimal ? 'px-4 py-3' : 'px-4 py-4',
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isPositive ? (
            <Sparkles className={cn('text-accent-500', minimal ? 'h-4 w-4' : 'h-5 w-5')} />
          ) : (
            <TrendingDown className={cn('text-danger-500', minimal ? 'h-4 w-4' : 'h-5 w-5')} />
          )}
          <div>
            <p className={cn('font-semibold', minimal ? 'text-xs' : 'text-sm', isPositive ? 'text-accent-600 dark:text-accent-400' : 'text-danger-600 dark:text-danger-400')}>
              {isPositive ? 'Kamu Hemat!' : 'Pengeluaran Naik'}
            </p>
            {!minimal && (
              <p className="text-xs text-neutral-500 mt-0.5">
                Sisa: {formatCurrency(Math.abs(currentSaved))}
              </p>
            )}
          </div>
        </div>
        {hasPrevData && (
          <div className="flex items-center gap-1">
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-accent-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-danger-500" />
            )}
            <span className={cn('font-semibold', isPositive ? 'text-accent-500' : 'text-danger-500', minimal ? 'text-xs' : 'text-sm')}>
              {isPositive ? '+' : ''}{formatCurrency(Math.abs(savedDiff))}
            </span>
          </div>
        )}
      </div>
      {!minimal && hasPrevData && (
        <p className="mt-2 text-xs text-neutral-400">
          {isPositive
            ? `Kamu hemat ${formatCurrency(savedDiff)} dari bulan lalu!`
            : `Pengeluaran naik ${formatCurrency(Math.abs(savedDiff))} dari bulan lalu`}
        </p>
      )}
    </div>
  );
}
