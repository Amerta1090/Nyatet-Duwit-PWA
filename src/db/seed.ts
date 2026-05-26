import { db } from './schema';
import { DEFAULT_CATEGORIES, DEFAULT_ACCOUNT, DEFAULT_SETTINGS } from '@/constants';
import { generateId } from '@/utils/id';

export async function seedDatabase(): Promise<void> {
  const categoryCount = await db.categories.count();
  if (categoryCount === 0) {
    const now = Date.now();
    const categories = DEFAULT_CATEGORIES.map((cat) => ({
      ...cat,
      createdAt: now,
    }));
    await db.categories.bulkPut(categories);
  }

  const accountCount = await db.accounts.count();

  if (accountCount === 0) {
    await db.accounts.add({
      id: generateId(),
      ...DEFAULT_ACCOUNT,
      balance: 0,
      isPrimary: true,
      isArchived: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  } else {
    await db.accounts.where('isPrimary').equals(1).first();
  }

  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    const settings = Object.entries(DEFAULT_SETTINGS).map(([key, value]) => ({
      key,
      value,
    }));
    await db.settings.bulkAdd(settings);
  }
}

export async function seedDummyData(): Promise<void> {
  const txCount = await db.transactions.count();
  if (txCount > 0) return;

  const accounts = await db.accounts.toArray();
  const categories = await db.categories.toArray();

  if (accounts.length === 0 || categories.length === 0) return;

  const cashAccount = accounts[0]!;
  const expenseCats = categories.filter((c) => c.type === 'expense');
  const incomeCats = categories.filter((c) => c.type === 'income');

  const now = Date.now();
  const day = 86400000;

  const dummyTransactions = [
    { type: 'income' as const, amount: 5000000, categoryId: incomeCats[0]!.id, date: now - 20 * day, notes: 'Gaji bulan Mei' },
    { type: 'expense' as const, amount: 25000, categoryId: expenseCats[0]!.id, date: now - 19 * day, notes: 'Nasi goreng + es teh' },
    { type: 'expense' as const, amount: 15000, categoryId: expenseCats[1]!.id, date: now - 18 * day, notes: 'Gojek ke kantor' },
    { type: 'expense' as const, amount: 75000, categoryId: expenseCats[2]!.id, date: now - 17 * day, notes: 'Beli tas ransel' },
    { type: 'expense' as const, amount: 45000, categoryId: expenseCats[0]!.id, date: now - 16 * day, notes: 'Makan siang team' },
    { type: 'expense' as const, amount: 20000, categoryId: expenseCats[3]!.id, date: now - 15 * day, notes: 'Netflix bulanan' },
    { type: 'expense' as const, amount: 150000, categoryId: expenseCats[4]!.id, date: now - 14 * day, notes: 'Listrik' },
    { type: 'income' as const, amount: 1500000, categoryId: incomeCats[1]!.id, date: now - 12 * day, notes: 'Project freelance' },
    { type: 'expense' as const, amount: 18000, categoryId: expenseCats[0]!.id, date: now - 10 * day, notes: 'Kopi susu' },
    { type: 'expense' as const, amount: 35000, categoryId: expenseCats[1]!.id, date: now - 9 * day, notes: 'Bensin' },
    { type: 'expense' as const, amount: 85000, categoryId: expenseCats[2]!.id, date: now - 8 * day, notes: 'Beli kemeja' },
    { type: 'expense' as const, amount: 50000, categoryId: expenseCats[0]!.id, date: now - 7 * day, notes: 'Makan malam' },
    { type: 'expense' as const, amount: 30000, categoryId: expenseCats[3]!.id, date: now - 6 * day, notes: 'Tiket bioskop' },
    { type: 'expense' as const, amount: 100000, categoryId: expenseCats[5]!.id, date: now - 5 * day, notes: 'Obat + vitamin' },
    { type: 'expense' as const, amount: 25000, categoryId: expenseCats[0]!.id, date: now - 3 * day, notes: 'Bakso' },
    { type: 'expense' as const, amount: 12000, categoryId: expenseCats[1]!.id, date: now - 2 * day, notes: 'TransJakarta' },
    { type: 'expense' as const, amount: 200000, categoryId: expenseCats[4]!.id, date: now - 1 * day, notes: 'Token listrik' },
    { type: 'expense' as const, amount: 55000, categoryId: expenseCats[0]!.id, date: now - 0 * day, notes: 'Makan siang hari ini' },
    { type: 'income' as const, amount: 2000000, categoryId: incomeCats[0]!.id, date: now - 0 * day, notes: 'Gaji freelance' },
    { type: 'expense' as const, amount: 75000, categoryId: expenseCats[6]!.id, date: now - 0 * day, notes: 'Beli buku' },
  ];

  let runningBalance = 0;
  for (const tx of dummyTransactions) {
    const id = generateId();
    const createdAt = tx.date;

    await db.transactions.add({
      id,
      type: tx.type,
      amount: tx.amount,
      categoryId: tx.categoryId,
      accountId: cashAccount.id,
      date: tx.date,
      notes: tx.notes,
      createdAt,
      updatedAt: createdAt,
      synced: false,
    });

    const delta = tx.type === 'income' ? tx.amount : -tx.amount;
    runningBalance += delta;
  }

  await db.accounts.update(cashAccount.id, {
    balance: runningBalance,
    updatedAt: now,
  });
}
