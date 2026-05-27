import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/db';
import { budgetRepo } from '@/db/repositories/budgetRepository';

beforeEach(async () => {
  await db.open();
  await db.transactions.clear();
  await db.categories.clear();
});

const makeCat = (overrides: Record<string, unknown>) => ({
  id: '',
  name: '',
  icon: 'circle',
  color: '#000',
  type: 'expense' as const,
  isDefault: false,
  order: 0,
  createdAt: Date.now(),
  ...overrides,
});

const makeTx = (overrides: Record<string, unknown>) => ({
  id: '',
  type: 'expense' as const,
  amount: 0,
  categoryId: '',
  accountId: '',
  date: Date.now(),
  createdAt: Date.now(),
  updatedAt: Date.now(),
  synced: false,
  ...overrides,
});

describe('budgetRepo', () => {
  it('returns empty array when no categories have budget', async () => {
    await db.categories.bulkAdd([
      makeCat({ id: 'cat-1', name: 'Makanan' }),
      makeCat({ id: 'cat-2', name: 'Transport' }),
    ]);
    const result = await budgetRepo.getAll();
    expect(result).toHaveLength(0);
  });

  it('returns budgets only for expense categories with budgetLimit', async () => {
    await db.categories.bulkAdd([
      makeCat({ id: 'cat-1', name: 'Makanan', budgetLimit: 500000 }),
      makeCat({ id: 'cat-2', name: 'Gaji', type: 'income', budgetLimit: 1000000 }),
    ]);
    const result = await budgetRepo.getAll();
    expect(result).toHaveLength(1);
    expect(result[0]?.categoryId).toBe('cat-1');
  });

  it('calculates spent amount from transactions', async () => {
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
    await db.categories.add(makeCat({ id: 'cat-1', name: 'Makanan', budgetLimit: 500000 }));
    await db.transactions.bulkAdd([
      makeTx({ id: 'tx-1', amount: 100000, categoryId: 'cat-1', accountId: 'acc-1', date: monthStart + 1000 }),
      makeTx({ id: 'tx-2', amount: 50000, categoryId: 'cat-1', accountId: 'acc-1', date: monthStart + 2000 }),
    ]);
    const result = await budgetRepo.getAll();
    expect(result[0]?.spent).toBe(150000);
    expect(result[0]?.percent).toBe(30);
  });

  it('marks status danger when over 100%', async () => {
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
    await db.categories.add(makeCat({ id: 'cat-1', name: 'Makanan', budgetLimit: 100000 }));
    await db.transactions.add(makeTx({ id: 'tx-1', amount: 150000, categoryId: 'cat-1', accountId: 'acc-1', date: monthStart + 1000 }));
    const result = await budgetRepo.getAll();
    expect(result[0]?.status).toBe('danger');
  });

  it('marks status warning between 75-100%', async () => {
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
    await db.categories.add(makeCat({ id: 'cat-1', name: 'Makanan', budgetLimit: 100000 }));
    await db.transactions.add(makeTx({ id: 'tx-1', amount: 80000, categoryId: 'cat-1', accountId: 'acc-1', date: monthStart + 1000 }));
    const result = await budgetRepo.getAll();
    expect(result[0]?.status).toBe('warning');
  });

  it('getTotalBudget returns aggregate totals', async () => {
    await db.categories.bulkAdd([
      makeCat({ id: 'cat-1', name: 'Makanan', budgetLimit: 500000 }),
      makeCat({ id: 'cat-2', name: 'Belanja', budgetLimit: 300000 }),
    ]);
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
    await db.transactions.bulkAdd([
      makeTx({ id: 'tx-1', amount: 100000, categoryId: 'cat-1', accountId: 'acc-1', date: monthStart + 1000 }),
      makeTx({ id: 'tx-2', amount: 50000, categoryId: 'cat-2', accountId: 'acc-1', date: monthStart + 2000 }),
    ]);
    const result = await budgetRepo.getTotalBudget();
    expect(result.totalBudget).toBe(800000);
    expect(result.totalSpent).toBe(150000);
  });

  it('setBudget updates category budgetLimit', async () => {
    await db.categories.add(makeCat({ id: 'cat-1', name: 'Makanan' }));
    await budgetRepo.setBudget('cat-1', 500000);
    const cat = await db.categories.get('cat-1');
    expect(cat?.budgetLimit).toBe(500000);
  });

  it('removeBudget clears category budgetLimit', async () => {
    await db.categories.add(makeCat({ id: 'cat-1', name: 'Makanan', budgetLimit: 500000 }));
    await budgetRepo.removeBudget('cat-1');
    const cat = await db.categories.get('cat-1');
    expect(cat?.budgetLimit).toBeUndefined();
  });

  it('getOverspent returns only danger budgets', async () => {
    await db.categories.bulkAdd([
      makeCat({ id: 'cat-1', name: 'Makanan', budgetLimit: 100000 }),
      makeCat({ id: 'cat-2', name: 'Belanja', budgetLimit: 500000 }),
    ]);
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
    await db.transactions.bulkAdd([
      makeTx({ id: 'tx-1', amount: 150000, categoryId: 'cat-1', accountId: 'acc-1', date: monthStart + 1000 }),
      makeTx({ id: 'tx-2', amount: 100000, categoryId: 'cat-2', accountId: 'acc-1', date: monthStart + 2000 }),
    ]);
    const result = await budgetRepo.getOverspent();
    expect(result).toHaveLength(1);
    expect(result[0]?.categoryId).toBe('cat-1');
  });
});
