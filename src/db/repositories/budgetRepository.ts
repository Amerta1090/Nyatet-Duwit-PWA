import { db } from '../schema';

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

export const budgetRepo = {
  _getMonthRange(now: number): { monthStart: number; monthEnd: number } {
    const d = new Date(now);
    return {
      monthStart: new Date(d.getFullYear(), d.getMonth(), 1).getTime(),
      monthEnd: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999).getTime(),
    };
  },

  async getAll(monthStart?: number, monthEnd?: number): Promise<BudgetSummary[]> {
    const categories = await db.categories.toArray();
    if (!monthStart || !monthEnd) {
      const range = this._getMonthRange(Date.now());
      monthStart = range.monthStart;
      monthEnd = range.monthEnd;
    }
    const txs = await db.transactions.where('date').between(monthStart, monthEnd).toArray();
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

  async getTotalBudget(monthStart?: number, monthEnd?: number): Promise<{ totalBudget: number; totalSpent: number; totalPercent: number }> {
    const budgets = await this.getAll(monthStart, monthEnd);
    const totalBudget = budgets.reduce((s, b) => s + b.limit, 0);
    const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
    return { totalBudget, totalSpent, totalPercent: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0 };
  },

  async getOverspent(monthStart?: number, monthEnd?: number): Promise<BudgetSummary[]> {
    const budgets = await this.getAll(monthStart, monthEnd);
    return budgets.filter((b) => b.status === 'danger');
  },

  async setBudget(categoryId: string, limit: number): Promise<void> {
    await db.categories.update(categoryId, { budgetLimit: limit });
  },

  async removeBudget(categoryId: string): Promise<void> {
    await db.categories.update(categoryId, { budgetLimit: undefined as never });
  },
};