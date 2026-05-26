import { useEffect, useState, useRef } from 'react';
import { db, seedDatabase } from '@/db';
import { seedDummyData } from '@/db/seed';

export function useDatabase() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    async function init() {
      try {
        await db.open();
        await seedDatabase();
        await seedDummyData();
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
