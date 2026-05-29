import type { Goal } from '@/types';
import { formatCurrency } from '@/utils/format';
import { formatDate } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  PiggyBank, Plane, Laptop, Home, Car, GraduationCap, Heart, Gift,
  Smartphone, Shield, Star, Ellipsis, CheckCircle2,
} from 'lucide-react';

const goalIcons: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  piggybank: PiggyBank,
  plane: Plane,
  laptop: Laptop,
  home: Home,
  car: Car,
  'graduation-cap': GraduationCap,
  heart: Heart,
  gift: Gift,
  smartphone: Smartphone,
  shield: Shield,
  star: Star,
};

function GoalIcon({ name, className, style }: { name: string; className?: string; style?: React.CSSProperties }) {
  const Icon = goalIcons[name] ?? Ellipsis;
  return <Icon className={className} style={style} />;
}

export interface GoalCardProps {
  goal: Goal;
  currentAmount: number;
  progressPercent: number;
  progressColor: string;
  onEdit: (goal: Goal) => void;
  onDelete: (goal: Goal) => void;
  onComplete: (goal: Goal) => void;
  estimatedCompletion?: number | null;
}

export function GoalCard({ goal, currentAmount, progressPercent, progressColor, onEdit, onDelete, onComplete, estimatedCompletion }: GoalCardProps) {
  return (
    <div className={`rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-800 ${goal.achievedAt ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: `${goal.color}20` }}
          >
            <GoalIcon name={goal.icon} className="h-5 w-5" style={{ color: goal.color }} />
          </div>
          <div>
            <p className="font-semibold text-neutral-900 dark:text-neutral-50">{goal.name}</p>
            <p className="text-xs text-neutral-400">
              {formatCurrency(currentAmount)} / {formatCurrency(goal.targetAmount)}
            </p>
          </div>
        </div>
        <span className="text-sm font-bold" style={{ color: goal.achievedAt ? '#10B981' : progressColor }}>
          {goal.achievedAt ? 'Selesai' : `${progressPercent}%`}
        </span>
      </div>

      {!goal.achievedAt && (
        <>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-700">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%`, backgroundColor: progressColor }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-neutral-400">
            {estimatedCompletion ? (
              <span>Estimasi selesai: {formatDate(estimatedCompletion, 'MMM yyyy', { locale: id })}</span>
            ) : goal.deadline ? (
              <span>Target: {formatDate(goal.deadline, 'MMM yyyy', { locale: id })}</span>
            ) : (
              <span>Tanpa deadline</span>
            )}
          </div>
        </>
      )}

      <div className="mt-3 flex gap-2">
        {!goal.achievedAt && (
          <button
            onClick={() => onComplete(goal)}
            className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-emerald-500 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
          >
            <CheckCircle2 className="h-4 w-4" />
            Selesai
          </button>
        )}
        <button
          onClick={() => onEdit(goal)}
          className="rounded-lg bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(goal)}
          className="rounded-lg bg-danger-50 px-3 py-2 text-sm font-medium text-danger-500 transition-colors hover:bg-danger-100 dark:bg-danger-500/10 dark:hover:bg-danger-500/20"
        >
          Hapus
        </button>
      </div>
    </div>
  );
}
