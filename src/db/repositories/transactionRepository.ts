import { db } from '../schema';
import type { Transaction } from '@/types';
import { generateId } from '@/utils/id';

export interface CreateTransactionInput {
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  categoryId: string;
  accountId: string;
  toAccountId?: string;
  date: number;
  notes?: string;
  tags?: string[];
  goalId?: string;
}

export interface GetAllOptions {
  limit?: number;
  offset?: number;
  type?: string;
  categoryId?: string;
  accountId?: string;
  dateFrom?: number;
  dateTo?: number;
  tagIds?: string[];
}

export const transactionRepo = {
  async create(input: CreateTransactionInput): Promise<Transaction> {
    return db.transaction('rw', db.transactions, db.accounts, async () => {
      const now = Date.now();
      const transaction: Transaction = {
        id: generateId(),
        ...input,
        isRecurring: false,
        sortOrder: now,
        createdAt: now,
        updatedAt: now,
        synced: false,
      };

      await db.transactions.add(transaction);

      const account = await db.accounts.get(input.accountId);
      if (account) {
        const delta = input.type === 'income' ? input.amount : -input.amount;
        await db.accounts.update(input.accountId, { balance: account.balance + delta, updatedAt: now });
      }

      if (input.type === 'transfer' && input.toAccountId) {
        const toAccount = await db.accounts.get(input.toAccountId);
        if (toAccount) {
          await db.accounts.update(input.toAccountId, { balance: toAccount.balance + input.amount, updatedAt: now });
        }
      }

      return transaction;
    });
  },

  async getById(id: string): Promise<Transaction | undefined> {
    return db.transactions.get(id);
  },

  async getAll(options?: GetAllOptions): Promise<Transaction[]> {
    let collection = db.transactions
      .orderBy('date')
      .reverse()
      .filter(() => true);

    if (options?.type && options.type !== 'all') {
      const type = options.type;
      collection = collection.filter((t) => t.type === type);
    }
    if (options?.categoryId) {
      const catId = options.categoryId;
      collection = collection.filter((t) => t.categoryId === catId);
    }
    if (options?.accountId) {
      const accId = options.accountId;
      collection = collection.filter((t) => t.accountId === accId || t.toAccountId === accId);
    }
    if (options?.dateFrom !== undefined) {
      const from = options.dateFrom;
      collection = collection.filter((t) => t.date >= from);
    }
    if (options?.dateTo !== undefined) {
      const to = options.dateTo;
      collection = collection.filter((t) => t.date <= to);
    }
    if (options?.tagIds && options.tagIds.length > 0) {
      const ids = options.tagIds;
      collection = collection.filter((t) => ids.every((id) => t.tags?.includes(id)));
    }

    const results = await collection.toArray();

    results.sort((a, b) => {
      const dc = b.date - a.date;
      if (dc !== 0) return dc;
      return (b.sortOrder ?? b.createdAt) - (a.sortOrder ?? a.createdAt);
    });

    if (options?.limit) {
      return results.slice(0, options.limit);
    }

    return results;
  },

  async getByDateRange(from: number, to: number): Promise<Transaction[]> {
    const txs = await db.transactions
      .where('date')
      .between(from, to, true, true)
      .reverse()
      .toArray();

    txs.sort((a, b) => {
      const dc = b.date - a.date;
      if (dc !== 0) return dc;
      return (b.sortOrder ?? b.createdAt) - (a.sortOrder ?? a.createdAt);
    });

    return txs;
  },

  async getByMonth(year: number, month: number): Promise<Transaction[]> {
    const from = new Date(year, month, 1).getTime();
    const to = new Date(year, month + 1, 0, 23, 59, 59).getTime();
    return this.getByDateRange(from, to);
  },

  async search(query: string, categories?: { id: string; name: string }[]): Promise<Transaction[]> {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const all = await db.transactions.toArray();
    const categoryIdsByName = categories
      ? categories.filter((c) => c.name.toLowerCase().includes(q)).map((c) => c.id)
      : [];
    return all.filter(
      (t) =>
        t.notes?.toLowerCase().includes(q) ||
        String(t.amount).includes(q) ||
        categoryIdsByName.includes(t.categoryId),
    );
  },

  async update(id: string, data: Partial<Transaction>): Promise<Transaction> {
    return db.transaction('rw', db.transactions, db.accounts, async () => {
      const old = await db.transactions.get(id);
      if (!old) throw new Error('Transaction not found');

      const now = Date.now();

      if (data.amount !== undefined || data.type !== undefined || data.accountId !== undefined || data.toAccountId !== undefined) {
        if (old.type !== 'transfer') {
          const oldAccount = await db.accounts.get(old.accountId);
          if (oldAccount) {
            const reversal = old.type === 'income' ? -old.amount : old.amount;
            await db.accounts.update(old.accountId, { balance: oldAccount.balance + reversal, updatedAt: now });
          }
        }

        const newType = data.type || old.type;
        const newAccountId = data.accountId || old.accountId;
        const newAmount = data.amount ?? old.amount;

        if (newType !== 'transfer') {
          const newAccount = await db.accounts.get(newAccountId);
          if (newAccount) {
            const delta = newType === 'income' ? newAmount : -newAmount;
            await db.accounts.update(newAccountId, { balance: newAccount.balance + delta, updatedAt: now });
          }
        }
      }

      await db.transactions.update(id, { ...data, updatedAt: now });
      const updated = await db.transactions.get(id);
      if (!updated) throw new Error('Transaction not found after update');
      return updated;
    });
  },

  async delete(id: string): Promise<void> {
    return db.transaction('rw', db.transactions, db.accounts, async () => {
      const old = await db.transactions.get(id);
      if (!old) return;

      const now = Date.now();

      if (old.type === 'transfer') {
        const srcAccount = await db.accounts.get(old.accountId);
        if (srcAccount) {
          await db.accounts.update(old.accountId, { balance: srcAccount.balance + old.amount, updatedAt: now });
        }
        const dstAccount = old.toAccountId ? await db.accounts.get(old.toAccountId) : undefined;
        if (dstAccount) {
          await db.accounts.update(old.toAccountId!, { balance: dstAccount.balance - old.amount, updatedAt: now });
        }
      } else {
        const account = await db.accounts.get(old.accountId);
        if (account) {
          const delta = old.type === 'income' ? -old.amount : old.amount;
          await db.accounts.update(old.accountId, { balance: account.balance + delta, updatedAt: now });
        }
      }

      await db.transactions.delete(id);
    });
  },

  async getTotalByType(type: 'income' | 'expense', dateFrom: number, dateTo: number): Promise<number> {
    const txs = await this.getByDateRange(dateFrom, dateTo);
    return txs
      .filter((t) => t.type === type)
      .reduce((sum, t) => sum + t.amount, 0);
  },

  async getTotalByCategory(dateFrom: number, dateTo: number): Promise<{ categoryId: string; total: number }[]> {
    const txs = await this.getByDateRange(dateFrom, dateTo);
    const grouped = new Map<string, number>();

    for (const tx of txs) {
      const current = grouped.get(tx.categoryId) ?? 0;
      grouped.set(tx.categoryId, current + tx.amount);
    }

    return Array.from(grouped.entries()).map(([categoryId, total]) => ({
      categoryId,
      total,
    }));
  },

  async getDailySpending(dateFrom: number, dateTo: number): Promise<{ date: number; total: number }[]> {
    const txs = await this.getByDateRange(dateFrom, dateTo);
    const grouped = new Map<number, number>();

    for (const tx of txs) {
      if (tx.type === 'expense') {
        const current = grouped.get(tx.date) ?? 0;
        grouped.set(tx.date, current + tx.amount);
      }
    }

    return Array.from(grouped.entries()).map(([date, total]) => ({
      date,
      total,
    }));
  },

  async getWeeklySummary(dateFrom: number, dateTo: number): Promise<{
    totalExpense: number;
    totalIncome: number;
    topCategories: { categoryId: string; total: number }[];
    transactionCount: number;
  }> {
    const txs = await this.getByDateRange(dateFrom, dateTo);
    const totalExpense = txs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const totalIncome = txs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);

    const catMap = new Map<string, number>();
    for (const tx of txs) {
      if (tx.type === 'expense') {
        catMap.set(tx.categoryId, (catMap.get(tx.categoryId) ?? 0) + tx.amount);
      }
    }
    const topCategories = Array.from(catMap.entries())
      .map(([categoryId, total]) => ({ categoryId, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);

    return { totalExpense, totalIncome, topCategories, transactionCount: txs.length };
  },

  async getMonthlyTotals(
    months: number,
  ): Promise<{ month: number; year: number; income: number; expense: number }[]> {
    const now = new Date();
    const endDate = now.getTime();
    const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1).getTime();

    const allTxs = await db.transactions
      .where('date')
      .between(startDate, endDate, true, true)
      .toArray();

    const monthIndex = (ts: number) => {
      const d = new Date(ts);
      return d.getFullYear() * 12 + d.getMonth();
    };
    const startIdx = monthIndex(startDate);
    const endIdx = monthIndex(endDate);

    const grouped = new Map<number, { income: number; expense: number }>();
    for (let i = startIdx; i <= endIdx; i++) {
      grouped.set(i, { income: 0, expense: 0 });
    }

    for (const tx of allTxs) {
      const idx = monthIndex(tx.date);
      const bucket = grouped.get(idx);
      if (bucket) {
        if (tx.type === 'income') bucket.income += tx.amount;
        else if (tx.type === 'expense') bucket.expense += tx.amount;
      }
    }

    return Array.from(grouped.entries()).map(([idx, val]) => ({
      month: idx % 12,
      year: Math.floor(idx / 12),
      income: val.income,
      expense: val.expense,
    }));
  },

  async getMonthlyComparison(year: number, month: number): Promise<{
    income: number;
    expense: number;
    prevIncome: number;
    prevExpense: number;
    transactionCount: number;
    dailyAvg: number;
    highestDay: { date: number; amount: number };
    streakDays: number;
  }> {
    const range = (() => {
      const start = new Date(year, month, 1).getTime();
      const end = new Date(year, month + 1, 0, 23, 59, 59).getTime();
      return { start, end };
    })();

    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const prevRange = (() => {
      const start = new Date(prevYear, prevMonth, 1).getTime();
      const end = new Date(prevYear, prevMonth + 1, 0, 23, 59, 59).getTime();
      return { start, end };
    })();

    const [txs, prevTxs] = await Promise.all([
      this.getByDateRange(range.start, range.end),
      this.getByDateRange(prevRange.start, prevRange.end),
    ]);

    const income = txs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = txs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const prevIncome = prevTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const prevExpense = prevTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dailyAvg = daysInMonth > 0 ? expense / daysInMonth : 0;

    const dayMap = new Map<number, number>();
    for (const tx of txs) {
      if (tx.type === 'expense') {
        dayMap.set(tx.date, (dayMap.get(tx.date) ?? 0) + tx.amount);
      }
    }
    let highestDay = { date: 0, amount: 0 };
    for (const [date, amount] of dayMap) {
      if (amount > highestDay.amount) highestDay = { date, amount };
    }

    const allTxs30 = await db.transactions
      .where('date')
      .above(Date.now() - 30 * 86400000)
      .toArray();
    const activeDays = new Set<number>();
    for (const tx of allTxs30) {
      activeDays.add(tx.date);
    }
    const sortedDays = Array.from(activeDays).sort((a, b) => b - a);
    let streakDays = 0;
    if (sortedDays.length > 0) {
      const today = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); })();
      const yesterday = today - 86400000;
      if (sortedDays[0]! >= yesterday) {
        for (let i = 0; i < sortedDays.length; i++) {
          const expected = today - i * 86400000;
          if (sortedDays[i] === expected) streakDays++;
          else break;
        }
      }
    }

    return {
      income, expense, prevIncome, prevExpense,
      transactionCount: txs.length,
      dailyAvg: Math.round(dailyAvg),
      highestDay,
      streakDays,
    };
  },
};
