import { db } from '../schema';
import { getCycleRange, isCycleExpired, getNewCycleStart } from '@/utils/budgeting';
import { startOfDay } from 'date-fns';
import { notifyDataChanged } from '@/stores/dataStore';

export interface BudgetSummary {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  limit: number;
  spent: number;
  percent: number;
  status: 'safe' | 'warning' | 'danger';
}

const CYCLE_SETTING_KEY = 'budget_cycle_start';

export const budgetRepo = {
  async getCycleStart(): Promise<number> {
    const setting = await db.settings.get(CYCLE_SETTING_KEY);
    if (setting) {
      return Number(setting.value);
    }
    const now = Date.now();
    await db.settings.put({ key: CYCLE_SETTING_KEY, value: String(now) });
    return startOfDay(now).getTime();
  },

  async setCycleStart(timestamp: number): Promise<void> {
    await db.settings.put({ key: CYCLE_SETTING_KEY, value: String(startOfDay(timestamp).getTime()) });
    notifyDataChanged();
  },

  async ensureActiveCycle(): Promise<{ cycleStart: number; cycleEnd: number; isNew: boolean }> {
    const cycleStart = await this.getCycleStart();
    if (isCycleExpired(cycleStart)) {
      const newStart = getNewCycleStart(cycleStart);
      await this.setCycleStart(newStart);
      const { end } = getCycleRange(newStart);
      return { cycleStart: newStart, cycleEnd: end, isNew: true };
    }
    const { end } = getCycleRange(cycleStart);
    return { cycleStart, cycleEnd: end, isNew: false };
  },

  async getAll(cycleStart?: number, cycleEnd?: number): Promise<BudgetSummary[]> {
    const categories = await db.categories.toArray();
    let start = cycleStart;
    let end = cycleEnd;
    if (!start || !end) {
      const cycle = await this.ensureActiveCycle();
      start = cycle.cycleStart;
      end = cycle.cycleEnd;
    }
    const txs = await db.transactions.where('date').between(start!, end!).toArray();
    const grouped = new Map<string, number>();
    for (const tx of txs) {
      if (tx.type === 'expense') {
        grouped.set(tx.categoryId, (grouped.get(tx.categoryId) ?? 0) + tx.amount);
      }
    }
    return categories.filter((c) => c.budgetLimit && c.type === 'expense').map((cat) => {
      const spent = grouped.get(cat.id!) ?? 0;
      const limit = cat.budgetLimit!;
      const percent = limit > 0 ? Math.round((spent / limit) * 100) : 0;
      return {
        categoryId: cat.id!,
        categoryName: cat.name,
        categoryIcon: cat.icon,
        categoryColor: cat.color,
        limit,
        spent,
        percent,
        status: percent < 75 ? 'safe' : percent < 100 ? 'warning' : 'danger',
      };
    });
  },

  async getTotalBudget(cycleStart?: number, cycleEnd?: number): Promise<{ totalBudget: number; totalSpent: number; totalPercent: number }> {
    const budgets = await this.getAll(cycleStart, cycleEnd);
    const totalBudget = budgets.reduce((s, b) => s + b.limit, 0);
    const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
    return { totalBudget, totalSpent, totalPercent: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0 };
  },

  async getOverspent(cycleStart?: number, cycleEnd?: number): Promise<BudgetSummary[]> {
    const budgets = await this.getAll(cycleStart, cycleEnd);
    return budgets.filter((b) => b.status === 'danger');
  },

  async setBudget(categoryId: string, limit: number): Promise<void> {
    await db.categories.update(categoryId, { budgetLimit: limit });
    notifyDataChanged();
  },

  async removeBudget(categoryId: string): Promise<void> {
    await db.categories.update(categoryId, { budgetLimit: undefined as never });
    notifyDataChanged();
  },
};
