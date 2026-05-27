import { useEffect, useState } from 'react';
import { db, seedDatabase } from '@/db';
import { recurringRepo } from '@/db/repositories/recurringRepository';

export function useDatabase() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function init() {
      try {
        await db.open();
        await seedDatabase();
        await recurringRepo.generateDue();
        setReady(true);
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
  }, []);

  return { ready, error };
}
