import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../schema';
import { goalRepo } from '../repositories/goalRepository';

beforeAll(async () => {
  await db.open();
});

afterAll(() => {
  db.close();
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
    expect(goal.currentAmount).toBe(0);
    expect(goal.deadline).toBeUndefined();
  });

  it('gets all goals', async () => {
    await goalRepo.create({ name: 'Laptop Baru', targetAmount: 10000000, icon: 'laptop', color: '#10B981' });
    const goals = await goalRepo.getAll();
    expect(goals.length).toBeGreaterThanOrEqual(2);
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

  it('adds progress to a goal', async () => {
    const goal = await goalRepo.create({ name: 'Progress', targetAmount: 100000, icon: 'gift', color: '#333' });
    const updated = await goalRepo.addProgress(goal.id, 25000);
    expect(updated.currentAmount).toBe(25000);
    const updated2 = await goalRepo.addProgress(goal.id, 15000);
    expect(updated2.currentAmount).toBe(40000);
  });

  it('calculates progress percent correctly', async () => {
    const goal = await goalRepo.create({ name: 'Percent', targetAmount: 100000, icon: 'gift', color: '#333' });
    expect(goalRepo.getProgressPercent(goal)).toBe(0);
    const half = await goalRepo.addProgress(goal.id, 50000);
    expect(goalRepo.getProgressPercent(half)).toBe(50);
    const full = await goalRepo.addProgress(goal.id, 50000);
    expect(goalRepo.getProgressPercent(full)).toBe(100);
  });

  it('returns correct progress color', async () => {
    const goal = await goalRepo.create({ name: 'Color', targetAmount: 100000, icon: 'gift', color: '#333' });
    expect(goalRepo.getProgressColor(goal)).toBe('#10B981');
    const mid = await goalRepo.addProgress(goal.id, 60000);
    expect(goalRepo.getProgressColor(mid)).toBe('#F59E0B');
    const high = await goalRepo.addProgress(mid.id, 30000);
    expect(goalRepo.getProgressColor(high)).toBe('#EF4444');
  });

  it('deletes a goal', async () => {
    const goal = await goalRepo.create({ name: 'Delete Me', targetAmount: 100000, icon: 'trash', color: '#000' });
    await goalRepo.delete(goal.id);
    const gone = await goalRepo.getById(goal.id);
    expect(gone).toBeUndefined();
  });

  it('gets total progress across goals', async () => {
    const g1 = await goalRepo.create({ name: 'Total1', targetAmount: 100000, icon: 'gift', color: '#111' });
    await goalRepo.addProgress(g1.id, 50000);
    const g2 = await goalRepo.create({ name: 'Total2', targetAmount: 100000, icon: 'gift', color: '#222' });
    await goalRepo.addProgress(g2.id, 25000);
    const total = await goalRepo.getTotalProgress();
    expect(total.goalCount).toBeGreaterThanOrEqual(2);
    expect(total.totalTarget).toBeGreaterThanOrEqual(200000);
    expect(total.totalCurrent).toBeGreaterThanOrEqual(75000);
  });

  it('gets top goals sorted by progress', async () => {
    const g1 = await goalRepo.create({ name: 'Top1', targetAmount: 100000, icon: 'gift', color: '#111' });
    await goalRepo.addProgress(g1.id, 90000);
    const g2 = await goalRepo.create({ name: 'Top2', targetAmount: 100000, icon: 'gift', color: '#222' });
    await goalRepo.addProgress(g2.id, 50000);
    const top = await goalRepo.getTopGoals(2);
    expect(top.length).toBeGreaterThanOrEqual(2);
    expect(goalRepo.getProgressPercent(top[0]!)).toBeGreaterThanOrEqual(goalRepo.getProgressPercent(top[1]!));
  });

  it('detects milestones', async () => {
    const goal = await goalRepo.create({ name: 'Milestone', targetAmount: 100000, icon: 'star', color: '#ff0' });
    let milestones = await goalRepo.checkMilestones(goal);
    expect(milestones.length).toBe(0);
    await goalRepo.addProgress(goal.id, 25000);
    const updated = await goalRepo.getById(goal.id)!;
    milestones = await goalRepo.checkMilestones(updated!);
    expect(milestones.length).toBe(1);
    expect(milestones[0]!.percent).toBe(25);
    milestones = await goalRepo.checkMilestones(updated!);
    expect(milestones.length).toBe(0);
  });
});
