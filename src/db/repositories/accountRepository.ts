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
    return accounts.sort((a) => (a.isPrimary ? -1 : 0));
  },

  async getById(id: string): Promise<Account | undefined> {
    return db.accounts.get(id);
  },

  async getPrimary(): Promise<Account | undefined> {
    return db.accounts.where('isPrimary').equals(1).first();
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
      await db.accounts.where('isPrimary').equals(1).modify({ isPrimary: false });
    }

    await db.accounts.add(account);
    return account;
  },

  async update(id: string, data: Partial<Account>): Promise<Account> {
    const now = Date.now();

    if (data.isPrimary) {
      await db.accounts.where('isPrimary').equals(1).modify({ isPrimary: false });
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
};
