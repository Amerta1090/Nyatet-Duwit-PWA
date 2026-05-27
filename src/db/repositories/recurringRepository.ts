import { db } from '../schema';
import type { RecurringTransaction } from '@/types';
import { generateId } from '@/utils/id';
import { startOfDay } from '@/utils/date';

export interface RecurringInput {
  template: {
    type: 'income' | 'expense' | 'transfer';
    amount: number;
    categoryId: string;
    accountId: string;
    toAccountId?: string;
    notes?: string;
  };
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: number;
  endDate?: number;
  isActive: boolean;
}

export const recurringRepo = {
  async getAll(): Promise<RecurringTransaction[]> {
    return db.recurring.toArray();
  },

  async getById(id: string): Promise<RecurringTransaction | undefined> {
    return db.recurring.get(id);
  },

  async create(input: RecurringInput): Promise<RecurringTransaction> {
    const now = Date.now();
    const rec: RecurringTransaction = {
      id: generateId(),
      template: { ...input.template },
      frequency: input.frequency,
      startDate: input.startDate,
      endDate: input.endDate,
      isActive: input.isActive,
      lastGenerated: now,
    };
    await db.recurring.add(rec);
    return rec;
  },

  async update(id: string, data: Partial<RecurringTransaction>): Promise<RecurringTransaction> {
    await db.recurring.update(id, data);
    const updated = await db.recurring.get(id);
    if (!updated) throw new Error('Recurring not found');
    return updated;
  },

  async delete(id: string): Promise<void> {
    await db.recurring.delete(id);
  },

  async generateDue(): Promise<void> {
    const actives = (await db.recurring.toArray()).filter((r) => r.isActive);
    const now = startOfDay(Date.now());
    for (const rec of actives) {
      if (rec.endDate && now > rec.endDate) continue;
      if (now < rec.startDate) continue;
      const due = isDue(rec);
      if (due) {
        await generateTransaction(rec);
      }
    }
  },
};

function getNextDate(rec: RecurringTransaction): number {
  const start = new Date(rec.startDate);
  const msPerDay = 86400000;
  switch (rec.frequency) {
    case 'daily': return start.getTime() + msPerDay;
    case 'weekly': return start.getTime() + 7 * msPerDay;
    case 'monthly': return new Date(start.getFullYear(), start.getMonth() + 1, start.getDate()).getTime();
    case 'yearly': {
      const d = new Date(start);
      d.setFullYear(d.getFullYear() + 1);
      return d.getTime();
    }
  }
}

function isDue(rec: RecurringTransaction): boolean {
  const next = getNextDate(rec);
  return Date.now() >= next && rec.isActive;
}

async function generateTransaction(rec: RecurringTransaction): Promise<void> {
  return db.transaction('rw', db.recurring, db.transactions, async () => {
    const now = Date.now();
    const tx = {
      id: generateId(),
      type: rec.template.type,
      amount: rec.template.amount,
      categoryId: rec.template.categoryId,
      accountId: rec.template.accountId,
      toAccountId: rec.template.toAccountId,
      date: now,
      notes: rec.template.notes,
      isRecurring: true,
      recurringId: rec.id,
      createdAt: now,
      updatedAt: now,
      synced: false,
    };
    await db.transactions.add(tx);
    await db.recurring.update(rec.id, { lastGenerated: now });
  });
}