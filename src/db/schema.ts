import Dexie, { type Table } from 'dexie';
import type { Account, Transaction, Category, RecurringTransaction, Goal, Debt, Tag, AppSettings } from '@/types';

export class NyatetDuwitDB extends Dexie {
  accounts!: Table<Account, string>;
  transactions!: Table<Transaction, string>;
  categories!: Table<Category, string>;
  recurring!: Table<RecurringTransaction, string>;
  goals!: Table<Goal, string>;
  debts!: Table<Debt, string>;
  tags!: Table<Tag, string>;
  settings!: Table<AppSettings, string>;

  constructor() {
    super('nyatetduwit');
    this.version(1).stores({
      accounts: 'id, isPrimary, isArchived',
      transactions: 'id, type, categoryId, accountId, date, isRecurring, synced',
      categories: 'id, type, isDefault',
      recurring: 'id, frequency, isActive, lastGenerated',
      settings: 'key',
    });
    this.version(2).stores({
      accounts: 'id, isPrimary, isArchived',
      transactions: 'id, type, categoryId, accountId, date, isRecurring, synced',
      categories: 'id, type, isDefault, order',
      recurring: 'id, frequency, isActive, lastGenerated',
      settings: 'key',
    });
    this.version(3).stores({
      accounts: 'id, isPrimary, isArchived',
      transactions: 'id, type, categoryId, accountId, date, isRecurring, synced',
      categories: 'id, type, isDefault, order',
      recurring: 'id, frequency, isActive, lastGenerated',
      goals: 'id',
      settings: 'key',
    });
    this.version(4).stores({
      accounts: 'id, isPrimary, isArchived',
      transactions: 'id, type, categoryId, accountId, date, isRecurring, synced',
      categories: 'id, type, isDefault, order',
      recurring: 'id, frequency, isActive, lastGenerated',
      goals: 'id',
      debts: 'id, type, dueDate',
      settings: 'key',
    });
    this.version(5).stores({
      accounts: 'id, isPrimary, isArchived',
      transactions: 'id, type, categoryId, accountId, date, isRecurring, synced',
      categories: 'id, type, isDefault, order',
      recurring: 'id, frequency, isActive, lastGenerated',
      goals: 'id',
      debts: 'id, type, dueDate',
      tags: 'id',
      settings: 'key',
    });
  }
}

export const db = new NyatetDuwitDB();
