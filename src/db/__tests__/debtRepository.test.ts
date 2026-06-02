import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { db } from '../schema';
import { debtRepo } from '../repositories/debtRepository';

beforeAll(async () => {
  await db.open();
});

afterAll(() => {
  db.close();
});

beforeEach(async () => {
  await db.debts.clear();
});

describe('debtRepo', () => {
  it('creates a debt', async () => {
    const debt = await debtRepo.create({
      type: 'owed',
      personName: 'Andi',
      amount: 1000000,
    });
    expect(debt.id).toBeDefined();
    expect(debt.type).toBe('owed');
    expect(debt.personName).toBe('Andi');
    expect(debt.amount).toBe(1000000);
    expect(debt.paidAmount).toBe(0);
  });

  it('gets all debts', async () => {
    await debtRepo.create({ type: 'owed', personName: 'Andi', amount: 1000000 });
    await debtRepo.create({ type: 'owing', personName: 'Budi', amount: 500000 });
    const all = await debtRepo.getAll();
    expect(all.length).toBe(2);
  });

  it('gets debt by id', async () => {
    const d = await debtRepo.create({ type: 'owed', personName: 'Test', amount: 100000 });
    const found = await debtRepo.getById(d.id);
    expect(found).toBeDefined();
    expect(found!.personName).toBe('Test');
  });

  it('updates a debt', async () => {
    const d = await debtRepo.create({ type: 'owed', personName: 'Old', amount: 100000 });
    const updated = await debtRepo.update(d.id, { personName: 'New', amount: 200000 });
    expect(updated.personName).toBe('New');
    expect(updated.amount).toBe(200000);
  });

  it('deletes a debt', async () => {
    const d = await debtRepo.create({ type: 'owed', personName: 'Delete', amount: 100000 });
    await debtRepo.delete(d.id);
    const gone = await debtRepo.getById(d.id);
    expect(gone).toBeUndefined();
  });

  it('filters debts by type', async () => {
    await debtRepo.create({ type: 'owed', personName: 'A', amount: 100000 });
    await debtRepo.create({ type: 'owing', personName: 'B', amount: 50000 });
    const owed = await debtRepo.getByType('owed');
    const owing = await debtRepo.getByType('owing');
    expect(owed.length).toBe(1);
    expect(owed[0]!.personName).toBe('A');
    expect(owing.length).toBe(1);
    expect(owing[0]!.personName).toBe('B');
  });

  it('calculates total owed and owing', async () => {
    await debtRepo.create({ type: 'owed', personName: 'A', amount: 1000000, paidAmount: 200000 });
    await debtRepo.create({ type: 'owed', personName: 'B', amount: 500000 });
    await debtRepo.create({ type: 'owing', personName: 'C', amount: 300000 });

    expect(await debtRepo.getTotalOwed()).toBe(1300000);
    expect(await debtRepo.getTotalOwing()).toBe(300000);
    expect(await debtRepo.getNetBalance()).toBe(1000000);
  });

  it('identifies overdue debts', async () => {
    const past = Date.now() - 86400000 * 5;
    await debtRepo.create({ type: 'owed', personName: 'Overdue', amount: 100000, dueDate: past });
    await debtRepo.create({ type: 'owed', personName: 'Future', amount: 100000, dueDate: Date.now() + 86400000 * 30 });
    await debtRepo.create({ type: 'owed', personName: 'Paid', amount: 100000, paidAmount: 100000, dueDate: past });

    const overdue = await debtRepo.getOverdue();
    expect(overdue.length).toBe(1);
    expect(overdue[0]!.personName).toBe('Overdue');
  });

  it('handles partial payment tracking', async () => {
    const d = await debtRepo.create({ type: 'owed', personName: 'Partial', amount: 100000 });
    await debtRepo.update(d.id, { paidAmount: 40000 });
    const updated = await debtRepo.getById(d.id);
    expect(updated!.paidAmount).toBe(40000);
    expect(updated!.amount - updated!.paidAmount).toBe(60000);
  });
});
