import { db } from '../schema';

export interface BackupData {
  version: string;
  exportDate: string;
  accounts: import('@/types').Account[];
  transactions: import('@/types').Transaction[];
  categories: import('@/types').Category[];
  recurring: import('@/types').RecurringTransaction[];
  goals: import('@/types').Goal[];
  settings: import('@/types').AppSettings[];
}

const CURRENT_VERSION = '1.1';

export const backupRepo = {
  async exportData(): Promise<BackupData> {
    const [accounts, transactions, categories, recurring, goals, settings] = await Promise.all([
      db.accounts.toArray(),
      db.transactions.toArray(),
      db.categories.toArray(),
      db.recurring.toArray(),
      db.goals.toArray(),
      db.settings.toArray(),
    ]);

    return {
      version: CURRENT_VERSION,
      exportDate: new Date().toISOString(),
      accounts,
      transactions,
      categories,
      recurring,
      goals,
      settings,
    };
  },

  downloadBackup(data: BackupData): void {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nyatetduwit-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  async importData(data: unknown): Promise<{ success: boolean; error?: string }> {
    const parsed = data as Partial<BackupData>;

    if (!parsed.version || !Array.isArray(parsed.accounts) || !Array.isArray(parsed.transactions)) {
      return { success: false, error: 'Format file tidak valid. Pastikan file backup NyatetDuwit.' };
    }

    try {
      await db.transaction('rw', [db.accounts, db.transactions, db.categories, db.recurring, db.goals, db.settings], async () => {
        await Promise.all([
          db.accounts.clear(),
          db.transactions.clear(),
          db.categories.clear(),
          db.recurring.clear(),
          db.goals.clear(),
          db.settings.clear(),
        ]);

        if (parsed.accounts!.length > 0) await db.accounts.bulkAdd(parsed.accounts!);
        if (parsed.transactions!.length > 0) await db.transactions.bulkAdd(parsed.transactions!);
        if (parsed.categories && parsed.categories.length > 0) await db.categories.bulkAdd(parsed.categories!);
        if (parsed.recurring && parsed.recurring.length > 0) await db.recurring.bulkAdd(parsed.recurring!);
        if (parsed.goals && parsed.goals.length > 0) await db.goals.bulkAdd(parsed.goals!);
        if (parsed.settings && parsed.settings.length > 0) await db.settings.bulkAdd(parsed.settings!);
      });

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal mengimpor data';
      return { success: false, error: message };
    }
  },

  async clearAllData(): Promise<void> {
    await db.transaction('rw', [db.accounts, db.transactions, db.categories, db.recurring, db.goals, db.settings], async () => {
      await Promise.all([
        db.accounts.clear(),
        db.transactions.clear(),
        db.categories.clear(),
        db.recurring.clear(),
        db.goals.clear(),
        db.settings.clear(),
      ]);
    });
  },
};
