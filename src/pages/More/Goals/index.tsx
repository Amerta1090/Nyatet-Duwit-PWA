import { useState, useEffect } from 'react';
import { goalRepo } from '@/db/repositories/goalRepository';
import { GoalCard } from '@/components/finance/GoalCard';
import { GoalForm } from '@/components/finance/GoalForm';
import { GoalProgressForm } from '@/components/finance/GoalProgressForm';
import { EmptyState } from '@/components/ui';
import { useUIStore } from '@/stores/uiStore';
import { vibrate } from '@/utils/haptic';
import { Target } from 'lucide-react';
import type { Goal } from '@/types';

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [progressFormOpen, setProgressFormOpen] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);
  const [progressGoal, setProgressGoal] = useState<Goal | null>(null);
  const [estimations, setEstimations] = useState<Map<string, number | null>>(new Map());
  const { showToast } = useUIStore();

  async function loadData() {
    const all = await goalRepo.getAll();
    setGoals(all);
    const estMap = new Map<string, number | null>();
    for (const g of all) {
      estMap.set(g.id, await goalRepo.getEstimatedCompletion(g));
    }
    setEstimations(estMap);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const total = goals.reduce((s, g) => s + goalRepo.getProgressPercent(g), 0);
  const avgPercent = goals.length > 0 ? Math.round(total / goals.length) : 0;

  async function handleDelete(goal: Goal) {
    const confirmed = window.confirm(`Hapus goal "${goal.name}"?`);
    if (!confirmed) return;
    await goalRepo.delete(goal.id);
    await goalRepo.resetMilestones(goal.id);
    showToast('Goal dihapus', 'info');
    loadData();
  }

  function handleEdit(goal: Goal) {
    setEditGoal(goal);
    setFormOpen(true);
  }

  function handleAddProgress(goal: Goal) {
    setProgressGoal(goal);
    setProgressFormOpen(true);
  }

  function handleFormClose() {
    setFormOpen(false);
    setEditGoal(null);
    loadData();
  }

  function handleProgressClose() {
    setProgressFormOpen(false);
    setProgressGoal(null);
    loadData();
  }

  async function handleSaved() {
    await loadData();
    const all = await goalRepo.getAll();
    for (const g of all) {
      const milestones = await goalRepo.checkMilestones(g);
      for (const m of milestones) {
        vibrate(50);
        if (m.isComplete) {
          showToast(`🎉 Selamat! Goal "${m.goalName}" tercapai!`, 'success');
        } else {
          showToast(`🎉 Goal "${m.goalName}" ${m.percent}% tercapai!`, 'success');
        }
      }
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4 py-4">
        {!loading && goals.length > 0 && (
          <div className="rounded-xl bg-primary-50 p-4 dark:bg-primary-500/10">
            <p className="text-sm text-primary-600 dark:text-primary-400">
              Rata-rata progress: {avgPercent}%
            </p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-neutral-400">Memuat...</p>
          </div>
        ) : goals.length === 0 ? (
          <EmptyState
            icon={<Target className="h-10 w-10" />}
            title="Belum ada goal"
            description="Buat goal pertama kamu untuk track tujuan finansial"
            action={
              <button
                onClick={() => { setEditGoal(null); setFormOpen(true); }}
                className="rounded-xl bg-primary-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
              >
                Buat Goal
              </button>
            }
          />
        ) : (
          <>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                {goals.length} Goal{goals.length > 1 ? '' : ''}
              </p>
              <button
                onClick={() => { setEditGoal(null); setFormOpen(true); }}
                className="rounded-lg bg-primary-500 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-600"
              >
                + Tambah
              </button>
            </div>
            {goals.map((g) => (
              <GoalCard
                key={g.id}
                goal={g}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAddProgress={handleAddProgress}
                estimatedCompletion={estimations.get(g.id)}
              />
            ))}
          </>
        )}
      </div>

      <GoalForm
        open={formOpen}
        onClose={handleFormClose}
        editGoal={editGoal}
        onSaved={handleSaved}
      />

      {progressGoal && (
        <GoalProgressForm
          open={progressFormOpen}
          onClose={handleProgressClose}
          goal={progressGoal}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
