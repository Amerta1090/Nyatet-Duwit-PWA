import { db } from '../schema';
import type { Account } from '@/types';
import { generateId } from '@/utils/id';

type CreateAccountInput = Omit<Account, 'id' | 'createdAt' | 'updatedAt'>;

export const accountRepo = {
  async getAll(activeOnly = false): Promise<Account[]> {
    let accounts = await db.accounts.toArray();
    if (activeOnly) {
      accounts = accounts.filter((a) => !a.isArchived);
    }
    return accounts
      .filter((a) => a.type !== 'goal')
      .sort((a) => (a.isPrimary ? -1 : 0));
  },

  async getById(id: string): Promise<Account | undefined> {
    return db.accounts.get(id);
  },

  async getPrimary(): Promise<Account | undefined> {
    const all = await db.accounts.toArray();
    return all.find((a) => a.isPrimary);
  },

  async create(input: CreateAccountInput): Promise<Account> {
    const now = Date.now();
    const account: Account = {
      id: generateId(),
      ...input,
      createdAt: now,
      updatedAt: now,
    };

    if (input.isPrimary) {
      const all = await db.accounts.toArray();
      const primary = all.find((a) => a.isPrimary);
      if (primary) {
        await db.accounts.update(primary.id, { isPrimary: false, updatedAt: now });
      }
    }

    await db.accounts.add(account);

    // Catat saldo awal sebagai transaksi income agar selalu konsisten
    if (account.balance > 0) {
      await db.transactions.add({
        id: generateId(),
        type: 'income',
        amount: account.balance,
        categoryId: 'cat-other-income',
        accountId: account.id,
        date: now,
        notes: 'Saldo awal',
        createdAt: now,
        updatedAt: now,
        synced: false,
      });
    }

    return account;
  },

  async update(id: string, data: Partial<Account>): Promise<Account> {
    const now = Date.now();

    if (data.isPrimary) {
      const all = await db.accounts.toArray();
      const primary = all.find((a) => a.isPrimary);
      if (primary) {
        await db.accounts.update(primary.id, { isPrimary: false, updatedAt: now });
      }
    }

    await db.accounts.update(id, { ...data, updatedAt: now });
    const updated = await db.accounts.get(id);
    if (!updated) throw new Error('Account not found after update');
    return updated;
  },

  async updateBalance(id: string, newBalance: number): Promise<Account> {
    const now = Date.now();
    await db.accounts.update(id, { balance: newBalance, updatedAt: now });
    const updated = await db.accounts.get(id);
    if (!updated) throw new Error('Account not found');
    return updated;
  },

  async getTotalBalance(): Promise<number> {
    const accounts = await this.getAll(true);
    return accounts.reduce((sum, a) => sum + a.balance, 0);
  },

  async archive(id: string): Promise<void> {
    await db.accounts.update(id, { isArchived: true, updatedAt: Date.now() });
  },

  async reconcileAll(): Promise<{ accountId: string; name: string; expected: number; actual: number; diff: number }[]> {
    return db.transaction('rw', db.accounts, db.transactions, async () => {
      const accounts = await db.accounts.toArray();
      const transactions = await db.transactions.toArray();
      const results: { accountId: string; name: string; expected: number; actual: number; diff: number }[] = [];

      for (const account of accounts) {
        let expected = 0;
        for (const tx of transactions) {
          if (tx.type === 'income' && tx.accountId === account.id) {
            expected += tx.amount;
          } else if (tx.type === 'expense' && tx.accountId === account.id) {
            expected -= tx.amount;
          } else if (tx.type === 'transfer') {
            if (tx.accountId === account.id) expected -= tx.amount;
            if (tx.toAccountId === account.id) expected += tx.amount;
          }
        }
        const actual = account.balance;
        const diff = actual - expected;
        results.push({ accountId: account.id, name: account.name, expected, actual, diff });
        // Selalu reset balance sesuai hitungan transaksi
        if (diff !== 0) {
          await db.accounts.update(account.id, { balance: expected, updatedAt: Date.now() });
        }
      }

      return results;
    });
  },
};
