import { db } from '../schema';
import type { Goal } from '@/types';
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

  async create(input: { name: string; targetAmount: number; icon: string; color: string; deadline?: number }): Promise<Goal> {
    const now = Date.now();
    const goal: Goal = {
      id: generateId(),
      name: input.name,
      targetAmount: input.targetAmount,
      currentAmount: 0,
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

  async addProgress(id: string, amount: number): Promise<Goal> {
    const goal = await db.goals.get(id);
    if (!goal) throw new Error('Goal not found');
    const newAmount = goal.currentAmount + amount;
    return this.update(id, { currentAmount: Math.max(0, newAmount) });
  },

  getProgressPercent(goal: Goal): number {
    if (goal.targetAmount <= 0) return 0;
    return Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
  },

  getProgressColor(goal: Goal): string {
    const percent = this.getProgressPercent(goal);
    if (percent >= 80) return '#EF4444';
    if (percent >= 50) return '#F59E0B';
    return '#10B981';
  },

  async getEstimatedCompletion(goal: Goal): Promise<number | null> {
    if (goal.currentAmount <= 0 || !goal.deadline) return null;
    const daysSinceCreation = Math.max(1, Math.floor((Date.now() - goal.createdAt) / 86400000));
    const avgDaily = goal.currentAmount / daysSinceCreation;
    if (avgDaily <= 0) return null;
    const remaining = goal.targetAmount - goal.currentAmount;
    const daysRemaining = Math.ceil(remaining / avgDaily);
    return Date.now() + daysRemaining * 86400000;
  },

  async getTotalProgress(): Promise<{ totalTarget: number; totalCurrent: number; totalPercent: number; goalCount: number }> {
    const goals = await this.getAll();
    const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
    const totalCurrent = goals.reduce((s, g) => s + g.currentAmount, 0);
    return {
      totalTarget,
      totalCurrent,
      totalPercent: totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0,
      goalCount: goals.length,
    };
  },

  async getTopGoals(limit: number = 3): Promise<Goal[]> {
    const goals = await this.getAll();
    return goals
      .sort((a, b) => this.getProgressPercent(b) - this.getProgressPercent(a))
      .slice(0, limit);
  },

  async getNearestDeadline(): Promise<Goal | null> {
    const goals = (await this.getAll()).filter((g) => g.deadline && g.currentAmount < g.targetAmount);
    if (goals.length === 0) return null;
    return goals.sort((a, b) => (a.deadline ?? Infinity) - (b.deadline ?? Infinity))[0]!;
  },

  MILESTONES: [25, 50, 75, 100] as const,

  async checkMilestones(goal: Goal): Promise<GoalMilestone[]> {
    const percent = this.getProgressPercent(goal);
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
