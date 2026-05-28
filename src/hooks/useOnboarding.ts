import { useState, useEffect, useCallback } from 'react';
import { db } from '@/db/schema';
import { useAppStore } from '@/stores/appStore';
import { generateId } from '@/utils/id';

export function useOnboarding() {
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(true);

  useEffect(() => {
    db.settings.get('onboarding_completed').then((s) => {
      setCompleted(s?.value === 'true');
      setLoading(false);
    });
  }, []);

  const complete = useCallback(async () => {
    await db.settings.put({ key: 'onboarding_completed', value: 'true' });
    useAppStore.getState().setOnboardingCompleted(true);
    setCompleted(true);
  }, []);

  return { loading, completed, complete };
}

export async function setupOnboardingAccount(name: string) {
  const count = await db.accounts.count();
  if (count > 0) {
    const existing = await db.accounts.limit(1).first();
    if (existing) {
      await db.accounts.update(existing.id, { name, updatedAt: Date.now() });
      return existing.id;
    }
  }
  const id = generateId();
  await db.accounts.add({
    id,
    name,
    type: 'cash',
    balance: 0,
    currency: 'IDR',
    icon: 'wallet',
    color: '#10B981',
    isPrimary: true,
    isArchived: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  return id;
}

export async function archiveUnusedCategories(keepIds: string[]) {
  const all = await db.categories.toArray();
  for (const cat of all) {
    if (!keepIds.includes(cat.id) && cat.isDefault) {
      await db.categories.update(cat.id, { order: 999 });
    }
  }
}
