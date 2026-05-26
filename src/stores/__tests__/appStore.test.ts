import { describe, it, expect } from 'vitest';
import { useAppStore } from '../appStore';

describe('appStore', () => {
  it('starts with default values', () => {
    const state = useAppStore.getState();
    expect(state.lastUsedCategoryId).toBeNull();
    expect(state.lastTransactionType).toBe('expense');
    expect(state.darkMode).toBe(false);
  });

  it('updates last used values', () => {
    useAppStore.getState().updateLastUsed('cat-food', 'acc-1', 'expense');
    const state = useAppStore.getState();
    expect(state.lastUsedCategoryId).toBe('cat-food');
    expect(state.lastUsedAccountId).toBe('acc-1');
  });

  it('toggles dark mode', () => {
    useAppStore.getState().toggleDarkMode();
    expect(useAppStore.getState().darkMode).toBe(true);
    useAppStore.getState().toggleDarkMode();
    expect(useAppStore.getState().darkMode).toBe(false);
  });
});
