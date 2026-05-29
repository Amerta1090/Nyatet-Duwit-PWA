import Dexie, { type Table } from 'dexie';
import type { Account, Transaction, Category, RecurringTransaction, AppSettings } from '@/types';

export class NyatetDuwitDB extends Dexie {
  accounts!: Table<Account, string>;
  transactions!: Table<Transaction, string>;
  categories!: Table<Category, string>;
  recurring!: Table<RecurringTransaction, string>;
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
  }
}

export const db = new NyatetDuwitDB();
