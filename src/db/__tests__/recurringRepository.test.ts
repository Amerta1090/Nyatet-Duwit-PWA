import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/db';
import { recurringRepo } from '@/db/repositories/recurringRepository';

beforeEach(async () => {
  await db.open();
  await db.recurring.clear();
  await db.transactions.clear();
});

const template = {
  type: 'expense' as const,
  amount: 50000,
  categoryId: 'cat-1',
  accountId: 'acc-1',
  notes: 'Test recurring',
};

const daysAgo = (days: number) => Date.now() - days * 86400000;

describe('recurringRepo', () => {
  it('creates a recurring transaction with defaults', async () => {
    const rec = await recurringRepo.create({
      template,
      frequency: 'monthly',
      startDate: daysAgo(30),
      isActive: true,
    });
    expect(rec.id).toBeTruthy();
    expect(rec.frequency).toBe('monthly');
    expect(rec.isActive).toBe(true);
    expect(rec.lastGenerated).toBeGreaterThan(0);
  });

  it('getAll returns all recurring transactions', async () => {
    await recurringRepo.create({ template, frequency: 'monthly', startDate: Date.now(), isActive: true });
    await recurringRepo.create({ template, frequency: 'weekly', startDate: Date.now(), isActive: true });
    const result = await recurringRepo.getAll();
    expect(result).toHaveLength(2);
  });

  it('getById returns a single recurring transaction', async () => {
    const created = await recurringRepo.create({ template, frequency: 'monthly', startDate: Date.now(), isActive: true });
    const result = await recurringRepo.getById(created.id);
    expect(result?.id).toBe(created.id);
  });

  it('update modifies fields', async () => {
    const created = await recurringRepo.create({ template, frequency: 'monthly', startDate: Date.now(), isActive: true });
    const updated = await recurringRepo.update(created.id, { isActive: false });
    expect(updated.isActive).toBe(false);
  });

  it('delete removes the record', async () => {
    const created = await recurringRepo.create({ template, frequency: 'monthly', startDate: Date.now(), isActive: true });
    await recurringRepo.delete(created.id);
    const result = await recurringRepo.getById(created.id);
    expect(result).toBeUndefined();
  });

  it('generateDue creates transactions for due recurring', async () => {
    await recurringRepo.create({
      template,
      frequency: 'daily',
      startDate: daysAgo(2),
      isActive: true,
    });
    await recurringRepo.generateDue();
    const txs = (await db.transactions.toArray()).filter((t) => t.isRecurring);
    expect(txs.length).toBeGreaterThanOrEqual(1);
    expect(txs[0]?.amount).toBe(50000);
    expect(txs[0]?.recurringId).toBeTruthy();
  });

  it('generateDue skips inactive recurring', async () => {
    await recurringRepo.create({
      template,
      frequency: 'daily',
      startDate: daysAgo(2),
      isActive: false,
    });
    await recurringRepo.generateDue();
    const txs = (await db.transactions.toArray()).filter((t) => t.isRecurring);
    expect(txs).toHaveLength(0);
  });

  it('generateDue updates lastGenerated after creation', async () => {
    const rec = await recurringRepo.create({
      template,
      frequency: 'daily',
      startDate: daysAgo(1),
      isActive: true,
    });
    const old = rec.lastGenerated;
    await recurringRepo.generateDue();
    const updated = await recurringRepo.getById(rec.id);
    expect(updated).toBeDefined();
    expect(updated?.lastGenerated).toBeGreaterThanOrEqual(old!);
  });

  it('generateDue skips recurring with endDate in the past', async () => {
    await recurringRepo.create({
      template,
      frequency: 'daily',
      startDate: daysAgo(30),
      endDate: daysAgo(1),
      isActive: true,
    });
    await recurringRepo.generateDue();
    const txs = (await db.transactions.toArray()).filter((t) => t.isRecurring);
    expect(txs).toHaveLength(0);
  });
});
