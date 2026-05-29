import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { goalRepo } from '@/db/repositories/goalRepository';
import { formatCurrency } from '@/utils/format';
import type { Goal } from '@/types';
import { Target, ChevronRight, Ellipsis, PiggyBank, Plane, Laptop, Home, Car, GraduationCap, Heart, Gift, Smartphone, Shield, Star } from 'lucide-react';

const goalIcons: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  piggybank: PiggyBank, plane: Plane, laptop: Laptop, home: Home,
  car: Car, 'graduation-cap': GraduationCap, heart: Heart, gift: Gift,
  smartphone: Smartphone, shield: Shield, star: Star,
};

function GoalIcon({ name, className, style }: { name: string; className?: string; style?: React.CSSProperties }) {
  const Icon = goalIcons[name] ?? Ellipsis;
  return <Icon className={className} style={style} />;
}

export function GoalSummaryWidget() {
  const navigate = useNavigate();
  const [topGoals, setTopGoals] = useState<(Goal & { currentAmount: number; percent: number; color: string })[]>([]);
  const [totalProgress, setTotalProgress] = useState({ totalTarget: 0, totalCurrent: 0, totalPercent: 0, goalCount: 0 });
  const [nearestDeadline, setNearestDeadline] = useState<Goal | null>(null);

  async function load() {
    const [total, nearest] = await Promise.all([
      goalRepo.getTotalProgress(),
      goalRepo.getNearestDeadline(),
    ]);
    setTotalProgress(total);
    setNearestDeadline(nearest);

    const top = await goalRepo.getTopGoals(3);
    const topWithData = await Promise.all(
      top.map(async (g) => ({
        ...g,
        currentAmount: await goalRepo.getCurrentAmount(g),
        percent: await goalRepo.getProgressPercent(g),
        color: await goalRepo.getProgressColor(g),
      })),
    );
    setTopGoals(topWithData);
  }

  useEffect(() => {
    load();
  }, []);

  if (totalProgress.goalCount === 0) return null;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary-500" />
          <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-100">Goals</h3>
        </div>
        <button
          onClick={() => navigate('/more/goals')}
          className="flex items-center gap-0.5 text-xs font-medium text-primary-500"
        >
          Lihat Semua
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {totalProgress.goalCount > 1 && (
        <div className="mb-3 rounded-xl bg-neutral-50 p-3 dark:bg-neutral-800">
          <div className="mb-1.5 flex items-center justify-between text-xs text-neutral-500">
            <span>Total Progress</span>
            <span>{totalProgress.totalPercent}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-700">
            <div
              className="h-full rounded-full bg-primary-500 transition-all duration-500"
              style={{ width: `${totalProgress.totalPercent}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-neutral-400">
            {formatCurrency(totalProgress.totalCurrent)} / {formatCurrency(totalProgress.totalTarget)}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {topGoals.map((g) => (
          <button
            key={g.id}
            onClick={() => navigate('/more/goals')}
            className="flex items-center gap-3 rounded-xl bg-white p-3 text-left transition-all hover:bg-neutral-50 dark:bg-neutral-800 dark:hover:bg-neutral-700"
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full"
              style={{ backgroundColor: `${g.color}20` }}
            >
              <GoalIcon name={g.icon} className="h-4 w-4" style={{ color: g.color }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50">{g.name}</p>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-700">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${g.percent}%`, backgroundColor: g.color }}
                />
              </div>
            </div>
            <span className="text-xs font-semibold" style={{ color: g.color }}>
              {g.percent}%
            </span>
          </button>
        ))}
      </div>

      {nearestDeadline && (
        <div className="mt-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
          Goal terdekat: {nearestDeadline.name}
        </div>
      )}
    </div>
  );
}
