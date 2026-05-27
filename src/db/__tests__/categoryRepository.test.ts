import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../schema';
import { seedDatabase } from '../seed';
import { categoryRepo } from '../repositories/categoryRepository';

beforeAll(async () => {
  await db.open();
  await seedDatabase();
});

afterAll(() => {
  db.close();
});

describe('categoryRepo', () => {
  it('returns all categories sorted by order', async () => {
    const cats = await categoryRepo.getAll();
    expect(cats.length).toBeGreaterThanOrEqual(8);
  });

  it('returns expense categories', async () => {
    const cats = await categoryRepo.getByType('expense');
    expect(cats.every((c) => c.type === 'expense')).toBe(true);
  });

  it('returns income categories', async () => {
    const cats = await categoryRepo.getByType('income');
    expect(cats.every((c) => c.type === 'income')).toBe(true);
  });

  it('creates a custom category', async () => {
    const cat = await categoryRepo.create({
      name: 'Crypto',
      type: 'expense',
      icon: 'bitcoin',
      color: '#F7931A',
      isDefault: false,
      order: 99,
    });
    expect(cat.id).toBeDefined();
    expect(cat.name).toBe('Crypto');
  });

  it('updates category name', async () => {
    const cat = (await categoryRepo.getAll())[0]!;
    const updated = await categoryRepo.update(cat.id, { name: 'Updated Name' });
    expect(updated.name).toBe('Updated Name');
  });

  it('deletes a category', async () => {
    const cat = await categoryRepo.create({
      name: 'Temp',
      type: 'expense',
      icon: 'trash',
      color: '#000',
      isDefault: false,
      order: 99,
    });
    await categoryRepo.delete(cat.id);
    const gone = await categoryRepo.getById(cat.id);
    expect(gone).toBeUndefined();
  });
});