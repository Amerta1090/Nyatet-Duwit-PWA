import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { db } from '../schema';
import { hasRealData } from '../backup/detect';

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

describe('hasRealData', () => {
  it('returns false for an empty database', async () => {
    expect(await hasRealData()).toBe(false);
  });

  it('returns true when there are transactions', async () => {
    await db.accounts.add({
      id: 'acc-1',
      name: 'Cash',
      type: 'cash',
      balance: 1000,
      currency: 'IDR',
      icon: 'wallet',
      color: '#10B981',
      isPrimary: true,
      isArchived: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    await db.transactions.add({
      id: 'tx-1',
      type: 'expense',
      amount: 1000,
      categoryId: 'cat-1',
      accountId: 'acc-1',
      date: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      synced: false,
    });
    expect(await hasRealData()).toBe(true);
  });

  it('returns true when there are multiple accounts', async () => {
    await db.accounts.bulkAdd([
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
      {
        id: 'acc-2',
        name: 'Bank',
        type: 'bank',
        balance: 0,
        currency: 'IDR',
        icon: 'banknote',
        color: '#3B82F6',
        isPrimary: false,
        isArchived: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ]);
    expect(await hasRealData()).toBe(true);
  });

  it('returns true when there is a custom category', async () => {
    await db.categories.add({
      id: 'cat-1',
      name: 'Kustom',
      type: 'expense',
      icon: 'tag',
      color: '#000000',
      isDefault: false,
      order: 0,
      createdAt: Date.now(),
    });
    expect(await hasRealData()).toBe(true);
  });

  it('returns false for default seed data only', async () => {
    await db.categories.add({
      id: 'cat-1',
      name: 'Makan',
      type: 'expense',
      icon: 'tag',
      color: '#000000',
      isDefault: true,
      order: 0,
      createdAt: Date.now(),
    });
    await db.accounts.add({
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
    });
    expect(await hasRealData()).toBe(false);
  });
});
