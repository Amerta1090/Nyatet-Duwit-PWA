import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { emergencyFundRepo } from '@/db/repositories/emergencyFundRepository';
import { formatCurrency } from '@/utils/format';
import { ShieldAlert, ShieldCheck, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

export function EmergencyFundWidget() {
  const navigate = useNavigate();
  const [percent, setPercent] = useState(0);
  const [current, setCurrent] = useState(0);
  const [target, setTarget] = useState(0);
  const [ready, setReady] = useState(false);

  async function load() {
    const prog = await emergencyFundRepo.getProgress();
    setPercent(prog.percent);
    setCurrent(prog.current);
    setTarget(prog.target);
    setReady(true);
  }

  useEffect(() => {
    load();
  }, []);

  if (!ready || target === 0) return null;

  const isMedium = percent >= 50 && percent < 75;
  const isHigh = percent >= 75 && percent < 100;
  const isComplete = percent >= 100;

  const barColor = isComplete ? 'bg-emerald-500' : isHigh ? 'bg-blue-500' : isMedium ? 'bg-amber-500' : 'bg-neutral-400';

  return (
    <button
      onClick={() => navigate('/more/emergency-fund')}
      className="flex w-full items-center gap-3 rounded-xl bg-white px-4 py-3 text-left shadow-sm transition-all hover:bg-neutral-50 dark:bg-neutral-800 dark:hover:bg-neutral-700"
    >
      <div className={cn(
        'flex h-9 w-9 items-center justify-center rounded-full',
        isComplete ? 'bg-emerald-50 dark:bg-emerald-500/10' :
        isHigh ? 'bg-blue-50 dark:bg-blue-500/10' :
        'bg-neutral-50 dark:bg-neutral-700',
      )}>
        {isComplete ? (
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
        ) : (
          <ShieldAlert className={cn(
            'h-4 w-4',
            isHigh ? 'text-blue-500' : isMedium ? 'text-amber-500' : 'text-neutral-400',
          )} />
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50">Dana Darurat</p>
          <span className="text-xs font-semibold" style={{ color: isComplete ? '#10B981' : isHigh ? '#3B82F6' : isMedium ? '#F59E0B' : '#64748B' }}>
            {percent}%
          </span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-700">
          <div className={cn('h-full rounded-full transition-all duration-500', barColor)} style={{ width: `${percent}%` }} />
        </div>
        <p className="mt-0.5 text-xs text-neutral-400">
          {formatCurrency(current)} / {formatCurrency(target)}
        </p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-neutral-300" />
    </button>
  );
}
