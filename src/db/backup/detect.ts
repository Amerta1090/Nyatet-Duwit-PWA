import { db } from '@/db/schema';

export async function hasRealData(): Promise<boolean> {
  const [txCount, accountCount] = await Promise.all([
    db.transactions.count(),
    db.accounts.count(),
  ]);
  if (txCount > 0 || accountCount > 1) return true;

  const categories = await db.categories.toArray();
  return categories.some((c) => !c.isDefault);
}
