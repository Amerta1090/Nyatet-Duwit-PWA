import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { db } from '../schema';
import { backupRepo } from '../repositories/backupRepository';
import { runBackupNow, runDailyBackupIfNeeded, getLastBackupDay, resetLastBackupDay } from '../backup/autoBackup';

beforeAll(async () => {
  await db.open();
});

afterAll(() => {
  db.close();
});

beforeEach(async () => {
  localStorage.clear();
  vi.restoreAllMocks();
  vi.spyOn(backupRepo, 'downloadBackup').mockImplementation(() => {});
  await db.transaction('rw', [db.accounts, db.transactions, db.categories, db.recurring, db.goals, db.debts, db.tags, db.settings], async () => {
    await Promise.all([
      db.accounts.clear(),
      db.transactions.clear(),
      db.categories.clear(),
      db.recurring.clear(),
      db.goals.clear(),
      db.debts.clear(),
      db.tags.clear(),
      db.settings.clear(),
    ]);
  });
});

async function addSampleData() {
  await db.accounts.add({
    id: 'acc-1',
    name: 'Cash',
    type: 'cash',
    balance: 5000,
    currency: 'IDR',
    icon: 'wallet',
    color: '#10B981',
    isPrimary: true,
    isArchived: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  await db.transactions.add({
    id: 'tx-1',
    type: 'income',
    amount: 5000,
    categoryId: 'cat-1',
    accountId: 'acc-1',
    date: Date.now(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    synced: false,
  });
}

describe('autoBackup', () => {
  it('runBackupNow returns false when there is no data', async () => {
    expect(await runBackupNow()).toBe(false);
    expect(getLastBackupDay()).toBeNull();
  });

  it('runBackupNow exports data and marks the day', async () => {
    await addSampleData();
    const ok = await runBackupNow();
    expect(ok).toBe(true);
    expect(backupRepo.downloadBackup).toHaveBeenCalledTimes(1);
    expect(getLastBackupDay()).not.toBeNull();
  });

  it('runDailyBackupIfNeeded runs only once per day', async () => {
    await addSampleData();
    const first = await runDailyBackupIfNeeded();
    expect(first.ran).toBe(true);
    expect(backupRepo.downloadBackup).toHaveBeenCalledTimes(1);

    const second = await runDailyBackupIfNeeded();
    expect(second.ran).toBe(false);
    expect(backupRepo.downloadBackup).toHaveBeenCalledTimes(1);
  });

  it('runDailyBackupIfNeeded skips when there is no data', async () => {
    const result = await runDailyBackupIfNeeded();
    expect(result.ran).toBe(false);
    expect(getLastBackupDay()).toBeNull();
  });

  it('resetLastBackupDay clears the marker', async () => {
    await addSampleData();
    await runBackupNow();
    expect(getLastBackupDay()).not.toBeNull();
    resetLastBackupDay();
    expect(getLastBackupDay()).toBeNull();
  });
});
