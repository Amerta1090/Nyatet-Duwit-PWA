import { useEffect, useState } from 'react';
import { db, seedDatabase } from '@/db';

export function useDatabase() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function init() {
      try {
        await db.open();
        await seedDatabase();
        setReady(true);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Database initialization failed'));
      }
    }
    init();
  }, []);

  return { ready, error };
}
