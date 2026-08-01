import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { db } from '../schema';
import { backupRepo, type BackupData } from '../repositories/backupRepository';

beforeAll(async () => {
  await db.open();
});

afterAll(() => {
  db.close();
});

beforeEach(async () => {
  await db.transaction('rw', [db.accounts, db.transactions, db.categories, db.recurring, db.goals, db.debts, db.tags, db.settings], async () => {
    await Promise.all([
      db.accounts.clear(),
      db.transactions.clear(),
      db.categories.clear(),
      db.recurring.clear(),
      db.goals.clear(),
      db.debts.clear(),
      db.tags.clear(),
      db.settings.clear(),
    ]);
  });
});

describe('backupRepo', () => {
  it('exports debts and tags', async () => {
    await db.debts.add({
      id: 'debt-1',
      type: 'owed',
      personName: 'Budi',
      amount: 50000,
      paidAmount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    await db.tags.add({
      id: 'tag-1',
      name: 'penting',
      color: '#000000',
      createdAt: Date.now(),
    });

    const data = await backupRepo.exportData();
    expect(data.debts).toHaveLength(1);
    expect(data.debts![0]!.personName).toBe('Budi');
    expect(data.tags).toHaveLength(1);
    expect(data.tags![0]!.name).toBe('penting');
  });

  it('imports data including debts and tags', async () => {
    const data: BackupData = {
      version: '1.2',
      exportDate: new Date().toISOString(),
      accounts: [
        {
          id: 'acc-1',
          name: 'Cash',
          type: 'cash',
          balance: 0,
          currency: 'IDR',
          icon: 'wallet',
          color: '#10B981',
          isPrimary: true,
          isArchived: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
      transactions: [],
      categories: [],
      recurring: [],
      goals: [],
      debts: [
        {
          id: 'debt-1',
          type: 'owing',
          personName: 'Andi',
          amount: 10000,
          paidAmount: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
      tags: [
        {
          id: 'tag-1',
          name: 'bisnis',
          color: '#3B82F6',
          createdAt: Date.now(),
        },
      ],
      settings: [],
    };

    const result = await backupRepo.importData(data);
    expect(result.success).toBe(true);
    expect(await db.debts.count()).toBe(1);
    expect(await db.tags.count()).toBe(1);
  });

  it('imports legacy backups without debts and tags', async () => {
    const legacy = {
      version: '1.1',
      exportDate: new Date().toISOString(),
      accounts: [
        {
          id: 'acc-1',
          name: 'Cash',
          type: 'cash',
          balance: 0,
          currency: 'IDR',
          icon: 'wallet',
          color: '#10B981',
          isPrimary: true,
          isArchived: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
      transactions: [],
      categories: [],
      recurring: [],
      goals: [],
      settings: [],
    };

    const result = await backupRepo.importData(legacy);
    expect(result.success).toBe(true);
    expect(await db.accounts.count()).toBe(1);
    expect(await db.debts.count()).toBe(0);
    expect(await db.tags.count()).toBe(0);
  });

  it('rejects invalid files', async () => {
    const result = await backupRepo.importData({ foo: 'bar' });
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
