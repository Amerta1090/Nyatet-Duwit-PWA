import { db } from '../schema';
import type { Debt } from '@/types';
import { generateId } from '@/utils/id';

export interface CreateDebtInput {
  type: 'owed' | 'owing';
  personName: string;
  amount: number;
  paidAmount?: number;
  dueDate?: number;
  notes?: string;
}

export const debtRepo = {
  async getAll(): Promise<Debt[]> {
    return db.debts.toArray();
  },

  async getById(id: string): Promise<Debt | undefined> {
    return db.debts.get(id);
  },

  async create(input: CreateDebtInput): Promise<Debt> {
    const now = Date.now();
    const debt: Debt = {
      id: generateId(),
      type: input.type,
      personName: input.personName,
      amount: input.amount,
      paidAmount: input.paidAmount ?? 0,
      dueDate: input.dueDate,
      notes: input.notes,
      createdAt: now,
      updatedAt: now,
    };
    await db.debts.add(debt);
    return debt;
  },

  async update(id: string, data: Partial<Debt>): Promise<Debt> {
    const updateData = { ...data, updatedAt: Date.now() };
    await db.debts.update(id, updateData);
    const updated = await db.debts.get(id);
    if (!updated) throw new Error('Debt not found');
    return updated;
  },

  async delete(id: string): Promise<void> {
    await db.debts.delete(id);
  },

  async getByType(type: 'owed' | 'owing'): Promise<Debt[]> {
    return db.debts.where('type').equals(type).toArray();
  },

  async getOverdue(): Promise<Debt[]> {
    const all = await db.debts.toArray();
    const now = Date.now();
    return all.filter((d) => d.dueDate && d.dueDate < now && d.paidAmount < d.amount);
  },

  async getTotalOwed(): Promise<number> {
    const owed = await this.getByType('owed');
    return owed.reduce((sum, d) => sum + (d.amount - d.paidAmount), 0);
  },

  async getTotalOwing(): Promise<number> {
    const owing = await this.getByType('owing');
    return owing.reduce((sum, d) => sum + (d.amount - d.paidAmount), 0);
  },

  async getNetBalance(): Promise<number> {
    const [owed, owing] = await Promise.all([
      this.getTotalOwed(),
      this.getTotalOwing(),
    ]);
    return owed - owing;
  },
};
