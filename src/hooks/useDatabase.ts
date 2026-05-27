import { useEffect, useState } from 'react';
import { db, seedDatabase } from '@/db';
import { seedDummyData } from '@/db/seed';
import { recurringRepo } from '@/db/repositories/recurringRepository';

export function useDatabase() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function init() {
      try {
        await db.open();
        await seedDatabase();
        await seedDummyData();
        await recurringRepo.generateDue();
        setReady(true);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(new Error(message));
      }
    }
    init();
  }, []);

  return { ready, error };
}
