import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { db } from '../schema';
import { tagRepo } from '../repositories/tagRepository';

beforeAll(async () => {
  await db.open();
});

afterAll(() => {
  db.close();
});

beforeEach(async () => {
  await db.tags.clear();
  await db.transactions.clear();
});

describe('tagRepo', () => {
  it('creates a tag', async () => {
    const tag = await tagRepo.create({ name: 'Makan Siang', color: '#F59E0B' });
    expect(tag.id).toBeDefined();
    expect(tag.name).toBe('Makan Siang');
    expect(tag.color).toBe('#F59E0B');
  });

  it('gets all tags ordered by name', async () => {
    await tagRepo.create({ name: 'Z', color: '#EF4444' });
    await tagRepo.create({ name: 'A', color: '#10B981' });
    const all = await tagRepo.getAll();
    expect(all[0]!.name).toBe('A');
    expect(all[1]!.name).toBe('Z');
  });

  it('updates a tag', async () => {
    const tag = await tagRepo.create({ name: 'Makan Siang', color: '#F59E0B' });
    await tagRepo.update(tag.id, { name: 'Makan Malam', color: '#EF4444' });
    const updated = await tagRepo.getById(tag.id);
    expect(updated?.name).toBe('Makan Malam');
    expect(updated?.color).toBe('#EF4444');
  });

  it('deletes a tag and removes from transactions', async () => {
    const tag = await tagRepo.create({ name: 'Test', color: '#6366F1' });
    await db.transactions.add({
      id: 'tx-1',
      type: 'expense',
      amount: 10000,
      categoryId: 'cat-1',
      accountId: 'acc-1',
      date: Date.now(),
      tags: [tag.id],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      synced: false,
    });
    await tagRepo.delete(tag.id);
    expect(await db.tags.get(tag.id)).toBeUndefined();
    const tx = await db.transactions.get('tx-1');
    expect(tx?.tags).toEqual([]);
  });

  it('calculates spending by tag', async () => {
    const tag1 = await tagRepo.create({ name: 'Food', color: '#F59E0B' });
    const tag2 = await tagRepo.create({ name: 'Transport', color: '#3B82F6' });
    const now = Date.now();
    await db.transactions.bulkAdd([
      { id: '1', type: 'expense', amount: 10000, categoryId: 'cat-1', accountId: 'acc-1', date: now, tags: [tag1.id], createdAt: now, updatedAt: now, synced: false },
      { id: '2', type: 'expense', amount: 25000, categoryId: 'cat-2', accountId: 'acc-1', date: now, tags: [tag1.id, tag2.id], createdAt: now, updatedAt: now, synced: false },
      { id: '3', type: 'expense', amount: 5000, categoryId: 'cat-1', accountId: 'acc-1', date: now, tags: [tag2.id], createdAt: now, updatedAt: now, synced: false },
      { id: '4', type: 'income', amount: 500000, categoryId: 'cat-3', accountId: 'acc-1', date: now, tags: [tag1.id], createdAt: now, updatedAt: now, synced: false },
    ]);

    const spending = await tagRepo.getSpendingByTag(now - 86400000, now + 86400000);
    const foodTotal = spending.find((s) => s.tagId === tag1.id)?.total ?? 0;
    const transportTotal = spending.find((s) => s.tagId === tag2.id)?.total ?? 0;

    expect(foodTotal).toBe(35000);
    expect(transportTotal).toBe(30000);
  });
});
