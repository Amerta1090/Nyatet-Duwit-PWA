import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../schema';
import { seedDatabase } from '../seed';
import { transactionRepo } from '../repositories/transactionRepository';
import { accountRepo } from '../repositories/accountRepository';

beforeAll(async () => {
  await db.open();
  await seedDatabase();
});

afterAll(() => {
  db.close();
});

describe('transactionRepo', () => {
  it('creates an expense transaction and updates balance', async () => {
    const accounts = await accountRepo.getAll(true);
    const account = accounts[0]!;
    const initialBalance = account.balance;

    const tx = await transactionRepo.create({
      type: 'expense',
      amount: 50000,
      categoryId: 'cat-food',
      accountId: account.id,
      date: Date.now(),
      notes: 'Test expense',
    });

    expect(tx.id).toBeDefined();
    expect(tx.type).toBe('expense');
    expect(tx.amount).toBe(50000);

    const updatedAccount = await accountRepo.getById(account.id);
    expect(updatedAccount!.balance).toBe(initialBalance - 50000);

    await transactionRepo.delete(tx.id);
  });

  it('creates an income transaction and updates balance', async () => {
    const accounts = await accountRepo.getAll(true);
    const account = accounts[0]!;
    const initialBalance = account.balance;

    const tx = await transactionRepo.create({
      type: 'income',
      amount: 1000000,
      categoryId: 'cat-salary',
      accountId: account.id,
      date: Date.now(),
    });

    const updatedAccount = await accountRepo.getById(account.id);
    expect(updatedAccount!.balance).toBe(initialBalance + 1000000);

    await transactionRepo.delete(tx.id);
  });

  it('gets all transactions with limit', async () => {
    const account = (await accountRepo.getAll(true))[0]!;

    await transactionRepo.create({ type: 'expense', amount: 10000, categoryId: 'cat-food', accountId: account.id, date: Date.now() });
    await transactionRepo.create({ type: 'expense', amount: 20000, categoryId: 'cat-transport', accountId: account.id, date: Date.now() });

    const txs = await transactionRepo.getAll({ limit: 10 });
    expect(txs.length).toBeGreaterThanOrEqual(2);
  });

  it('searches transactions', async () => {
    const account = (await accountRepo.getAll(true))[0]!;

    await transactionRepo.create({ type: 'expense', amount: 15000, categoryId: 'cat-food', accountId: account.id, date: Date.now(), notes: 'Kopi susu' });

    const results = await transactionRepo.search('kopi');
    expect(results.length).toBeGreaterThanOrEqual(1);
  });

  it('getMonthlyTotals returns aggregated income/expense per month', async () => {
    const accounts = await accountRepo.getAll(true);
    const account = accounts[0]!;
    const now = Date.now();
    const thisMonth = new Date(now).getMonth();
    const thisYear = new Date(now).getFullYear();

    await transactionRepo.create({ type: 'income', amount: 5000000, categoryId: 'cat-salary', accountId: account.id, date: now });
    await transactionRepo.create({ type: 'expense', amount: 250000, categoryId: 'cat-food', accountId: account.id, date: now });

    const totals = await transactionRepo.getMonthlyTotals(3);
    expect(totals.length).toBeLessThanOrEqual(3);
    const current = totals[totals.length - 1]!;
    expect(current.month).toBe(thisMonth);
    expect(current.year).toBe(thisYear);
    expect(current.income).toBeGreaterThan(0);
    expect(current.expense).toBeGreaterThan(0);
  });

  it('deletes transaction and reverses balance', async () => {
    const account = (await accountRepo.getAll(true))[0]!;
    const initialBalance = account.balance;

    const tx = await transactionRepo.create({ type: 'expense', amount: 75000, categoryId: 'cat-food', accountId: account.id, date: Date.now() });
    const afterCreate = await accountRepo.getById(account.id);
    expect(afterCreate!.balance).toBe(initialBalance - 75000);

    await transactionRepo.delete(tx.id);
    const afterDelete = await accountRepo.getById(account.id);
    expect(afterDelete!.balance).toBe(initialBalance);
  });
});
