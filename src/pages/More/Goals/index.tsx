import { useState, useEffect } from 'react';
import { goalRepo } from '@/db/repositories/goalRepository';
import { accountRepo } from '@/db/repositories/accountRepository';
import { GoalCard } from '@/components/finance/GoalCard';
import { GoalForm } from '@/components/finance/GoalForm';
import { EmptyState, BottomSheet } from '@/components/ui';
import { useUIStore } from '@/stores/uiStore';
import { vibrate } from '@/utils/haptic';
import { cn } from '@/utils/cn';
import { Target, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { Goal } from '@/types';
import { formatCurrency } from '@/utils/format';

interface GoalDisplay {
  goal: Goal;
  currentAmount: number;
  progressPercent: number;
  progressColor: string;
  estimatedCompletion: number | null;
}

export default function GoalsPage() {
  const [activeGoals, setActiveGoals] = useState<GoalDisplay[]>([]);
  const [achievedGoals, setAchievedGoals] = useState<GoalDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);
  const [confirmGoal, setConfirmGoal] = useState<{ goal: Goal; insufficient: boolean } | null>(null);
  const { showToast } = useUIStore();

  async function loadData() {
    const all = await goalRepo.getAll();
    const displays = await Promise.all(
      all.map(async (g) => ({
        goal: g,
        currentAmount: await goalRepo.getCurrentAmount(g),
        progressPercent: await goalRepo.getProgressPercent(g),
        progressColor: await goalRepo.getProgressColor(g),
        estimatedCompletion: await goalRepo.getEstimatedCompletion(g),
      })),
    );
    setActiveGoals(displays.filter((d) => !d.goal.achievedAt));
    setAchievedGoals(displays.filter((d) => d.goal.achievedAt));
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const allActive = activeGoals;
  const avgPercent = allActive.length > 0
    ? Math.round(allActive.reduce((s, d) => s + d.progressPercent, 0) / allActive.length)
    : 0;

  async function handleDelete(goal: Goal) {
    const confirmed = window.confirm(`Hapus goal "${goal.name}"?`);
    if (!confirmed) return;
    await goalRepo.delete(goal.id);
    await goalRepo.resetMilestones(goal.id);
    showToast('Goal dihapus', 'info');
    loadData();
  }

  async function handleComplete(goal: Goal) {
    const accounts = await accountRepo.getAll();
    const primary = accounts.find((a) => a.isPrimary) ?? accounts[0];
    const balance = primary?.balance ?? 0;
    const insufficient = balance < goal.targetAmount;
    setConfirmGoal({ goal, insufficient });
  }

  async function handleConfirmComplete() {
    if (!confirmGoal) return;
    const { goal, insufficient } = confirmGoal;
    setConfirmGoal(null);
    await goalRepo.complete(goal.id, insufficient);
    showToast(`Selamat! Goal "${goal.name}" tercapai!`, 'success');
    vibrate(50);
    loadData();
  }

  function handleEdit(goal: Goal) {
    setEditGoal(goal);
    setFormOpen(true);
  }

  function handleFormClose() {
    setFormOpen(false);
    setEditGoal(null);
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
        {!loading && allActive.length > 0 && (
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
        ) : allActive.length === 0 && achievedGoals.length === 0 ? (
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
                {allActive.length} Goal Aktif
              </p>
              <button
                onClick={() => { setEditGoal(null); setFormOpen(true); }}
                className="rounded-lg bg-primary-500 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-600"
              >
                + Tambah
              </button>
            </div>
            {allActive.map((d) => (
              <GoalCard
                key={d.goal.id}
                goal={d.goal}
                currentAmount={d.currentAmount}
                progressPercent={d.progressPercent}
                progressColor={d.progressColor}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onComplete={handleComplete}
                estimatedCompletion={d.estimatedCompletion}
              />
            ))}

            {achievedGoals.length > 0 && (
              <>
                <div className="mt-4 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                    {achievedGoals.length} Goal Tercapai
                  </p>
                </div>
                {achievedGoals.map((d) => (
                  <GoalCard
                    key={d.goal.id}
                    goal={d.goal}
                    currentAmount={d.currentAmount}
                    progressPercent={d.progressPercent}
                    progressColor={d.progressColor}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onComplete={handleComplete}
                    estimatedCompletion={d.estimatedCompletion}
                  />
                ))}
              </>
            )}
          </>
        )}
      </div>

      <GoalForm
        open={formOpen}
        onClose={handleFormClose}
        editGoal={editGoal}
        onSaved={handleSaved}
      />

      <BottomSheet
        open={!!confirmGoal}
        onClose={() => setConfirmGoal(null)}
        title={confirmGoal?.insufficient ? 'Saldo Tidak Mencukupi' : 'Selesaikan Goal'}
      >
        <div className="flex flex-col gap-4">
          {confirmGoal?.insufficient ? (
            <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-4 dark:bg-amber-500/10">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <div className="text-sm text-neutral-700 dark:text-neutral-300">
                Saldo akun utama tidak mencukupi. Transaksi akan membuat saldo minus.
              </div>
            </div>
          ) : (
            <p className="text-sm text-neutral-500">
              Goal akan ditandai selesai dan {formatCurrency(confirmGoal?.goal.targetAmount ?? 0)} dicatat sebagai pengeluaran dari akun utama.
            </p>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => setConfirmGoal(null)}
              className="flex-1 rounded-xl bg-neutral-100 py-2.5 text-sm font-medium text-neutral-700 dark:bg-neutral-700 dark:text-neutral-100"
            >
              Batal
            </button>
            <button
              onClick={handleConfirmComplete}
              className={cn(
                'flex-1 rounded-xl py-2.5 text-sm font-medium text-white',
                confirmGoal?.insufficient ? 'bg-amber-500' : 'bg-emerald-500',
              )}
            >
              {confirmGoal?.insufficient ? 'Tetap Lanjutkan' : 'Selesaikan'}
            </button>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
