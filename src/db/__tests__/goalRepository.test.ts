import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { db } from '../schema';
import { goalRepo } from '../repositories/goalRepository';
import { generateId } from '@/utils/id';

beforeAll(async () => {
  await db.open();
});

afterAll(() => {
  db.close();
});

beforeEach(async () => {
  await db.goals.clear();
  await db.accounts.clear();
  await db.transactions.clear();
  await db.settings.clear();
});

describe('goalRepo', () => {
  it('creates a goal', async () => {
    const goal = await goalRepo.create({
      name: 'Liburan Bali',
      targetAmount: 5000000,
      icon: 'plane',
      color: '#3B82F6',
    });
    expect(goal.id).toBeDefined();
    expect(goal.name).toBe('Liburan Bali');
    expect(goal.targetAmount).toBe(5000000);
    expect(goal.accountId).toBeUndefined();
    expect(goal.deadline).toBeUndefined();
  });

  it('gets all goals', async () => {
    await goalRepo.create({ name: 'Laptop Baru', targetAmount: 10000000, icon: 'laptop', color: '#10B981' });
    const goals = await goalRepo.getAll();
    expect(goals.length).toBeGreaterThanOrEqual(1);
  });

  it('gets goal by id', async () => {
    const goal = await goalRepo.create({ name: 'Test', targetAmount: 100000, icon: 'home', color: '#000' });
    const found = await goalRepo.getById(goal.id);
    expect(found).toBeDefined();
    expect(found!.name).toBe('Test');
  });

  it('updates a goal', async () => {
    const goal = await goalRepo.create({ name: 'Update Me', targetAmount: 100000, icon: 'star', color: '#fff' });
    const updated = await goalRepo.update(goal.id, { name: 'Updated', targetAmount: 200000 });
    expect(updated.name).toBe('Updated');
    expect(updated.targetAmount).toBe(200000);
  });

  it('gets current amount from total non-goal account balance', async () => {
    const goal = await goalRepo.create({ name: 'Test', targetAmount: 100000, icon: 'gift', color: '#333' });

    // No accounts → 0
    expect(await goalRepo.getCurrentAmount(goal)).toBe(0);

    // Add a cash account with balance
    const accId = generateId();
    await db.accounts.add({ id: accId, name: 'Cash', type: 'cash', balance: 25000, currency: 'IDR', icon: 'wallet', color: '#000', isPrimary: true, isArchived: false, createdAt: Date.now(), updatedAt: Date.now() });

    expect(await goalRepo.getCurrentAmount(goal)).toBe(25000);

    // Goal account should be excluded
    const goalAccId = generateId();
    await db.accounts.add({ id: goalAccId, name: 'Goal Acc', type: 'goal', balance: 100000, currency: 'IDR', icon: 'piggybank', color: '#333', isPrimary: false, isArchived: false, createdAt: Date.now(), updatedAt: Date.now() });

    expect(await goalRepo.getCurrentAmount(goal)).toBe(25000);
  });

  it('calculates progress percent from total balance', async () => {
    const goal = await goalRepo.create({ name: 'Percent', targetAmount: 100000, icon: 'gift', color: '#333' });
    expect(await goalRepo.getProgressPercent(goal)).toBe(0);

    const accId = generateId();
    await db.accounts.add({ id: accId, name: 'Cash', type: 'cash', balance: 50000, currency: 'IDR', icon: 'wallet', color: '#000', isPrimary: true, isArchived: false, createdAt: Date.now(), updatedAt: Date.now() });

    expect(await goalRepo.getProgressPercent(goal)).toBe(50);

    await db.accounts.update(accId, { balance: 100000 });
    expect(await goalRepo.getProgressPercent(goal)).toBe(100);
  });

  it('completes a goal and creates expense from primary account', async () => {
    const accId = generateId();
    await db.accounts.add({ id: accId, name: 'Cash', type: 'cash', balance: 200000, currency: 'IDR', icon: 'wallet', color: '#000', isPrimary: true, isArchived: false, createdAt: Date.now(), updatedAt: Date.now() });

    const goal = await goalRepo.create({ name: 'Complete', targetAmount: 100000, icon: 'star', color: '#ff0' });
    await goalRepo.complete(goal.id);

    const completed = await goalRepo.getById(goal.id);
    expect(completed!.achievedAt).toBeDefined();

    const txs = await db.transactions.toArray();
    expect(txs.length).toBe(1);
    expect(txs[0]!.type).toBe('expense');
    expect(txs[0]!.amount).toBe(100000);
    expect(txs[0]!.accountId).toBe(accId);

    const account = await db.accounts.get(accId);
    expect(account!.balance).toBe(100000);
  });

  it('rejects complete when balance insufficient unless force=true', async () => {
    const accId = generateId();
    await db.accounts.add({ id: accId, name: 'Cash', type: 'cash', balance: 50000, currency: 'IDR', icon: 'wallet', color: '#000', isPrimary: true, isArchived: false, createdAt: Date.now(), updatedAt: Date.now() });

    const goal = await goalRepo.create({ name: 'Big Goal', targetAmount: 100000, icon: 'star', color: '#ff0' });

    await expect(goalRepo.complete(goal.id)).rejects.toThrow('Saldo tidak mencukupi');

    await goalRepo.complete(goal.id, true);
    const completed = await goalRepo.getById(goal.id);
    expect(completed!.achievedAt).toBeDefined();

    const account = await db.accounts.get(accId);
    expect(account!.balance).toBe(-50000);
  });

  it('deletes a goal', async () => {
    const goal = await goalRepo.create({ name: 'Delete Me', targetAmount: 100000, icon: 'trash', color: '#000' });
    await goalRepo.delete(goal.id);
    const gone = await goalRepo.getById(goal.id);
    expect(gone).toBeUndefined();
  });

  it('gets total progress', async () => {
    const accId = generateId();
    await db.accounts.add({ id: accId, name: 'Cash', type: 'cash', balance: 50000, currency: 'IDR', icon: 'wallet', color: '#000', isPrimary: true, isArchived: false, createdAt: Date.now(), updatedAt: Date.now() });

    await goalRepo.create({ name: 'Goal1', targetAmount: 100000, icon: 'gift', color: '#111' });
    await goalRepo.create({ name: 'Goal2', targetAmount: 200000, icon: 'star', color: '#222' });

    const total = await goalRepo.getTotalProgress();
    expect(total.goalCount).toBe(2);
    expect(total.totalTarget).toBe(300000);
    expect(total.totalCurrent).toBe(50000);
  });

  it('detects milestones', async () => {
    const goal = await goalRepo.create({ name: 'Milestone', targetAmount: 100000, icon: 'star', color: '#ff0' });
    let milestones = await goalRepo.checkMilestones(goal);
    expect(milestones.length).toBe(0);

    const accId = generateId();
    await db.accounts.add({ id: accId, name: 'Cash', type: 'cash', balance: 25000, currency: 'IDR', icon: 'wallet', color: '#000', isPrimary: true, isArchived: false, createdAt: Date.now(), updatedAt: Date.now() });

    const updated = await goalRepo.getById(goal.id);
    milestones = await goalRepo.checkMilestones(updated!);
    expect(milestones.length).toBe(1);
    expect(milestones[0]!.percent).toBe(25);

    milestones = await goalRepo.checkMilestones(updated!);
    expect(milestones.length).toBe(0);
  });
});
