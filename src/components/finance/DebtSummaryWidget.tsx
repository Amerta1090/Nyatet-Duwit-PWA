import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { debtRepo } from '@/db/repositories/debtRepository';
import { formatCurrency } from '@/utils/format';
import { HandCoins, ChevronRight, AlertTriangle, UserPlus, UserMinus } from 'lucide-react';
import { cn } from '@/utils/cn';

export function DebtSummaryWidget() {
  const navigate = useNavigate();
  const [totalOwed, setTotalOwed] = useState(0);
  const [totalOwing, setTotalOwing] = useState(0);
  const [net, setNet] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);
  const [expanded, setExpanded] = useState(false);

  async function load() {
    const [owed, owing, netBal, overdue] = await Promise.all([
      debtRepo.getTotalOwed(),
      debtRepo.getTotalOwing(),
      debtRepo.getNetBalance(),
      debtRepo.getOverdue(),
    ]);
    setTotalOwed(owed);
    setTotalOwing(owing);
    setNet(netBal);
    setOverdueCount(overdue.length);
  }

  useEffect(() => {
    load();
  }, []);

  if (totalOwed === 0 && totalOwing === 0) return null;

  return (
    <div className="rounded-xl bg-white shadow-sm dark:bg-neutral-800">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-4 py-3"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-50 dark:bg-purple-500/10">
          <HandCoins className="h-4 w-4 text-purple-500" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
            Utang & Piutang
          </p>
          <p className={cn('text-xs', net >= 0 ? 'text-accent-500' : 'text-danger-500')}>
            Bersih: {net >= 0 ? '+' : ''}{formatCurrency(net)}
            {overdueCount > 0 && (
              <span className="ml-2 text-danger-500">
                ({overdueCount} overdue)
              </span>
            )}
          </p>
        </div>
        <ChevronRight className={cn(
          'h-4 w-4 text-neutral-300 transition-transform',
          expanded && 'rotate-90',
        )} />
      </button>

      {expanded && (
        <div className="border-t border-neutral-100 px-4 pb-3 pt-2 dark:border-neutral-700">
          <div className="mb-2 flex items-center gap-2 text-xs text-blue-500">
            <UserPlus className="h-3.5 w-3.5" />
            Piutang: {formatCurrency(totalOwed)}
          </div>
          <div className="mb-3 flex items-center gap-2 text-xs text-amber-500">
            <UserMinus className="h-3.5 w-3.5" />
            Utang: {formatCurrency(totalOwing)}
          </div>
          {overdueCount > 0 && (
            <div className="mb-2 flex items-center gap-1.5 rounded-lg bg-danger-50 px-3 py-2 text-xs text-danger-600 dark:bg-danger-500/10 dark:text-danger-400">
              <AlertTriangle className="h-3.5 w-3.5" />
              {overdueCount} item lewat jatuh tempo
            </div>
          )}
          <button
            onClick={() => navigate('/more/debt')}
            className="w-full rounded-lg bg-primary-50 py-2 text-xs font-medium text-primary-600 transition-colors hover:bg-primary-100 dark:bg-primary-500/10 dark:text-primary-400 dark:hover:bg-primary-500/20"
          >
            Kelola Utang & Piutang
          </button>
        </div>
      )}
    </div>
  );
}
