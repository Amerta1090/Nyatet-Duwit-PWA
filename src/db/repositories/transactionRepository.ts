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
}

export interface GetAllOptions {
  limit?: number;
  offset?: number;
  type?: string;
  categoryId?: string;
  accountId?: string;
  dateFrom?: number;
  dateTo?: number;
}

export const transactionRepo = {
  async create(input: CreateTransactionInput): Promise<Transaction> {
    return db.transaction('rw', db.transactions, db.accounts, async () => {
      const now = Date.now();
      const transaction: Transaction = {
        id: generateId(),
        ...input,
        isRecurring: false,
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

    if (options?.limit) {
      return collection.limit(options.limit).toArray();
    }

    return collection.toArray();
  },

  async getByDateRange(from: number, to: number): Promise<Transaction[]> {
    return db.transactions
      .where('date')
      .between(from, to, true, true)
      .reverse()
      .toArray();
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
};
