import { useEffect, useState, useCallback } from 'react';
import { db, seedDatabase } from '@/db';
import { recurringRepo } from '@/db/repositories/recurringRepository';
import { hasRealData } from '@/db/backup';

export type RestoreCheck = 'checking' | 'ok' | 'needs-restore';

export function useDatabase() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [restoreCheck, setRestoreCheck] = useState<RestoreCheck>('checking');

  const startFresh = useCallback(async () => {
    await seedDatabase();
    await recurringRepo.generateDue();
    setRestoreCheck('ok');
    setReady(true);
  }, []);

  useEffect(() => {
    async function init() {
      try {
        await db.open();
        const hadData = await hasRealData();
        if (hadData) {
          await startFresh();
        } else {
          setRestoreCheck('needs-restore');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        if (err instanceof DOMException && (err.name === 'QuotaExceededError' || err.name === 'QuotaExceeded')) {
          setError(new Error('Penyimpanan penuh. Hapus data lama atau backup dan hapus data.'));
        } else {
          setError(new Error(message));
        }
      }
    }
    init();
  }, [startFresh]);

  return { ready, error, restoreCheck, startFresh };
}
