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
    await db.categories.bulkAdd(categories);
  }

  const accountCount = await db.accounts.count();
  if (accountCount === 0) {
    await db.accounts.add({
      id: generateId(),
      ...DEFAULT_ACCOUNT,
      isPrimary: true,
      isArchived: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
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
