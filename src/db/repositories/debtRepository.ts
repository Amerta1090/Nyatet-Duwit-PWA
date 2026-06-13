import { db } from '../schema';
import type { Debt } from '@/types';
import { generateId } from '@/utils/id';
import { encryptDebt, decryptDebt, decryptDebts } from '../encryptionMiddleware';

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
    const debts = await db.debts.toArray();
    return decryptDebts(debts);
  },

  async getById(id: string): Promise<Debt | undefined> {
    const debt = await db.debts.get(id);
    if (!debt) return undefined;
    return decryptDebt(debt);
  },

  async create(input: CreateDebtInput): Promise<Debt> {
    const now = Date.now();
    const rawDebt: Debt = {
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

    const encrypted = await encryptDebt(rawDebt);
    await db.debts.add(encrypted as Debt);
    return rawDebt;
  },

  async update(id: string, data: Partial<Debt>): Promise<Debt> {
    const encryptedData = await encryptDebt(data);
    const updateData = { ...encryptedData, updatedAt: Date.now() };
    await db.debts.update(id, updateData);
    const updated = await db.debts.get(id);
    if (!updated) throw new Error('Debt not found');
    return decryptDebt(updated);
  },

  async delete(id: string): Promise<void> {
    await db.debts.delete(id);
  },

  async getByType(type: 'owed' | 'owing'): Promise<Debt[]> {
    const debts = await db.debts.where('type').equals(type).toArray();
    return decryptDebts(debts);
  },

  async getOverdue(): Promise<Debt[]> {
    const all = await db.debts.toArray();
    const decrypted = await decryptDebts(all);
    const now = Date.now();
    return decrypted.filter((d) => d.dueDate && d.dueDate < now && d.paidAmount < d.amount);
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

  async getUpcomingDue(days: number = 3): Promise<Debt[]> {
    const all = await db.debts.toArray();
    const decrypted = await decryptDebts(all);
    const now = Date.now();
    const deadline = now + days * 86400000;
    return decrypted.filter((d) => d.dueDate && d.dueDate > now && d.dueDate <= deadline && d.paidAmount < d.amount);
  },
};
