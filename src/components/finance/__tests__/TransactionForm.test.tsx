import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '@/db/schema';
import { seedDatabase } from '@/db/seed';
import { accountRepo } from '@/db/repositories/accountRepository';
import { transactionRepo } from '@/db/repositories/transactionRepository';

beforeAll(async () => {
  await db.open();
  await seedDatabase();
});

afterAll(() => {
  db.close();
});

describe('TransactionForm - repository integration', () => {
  it('creates expense transaction and updates account balance', async () => {
    const accounts = await accountRepo.getAll(true);
    const account = accounts[0]!;
    const initialBalance = account.balance;

    const tx = await transactionRepo.create({
      type: 'expense',
      amount: 25000,
      categoryId: 'cat-food',
      accountId: account.id,
      date: Date.now(),
      notes: 'Test transaction',
    });

    expect(tx.id).toBeDefined();
    expect(tx.type).toBe('expense');
    expect(tx.amount).toBe(25000);

    const updated = await accountRepo.getById(account.id);
    expect(updated!.balance).toBe(initialBalance - 25000);

    await transactionRepo.delete(tx.id);
  });

  it('creates income transaction and updates balance', async () => {
    const accounts = await accountRepo.getAll(true);
    const account = accounts[0]!;
    const initial = account.balance;

    const tx = await transactionRepo.create({
      type: 'income',
      amount: 500000,
      categoryId: 'cat-salary',
      accountId: account.id,
      date: Date.now(),
    });

    const updated = await accountRepo.getById(account.id);
    expect(updated!.balance).toBe(initial + 500000);

    await transactionRepo.delete(tx.id);
  });

  it('creates transfer between accounts', async () => {
    const accounts = await accountRepo.getAll(true);
    if (accounts.length < 2) return;
    const from = accounts[0]!;
    const to = accounts[1]!;

    await transactionRepo.create({
      type: 'transfer',
      amount: 100000,
      categoryId: 'cat-other-expense',
      accountId: from.id,
      toAccountId: to.id,
      date: Date.now(),
    });

    const fromAcc = await accountRepo.getById(from.id);
    expect(fromAcc!.balance).toBe(from.balance - 100000);
  });

  it('handles empty state gracefully', async () => {
    const txs = await transactionRepo.getAll({});
    expect(Array.isArray(txs)).toBe(true);
  });
});