import { backupRepo } from '@/db/repositories/backupRepository';
import { hasRealData } from './detect';

const LS_KEY_LAST_BACKUP_DAY = 'nyatetduwit_last_backup_day';

function toDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getLastBackupDay(): string | null {
  return localStorage.getItem(LS_KEY_LAST_BACKUP_DAY);
}

export function getLastBackupLabel(): string | null {
  const day = getLastBackupDay();
  if (!day) return null;
  const [y, m, d] = day.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function needsUserGestureForDownload(): boolean {
  const nav = navigator as unknown as { userActivation?: { hasBeenActive: boolean } };
  if (nav.userActivation) {
    return !nav.userActivation.hasBeenActive;
  }
  return false;
}

export async function runBackupNow(): Promise<boolean> {
  if (!(await hasRealData())) return false;
  const data = await backupRepo.exportData();
  backupRepo.downloadBackup(data);
  localStorage.setItem(LS_KEY_LAST_BACKUP_DAY, toDayKey(new Date()));
  return true;
}

export async function runDailyBackupIfNeeded(): Promise<{ ran: boolean; needsBanner: boolean }> {
  const today = toDayKey(new Date());
  if (localStorage.getItem(LS_KEY_LAST_BACKUP_DAY) === today) {
    return { ran: false, needsBanner: false };
  }
  const ok = await runBackupNow();
  if (!ok) return { ran: false, needsBanner: false };
  return { ran: true, needsBanner: needsUserGestureForDownload() };
}

export function resetLastBackupDay(): void {
  localStorage.removeItem(LS_KEY_LAST_BACKUP_DAY);
}
