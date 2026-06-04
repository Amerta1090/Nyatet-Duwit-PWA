import { db } from '../schema';
import type { Tag, Transaction } from '@/types';
import { generateId } from '@/utils/id';

export const tagRepo = {
  async getAll(): Promise<Tag[]> {
    const tags = await db.tags.toArray();
    return tags.sort((a, b) => a.name.localeCompare(b.name));
  },

  async getById(id: string): Promise<Tag | undefined> {
    return db.tags.get(id);
  },

  async create(input: { name: string; color: string }): Promise<Tag> {
    const now = Date.now();
    const tag: Tag = {
      id: generateId(),
      name: input.name.trim(),
      color: input.color,
      createdAt: now,
    };
    await db.tags.add(tag);
    return tag;
  },

  async update(id: string, data: Partial<Pick<Tag, 'name' | 'color'>>): Promise<Tag> {
    await db.tags.update(id, data);
    const updated = await db.tags.get(id);
    if (!updated) throw new Error('Tag not found');
    return updated;
  },

  async delete(id: string): Promise<void> {
    await db.transaction('rw', db.tags, db.transactions, async () => {
      await db.tags.delete(id);
      const txs = await db.transactions.toArray();
      for (const tx of txs) {
        if (tx.tags?.includes(id)) {
          const newTags = tx.tags.filter((t) => t !== id);
          await db.transactions.update(tx.id, { tags: newTags.length > 0 ? newTags : [] });
        }
      }
    });
  },

  async getTotalSpending(tagId: string, dateFrom: number, dateTo: number): Promise<number> {
    const txs = await db.transactions
      .where('date')
      .between(dateFrom, dateTo, true, true)
      .toArray();
    return txs
      .filter((t) => t.tags?.includes(tagId) && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  },

  async getSpendingByTag(dateFrom: number, dateTo: number): Promise<{ tagId: string; total: number }[]> {
    const txs = await db.transactions
      .where('date')
      .between(dateFrom, dateTo, true, true)
      .toArray();
    const grouped = new Map<string, number>();
    for (const tx of txs) {
      if (tx.type !== 'expense' || !tx.tags) continue;
      for (const tagId of tx.tags) {
        grouped.set(tagId, (grouped.get(tagId) ?? 0) + tx.amount);
      }
    }
    return Array.from(grouped.entries()).map(([tagId, total]) => ({ tagId, total }));
  },

  async getTransactionsByTags(tagIds: string[], dateFrom?: number, dateTo?: number): Promise<Transaction[]> {
    let collection = db.transactions.orderBy('date').reverse().filter(() => true);
    if (dateFrom !== undefined) {
      collection = collection.filter((t) => t.date >= dateFrom);
    }
    if (dateTo !== undefined) {
      collection = collection.filter((t) => t.date <= dateTo);
    }
    const results = await collection.toArray();
    return results.filter((t) => tagIds.every((id) => t.tags?.includes(id)));
  },
};
