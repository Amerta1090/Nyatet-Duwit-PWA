import { db } from '../schema';
import type { Category } from '@/types';
import { generateId } from '@/utils/id';

export const categoryRepo = {
  async getAll(): Promise<Category[]> {
    return db.categories.orderBy('order').toArray();
  },

  async getByType(type: 'income' | 'expense'): Promise<Category[]> {
    return db.categories.where('type').equals(type).sortBy('order');
  },

  async getById(id: string): Promise<Category | undefined> {
    return db.categories.get(id);
  },

  async create(input: Omit<Category, 'id' | 'createdAt'>): Promise<Category> {
    const category: Category = {
      id: generateId(),
      ...input,
      createdAt: Date.now(),
    };
    await db.categories.add(category);
    return category;
  },

  async update(id: string, data: Partial<Category>): Promise<Category> {
    await db.categories.update(id, data);
    const updated = await db.categories.get(id);
    if (!updated) throw new Error('Category not found');
    return updated;
  },

  async delete(id: string): Promise<void> {
    await db.categories.delete(id);
  },
};
