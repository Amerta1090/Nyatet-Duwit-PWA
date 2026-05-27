import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../schema';
import { seedDatabase } from '../seed';
import { accountRepo } from '../repositories/accountRepository';

beforeAll(async () => {
  await db.open();
  await seedDatabase();
});

afterAll(() => {
  db.close();
});

describe('accountRepo', () => {
  it('returns all active accounts', async () => {
    const accounts = await accountRepo.getAll(true);
    expect(accounts.length).toBeGreaterThanOrEqual(1);
    expect(accounts.every((a) => !a.isArchived)).toBe(true);
  });

  it('returns primary account', async () => {
    const primary = await accountRepo.getPrimary();
    expect(primary).toBeDefined();
    expect(primary!.isPrimary).toBe(true);
  });

  it('creates an account', async () => {
    const acc = await accountRepo.create({
      name: 'Test Bank',
      type: 'bank',
      balance: 0,
      currency: 'IDR',
      icon: 'banknote',
      color: '#3B82F6',
      isPrimary: false,
      isArchived: false,
    });
    expect(acc.id).toBeDefined();
    expect(acc.name).toBe('Test Bank');
  });

  it('updates balance correctly', async () => {
    const acc = (await accountRepo.getAll(true))[0]!;
    const updated = await accountRepo.updateBalance(acc.id, 1000000);
    expect(updated.balance).toBe(1000000);
  });

  it('archives an account', async () => {
    const acc = (await accountRepo.getAll(true))[0]!;
    await accountRepo.archive(acc.id);
    const archived = await accountRepo.getById(acc.id);
    expect(archived!.isArchived).toBe(true);
  });

  it('reconcileAll recalculates balances', async () => {
    const results = await accountRepo.reconcileAll();
    expect(Array.isArray(results)).toBe(true);
    results.forEach((r) => {
      expect(typeof r.diff).toBe('number');
    });
  });
});