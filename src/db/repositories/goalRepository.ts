import { db } from '../schema';
import type { Goal, Account } from '@/types';
import { generateId } from '@/utils/id';

export interface GoalMilestone {
  goalId: string;
  goalName: string;
  percent: number;
  isComplete: boolean;
}

export const goalRepo = {
  async getAll(): Promise<Goal[]> {
    return db.goals.toArray();
  },

  async getById(id: string): Promise<Goal | undefined> {
    return db.goals.get(id);
  },

  async getCurrentAmount(_goal: Goal): Promise<number> {
    const accounts = await db.accounts.toArray();
    return accounts
      .filter((a) => a.type !== 'goal' && !a.isArchived)
      .reduce((sum, a) => sum + a.balance, 0);
  },

  async create(input: { name: string; targetAmount: number; icon: string; color: string; deadline?: number }): Promise<Goal> {
    const now = Date.now();
    const goal: Goal = {
      id: generateId(),
      name: input.name,
      targetAmount: input.targetAmount,
      icon: input.icon,
      color: input.color,
      deadline: input.deadline,
      createdAt: now,
      updatedAt: now,
    };
    await db.goals.add(goal);
    return goal;
  },

  async update(id: string, data: Partial<Goal>): Promise<Goal> {
    const updateData = { ...data, updatedAt: Date.now() };
    await db.goals.update(id, updateData);
    const updated = await db.goals.get(id);
    if (!updated) throw new Error('Goal not found');
    return updated;
  },

  async delete(id: string): Promise<void> {
    await db.goals.delete(id);
  },

  async complete(id: string, force?: boolean): Promise<void> {
    return db.transaction('rw', db.goals, db.accounts, db.transactions, db.categories, async () => {
      const goal = await db.goals.get(id);
      if (!goal) throw new Error('Goal not found');
      if (goal.achievedAt) return;

      const now = Date.now();
      // Use the goal's linked account, or fall back to primary/first non-goal account
      let targetAccount: Account | undefined;
      if (goal.accountId) {
        targetAccount = await db.accounts.get(goal.accountId);
      }
      if (!targetAccount) {
        const all = await db.accounts.toArray();
        targetAccount = all.find((a) => a.isPrimary && a.type !== 'goal')
          ?? all.find((a) => a.type !== 'goal');
      }

      if (targetAccount && goal.targetAmount > 0) {
        if (!force && targetAccount.balance < goal.targetAmount) {
          throw new Error('Saldo tidak mencukupi');
        }
        const otherCategory = await db.categories.get('cat-other-expense');
        const categoryId = otherCategory?.id || 'cat-other-expense';

        await db.transactions.add({
          id: generateId(),
          type: 'expense',
          amount: goal.targetAmount,
          categoryId,
          accountId: targetAccount.id,
          date: now,
          notes: `Pencapaian goal: ${goal.name}`,
          createdAt: now,
          updatedAt: now,
          synced: false,
        });

        await db.accounts.update(targetAccount.id, {
          balance: targetAccount.balance - goal.targetAmount,
          updatedAt: now,
        });
      }

      await db.goals.update(id, { achievedAt: now, updatedAt: now });
    });
  },

  async getProgressPercent(goal: Goal): Promise<number> {
    if (goal.achievedAt) return 100;
    if (goal.targetAmount <= 0) return 0;
    const current = await this.getCurrentAmount(goal);
    return Math.min(Math.round((current / goal.targetAmount) * 100), 100);
  },

  async getProgressColor(goal: Goal): Promise<string> {
    const percent = await this.getProgressPercent(goal);
    if (goal.achievedAt) return '#10B981';
    if (percent >= 80) return '#EF4444';
    if (percent >= 50) return '#F59E0B';
    return '#10B981';
  },

  async getEstimatedCompletion(goal: Goal): Promise<number | null> {
    if (goal.achievedAt) return null;
    const current = await this.getCurrentAmount(goal);
    if (current <= 0 || !goal.deadline) return null;
    const daysSinceCreation = Math.max(1, Math.floor((Date.now() - goal.createdAt) / 86400000));
    const avgDaily = current / daysSinceCreation;
    if (avgDaily <= 0) return null;
    const remaining = goal.targetAmount - current;
    const daysRemaining = Math.ceil(remaining / avgDaily);
    return Date.now() + daysRemaining * 86400000;
  },

  async getTotalProgress(): Promise<{ totalTarget: number; totalCurrent: number; totalPercent: number; goalCount: number }> {
    const goals = await this.getAll();
    let totalTarget = 0;
    let activeCount = 0;
    for (const g of goals) {
      if (g.achievedAt) continue;
      totalTarget += g.targetAmount;
      activeCount++;
    }
    const totalCurrent = activeCount > 0 ? await this.getCurrentAmount(goals[0]!) : 0;
    return {
      totalTarget,
      totalCurrent,
      totalPercent: totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0,
      goalCount: activeCount,
    };
  },

  async getTopGoals(limit: number = 3): Promise<Goal[]> {
    const goals = (await this.getAll()).filter((g) => !g.achievedAt);
    const withPct = await Promise.all(
      goals.map(async (g) => ({ goal: g, pct: await this.getProgressPercent(g) })),
    );
    return withPct
      .sort((a, b) => b.pct - a.pct)
      .slice(0, limit)
      .map((x) => x.goal);
  },

  async getNearestDeadline(): Promise<Goal | null> {
    const goals = (await this.getAll()).filter((g) => {
      if (g.achievedAt || !g.deadline) return false;
      return true;
    });
    if (goals.length === 0) return null;
    return goals.sort((a, b) => (a.deadline ?? Infinity) - (b.deadline ?? Infinity))[0]!;
  },

  MILESTONES: [25, 50, 75, 100] as const,

  async checkMilestones(goal: Goal): Promise<GoalMilestone[]> {
    if (goal.achievedAt) return [];
    const percent = await this.getProgressPercent(goal);
    const triggered: GoalMilestone[] = [];
    for (const m of this.MILESTONES) {
      if (percent < m) continue;
      const key = `milestone_${goal.id}_${m}`;
      const existing = await db.settings.get(key);
      if (!existing) {
        await db.settings.put({ key, value: 'true' });
        triggered.push({
          goalId: goal.id,
          goalName: goal.name,
          percent: m,
          isComplete: m === 100,
        });
      }
    }
    return triggered;
  },

  async resetMilestones(goalId: string): Promise<void> {
    for (const m of this.MILESTONES) {
      await db.settings.delete(`milestone_${goalId}_${m}`);
    }
  },
};
