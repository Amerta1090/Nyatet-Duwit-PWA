import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { db } from '../schema';
import { emergencyFundRepo } from '../repositories/emergencyFundRepository';
import { accountRepo } from '../repositories/accountRepository';
import { transactionRepo } from '../repositories/transactionRepository';
import { generateId } from '@/utils/id';

beforeAll(async () => {
  await db.open();
});

afterAll(() => {
  db.close();
});

beforeEach(async () => {
  await db.accounts.clear();
  await db.transactions.clear();
  await db.settings.clear();
  await db.categories.clear();
  await db.goals.clear();
  await db.debts.clear();
});

describe('emergencyFundRepo', () => {
  it('returns auto target mode by default', async () => {
    const target = await emergencyFundRepo.getTarget();
    expect(target.mode).toBe('auto');
  });

  it('sets and retrieves manual target', async () => {
    await emergencyFundRepo.setTarget(15000000);
    const target = await emergencyFundRepo.getTarget();
    expect(target.mode).toBe('manual');
    expect(target.amount).toBe(15000000);
  });

  it('sets and retrieves auto target', async () => {
    await emergencyFundRepo.setTarget(15000000);
    await emergencyFundRepo.setTarget('auto');
    const target = await emergencyFundRepo.getTarget();
    expect(target.mode).toBe('auto');
  });

  it('calculates recommended amount from 3 months expense', async () => {
    const catId = generateId();
    await db.categories.add({ id: catId, name: 'Test', type: 'expense', icon: 'x', color: '#000', isDefault: false, order: 0, createdAt: Date.now() });
    const accId = generateId();
    await db.accounts.add({ id: accId, name: 'Cash', type: 'cash', balance: 1000000, currency: 'IDR', icon: 'wallet', color: '#000', isPrimary: true, isArchived: false, createdAt: Date.now(), updatedAt: Date.now() });

    const now = Date.now();
    const twoMonthsAgo = now - 60 * 86400000;
    const threeMonthsAgo = now - 90 * 86400000;

    await transactionRepo.create({ type: 'expense', amount: 3000000, categoryId: catId, accountId: accId, date: now });
    await transactionRepo.create({ type: 'expense', amount: 2500000, categoryId: catId, accountId: accId, date: twoMonthsAgo });
    await transactionRepo.create({ type: 'expense', amount: 2000000, categoryId: catId, accountId: accId, date: threeMonthsAgo });

    const recommended = await emergencyFundRepo.calculateRecommendedAmount();
    const monthlyAvg = (3000000 + 2500000 + 2000000) / 3;
    expect(recommended).toBe(Math.round(monthlyAvg * 3));
  });

  it('links account ids', async () => {
    await emergencyFundRepo.setLinkedAccountIds(['acc1', 'acc2']);
    const ids = await emergencyFundRepo.getLinkedAccountIds();
    expect(ids).toEqual(['acc1', 'acc2']);
  });

  it('returns current amount from linked accounts', async () => {
    const acc1 = await accountRepo.create({ name: 'BCA', type: 'bank', balance: 5000000, currency: 'IDR', icon: 'bank', color: '#000', isPrimary: true, isArchived: false });
    const acc2 = await accountRepo.create({ name: 'Cash', type: 'cash', balance: 2000000, currency: 'IDR', icon: 'wallet', color: '#111', isPrimary: false, isArchived: false });

    await emergencyFundRepo.setLinkedAccountIds([acc1.id]);
    let current = await emergencyFundRepo.getCurrentAmount();
    expect(current).toBe(5000000);

    await emergencyFundRepo.setLinkedAccountIds([acc1.id, acc2.id]);
    current = await emergencyFundRepo.getCurrentAmount();
    expect(current).toBe(7000000);
  });

  it('returns all accounts when no linked accounts set', async () => {
    await accountRepo.create({ name: 'BCA', type: 'bank', balance: 5000000, currency: 'IDR', icon: 'bank', color: '#000', isPrimary: true, isArchived: false });
    await accountRepo.create({ name: 'Cash', type: 'cash', balance: 2000000, currency: 'IDR', icon: 'wallet', color: '#111', isPrimary: false, isArchived: false });

    const current = await emergencyFundRepo.getCurrentAmount();
    expect(current).toBe(7000000);
  });

  it('calculates progress percentage', async () => {
    await emergencyFundRepo.setTarget(10000000);
    const accId = generateId();
    await db.accounts.add({ id: accId, name: 'Cash', type: 'cash', balance: 5000000, currency: 'IDR', icon: 'wallet', color: '#000', isPrimary: true, isArchived: false, createdAt: Date.now(), updatedAt: Date.now() });

    await emergencyFundRepo.setLinkedAccountIds([accId]);
    const progress = await emergencyFundRepo.getProgress();
    expect(progress.target).toBe(10000000);
    expect(progress.current).toBe(5000000);
    expect(progress.percent).toBe(50);
  });
});
